import HiveToolsAPI from "../src/HiveApi";
import ApiClient from "../src/api/ApiClient";
let api = new HiveToolsAPI(1);

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
    let response = await api.getData("/game/all/{game}", params, true);
    expect(response.status).toBe(200);
});

test('cache returns cached data', async () => {
    let params = {
        'game': "wars"
    };

    await api.getData("/game/all/{game}", params, true);
    let start = new Date().getTime();
    await api.getData("/game/all/{game}", params, true);
    let diff = (new Date().getTime()) - start;

    expect(diff).toBeLessThan(5);
});