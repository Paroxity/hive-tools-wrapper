import { Game } from "./data";
import _GameXpInfo from "./xp_info.json";

export const GameLeaderboardInfo: Record<
	Game,
	{
		leaderboard_epoch: {
			year: number;
			month: number;
		};
		archived?: {
			year: number;
			month: number;
		};
	}
> = {
	[Game.BedWars]: {
		leaderboard_epoch: {
			year: 2024,
			month: 3
		}
	},
	[Game.DeathRun]: {
		leaderboard_epoch: {
			year: 2019,
			month: 1
		}
	},
	[Game.HideAndSeek]: {
		leaderboard_epoch: {
			year: 2022,
			month: 6
		}
	},
	[Game.MurderMystery]: {
		leaderboard_epoch: {
			year: 2019,
			month: 6
		}
	},
	[Game.SurvivalGames]: {
		leaderboard_epoch: {
			year: 2019,
			month: 8
		}
	},
	[Game.SkyWars]: {
		leaderboard_epoch: {
			year: 2020,
			month: 5
		}
	},
	[Game.JustBuild]: {
		leaderboard_epoch: {
			year: 2022,
			month: 1
		}
	},
	[Game.GroundWars]: {
		leaderboard_epoch: {
			year: 2022,
			month: 6
		}
	},
	[Game.BlockDrop]: {
		leaderboard_epoch: {
			year: 2022,
			month: 6
		}
	},
	[Game.CaptureTheFlag]: {
		leaderboard_epoch: {
			year: 2022,
			month: 6
		}
	},
	[Game.BlockParty]: {
		leaderboard_epoch: {
			year: 2023,
			month: 1
		}
	},
	[Game.Bridge]: {
		leaderboard_epoch: {
			year: 2023,
			month: 6
		}
	},
	[Game.Gravity]: {
		leaderboard_epoch: {
			year: 2023,
			month: 7
		}
	},
	[Game.TreasureWars]: {
		leaderboard_epoch: {
			year: 2018,
			month: 12
		},
		archived: {
			year: 2024,
			month: 3
		}
	}
};

//@ts-ignore `xp_info.json` will be missing newly added games prior to regenerating the file
export const GameXpInfo: Record<
	Game,
	{
		increment: number;
		increment_cap?: number;
		max: number;
		max_prestige?: number;
	}
> = _GameXpInfo;

export type GameMetainfo = {
	name: string;
	shortName: string;
	maxLevel: number;
	allowPrestiging: boolean;
	maxPrestige: number;
	experienceToLevel: Record<number, number>;
};
