import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import { AllTimeLeaderboard, AllTimePlayer, Game, MonthlyLeaderboard, MonthlyPlayer } from "./games/data";
import { AllTimeStatsProcessors, MonthlyStatsProcessors } from "./games/processors";

const cache = setupCache({
	maxAge: 5 * 60 * 1000
});
const request = axios.create({
	adapter: cache.adapter
});

async function fetchData<T>(
	url: string,
	controller?: AbortController
): Promise<T> {
	try {
		const response = await request.get("https://api.playhive.com/v0" + url, {
			signal: controller?.signal
		});
		return response.data;
	} catch (e) {
		if (axios.isAxiosError(e)) {
			const response = e.response;
			if (response?.status === 429) {
				const timeout = response?.headers["retry-after"];
				if (typeof timeout === "number") {
					await new Promise(r => setTimeout(r, timeout * 1000));
					return fetchData(url, controller);
				}
			}
		}
		throw e;
	}
}

export async function getMonthlyStats<T extends Game>(
	identifier: string,
	game: T,
	year?: number,
	month?: number,
	controller?: AbortController
): Promise<MonthlyPlayer[T]> {
	let url = `/game/monthly/player/${game}/${identifier}`;
	if (year && month) url += `/${year}/${month}`;

	const data: MonthlyPlayer[T] = await fetchData(url, controller);
	MonthlyStatsProcessors[game].forEach(processor => processor(data));
	return data;
}

export async function getAllTimeStats<T extends Game>(
	identifier: string,
	game: T,
	controller?: AbortController
): Promise<AllTimePlayer[T]> {
	const data: AllTimePlayer[T] = await fetchData(
		`/game/all/${game}/${identifier}`,
		controller
	);
	AllTimeStatsProcessors[game].forEach(processor => processor(data));
	return data;
}

export async function getMonthlyLeaderboard<T extends Game>(
	game: T,
	year?: number,
	month?: number,
	amount?: number,
	skip?: number,
	controller?: AbortController
): Promise<MonthlyLeaderboard[T]> {
	let url = `/game/monthly/${game}`;
	if (year && month) {
		url += `/${year}/${month}`;
		if (amount) {
			url += `/${amount}`;
			if (skip) url += `/${skip}`;
		}
	}

	const data: MonthlyLeaderboard[T] = await fetchData(url, controller);
	MonthlyStatsProcessors[game].forEach(processor => data.forEach(d => processor(d)));
	return data;
}

export async function getAllTimeLeaderboard<T extends Game>(
	game: T,
	controller?: AbortController
): Promise<AllTimeLeaderboard[T]> {
	const data: AllTimeLeaderboard[T] = await fetchData(
		`/game/all/${game}`,
		controller
	);
	AllTimeStatsProcessors[game].forEach(processor => data.forEach(d => processor(d)));
	return data;
}