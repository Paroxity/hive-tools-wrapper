import { Game } from "./data";
import _GameXpInfo from "./xp_info.json";

export const GameLeaderboardInfo: Record<
	Game,
	{
		epoch: {
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
		epoch: {
			year: 2024,
			month: 3
		}
	},
	[Game.DeathRun]: {
		epoch: {
			year: 2019,
			month: 1
		}
	},
	[Game.HideAndSeek]: {
		epoch: {
			year: 2022,
			month: 6
		}
	},
	[Game.MurderMystery]: {
		epoch: {
			year: 2019,
			month: 6
		}
	},
	[Game.SurvivalGames]: {
		epoch: {
			year: 2019,
			month: 8
		}
	},
	[Game.SkyWars]: {
		epoch: {
			year: 2020,
			month: 5
		}
	},
	[Game.JustBuild]: {
		epoch: {
			year: 2022,
			month: 1
		}
	},
	[Game.GroundWars]: {
		epoch: {
			year: 2022,
			month: 6
		}
	},
	[Game.BlockDrop]: {
		epoch: {
			year: 2022,
			month: 6
		}
	},
	[Game.CaptureTheFlag]: {
		epoch: {
			year: 2022,
			month: 6
		}
	},
	[Game.BlockParty]: {
		epoch: {
			year: 2023,
			month: 1
		}
	},
	[Game.Bridge]: {
		epoch: {
			year: 2023,
			month: 6
		}
	},
	[Game.Gravity]: {
		epoch: {
			year: 2023,
			month: 7
		}
	},
	[Game.TreasureWars]: {
		epoch: {
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
	shortName: Uppercase<Game>;
	maxLevel: number;
	allowPrestiging: boolean;
	maxPrestige: number;
	experienceToLevel: Record<number, number>;
	levelUnlocks: {
		[level: number]: {
			name: string;
			icon: string | null;
			type: string;
			global: boolean;
			globalCosmetic: {
				url: string;
				name: string;
				type: string;
			}
		}[];
	};
	levelUnlockTypes: {
		[type: string]: {
			name: string;
			icon: string | null;
			default: string | null;
		}
	}
};
