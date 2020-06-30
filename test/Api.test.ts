import ApiClient from "../src/api/ApiClient";
import HiveApi from "../src/HiveApi";

test('path builder works correctly', async () => {
    const params = {
        'test': "test1",
        'empty': ""
    };
    expect(ApiClient.buildPath("/path/{fake}/{test}/{empty}", params)).toBe("/path/%7Bfake%7D/test1/");
});

test('cache gets new data', async () => {
    const params = {
        'game': "wars"
    };
    const response = await ApiClient.getData("/game/all/{game}", params);
    expect(response.status).toBe(200);
});

test('extra stats calculations work', async () => {
    const response = await HiveApi.getAllTimePlayerStatistics("wars", "NeutronicMC");
    expect(response.kdr).toBeDefined();
});

test('cache returns cached data', async () => {
    const params = {
        'game': "wars"
    };

    ApiClient.setCacheTimeout(300);
    await ApiClient.getData("/game/all/{game}", params);
    const start = new Date().getTime();
    await ApiClient.getData("/game/all/{game}", params);
    const diff = (new Date().getTime()) - start;

    expect(diff).toBeLessThan(5);
});

test('efficiency???', async () => {
    const response = await HiveApi.getAllTimePlayerStatistics("murder", "SirUntouchable0");
    expect(response.efficiency).toBe(0);
});