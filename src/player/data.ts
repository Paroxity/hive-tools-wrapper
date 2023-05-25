export type Player = {
	UUID: string;
	xuid: string;
	username: string;
	username_cc: string;
	rank:
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
	first_played: number;
	daily_login_streak: number;
	longest_daily_login_streak: number;
};

