import ApiClient from "../src/api/ApiClient";
import HiveApi from "../src/HiveApi";

test('path builder works correctly', async () => {
    let params = {
        'test': "test1",
        'empty': ""
    };
    expect(ApiClient.buildPath("/path/{fake}/{test}/{empty}", params)).toBe("/path/%7Bfake%7D/test1/");
});

test('cache gets new data', async () => {
    let params = {
        'game': "wars"
    };
    let response = await ApiClient.getData("/game/all/{game}", params);
    expect(response.status).toBe(200);
});

test('extra stats calculations work', async () => {
    let response = await HiveApi.getAllTimePlayerStatistics("wars", "NeutronicMC");
    expect(response.kdr).toBeDefined();
});

test('cache returns cached data', async () => {
    let params = {
        'game': "wars"
    };

    ApiClient.setCacheTimeout(300);
    await ApiClient.getData("/game/all/{game}", params);
    let start = new Date().getTime();
    await ApiClient.getData("/game/all/{game}", params);
    let diff = (new Date().getTime()) - start;

    expect(diff).toBeLessThan(5);
});