export enum Game {
	TreasureWars = "wars",
	DeathRun = "dr",
	HideAndSeek = "hide",
	MurderMystery = "mm",
	SurvivalGames = "sg",
	SkyWars = "sw",
	JustBuild = "build",
	GroundWars = "ground",
	BlockDrop = "drop",
	CaptureTheFlag = "ctf"
}

export type BaseGameData = {
	played: number;
	victories: number;
	losses: number;
	win_percentage: number;
	xp: number;
};

export type PvPGameData = {
	kills: number;
	deaths: number;
	kdr: number;
};

export type MonthlyGameData = {
	username: string;
	uncapped_xp: number;
} & LeaderboardGameData;

export type AllTimeGameData = {
	UUID: string;
	level: number;
};

export type LeaderboardGameData = {
	index: number;
	human_index: number;
};

export type GameData = {
	[Game.TreasureWars]: BaseGameData &
		PvPGameData & {
			final_kills: number;
			fkdr: number;
			treasure_destroyed: number;
		};
	[Game.DeathRun]: BaseGameData & {
		kills: number;
		deaths: number;
		checkpoints: number;
		activated: number;
	};
	[Game.HideAndSeek]: BaseGameData & {
		hider_kills: number;
		seeker_kills: number;
		deaths: number;
	};
	[Game.MurderMystery]: BaseGameData & {
		murders: number;
		murderer_eliminations: number;
		deaths: number;
		coins: number;
	};
	[Game.SurvivalGames]: BaseGameData &
		PvPGameData & {
			crates: number;
			cows: number;
			deathmatches: number;
		};
	[Game.SkyWars]: BaseGameData &
		PvPGameData & {
			mystery_chests_destroyed: number;
			ores_mined: number;
			spells_used: number;
		};
	[Game.JustBuild]: BaseGameData & {
		rating_meh_received: number;
		rating_okay_received: number;
		rating_good_received: number;
		rating_love_received: number;
	};

	[Game.GroundWars]: BaseGameData &
		PvPGameData & {
			blocks_placed: number;
			blocks_destroyed: number;
			projectiles_fired: number;
		};
	[Game.BlockDrop]: BaseGameData & {
		deaths: number;
		vaults_used: number;
		powerups_collected: number;
		blocks_destroyed: number;
	};
	[Game.CaptureTheFlag]: BaseGameData &
		PvPGameData & {
			assists: number;
			flags_captured: number;
			flags_returned: number;
		};
};

type Player<T> = {
	[G in Game]: GameData[G] & T;
};
export type MonthlyPlayer = Player<MonthlyGameData>;
export type AllTimePlayer = Player<AllTimeGameData> & {
	[G in Game.TreasureWars]: { prestige: number };
};

export type MonthlyLeaderboard = {
	[G in Game]: MonthlyPlayer[G][];
};
export type AllTimeLeaderboard = {
	[G in Game]: (AllTimePlayer[G] & LeaderboardGameData)[];
};

