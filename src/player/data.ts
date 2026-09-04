import { AllTimeGameStats, Game, GameStats } from "../games/data";

export type PaidRank = "PLUS" | "ULTIMATE";

export type Rank =
	| "REGULAR"
	| "YOUTUBER"
	| "STREAMER"
	| "TIKTOK"
	| "VIP"
	| "HELPER"
	| "MODERATOR"
	| "HIVE_TEAM"
	| "STAFF_MANAGER"
	| "COMMUNITY_MANAGER"
	| "OWNER"
	| PaidRank;

type StatTrack = {
	[G in Game]: {
		game: G;
		placeholder: string;
	} & (
		| { key: keyof GameStats<G, AllTimeGameStats> }
		| ({
				keys: [
					keyof GameStats<G, AllTimeGameStats>,
					keyof GameStats<G, AllTimeGameStats>
				];
		  } & (
				| { operation: "add" | "subtract" }
				| { operation: "divide"; style: "percent" | "dot" }
		  ))
	);
}[Game];

type BasicHubTitle = {
	display: string;
};

type StatTrackHubTitle = BasicHubTitle & {
	special_type: "stat_track";
	stat_track: StatTrack[];
};

export type HubTitle = BasicHubTitle | StatTrackHubTitle;

export type AccessoryRarity =
	| "COMMON"
	| "UNCOMMON"
	| "RARE"
	| "EPIC"
	| "LEGENDARY"
	| "MYTHIC";

export type Avatar = {
	url: string;
	name: string;
	edition?: number;
	edition_total?: number;
};

export type Accessory = {
	name: string;
	icon: string;
	rarity: AccessoryRarity;
	edition?: number;
	edition_total?: number;
};

export type Player = {
	UUID: string;
	xuid: string | number;
	mcid?: string;
	username: string;
	username_cc: string;
	rank: Rank;
	first_played: number;
	player_number?: number;
	daily_login_streak?: number;
	longest_daily_login_streak?: number;
	hub_title_count: number;
	hub_title_unlocked?: HubTitle[];
	avatar_count: number;
	avatar_unlocked?: Avatar[];
	costume_count: number;
	costume_unlocked?: string[];
	hat_count: number;
	hat_unlocked?: Accessory[];
	backbling_count: number;
	"cosmetics.backbling"?: Accessory[];
	friend_count: number;
	equipped_hub_title?: HubTitle;
	equipped_avatar?: Avatar;
	equipped_costume?: string;
	equipped_hat?: Accessory;
	equipped_backbling?: Accessory;
	quest_count?: number;
	paid_ranks?: PaidRank[];
	pets: string[];
	mounts: string[];
	variable_entitlements?: string[];
};

export type PlayerSearchResult = {
	UUID: string;
	username: string;
	username_cc: string | null;
};

type RoundPlayedActivity = {
	type: "ROUND_PLAYED";
	game: Game;
	victory: boolean;
};

type LockerActivity = {
	type: "LOCKER";
	unlock_type:
		| "avatar"
		| "backbling" // TODO: Verify
		| "costume" 
		| "hats" // TODO: Verify
		| "hub_title"
		| "mounts" // TODO: Verify
		| "pets"; // TODO: Verify
	unlock_id: string;
};

export type PlayerActivity = {
	time: number;
} & (RoundPlayedActivity | LockerActivity);
