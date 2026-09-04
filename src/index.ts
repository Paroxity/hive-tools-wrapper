import { CatalogueItem } from "./catalogue/data";
import {
	AllTimeGameStats,
	AvailableMonthlyLeaderboard,
	Game,
	GameLeaderboard,
	Games,
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
import {
	ApiHttpError,
	clearCache,
	enableCache,
	fetchData,
	getCache,
	getHiveApiUrl,
	retryAfterRequestLimitTimeout,
	setHiveApiKey,
	setHiveApiUrl
} from "./http";
import { GameMap } from "./map/data";
import { Player, PlayerActivity, PlayerSearchResult } from "./player/data";

export {
	ApiHttpError,
	clearCache,
	enableCache,
	getCache,
	getHiveApiUrl,
	retryAfterRequestLimitTimeout,
	setHiveApiKey,
	setHiveApiUrl
};

function playerResolveHeaders(
	resolveHubTitles: boolean,
	init?: RequestInit
): HeadersInit {
	return {
		...init?.headers,
		"X-Hive-Resolve-Dynamic-Hub-Titles": resolveHubTitles.toString(),
		"X-Hive-Resolve-Stat-Track": resolveHubTitles.toString()
	};
}

function catalogueListUrl(
	path: string,
	limit?: number,
	offset?: number
): string {
	if (limit !== undefined && (limit < 1 || limit > 50)) {
		throw new Error("Catalogue limit must be between 1 and 50.");
	}
	if (offset !== undefined && offset < 0) {
		throw new Error("Catalogue offset must be greater than or equal to 0.");
	}

	const params = new URLSearchParams();
	if (limit !== undefined) params.set("limit", String(limit));
	if (offset !== undefined) params.set("offset", String(offset));
	const query = params.toString();
	return query ? `${path}?${query}` : path;
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
	Games.forEach(<G extends Game>(game: G) => {
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
		parkour: ParkourStats | null;
	} = await fetchData(`/game/all/all/${identifier}`, controller, {
		...init,
		headers: playerResolveHeaders(resolveHubTitles, init)
	});
	Games.forEach(<G extends Game>(game: G) => {
		const stats = data[game];
		if (!stats || Array.isArray(stats)) {
			data[game] = null;
			return;
		}
		AllTimeStatsProcessors[game].forEach(processor =>
			processor(stats as GameStats<G, AllTimeGameStats>)
		);
	});
	if (!data.parkour || Array.isArray(data.parkour)) {
		data.parkour = null;
	}
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
		(await fetchData(`/game/all/main/${identifier}`, controller, {
			...init,
			headers: playerResolveHeaders(resolveHubTitles, init)
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
	} & Partial<Record<Game, number>>;
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
	if (partial.length < 4) {
		throw new Error("Player search partial must be at least 4 characters.");
	}

	return await fetchData(
		`/player/search/${partial.toLowerCase()}`,
		controller,
		init
	);
}

export async function getPlayerActivity(
	uuid: string,
	controller?: AbortController,
	init?: RequestInit,
	realtime?: boolean
): Promise<PlayerActivity[]> {
	const url = realtime
		? `/player/activity/${uuid}?realtime=true`
		: `/player/activity/${uuid}`;
	return await fetchData(url, controller, init);
}

export async function getAvailableMonthlyLeaderboards(
	game: Game,
	showCounts: boolean = false,
	controller?: AbortController,
	init?: RequestInit
): Promise<AvailableMonthlyLeaderboard[]> {
	return await fetchData(`/game/monthly/${game}/available`, controller, {
		...init,
		headers: {
			...init?.headers,
			...(showCounts ? { "X-Hive-Show-Counts": "true" } : {})
		}
	});
}

export async function getCostumes(
	limit?: number,
	offset?: number,
	controller?: AbortController,
	init?: RequestInit
): Promise<CatalogueItem[]> {
	return await fetchData(
		catalogueListUrl("/catalogue/costumes", limit, offset),
		controller,
		init
	);
}

export async function getCostume(
	id: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<CatalogueItem> {
	return await fetchData(`/catalogue/costumes/${id}`, controller, init);
}

export async function getTitles(
	limit?: number,
	offset?: number,
	controller?: AbortController,
	init?: RequestInit
): Promise<CatalogueItem[]> {
	return await fetchData(
		catalogueListUrl("/catalogue/titles", limit, offset),
		controller,
		init
	);
}

export async function getTitle(
	id: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<CatalogueItem> {
	return await fetchData(`/catalogue/titles/${id}`, controller, init);
}

export * from "./catalogue/data";
export * from "./games/data";
export * from "./games/info";
export * from "./games/processors";
export * from "./map/data";
export * from "./player/data";
export * as v2 from "./v2";
