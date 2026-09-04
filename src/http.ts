const cachedResponses: {
	[key: string]: {
		response: Promise<any>;
		time: number;
		expireTimeout: ReturnType<typeof setTimeout>;
	};
} = {};

let hiveApiUrl = "https://api.playhive.com/v0";
let hiveApiKey: string | undefined;
let hiveApiSecret = "";
let cacheLife = 0; // Measured in milliseconds
let awaitRequestLimitTimeout = false;

export function getHiveApiUrl(): string {
	return hiveApiUrl;
}

export function setHiveApiUrl(url: string) {
	hiveApiUrl = url;
}

export function getHiveApiV2Url(): string {
	if (hiveApiUrl.endsWith("/v0")) return hiveApiUrl.slice(0, -3) + "/v2";
	if (hiveApiUrl.endsWith("/v0/")) return hiveApiUrl.slice(0, -4) + "/v2";
	return hiveApiUrl.replace(/\/$/, "") + "/v2";
}

// Basic auth for v2 (required) and extra v0 fields (optional).
// `secret` is the Basic password; omit it when the key is the username.
export function setHiveApiKey(key?: string, secret: string = "") {
	hiveApiKey = key || undefined;
	hiveApiSecret = secret;
}

function encodeBasicAuth(key: string, secret: string): string {
	const credentials = key + ":" + secret;
	if (typeof btoa === "function") return btoa(credentials);
	return Buffer.from(credentials, "utf8").toString("base64");
}

function authorizationHeaders(): { [header: string]: string } {
	if (!hiveApiKey) return {};
	return {
		Authorization: "Basic " + encodeBasicAuth(hiveApiKey, hiveApiSecret)
	};
}

// Enables caching and sets the cache life in seconds
export function enableCache(seconds: number) {
	cacheLife = seconds * 1000;
}

export function clearCache() {
	for (const key in cachedResponses) {
		clearTimeout(cachedResponses[key]?.expireTimeout);
		delete cachedResponses[key];
	}
}

// This is intended for testing and generally shouldn't
// be used for retrieving cached data manually.
export function getCache() {
	return cachedResponses;
}

export function retryAfterRequestLimitTimeout(enabled: boolean) {
	awaitRequestLimitTimeout = enabled;
}

export class ApiHttpError extends Error {
	public _tag = "ApiHttpError";
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

export type FetchDataOptions = {
	baseUrl?: string;
	apiVersionHeader?: boolean;
};

export async function fetchData<T>(
	url: string,
	controller?: AbortController,
	init?: RequestInit,
	options?: FetchDataOptions
): Promise<T> {
	const cacheKey = (options?.baseUrl || "") + url;

	if (cacheLife > 0 && cachedResponses[cacheKey]) {
		if (Date.now() - cachedResponses[cacheKey].time < cacheLife) {
			clearTimeout(cachedResponses[cacheKey].expireTimeout);
			cachedResponses[cacheKey].expireTimeout = setTimeout(
				() => delete cachedResponses[cacheKey],
				cacheLife
			);

			try {
				return await cachedResponses[cacheKey].response;
			} catch (e: any) {
				// Only continue if it was an AbortError, otherwise rethrow
				if (e.name !== "AbortError") throw e;
				// Fall through to create a new request if the cached one was aborted
			}
		} else {
			delete cachedResponses[cacheKey];
		}
	}

	const baseUrl = options?.baseUrl || hiveApiUrl;
	const includeVersionHeader = options?.apiVersionHeader !== false;

	const requestPromise = fetch(baseUrl + url, {
		...init,
		signal: controller?.signal,
		headers: {
			...(includeVersionHeader
				? { "X-Hive-Api-Version": "2024-03-29" }
				: {}),
			...authorizationHeaders(),
			...init?.headers
		}
	}).then(async response => {
		if (response.ok) return response.json();

		const timeout = response.headers.get("retry-after") ?? "60";

		if (response.status === 429 && awaitRequestLimitTimeout) {
			await new Promise(r => setTimeout(r, parseInt(timeout) * 1000));

			if (cacheLife > 0 && cacheKey in cachedResponses) {
				delete cachedResponses[cacheKey];
			}

			return await fetchData(url, controller, init, options);
		} else {
			throw new ApiHttpError(response.statusText, response.status);
		}
	});

	const finalPromise =
		cacheLife > 0
			? requestPromise.catch(e => {
					if (cacheKey in cachedResponses) delete cachedResponses[cacheKey];
					throw e;
				})
			: requestPromise;

	if (cacheLife > 0) {
		cachedResponses[cacheKey] = {
			response: finalPromise,
			time: Date.now(),
			expireTimeout: setTimeout(
				() => delete cachedResponses[cacheKey],
				cacheLife
			)
		};

		const data = await finalPromise;
		cachedResponses[cacheKey].time = Date.now();
		return data;
	}

	return await finalPromise;
}

export function withQuery(
	path: string,
	query?: { [key: string]: string | number | boolean | undefined }
): string {
	if (!query) return path;
	const params = new URLSearchParams();
	Object.keys(query).forEach(key => {
		const value = query[key];
		if (value !== undefined) {
			params.set(key, String(value));
		}
	});
	const qs = params.toString();
	return qs ? path + "?" + qs : path;
}
