import {
	AllTimeGameStats,
	Game,
	GameStats,
	MonthlyGameStats,
	BaseGameStats,
	PvPGameData
} from "./data";
import { GameInfo } from "./info";

const commonProcessedStats: ((stats: BaseGameStats) => void)[] = [
	stats => {
		stats.losses = stats.played - stats.victories;
	},
	stats => {
		if (stats.victories !== undefined)
			stats.win_percentage =
				stats.played === 0
					? "0%"
					: `${((stats.victories / stats.played) * 100).toFixed(2)}%`;
	},
	stats => {
		Object.entries(stats).forEach(([key, value]) => {
			if (Number.isNaN(value)) delete stats[key as keyof BaseGameStats];
		});
	}
];
const kdrProcessedStat = (stats: PvPGameData) => {
	stats.kdr =
		stats.deaths === 0
			? stats.kills
			: parseFloat((stats.kills / stats.deaths).toFixed(2));
};

export const MonthlyStatsProcessors: {
	[G in Game]: ((stats: GameStats<G, MonthlyGameStats>) => void)[];
} = {
	[Game.TreasureWars]: [
		kdrProcessedStat,
		stats => {
			stats.fkdr =
				stats.deaths === 0
					? stats.final_kills
					: parseFloat((stats.final_kills / stats.deaths).toFixed(2));
			stats.fkpr =
				stats.played === 0
					? stats.final_kills
					: parseFloat((stats.final_kills / stats.played).toFixed(2));
		},
		...commonProcessedStats
	],
	[Game.DeathRun]: commonProcessedStats,
	[Game.HideAndSeek]: commonProcessedStats,
	[Game.MurderMystery]: commonProcessedStats,
	[Game.SurvivalGames]: [kdrProcessedStat, ...commonProcessedStats],
	[Game.SkyWars]: [kdrProcessedStat, ...commonProcessedStats],
	[Game.JustBuild]: commonProcessedStats,
	[Game.GroundWars]: [kdrProcessedStat, ...commonProcessedStats],
	[Game.BlockDrop]: commonProcessedStats,
	[Game.CaptureTheFlag]: [kdrProcessedStat, ...commonProcessedStats],
	[Game.BlockParty]: commonProcessedStats,
	[Game.Bridge]: [
		// Transform abnormal stat keys in the leaderboard data
		(
			stats: GameStats<Game.Bridge, MonthlyGameStats> & {
				m_solo_played?: number;
				m_solo_victories?: number;
				m_solo_kills?: number;
				m_solo_deaths?: number;
				m_solo_goals?: number;
			}
		) => {
			["played", "victories", "kills", "deaths", "goals"].forEach(k => {
				const key = k as keyof typeof stats;
				const leaderboardKey = ("m_solo_" + k) as keyof typeof stats;
				if (stats[leaderboardKey]) {
					(stats as Record<typeof key, string | number | undefined>)[key] =
						stats[leaderboardKey];
					delete stats[leaderboardKey];
				}
			});
		},
		kdrProcessedStat,
		...commonProcessedStats
	]
};
export const AllTimeStatsProcessors: {
	[G in Game]: ((stats: GameStats<G, AllTimeGameStats>) => void)[];
} = Object.entries(MonthlyStatsProcessors).reduce(
	(acc, [game, processors]) => ({
		[game]: [
			...processors,
			(stats: AllTimeGameStats) =>
				(stats.level = calculateLevel(game as Game, stats.xp))
		],
		...acc
	}),
	{} as { [G in Game]: ((stats: GameStats<G, AllTimeGameStats>) => void)[] }
);

function calculateLevel(game: Game, xp: number) {
	if (game === Game.Bridge) {
		let lastXp = 0;
		let currentXp = 300;
		let increment = 300;
		let additionalIncrement = 300;

		let i = 2;
		while (true) {
			if (xp === currentXp) return i;
			else if (xp < currentXp) return i + (xp - lastXp) / (currentXp - lastXp) - 1;

			additionalIncrement = Math.floor(additionalIncrement * 1.08);
			increment += additionalIncrement;
			lastXp = currentXp;
			currentXp += increment;
			i++;
		}
	}

	const increment = GameInfo[game].levels.increment / 2;
	const flattenLevel = GameInfo[game].levels.increment_cap;
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

