export type CatalogueUnlockType =
	| "STORE_PURCHASE"
	| "QUEST_POINTS"
	| "GAME_LEVEL"
	| "BUNDLE_PURCHASE"
	| "SPECIAL_EVENT"
	| "ACHIEVEMENT"
	| "GAME_PURCHASE"
	| "LEGACY";

export type CatalogueContent = {
	type: string;
	UUID: string;
};

export type CatalogueStoreOffer = {
	name: string;
	retailProductID: string;
	contents: CatalogueContent[];
};

export type CatalogueUnlockMetadata = {
	game?: string;
	level?: number;
	additionalRequirement?: string;
	questPoints?: number;
	requirement?: string;
	description?: string;
	bundleId?: string;
	originalUnlockType?: CatalogueUnlockType;
	lastAvailable?: string;
	[key: string]: unknown;
};

export type CatalogueUnlockData = {
	type: CatalogueUnlockType;
	active: boolean;
	metadata?: CatalogueUnlockMetadata | unknown[];
	store_offer?: CatalogueStoreOffer;
};

export type CatalogueItem = {
	UUID: string;
	display: string;
	unlock_data: CatalogueUnlockData;
};
