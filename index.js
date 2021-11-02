const Axios = require("axios");
const NodeCache = require("node-cache");

const cache = new NodeCache({stdTTL: 300, checkperiod: 300});

const API_URL = "https://api.playhive.com/v0";

const TIME_SCOPE_ALL = "all";
const TIME_SCOPE_MONTHLY = "monthly";

/**
 * Values for XP and level calculation.
 * @type {Object.<string, number[]>}
 */
const GAME_XP = {
	wars: [150, 52],
	dr: [200],
	hide: [100],
	murder: [100, 82],
	sg: [150],
	sky: [150, 52],
	build: [100]
};

/**
 * Fetches a monthly leaderboard for a game
 * @param {string} game
 * @param {number=} year
 * @param {number=} month
 * @param {number=} amount Number of entries to fetch
 * @param {number=} skip Number of entries to skip
 * @returns {Promise<Object>} Monthly leaderboard
 */
async function getMonthlyLeaderboard(game, year, month, amount, skip) {
	let data;

	if (year && month) {
		if (amount && skip) {
			data = await fetchData(
				"/game/monthly/{game}/{year}/{month}/{amount}/{skip}",
				{
					game,
					year,
					month,
					amount,
					skip
				}
			);
		} else {
			data = await fetchData("/game/monthly/{game}/{year}/{month}", {
				game,
				year,
				month
			});
		}
	} else {
		data = await fetchData("/game/monthly/{game}", {game});
	}
	return data.map(player =>
		calculateExtraStats(player, game, TIME_SCOPE_MONTHLY)
	);
}

/**
 * Fetches all-time leaderboards for a game
 * @param {string} game
 * @returns {Promise<Object>} All-time leaderboard
 */
async function getAllTimeLeaderboard(game) {
	return (await fetchData("/game/all/{game}", {game})).map(player =>
		calculateExtraStats(player, game, TIME_SCOPE_ALL)
	);
}

/**
 * Fetches monthly player stats of a player
 * @param {string} identifier
 * @param {string} game
 * @param {number=} year
 * @param {number=} month
 * @returns {Promise<Object>} Monthly player statistics
 */
async function getMonthlyPlayerStats(identifier, game, year, month) {
	let data;

	if (year && month) {
		data = await fetchData(
			"/game/monthly/player/{game}/{identifier}/{year}/{month}",
			{
				game,
				identifier,
				year,
				month
			}
		);
	} else {
		data = await fetchData("/game/monthly/player/{game}/{identifier}", {
			game,
			identifier
		});
	}
	return calculateExtraStats(data, game, TIME_SCOPE_MONTHLY);
}

/**
 * Fetches all-time player stats of a player
 * @param {string} identifier
 * @param {string} game
 * @returns {Promise<Object>} All-time player statistics
 */
async function getAllTimePlayerStats(identifier, game) {
	return calculateExtraStats(
		await fetchData("/game/all/{game}/{identifier}", {
			game,
			identifier
		}),
		game,
		TIME_SCOPE_ALL
	);
}

/**
 * Calculates & appends extra statistics
 * @param {Object} data Player data
 * @param {string} game
 * @param {"monthly" | "all"} timeScope
 */
function calculateExtraStats(data, game, timeScope) {
	if ("played" in data) {
		if ("victories" in data) {
			data.games_lost = data.played - data.victories;
			data.win_percentage_raw =
				data.played === 0 ? 0 : data.victories / data.played;
			data.win_percentage = `${(data.win_percentage_raw * 100).toFixed(2)}%`;
		}

		let kills = data.kills ? data.kills : data.hider_kills;
		if (kills !== undefined) data.kpr = kills / data.played;
		if ("deaths" in data) {
			data.rpd = data.played / data.deaths;
			if ("checkpoints" in data) data.cdr = data.checkpoints / data.deaths;
			if (data.deaths === 0) {
				if (kills !== undefined) data.kdr = kills;
				if ("seeker_kills" in data) data.skdr = data.seeker_kills;
				if ("final_kills" in data) data.fkdr = data.final_kills;
				if ("treasure_destroyed" in data) data.ddr = data.treasure_destroyed;
			} else {
				if (kills !== undefined)
					data.kdr = parseFloat((kills / data.deaths).toFixed(2));
				if ("seeker_kills" in data) data.skdr = data.seeker_kills / data.deaths;
				if ("final_kills" in data)
					data.fkdr = parseFloat((data.final_kills / data.deaths).toFixed(2));
				if ("treasure_destroyed" in data)
					data.ddr = data.treasure_destroyed / data.deaths;
			}
		}
		if ("coins" in data && "murderer_eliminations" in data)
			data.efficiency = data.murderer_eliminations / 10 / data.coins;
		if ("deathmatches" in data) data.dmpr = data.deathmatches / data.played;
		if (timeScope === TIME_SCOPE_ALL)
			data.level = calculateLevel(game, data.xp);
	}
	return data;
}

/**
 * Calculates in-game level based on game & XP
 * @param {string} game
 * @param {number} xp
 * @returns {number} Game level
 */
function calculateLevel(game, xp) {
	let increment = GAME_XP[game][0] / 2;
	let flattenLevel = GAME_XP[game][1];
	let level =
		(-increment + Math.sqrt(Math.pow(increment, 2) - 4 * increment * -xp)) /
		(2 * increment) +
		1;
	if (flattenLevel && level > flattenLevel)
		level =
			flattenLevel +
			(xp -
				(increment * Math.pow(flattenLevel - 1, 2) +
					(flattenLevel - 1) * increment)) /
			((flattenLevel - 1) * increment * 2);
	return level;
}

/**
 * Fetches data from the Hive API
 * @param {string} path API path
 * @param {Object.<string>} pathParams Path parameters
 * @returns {Promise<any>} API data
 */
async function fetchData(path, pathParams) {
	path = buildUrl(path, pathParams);
	let response = cache.get(path);
	if (response === undefined) {
		response = {};
		try {
			response = (await Axios.get(path)).data;
		} catch (e) {
			if (e.response.status === 429) {
				response = e.response;
				if ("x-ratelimit-limit" in response.headers) {
					while (response.headers["retry-after"]) {
						await new Promise(r =>
							setTimeout(r, response.headers["retry-after"] * 1000)
						);
						try {
							response = (await Axios.get(path)).data;
						} catch (e) {
							console.log(e);
						}
					}
				} else {
					await new Promise(r => setTimeout(r, 60000));
					response = (await Axios.get(path)).data;
				}
			}
		}
		cache.set(path, response);
	}
	return response;
}

/**
 * Builds URL from path & parameters
 * @param {string} path
 * @param {Object.<string>} params
 */
function buildUrl(path, params) {
	if (!path.startsWith("/")) path = `/${path}`;
	return (
		API_URL +
		path.replace(/{(.+?)}/g, (fullMatch, key) => {
			return encodeURIComponent(params[key]);
		})
	);
}

module.exports = {
	getMonthlyLeaderboard,
	getAllTimeLeaderboard,
	getMonthlyPlayerStats,
	getAllTimePlayerStats
};
