export type Player = {
	UUID: string;
	xuid: string;
	username: string;
	username_cc: string;
	rank:
		| "REGULAR"
		| "PLUS"
		| "YOUTUBER"
		| "TIKTOK"
		| "VIP"
		| "HELPER"
		| "MODERATOR"
		| "STAFF_MANAGER"
		| "HIVE_TEAM";
	first_played: number;
	daily_login_streak: number;
	longest_daily_login_streak: number;
};

