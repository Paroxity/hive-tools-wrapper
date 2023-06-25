export type Rank =
	| "REGULAR"
	| "PLUS"
	| "YOUTUBER"
	| "STREAMER"
	| "TIKTOK"
	| "VIP"
	| "HELPER"
	| "MODERATOR"
	| "HIVE_TEAM"
	| "STAFF_MANAGER"
	| "COMMUNITY_MANAGER"
	| "OWNER";

export type Avatar = { url: string; name: string };

export type Player = {
	UUID: string;
	xuid: string;
	username: string;
	username_cc: string;
	rank: Rank;
	first_played: number;
	daily_login_streak: number;
	longest_daily_login_streak: number;
	hub_title_count: number;
	hub_title_unlocked: string[];
	costume_count: number;
	costume_unlocked: string[];
	avatar_count: number;
	avatar_unlocked: Avatar[];
	friend_count: number;
	equipped_hub_title: string | null;
	equipped_costume: string | null;
	equipped_avatar: Avatar | null;
	quest_count: number;
	paid_ranks: Rank[];
};
