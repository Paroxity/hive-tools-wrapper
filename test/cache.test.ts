import { nanoseconds, sleep } from "bun";
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	spyOn,
	test
} from "bun:test";
import { clearCache, enableCache, getCache, getServerStats } from "../src";

describe("Caching", () => {
	afterAll(() => enableCache(0));
	beforeEach(() => enableCache(1));
	afterEach(() => clearCache());

	test("Requests are cached", async () => {
		const fetchSpy = spyOn(global, "fetch");
		await getServerStats();
		const cachedStart = nanoseconds();
		await getServerStats();
		const timing = nanoseconds() - cachedStart;
		expect(timing).toBeLessThan(500_000); // less than 0.5 ms
		expect(fetchSpy).toBeCalledTimes(1);
	}, 1000);

	test("Cached requests are deleted after they expire", async () => {
		await getServerStats();
		await sleep(1000);
		expect(getCache()["/global/statistics"]?.time).toBeTypeOf("undefined");
	}, 1500);

	test("clearCache() clears the cache", async () => {
		await getServerStats();
		clearCache();
		expect(Object.keys(getCache())).toHaveLength(0);
	}, 1000);

	test("Cache can be disabled", async () => {
		enableCache(0);
		await getServerStats();
		expect(Object.keys(getCache())).toHaveLength(0);
	}, 1000);
});
