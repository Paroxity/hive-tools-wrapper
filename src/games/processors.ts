import {
	AllTimePlayer,
	Game,
	GamePlayer,
	MonthlyPlayer,
	Player,
	PrestigeGameData,
	PvPGameData
} from "./data";
import { GameInfo } from "./info";

const commonProcessedStats: ((stats: Player) => void)[] = [
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
			if (Number.isNaN(value)) delete stats[key as keyof Player];
		});
	}
];
const kdrProcessedStat = (stats: PvPGameData) => {
	stats.kdr =
		stats.deaths === 0
			? stats.kills
			: parseFloat((stats.kills / stats.deaths).toFixed(2));
};

const StatsProcessors: {
	[G in Game]: ((stats: GamePlayer<G, MonthlyPlayer>) => void)[];
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

export const MonthlyStatsProcessors: {
	[G in Game]: ((stats: GamePlayer<G, MonthlyPlayer>) => void)[];
} = Object.entries(StatsProcessors).reduce(
	(acc, [game, processors]) => ({
		...acc,
		[game]: [
			...processors,
			(stats: MonthlyPlayer) => {
				if (stats.xp && hasPrestige(stats)) {
					stats.xp = stats.xp + stats.prestige * calculateMaxXp(game as Game);
				}
			}
		]
	}),
	{} as { [G in Game]: ((stats: GamePlayer<G, MonthlyPlayer>) => void)[] }
);
export const AllTimeStatsProcessors: {
	[G in Game]: ((stats: GamePlayer<G, AllTimePlayer>) => void)[];
} = Object.entries(StatsProcessors).reduce(
	(acc, [game, processors]) => ({
		...acc,
		[game]: [
			...processors,
			(stats: AllTimePlayer) =>
				(stats.level = calculateLevel(game as Game, stats.xp))
		]
	}),
	{} as { [G in Game]: ((stats: GamePlayer<G, AllTimePlayer>) => void)[] }
);

function hasPrestige(stats: GamePlayer<any>): stats is PrestigeGameData {
	return stats.prestige;
}

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

function calculateMaxXp(game: Game): number {
	const maxLevel = GameInfo[game].levels.max - 1;
	const increment = GameInfo[game].levels.increment;
	const incrementCap = GameInfo[game].levels.increment_cap;
	const inputIncrement = increment / 2;
	const inputLevel = incrementCap ? incrementCap - 1 : maxLevel;
	return (
		inputIncrement * Math.pow(inputLevel, 2) +
		inputIncrement * inputLevel +
		increment * inputLevel * (maxLevel - inputLevel)
	);
}
