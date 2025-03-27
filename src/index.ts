import {
	AllTimeGameStats,
	Game,
	GameLeaderboard,
	GameStats,
	MonthlyGameStats,
	ParkourStats,
	SeasonGame,
	SpecialGame,
	SpecialLeaderboardName
} from "./games/data";
import { GameLeaderboardInfo, GameMetainfo } from "./games/info";
import {
	AllTimeStatsProcessors,
	MonthlyStatsProcessors
} from "./games/processors";
import { Player, PlayerActivity, PlayerSearchResult } from "./player/data";
import { GameMap } from "./map/data";

const cachedResponses: {
	[key: string]: {
		response: Promise<any>;
		time: number;
		expireTimeout: ReturnType<typeof setTimeout>;
	};
} = {};

let hiveApiUrl = "https://api.playhive.com/v0";
let cacheLife = 0; // Measured in milliseconds
export function getHiveApiUrl(): string {
	return hiveApiUrl;
}

export function setHiveApiUrl(url: string) {
	hiveApiUrl = url;
}

// Enables caching and sets the cache life in seconds
export function enableCache(seconds: number) {
	cacheLife = seconds * 1000;
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

async function cacheRequest<T>(
	url: string,
	requestPromise: Promise<T>
): Promise<T> {
	if (cachedResponses[url]) {
		if (Date.now() - cachedResponses[url].time < cacheLife) {
			clearTimeout(cachedResponses[url].expireTimeout);
			cachedResponses[url].expireTimeout = setTimeout(
				() => delete cachedResponses[url],
				cacheLife
			);
			return await cachedResponses[url].response.catch(async e => {
				//Assume if the request errored out and the AbortController was aborted, that was the reason for the error,
				//and that this new request is using a new AbortController and should continue.
				if (e.name !== "AbortError") throw e;
				// Create a new request if the cached one was aborted
				return await fetchData(url);
			});
		}
		delete cachedResponses[url];
	}

	cachedResponses[url] = {
		response: requestPromise,
		time: Date.now(),
		expireTimeout: setTimeout(() => delete cachedResponses[url], cacheLife)
	};

	const data = await cachedResponses[url].response;
	cachedResponses[url].time = Date.now();
	return data;
}

async function fetchData<T>(
	url: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<T> {
	const requestPromise = fetch(hiveApiUrl + url, {
		...init,
		signal: controller?.signal,
		headers: {
			"X-Hive-Api-Version": "2024-03-29",
			...init?.headers
		}
	}).then(async response => {
		if (response.ok) return response.json();

		const timeout = response.headers.get("retry-after") ?? "60";
		if (response.status !== 429)
			throw new ApiHttpError(response.statusText, response.status);

		await new Promise(r => setTimeout(r, parseInt(timeout) * 1000));

		if (cacheLife > 0 && url in cachedResponses) {
			delete cachedResponses[url];
		}

		return await fetchData(url, controller);
	});

	const finalPromise =
		cacheLife > 0
			? requestPromise.catch(e => {
					if (url in cachedResponses) delete cachedResponses[url];
					throw e;
				})
			: requestPromise;

	return cacheLife > 0
		? await cacheRequest(url, finalPromise)
		: await finalPromise;
}

function validateMonth(game: Game, year?: number, month?: number): void {
	if (year === undefined || month === undefined) return;
	const { year: epochYear, month: epochMonth } =
		GameLeaderboardInfo[game].epoch;

	if (year < epochYear || (year === epochYear && month < epochMonth)) {
		throw new Error(
			`Can not access ${game} monthly statistics for month (${month}/${year}) prior to epoch (${epochMonth}/${epochYear}).`
		);
	}

	if (GameLeaderboardInfo[game].archived) {
		const { year: archivedYear, month: archivedMonth } =
			GameLeaderboardInfo[game].archived!;
		if (
			year > archivedYear ||
			(year === archivedYear && month > archivedMonth)
		) {
			throw new Error(
				`Can not access ${game} monthly statistics for month (${month}/${year}) after archival (${archivedMonth}/${archivedYear}).`
			);
		}
	}
}

export async function getMonthlyStats(
	identifier: string,
	year?: number,
	month?: number,
	controller?: AbortController,
	init?: RequestInit
) {
	validateMonth(Game.TreasureWars, year, month);

	let url = `/game/monthly/player/all/${identifier}`;
	if (year && month) url += `/${year}/${month}`;

	const data: { [G in Game]: GameStats<G, MonthlyGameStats> | null } =
		await fetchData(url, controller, init);
	Object.values(Game).forEach(<G extends Game>(game: G) => {
		const stats = data[game];
		if (!stats || Array.isArray(stats) || stats.human_index === 2147483647) {
			data[game] = null;
			return;
		}
		MonthlyStatsProcessors[game].forEach(processor => processor(stats));
	});
	return data;
}

export async function getGameMonthlyStats<G extends Game>(
	identifier: string,
	game: G,
	year?: number,
	month?: number,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameStats<G, MonthlyGameStats>> {
	validateMonth(game, year, month);

	let url = `/game/monthly/player/${game}/${identifier}`;
	if (year && month) url += `/${year}/${month}`;

	const data: GameStats<G, MonthlyGameStats> = await fetchData(
		url,
		controller,
		init
	);
	MonthlyStatsProcessors[game].forEach(processor => processor(data));
	return data;
}

export async function getGameSeasonStats<G extends SeasonGame>(
	identifier: string,
	game: G,
	season: number,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameStats<G, MonthlyGameStats>> {
	let url = `/game/season/player/${game}/${identifier}/${season}`;

	const data: GameStats<G, MonthlyGameStats> = await fetchData(
		url,
		controller,
		init
	);
	MonthlyStatsProcessors[game].forEach(processor => processor(data));
	return data;
}

export async function getAllTimeStats(
	identifier: string,
	resolveHubTitles: boolean = true,
	controller?: AbortController,
	init?: RequestInit
) {
	const data: { [G in Game]: GameStats<G, AllTimeGameStats> | null } & {
		main: Player;
	} = await fetchData(`/game/all/all/${identifier}`, controller, {
		...init,
		headers: {
			...init?.headers,
			"X-Hive-Resolve-Dynamic-Hub-Titles": resolveHubTitles.toString()
		}
	});
	Object.values(Game).forEach(<G extends Game>(game: G) => {
		const stats = data[game];
		if (!stats || Array.isArray(stats)) {
			data[game] = null;
			return;
		}
		AllTimeStatsProcessors[game].forEach(processor =>
			processor(stats as GameStats<G, AllTimeGameStats>)
		);
	});
	return data;
}

export async function getGameAllTimeStats<G extends Game>(
	identifier: string,
	game: G,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameStats<G, AllTimeGameStats>> {
	const data: GameStats<G, AllTimeGameStats> = await fetchData(
		`/game/all/${game}/${identifier}`,
		controller,
		init
	);
	AllTimeStatsProcessors[game].forEach(processor => processor(data));
	return data;
}

export async function getMainStats(
	identifier: string,
	resolveHubTitles: boolean = true,
	controller?: AbortController,
	init?: RequestInit
) {
	return (
		(await fetchData(`/game/all/all/${identifier}`, controller, {
			...init,
			headers: {
				...init?.headers,
				"X-Hive-Resolve-Dynamic-Hub-Titles": resolveHubTitles.toString()
			}
		})) as {
			main: Player;
		}
	)["main"];
}

export async function getParkourStats(
	identifier: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<ParkourStats> {
	return await fetchData(`/game/all/parkour/${identifier}`, controller, init);
}

export async function getMonthlyLeaderboard<G extends Game>(
	game: G,
	year?: number,
	month?: number,
	amount?: number,
	skip?: number,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameLeaderboard<G, MonthlyGameStats>> {
	validateMonth(game, year, month);

	let url = `/game/monthly/${game}`;
	if (year && month) {
		url += `/${year}/${month}`;
		if (amount) {
			url += `/${amount}`;
			if (skip) url += `/${skip}`;
		}
	}

	const data: GameLeaderboard<G, MonthlyGameStats> = Object.values(
		await fetchData(url, controller, init)
	);
	MonthlyStatsProcessors[game].forEach(processor =>
		data.forEach(d => processor(d))
	);
	return data;
}

export async function getSeasonLeaderboard<G extends SeasonGame>(
	game: G,
	season: number,
	amount?: number,
	skip?: number,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameLeaderboard<G, MonthlyGameStats>> {
	let url = `/game/season/${game}/${season}`;
	if (amount) {
		if (!skip) skip = 0;
		url += `/${amount}/${skip}`;
	}

	const data: GameLeaderboard<G, MonthlyGameStats> = Object.values(
		await fetchData(url, controller, init)
	);
	MonthlyStatsProcessors[game].forEach(processor =>
		data.forEach(d => processor(d))
	);
	return data;
}

export async function getSpecialLeaderboard<G extends SpecialGame>(
	game: G,
	leaderboardName: SpecialLeaderboardName[G],
	amount?: number,
	skip?: number,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameLeaderboard<G, MonthlyGameStats>> {
	let url = `/game/special/${game}/${leaderboardName}`;
	if (amount) {
		if (!skip) skip = 0;
		url += `/${amount}/${skip}`;
	}

	const data: GameLeaderboard<G, MonthlyGameStats> = Object.values(
		await fetchData(url, controller, init)
	);
	MonthlyStatsProcessors[game].forEach(processor =>
		data.forEach(d => processor(d))
	);
	return data;
}

export async function getAllTimeLeaderboard<G extends Game>(
	game: G,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameLeaderboard<G, AllTimeGameStats>> {
	const data: GameLeaderboard<G, AllTimeGameStats> = await fetchData(
		`/game/all/${game}`,
		controller,
		init
	);
	AllTimeStatsProcessors[game].forEach(processor =>
		data.forEach(d => processor(d))
	);
	return data;
}

export async function getServerStats(
	controller?: AbortController,
	init?: RequestInit
): Promise<{
	unique_players: {
		global: number;
		main: number;
	} & {
		[game in Game]: number;
	};
}> {
	return await fetchData("/global/statistics", controller, init);
}

export async function getGameMaps(
	game: Game,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameMap[]> {
	return await fetchData(`/game/map/${game}`, controller, init);
}

export async function getGameMetainfo(
	game: Game,
	controller?: AbortController,
	init?: RequestInit
): Promise<GameMetainfo> {
	return await fetchData(`/game/meta/${game}`, controller, init);
}

export async function searchPlayer(
	partial: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<PlayerSearchResult[]> {
	return await fetchData(
		`/player/search/${partial.toLowerCase()}`,
		controller,
		init
	);
}

export async function getPlayerActivity(
	uuid: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<PlayerActivity[]> {
	return await fetchData(`/player/activity/${uuid}`, controller, init);
}

export * from "./games/data";
export * from "./games/info";
export * from "./games/processors";
export * from "./map/data";
export * from "./player/data";
