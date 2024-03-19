export type PaidRank = "PLUS";

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

export type Avatar = { url: string; name: string };

export type Accessory = {
	name: string;
	icon: string;
	rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
};

export type Player = {
	UUID: string;
	xuid: string;
	username: string;
	username_cc: string;
	rank: Rank;
	first_played: number;
	daily_login_streak?: number;
	longest_daily_login_streak?: number;
	hub_title_count: number;
	hub_title_unlocked?: string[];
	avatar_count: number;
	avatar_unlocked?: Avatar[];
	costume_count: number;
	costume_unlocked?: string[];
	hat_count: number;
	hat_unlocked?: Accessory[];
	backbling_count: number;
	"cosmetics.backbling"?: Accessory[];
	friend_count: number;
	equipped_hub_title?: string;
	equipped_avatar?: Avatar;
	equipped_costume?: string;
	equipped_backbling?: Accessory;
	quest_count?: number;
	paid_ranks?: PaidRank[];
	pets: string[];
	mounts: string[];
};
