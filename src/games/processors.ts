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
	[G in Game]: ((stats: GameStats<G,  MonthlyGameStats>) => void)[];
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
	[Game.BlockParty]: commonProcessedStats
};
export const AllTimeStatsProcessors: {
	[G in Game]: ((stats: GameStats<G, AllTimeGameStats>) => void)[];
} = Object.entries(MonthlyStatsProcessors).reduce(
	(acc, [game, processors]) => ({
		...acc,
		[game]: [
			...processors,
			(stats: AllTimeGameStats) =>
				(stats.level = calculateLevel(game as Game, stats.xp))
		]
	}),
	{} as { [G in Game]: ((stats: GameStats<G, AllTimeGameStats>) => void)[] }
);

function calculateLevel(game: Game, xp: number) {
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
