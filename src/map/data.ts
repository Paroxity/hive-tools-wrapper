export type GameMap = {
	name: string;
	season:
		| "NO_SEASON"
		| "WINTERFEST"
		| "SPRING"
		| "HALLOWEEN"
		| "AUTUMN"
		| "SUMMER";
	variant: "REGULAR" | "DUOS" | "TRIOS" | "SQUADS" | "MEGA" | "ROYALE";
	image: string;
};

