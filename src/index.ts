import {
	AllTimePlayer,
	Game,
	GameLeaderboard,
	GamePlayer,
	MonthlyPlayer
} from "./games/data";
import { GameInfo } from "./games/info";
import {
	AllTimeStatsProcessors,
	MonthlyStatsProcessors
} from "./games/processors";

const cachedResponses: {
	[key: string]: {
		response: Promise<any>;
		time: number;
	};
} = {};

async function fetchData<T>(
	url: string,
	controller?: AbortController
): Promise<T> {
	if (cachedResponses[url]) {
		if (Date.now() - cachedResponses[url].time < 5 * 60 * 1000) {
			return await cachedResponses[url].response;
		}
		delete cachedResponses[url];
	}
	cachedResponses[url] = {
		response: fetch("https://api.playhive.com/v0" + url, {
			signal: controller?.signal
		})
			.then(async response => {
				if (response.ok) return response.json();

				const timeout = response.headers.get("retry-after");
				if (response.status !== 429 || !timeout) {
					delete cachedResponses[url];
					throw new Error(response.statusText);
				}

				await new Promise(r => setTimeout(r, parseInt(timeout) * 1000));
				return await fetchData(url, controller);
			})
			.catch(e => {
				delete cachedResponses[url];
				throw e;
			}),
		time: Date.now()
	};
	const data = await cachedResponses[url].response;
	cachedResponses[url].time = Date.now();
	return data;
}

function validateMonth(game: Game, year?: number, month?: number): void {
	if (year === undefined || month === undefined) return;
	const { year: epochYear, month: epochMonth } =
		GameInfo[game].leaderboard_epoch;

	if (year < epochYear || (year === epochYear && month < epochMonth)) {
		throw new Error(
			`Can not access monthly statistics for the month (${month}/${year}), prior to epoch (${epochMonth}/${epochYear}).`
		);
	}
}

export async function getMonthlyStats<G extends Game>(
	identifier: string,
	game: G,
	year?: number,
	month?: number,
	controller?: AbortController
): Promise<GamePlayer<G, MonthlyPlayer>> {
	validateMonth(game, year, month);

	let url = `/game/monthly/player/${game}/${identifier}`;
	if (year && month) url += `/${year}/${month}`;

	const data: GamePlayer<G, MonthlyPlayer> = await fetchData(url, controller);
	MonthlyStatsProcessors[game].forEach(processor => processor(data));
	return data;
}

export async function getAllTimeStats<G extends Game>(
	identifier: string,
	game: G,
	controller?: AbortController
): Promise<GamePlayer<G, AllTimePlayer>> {
	const data: GamePlayer<G, AllTimePlayer> = await fetchData(
		`/game/all/${game}/${identifier}`,
		controller
	);
	AllTimeStatsProcessors[game].forEach(processor => processor(data));
	return data;
}

export async function getMonthlyLeaderboard<G extends Game>(
	game: G,
	year?: number,
	month?: number,
	amount?: number,
	skip?: number,
	controller?: AbortController
): Promise<GameLeaderboard<G, MonthlyPlayer>> {
	validateMonth(game, year, month);

	let url = `/game/monthly/${game}`;
	if (year && month) {
		url += `/${year}/${month}`;
		if (amount) {
			url += `/${amount}`;
			if (skip) url += `/${skip}`;
		}
	}

	const data: GameLeaderboard<G, MonthlyPlayer> = await fetchData(
		url,
		controller
	);
	MonthlyStatsProcessors[game].forEach(processor =>
		data.forEach(d => processor(d))
	);
	return data;
}

export async function getAllTimeLeaderboard<G extends Game>(
	game: G,
	controller?: AbortController
): Promise<GameLeaderboard<G, AllTimePlayer>> {
	const data: GameLeaderboard<G, AllTimePlayer> = await fetchData(
		`/game/all/${game}`,
		controller
	);
	AllTimeStatsProcessors[game].forEach(processor =>
		data.forEach(d => processor(d))
	);
	return data;
}

export * from "./games/data";
export * from "./games/info";
export * from "./games/processors";
