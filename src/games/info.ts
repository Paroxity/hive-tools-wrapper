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
	}
> = {
	[Game.TreasureWars]: {
		levels: {
			increment: 150,
			increment_cap: 52,
			max: 100,
			max_prestige: 5
		}
	},
	[Game.DeathRun]: {
		levels: {
			increment: 200,
			increment_cap: 42,
			max: 75
		}
	},
	[Game.HideAndSeek]: {
		levels: {
			increment: 100,
			max: 50
		}
	},
	[Game.MurderMystery]: {
		levels: {
			increment: 100,
			increment_cap: 82,
			max: 100,
			max_prestige: 5
		}
	},
	[Game.SurvivalGames]: {
		levels: {
			increment: 150,
			max: 30
		}
	},
	[Game.SkyWars]: {
		levels: {
			increment: 150,
			increment_cap: 52,
			max: 75
		}
	},
	[Game.JustBuild]: {
		levels: {
			increment: 100,
			max: 20
		}
	},
	[Game.GroundWars]: {
		levels: {
			increment: 150,
			max: 20
		}
	},
	[Game.BlockDrop]: {
		levels: {
			increment: 150,
			increment_cap: 22,
			max: 25
		}
	},
	[Game.CaptureTheFlag]: {
		levels: {
			increment: 150,
			max: 20
		}
	}
};

