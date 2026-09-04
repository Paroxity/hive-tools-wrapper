import { afterEach, describe, expect, spyOn, test } from "bun:test";
import {
	Game,
	getAvailableMonthlyLeaderboards,
	getCostume,
	getCostumes,
	getGameAllTimeStats,
	getMainStats,
	getMonthlyLeaderboard,
	getTitle,
	getTitles,
	searchPlayer,
	setHiveApiKey,
	v2
} from "../src";

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}

function mockFetchJson(body: unknown) {
	return spyOn(global, "fetch").mockImplementation(async () =>
		jsonResponse(body)
	);
}

describe("New PlayHive endpoints", () => {
	let fetchSpy: ReturnType<typeof spyOn> | undefined;

	afterEach(() => {
		fetchSpy?.mockRestore();
		fetchSpy = undefined;
	});

	test("getMainStats uses /game/all/main and resolve headers", async () => {
		fetchSpy = mockFetchJson({
			main: {
				UUID: "test",
				username: "player",
				player_number: 12,
				mcid: "abc"
			}
		});

		const main = await getMainStats("player");
		expect(main.player_number).toBe(12);
		expect(main.mcid).toBe("abc");
		expect(fetchSpy).toBeCalledTimes(1);
		const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://api.playhive.com/v0/game/all/main/player");
		const headers = init.headers as Record<string, string>;
		expect(headers["X-Hive-Resolve-Dynamic-Hub-Titles"]).toBe("true");
		expect(headers["X-Hive-Resolve-Stat-Track"]).toBe("true");
	});

	test("getCostumes and getTitles support limit and offset", async () => {
		fetchSpy = mockFetchJson([]);

		await getCostumes(10, 20);
		await getTitles(5, 15);
		await getCostume("costume-id");
		await getTitle("title-id");

		const urls = fetchSpy.mock.calls.map(call => call[0] as string);
		expect(urls).toEqual([
			"https://api.playhive.com/v0/catalogue/costumes?limit=10&offset=20",
			"https://api.playhive.com/v0/catalogue/titles?limit=5&offset=15",
			"https://api.playhive.com/v0/catalogue/costumes/costume-id",
			"https://api.playhive.com/v0/catalogue/titles/title-id"
		]);
	});

	test("catalogue list rejects invalid pagination", () => {
		expect(() => getCostumes(51)).toThrow("Catalogue limit");
		expect(() => getTitles(10, -1)).toThrow("Catalogue offset");
	});

	test("getAvailableMonthlyLeaderboards hits the available endpoint", async () => {
		fetchSpy = mockFetchJson([
			{
				month: "march",
				year: "2024",
				month_number: 3,
				resource: "/v0/game/monthly/bed/2024/3"
			}
		]);

		const months = await getAvailableMonthlyLeaderboards(Game.BedWars, true);
		expect(months[0].month_number).toBe(3);
		const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://api.playhive.com/v0/game/monthly/bed/available");
		expect((init.headers as Record<string, string>)["X-Hive-Show-Counts"]).toBe(
			"true"
		);
	});

	test("searchPlayer requires at least 4 characters", () => {
		expect(() => searchPlayer("neu")).toThrow("at least 4 characters");
	});
});

describe("Live PlayHive API", () => {
	test("main profile includes player_number and mcid", async () => {
		const main = await getMainStats("NeutronicMC");
		expect(main.username_cc).toBe("NeutronicMC");
		expect(typeof main.player_number).toBe("number");
		expect(typeof main.mcid).toBe("string");
	}, 15000);

	test("SkyWars Classic all-time stats include selected_kit", async () => {
		const stats = await getGameAllTimeStats("NeutronicMC", Game.SkyWarsClassic);
		expect(stats.selected_kit).toBe("ARCHER");
		expect(stats.played).toBeGreaterThan(0);
		expect(stats.level).toBeGreaterThan(1);
	}, 15000);

	test("Hide and Seek monthly leaderboard includes taunts", async () => {
		const board = await getMonthlyLeaderboard(Game.HideAndSeek);
		expect(board[0].taunts).toBeDefined();
	}, 15000);

	test("catalogue costumes return unlock data", async () => {
		const costumes = await getCostumes(2);
		expect(costumes.length).toBe(2);
		expect(costumes[0].UUID).toBeTypeOf("string");
		expect(costumes[0].unlock_data.type).toBeTypeOf("string");
		const costume = await getCostume(costumes[0].UUID);
		expect(costume.UUID).toBe(costumes[0].UUID);
	}, 15000);

	test("available monthly leaderboards list months", async () => {
		const months = await getAvailableMonthlyLeaderboards(Game.BedWars);
		expect(months.length).toBeGreaterThan(0);
		expect(months[0].resource.startsWith("/v0/game/monthly/bed/")).toBe(true);
	}, 15000);
});

describe("v2 API", () => {
	let fetchSpy: ReturnType<typeof spyOn> | undefined;

	afterEach(() => {
		fetchSpy?.mockRestore();
		fetchSpy = undefined;
		setHiveApiKey();
	});

	test("sends Basic auth and hits /v2 paths", async () => {
		setHiveApiKey("test-key", "test-secret");
		fetchSpy = mockFetchJson({
			id: "player",
			username: "NeutronicMC"
		});

		const player = await v2.getPlayer("NeutronicMC");
		expect(player.username).toBe("NeutronicMC");
		expect(fetchSpy).toBeCalledTimes(1);
		const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://api.playhive.com/v2/players/NeutronicMC");
		const headers = init.headers as Record<string, string>;
		expect(headers.Authorization).toBe("Basic " + btoa("test-key:test-secret"));
		expect(headers["X-Hive-Api-Version"]).toBeUndefined();
	});

	test("paginates collection endpoints", async () => {
		setHiveApiKey("test-key");
		fetchSpy = mockFetchJson({ data: [], pagination: { limit: 10 } });

		await v2.getGames({ limit: 10, offset: 20 });
		const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://api.playhive.com/v2/games?limit=10&offset=20");
	});
});
