import { Game } from "./data";

export const GameInfo: Record<
	Game,
	{
		levels: {
			increment: number;
			increment_cap?: number;
			max: number;
			max_prestige?: number;
		};
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
	[Game.TreasureWars]: {
		levels: {
			increment: 150,
			increment_cap: 52,
			max: 100,
			max_prestige: 5
		},
		leaderboard_epoch: {
			year: 2018,
			month: 11
		},
		archived: {
			year: 2024,
			month: 2
		}
	},
	[Game.DeathRun]: {
		levels: {
			increment: 200,
			increment_cap: 42,
			max: 75
		},
		leaderboard_epoch: {
			year: 2019,
			month: 0
		}
	},
	[Game.HideAndSeek]: {
		levels: {
			increment: 100,
			max: 75
		},
		leaderboard_epoch: {
			year: 2022,
			month: 5
		}
	},
	[Game.MurderMystery]: {
		levels: {
			increment: 100,
			increment_cap: 82,
			max: 100,
			max_prestige: 5
		},
		leaderboard_epoch: {
			year: 2019,
			month: 5
		}
	},
	[Game.SurvivalGames]: {
		levels: {
			increment: 150,
			max: 30
		},
		leaderboard_epoch: {
			year: 2019,
			month: 7
		}
	},
	[Game.SkyWars]: {
		levels: {
			increment: 150,
			increment_cap: 52,
			max: 75
		},
		leaderboard_epoch: {
			year: 2020,
			month: 4
		}
	},
	[Game.JustBuild]: {
		levels: {
			increment: 100,
			max: 20
		},
		leaderboard_epoch: {
			year: 2022,
			month: 0
		}
	},
	[Game.GroundWars]: {
		levels: {
			increment: 150,
			max: 20
		},
		leaderboard_epoch: {
			year: 2022,
			month: 5
		}
	},
	[Game.BlockDrop]: {
		levels: {
			increment: 150,
			increment_cap: 22,
			max: 25
		},
		leaderboard_epoch: {
			year: 2022,
			month: 5
		}
	},
	[Game.CaptureTheFlag]: {
		levels: {
			increment: 150,
			max: 50
		},
		leaderboard_epoch: {
			year: 2022,
			month: 5
		}
	},
	[Game.BlockParty]: {
		levels: {
			increment: 150,
			max: 25
		},
		leaderboard_epoch: {
			year: 2023,
			month: 0
		}
	},
	[Game.Bridge]: {
		levels: {
			increment: 0,
			max: 20
		},
		leaderboard_epoch: {
			year: 2023,
			month: 5
		}
	},
	[Game.Gravity]: {
		levels: {
			increment: 150,
			max: 25
		},
		leaderboard_epoch: {
			year: 2023,
			month: 6
		}
	}
};

export type GameMetainfo = {
	name: string;
	shortName: string;
	maxLevel: number;
	allowPrestiging: boolean;
	maxPrestige: number;
	experienceToLevel: Record<number, number>;
};

