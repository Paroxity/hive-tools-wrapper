import {
	AllTimeGameStats,
	Game,
	GameLeaderboard,
	GameStats,
	MonthlyGameStats
} from "./games/data";
import { GameInfo } from "./games/info";
import {
	AllTimeStatsProcessors,
	MonthlyStatsProcessors
} from "./games/processors";
import { Player } from "./player/data";
import { GameMap } from "./map/data";

const cachedResponses: {
	[key: string]: {
		response: Promise<any>;
		time: number;
	};
} = {};

async function fetchData<T>(
	url: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<T> {
	if (cachedResponses[url]) {
		if (Date.now() - cachedResponses[url].time < 5 * 60 * 1000)
			return await cachedResponses[url].response.catch(async e => {
				//Assume if the request errored out and the AbortController was aborted, that was the reason for the error,
				//and that this new request is using a new AbortController and should continue.
				if (e.name !== "AbortError") throw e;
				return await fetchData(url);
			});
		delete cachedResponses[url];
	}
	cachedResponses[url] = {
		response: fetch("https://api.playhive.com/v0" + url, {
			signal: controller?.signal,
			...init
		})
			.then(async response => {
				if (response.ok) return response.json();

				const timeout = response.headers.get("retry-after") ?? "60";
				if (response.status !== 429) throw new Error(response.statusText);

				await new Promise(r => setTimeout(r, parseInt(timeout) * 1000));
				delete cachedResponses[url];
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
	Object.entries(data).forEach(([game, stats]) => {
		if (!stats || Array.isArray(stats) || stats.human_index === 2147483647) {
			data[game as keyof typeof data] = null;
			return;
		}
		MonthlyStatsProcessors[game as Game].forEach(processor =>
			processor(stats as GameStats<Game>)
		);
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

	const data: GameStats<G, MonthlyGameStats> = await fetchData(url, controller, init);
	MonthlyStatsProcessors[game].forEach(processor => processor(data));
	return data;
}

export async function getAllTimeStats(
	identifier: string,
	controller?: AbortController,
	init?: RequestInit
) {
	const data: { [G in Game]: GameStats<G, AllTimeGameStats> | null } & {
		main: Player | null;
	} = await fetchData(`/game/all/all/${identifier}`, controller, init);
	Object.entries(data)
		.filter(([game]) => game !== "main")
		.forEach(([game, stats]) => {
			if (!stats || Array.isArray(stats)) {
				data[game as keyof typeof data] = null;
				return;
			}
			AllTimeStatsProcessors[game as Game]?.forEach(processor =>
				processor(stats as GameStats<Game>)
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
	controller?: AbortController,
	init?: RequestInit
): Promise<Player> {
	return (
		(await fetchData(`/game/all/all/${identifier}`, controller, init)) as {
			main: Player;
		}
	)["main"];
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

	const data: GameLeaderboard<G, MonthlyGameStats> = await fetchData(
		url,
		controller,
		init
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

export async function getServerStats(controller?: AbortController, init?: RequestInit): Promise<{
	unique_players: {
		global: number;
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

export * from "./games/data";
export * from "./games/info";
export * from "./games/processors";
export * from "./map/data";
export * from "./player/data";
