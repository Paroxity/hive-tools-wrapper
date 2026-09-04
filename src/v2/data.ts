export type V2Links = { [rel: string]: string };

export type V2Pagination = {
	limit?: number;
	offset?: number;
	cursor?: string;
	next_cursor?: string;
	total?: number;
};

export type V2ListResponse<T> = {
	data: T[];
	pagination?: V2Pagination;
};

export type V2ListQuery = {
	limit?: number;
	offset?: number;
	cursor?: string;
	q?: string;
	type?: string;
	game_id?: string;
	kind?: string;
	period?: string;
	status?: string;
};

export type V2Discovery = {
	version?: string;
	links?: V2Links;
};

export type V2PlayerSummary = {
	id?: string;
	username?: string;
	username_normalized?: string;
	links?: V2Links;
};

export type V2ExternalIdentities = {
	xuid?: string;
	playfab_id?: string;
};

export type V2LoginStreak = {
	current?: number;
	longest?: number;
};

export type V2PlayerProfile = {
	id?: string;
	username?: string;
	username_normalized?: string;
	external_identities?: V2ExternalIdentities;
	rank?: string;
	paid_ranks?: string[];
	first_joined_at?: string;
	player_number?: number;
	login_streak?: V2LoginStreak;
	friend_count?: number;
	quest_count?: number;
	links?: V2Links;
};

export type V2PlayerStatistics = {
	player_id?: string;
	game_id?: string;
	first_played_at?: string;
	statistics?: { [key: string]: unknown };
};

export type V2Entitlement = {
	id?: string;
	type?: string;
	display_name?: string;
	known?: boolean;
};

export type V2Edition = {
	number?: number;
	total?: number;
};

export type V2OwnedCosmetic = {
	id?: string;
	type?: string;
	display_name?: unknown;
	image_url?: string;
	equipped?: boolean;
	edition?: V2Edition;
};

export type V2ActivityEvent = {
	id?: string;
	occurred_at?: string;
	type?: string;
	game_id?: string;
	details?: { [key: string]: unknown };
};

export type V2ActivityMeta = {
	player_online?: boolean;
	activity_disabled?: boolean;
};

export type V2ActivityResponse = {
	data?: V2ActivityEvent[];
	pagination?: V2Pagination;
	meta?: V2ActivityMeta;
};

export type V2Meta = {
	as_of?: string;
	is_estimate?: boolean;
};

export type V2GameCount = {
	game_id?: string;
	estimated_unique?: number;
};

export type V2NetworkPlayers = {
	estimated_unique_total?: number;
	estimated_unique_by_game?: V2GameCount[];
};

export type V2NetworkStatistics = {
	players?: V2NetworkPlayers;
};

export type V2NetworkStatisticsResponse = {
	data?: V2NetworkStatistics;
	meta?: V2Meta;
};

export type V2Leaderboard = {
	id?: string;
	game_id?: string;
	kind?: string;
	period?: string;
	season_id?: number;
	event_id?: string;
	status?: string;
	ordered_by?: string;
	entry_count?: number;
	entry_count_is_estimate?: boolean;
	links?: V2Links;
};

export type V2PlayerRef = {
	id?: string;
	username?: string;
};

export type V2LeaderboardEntry = {
	rank?: number;
	player?: V2PlayerRef;
	statistics?: { [key: string]: unknown };
};

export type V2Capabilities = {
	statistics?: boolean;
	maps?: boolean;
	progression?: boolean;
	all_time_leaderboards?: boolean;
	monthly_leaderboards?: boolean;
	season_leaderboards?: boolean;
};

export type V2StatSchemaEntry = {
	key?: string;
	type?: string;
};

export type V2Game = {
	id?: string;
	name?: string;
	short_name?: string;
	capabilities?: V2Capabilities;
	stat_schema?: V2StatSchemaEntry[];
	links?: V2Links;
};

export type V2Prestige = {
	enabled?: boolean;
	max_level?: number;
};

export type V2Level = {
	level?: number;
	cumulative_xp?: number;
	rewards?: unknown[];
};

export type V2Progression = {
	game_id?: string;
	max_level?: number;
	prestige?: V2Prestige;
	levels?: V2Level[];
	reward_types?: unknown;
};

export type V2Map = {
	id?: string;
	game_id?: string;
	name?: string;
	variant?: string;
	seasonal_theme?: string;
	image_url?: string;
};

export type V2Unlock = {
	type?: string;
	active?: boolean;
	metadata?: unknown;
};

export type V2Content = {
	type?: string;
	id?: unknown;
};

export type V2StoreOffer = {
	name?: unknown;
	retail_product_id?: unknown;
	contents?: V2Content[];
};

export type V2Cosmetic = {
	id?: string;
	type?: string;
	display_name?: unknown;
	image_url?: string;
	total_sold?: number;
	unlock?: V2Unlock;
	store_offer?: V2StoreOffer;
};
