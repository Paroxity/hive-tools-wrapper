import { fetchData, getHiveApiV2Url, withQuery } from "../http";
import {
	V2ActivityResponse,
	V2Cosmetic,
	V2Discovery,
	V2Entitlement,
	V2Game,
	V2Leaderboard,
	V2LeaderboardEntry,
	V2ListQuery,
	V2ListResponse,
	V2Map,
	V2NetworkStatisticsResponse,
	V2OwnedCosmetic,
	V2PlayerProfile,
	V2PlayerStatistics,
	V2PlayerSummary,
	V2Progression
} from "./data";

export * from "./data";

function fetchV2<T>(
	path: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<T> {
	return fetchData<T>(path, controller, init, {
		baseUrl: getHiveApiV2Url(),
		apiVersionHeader: false
	});
}

export async function getDiscovery(
	controller?: AbortController,
	init?: RequestInit
): Promise<V2Discovery> {
	return await fetchV2("", controller, init);
}

export async function searchPlayers(
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2PlayerSummary>> {
	return await fetchV2(withQuery("/players", query), controller, init);
}

export async function getPlayer(
	playerId: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2PlayerProfile> {
	return await fetchV2(`/players/${playerId}`, controller, init);
}

export async function getPlayerStatistics(
	playerId: string,
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2PlayerStatistics>> {
	return await fetchV2(
		withQuery(`/players/${playerId}/statistics`, query),
		controller,
		init
	);
}

export async function getPlayerGameStatistics(
	playerId: string,
	gameId: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2PlayerStatistics> {
	return await fetchV2(
		`/players/${playerId}/statistics/${gameId}`,
		controller,
		init
	);
}

export async function getPlayerEntitlements(
	playerId: string,
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2Entitlement>> {
	return await fetchV2(
		withQuery(`/players/${playerId}/entitlements`, query),
		controller,
		init
	);
}

export async function getPlayerCosmetics(
	playerId: string,
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2OwnedCosmetic>> {
	return await fetchV2(
		withQuery(`/players/${playerId}/cosmetics`, query),
		controller,
		init
	);
}

export async function getPlayerActivity(
	playerId: string,
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ActivityResponse> {
	return await fetchV2(
		withQuery(`/players/${playerId}/activity`, query),
		controller,
		init
	);
}

export async function getNetworkStatistics(
	controller?: AbortController,
	init?: RequestInit
): Promise<V2NetworkStatisticsResponse> {
	return await fetchV2("/network/statistics", controller, init);
}

export async function getLeaderboards(
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2Leaderboard>> {
	return await fetchV2(withQuery("/leaderboards", query), controller, init);
}

export async function getLeaderboard(
	leaderboardId: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2Leaderboard> {
	return await fetchV2(`/leaderboards/${leaderboardId}`, controller, init);
}

export async function getLeaderboardEntries(
	leaderboardId: string,
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2LeaderboardEntry>> {
	return await fetchV2(
		withQuery(`/leaderboards/${leaderboardId}/entries`, query),
		controller,
		init
	);
}

export async function getLeaderboardEntry(
	leaderboardId: string,
	playerId: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2LeaderboardEntry> {
	return await fetchV2(
		`/leaderboards/${leaderboardId}/entries/${playerId}`,
		controller,
		init
	);
}

export async function getGames(
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2Game>> {
	return await fetchV2(withQuery("/games", query), controller, init);
}

export async function getGame(
	gameId: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2Game> {
	return await fetchV2(`/games/${gameId}`, controller, init);
}

export async function getGameProgression(
	gameId: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2Progression> {
	return await fetchV2(`/games/${gameId}/progression`, controller, init);
}

export async function getGameMaps(
	gameId: string,
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2Map>> {
	return await fetchV2(
		withQuery(`/games/${gameId}/maps`, query),
		controller,
		init
	);
}

export async function getCosmetics(
	query?: V2ListQuery,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2ListResponse<V2Cosmetic>> {
	return await fetchV2(withQuery("/cosmetics", query), controller, init);
}

export async function getCosmetic(
	cosmeticId: string,
	controller?: AbortController,
	init?: RequestInit
): Promise<V2Cosmetic> {
	return await fetchV2(`/cosmetics/${cosmeticId}`, controller, init);
}
