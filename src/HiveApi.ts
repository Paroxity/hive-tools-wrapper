import ApiClient from "./api/ApiClient"
import {AxiosResponse} from "axios";
export default class HiveToolsAPI extends ApiClient {
    constructor(cacheTimeout: number) {
        super(cacheTimeout);
    }

    public async getMonthlyLeaderboard(game: string, cache: boolean = true) {
        const params = {
            "game": game
        }

        return (await this.getData("/game/monthly/{game}", params, cache)).data;
    }

    public async getSpecificMonthlyLeaderboard(game: string, year: string, month: string, amount?: string, skip?: string, cache: boolean = true) {
        const params = {
            'game': game,
            'year': year,
            'month': month,
            'amount': amount,
            'skip': skip
        }

        return (await this.getData("/game/monthly/{game}/{year}/{month}/{amount}/{skip}", params, cache)).data;
    }

    public async getMonthlyPlayerStatistics(game: string, player: string, cache: boolean = true): Promise<AxiosResponse> {
        const params = {
            'game': game,
            'player': player
        }

        return (await this.getData("/game/monthly/player/{game}/{player}", params, cache)).data;
    }

    public async getSpecificMonthlyPlayerStatistics(game: string, player: string, year: string, month: string, cache: boolean = true): Promise<AxiosResponse> {
        const params = {
            'game': game,
            'player': player,
            'year': year,
            'month': month
        }

        return (await this.getData("/game/monthly/player/{game}/{player}/{year}/{month}", params, cache)).data;
    }

    public async getAllTimeLeaderboard(game: string, cache: boolean = true): Promise<AxiosResponse> {
        const params = {
            "game": game
        }
        return (await this.getData("/game/monthly/player/{game}/{player}/{year}/{month}", params, cache)).data;
    }

    public async getAllTimePlayerStatistics(game: string, player: string, cache: boolean = true) {
        const params = {
            'game': game,
            'player': player
        }
        return (await this.getData("/game/all/{game}/{player}", params, cache)).data;
    }
}