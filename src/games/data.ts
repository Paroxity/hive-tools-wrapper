export enum Game {
	TreasureWars = "wars",
	DeathRun = "dr",
	HideAndSeek = "hide",
	MurderMystery = "murder",
	SurvivalGames = "sg",
	SkyWars = "sky",
	JustBuild = "build",
	GroundWars = "ground",
	BlockDrop = "drop",
	CaptureTheFlag = "ctf"
}

export type LeaderboardGameData = {
	index: number;
	human_index: number;
};

export type PrestigeGameData<P extends Player> = P extends AllTimePlayer
	? {
			prestige: number;
	  }
	: {};

export type PvPGameData = {
	kills: number;
	deaths: number;
	kdr: number;
};

export interface Player {
	played: number;
	victories: number;
	losses: number;
	win_percentage: string;
	xp: number;
}

export interface MonthlyPlayer extends Player {
	username: string;
	uncapped_xp: number;
}

export interface AllTimePlayer extends Player {
	UUID: string;
	first_played: number;
	level: number;
}

type GamePlayerInner<P extends Player> = {
	[Game.TreasureWars]: P &
		PvPGameData &
		PrestigeGameData<P> & {
			final_kills: number;
			fkdr: number;
			treasure_destroyed: number;
		};
	[Game.DeathRun]: P & {
		kills: number;
		deaths: number;
		checkpoints: number;
		activated: number;
	};
	[Game.HideAndSeek]: P & {
		hider_kills: number;
		seeker_kills: number;
		deaths: number;
	};
	[Game.MurderMystery]: P & {
		murders: number;
		murderer_eliminations: number;
		deaths: number;
		coins: number;
	};
	[Game.SurvivalGames]: P &
		PvPGameData & {
			crates: number;
			cows: number;
			deathmatches: number;
		};
	[Game.SkyWars]: P &
		PvPGameData & {
			mystery_chests_destroyed: number;
			ores_mined: number;
			spells_used: number;
		};
	[Game.JustBuild]: P & {
		rating_meh_received: number;
		rating_okay_received: number;
		rating_good_received: number;
		rating_love_received: number;
	};

	[Game.GroundWars]: P &
		PvPGameData & {
			blocks_placed: number;
			blocks_destroyed: number;
			projectiles_fired: number;
		};
	[Game.BlockDrop]: P & {
		deaths: number;
		vaults_used: number;
		powerups_collected: number;
		blocks_destroyed: number;
	};
	[Game.CaptureTheFlag]: P &
		PvPGameData & {
			assists: number;
			flags_captured: number;
			flags_returned: number;
		};
};

export type GamePlayer<
	G extends Game,
	P extends Player = any
> = GamePlayerInner<P>[G] &
	(P extends MonthlyPlayer ? LeaderboardGameData : {});

export type GameLeaderboard<
	G extends Game,
	P extends Player = MonthlyPlayer
> = (GamePlayer<G, P> & LeaderboardGameData)[];

