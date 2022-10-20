import {
	AllTimePlayer,
	BaseGameData,
	Game,
	GameData,
	MonthlyPlayer,
	PvPGameData
} from "./data";
import { GameInfo } from "./info";

const commonProcessedStats: ((stats: BaseGameData) => void)[] = [
	stats => {
		stats.losses = stats.played - stats.victories;
	},
	stats => {
		stats.win_percentage =
			stats.played === 0 ? 0 : stats.victories / stats.played;
	}
];
const kdrProcessedStat = (stats: PvPGameData) => {
	stats.kdr = stats.deaths === 0 ? stats.kills : stats.kills / stats.deaths;
};

const StatsProcessors: {
	[K in Game]: ((stats: GameData[K]) => void)[];
} = {
	[Game.TreasureWars]: [
		...commonProcessedStats,
		kdrProcessedStat,
		(stats: GameData[Game.TreasureWars]) => {
			stats.fkdr =
				stats.deaths === 0
					? stats.final_kills
					: stats.final_kills / stats.deaths;
		}
	],
	[Game.DeathRun]: commonProcessedStats,
	[Game.HideAndSeek]: commonProcessedStats,
	[Game.MurderMystery]: commonProcessedStats,
	[Game.SurvivalGames]: [...commonProcessedStats, kdrProcessedStat],
	[Game.SkyWars]: [...commonProcessedStats, kdrProcessedStat],
	[Game.JustBuild]: commonProcessedStats,
	[Game.GroundWars]: [...commonProcessedStats, kdrProcessedStat],
	[Game.BlockDrop]: commonProcessedStats,
	[Game.CaptureTheFlag]: [...commonProcessedStats, kdrProcessedStat]
};
export const MonthlyStatsProcessors: {
	[K in Game]: ((stats: MonthlyPlayer[K]) => void)[];
} = StatsProcessors;
export const AllTimeStatsProcessors: {
	[K in Game]: ((stats: AllTimePlayer[K]) => void)[];
} = StatsProcessors;
Object.entries(AllTimeStatsProcessors).forEach(([game, processors]) => {
	processors.push(stats => {
		stats.level = calculateLevel(game as Game, stats.xp);
	});
});

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

