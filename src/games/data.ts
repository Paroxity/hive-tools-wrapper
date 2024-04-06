export enum Game {
	BedWars = "bed",
	DeathRun = "dr",
	HideAndSeek = "hide",
	MurderMystery = "murder",
	SurvivalGames = "sg",
	SkyWars = "sky",
	JustBuild = "build",
	GroundWars = "ground",
	BlockDrop = "drop",
	CaptureTheFlag = "ctf",
	BlockParty = "party",
	Bridge = "bridge",
	Gravity = "grav",
	TreasureWars = "wars",
}

export type LeaderboardGameData = {
	index: number;
	human_index: number;
};

export type PrestigeGameData = {
	prestige: number;
};

export type PvPGameData = {
	kills: number;
	deaths: number;
	kdr: number;
};

export interface BaseGameStats {
	played: number;
	victories: number;
	losses: number;
	win_percentage: string;
	xp: number;
}

export interface MonthlyGameStats extends BaseGameStats {
	username: string;
	uncapped_xp: number;
}

export interface AllTimeGameStats extends BaseGameStats {
	UUID: string;
	first_played: number;
	level: number;
}

type GameStatsInner<P extends BaseGameStats> = {
	[Game.BedWars]: P &
		PvPGameData &
		PrestigeGameData & {
			final_kills: number;
			fkdr: number;
			fkpr: number;
			beds_destroyed: number;
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
	[Game.MurderMystery]: P &
		PrestigeGameData & {
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
		rating_great_received: number;
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
	[Game.BlockParty]: P & {
		powerups_collected: number;
		rounds_survived: number;
	};
	[Game.Bridge]: P &
		PvPGameData & {
			goals: number;
		};
	[Game.Gravity]: P & {
		deaths: number;
		maps_completed: number;
		maps_completed_without_dying: number;
	};
	[Game.TreasureWars]: P &
		PvPGameData &
		PrestigeGameData & {
			final_kills: number;
			fkdr: number;
			fkpr: number;
			treasure_destroyed: number;
		};
};

export type GameStats<
	G extends Game,
	P extends BaseGameStats
> = GameStatsInner<P>[G] &
	(P extends MonthlyGameStats ? LeaderboardGameData : {});

export type GameLeaderboard<
	G extends Game,
	P extends BaseGameStats
> = (GameStats<G, P> &
	LeaderboardGameData & { username: string; UUID: string })[];

export type SeasonGame = Game.BedWars;

export type SpecialGame = Game.TreasureWars;

export type SpecialLeaderboardName = {
	[Game.TreasureWars]: "rewards";
};