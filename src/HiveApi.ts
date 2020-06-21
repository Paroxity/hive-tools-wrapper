import ApiClient from './api/ApiClient';
import {LeaderboardData, Params, PlayerData} from "./ts/types/api_types";

type CalculatedWinData = {
    win_percentage: string,
    win_percentage_raw: number,
    games_lost: number
}

export default class HiveToolsAPI extends ApiClient {
    public static async getMonthlyLeaderboard(game: string): Promise<LeaderboardData> {
        const params = {
            game,
        };
        const response = await this.getData('/game/monthly/{game}', params);
        return this.calculateExtraLeaderboardStats(response.data);
    }

    public static async getSpecificMonthlyLeaderboard(
        game: string,
        year: string,
        month: string,
        amount?: string,
        skip?: string,
    ): Promise<LeaderboardData> {
        const params: Params = {
            game,
            year,
            month,
            amount,
            skip,
        };
        const response = await this.getData('/game/monthly/{game}/{year}/{month}/{amount}/{skip}', params);

        return this.calculateExtraLeaderboardStats(response.data);
    }

    public static async getMonthlyPlayerStatistics(game: string, player: string): Promise<PlayerData> {
        const params = {
            game,
            player,
        };
        const response = await this.getData('/game/monthly/player/{game}/{player}', params);
        return this.calculateExtraPlayerStats(response.data);
    }

    public static async getSpecificMonthlyPlayerStatistics(
        game: string,
        player: string,
        year: string,
        month: string,
    ): Promise<PlayerData> {
        const params = {
            game,
            player,
            year,
            month,
        };
        const response = await this.getData('/game/monthly/player/{game}/{player}/{year}/{month}', params);
        return this.calculateExtraPlayerStats(response.data);
    }

    public static async getAllTimeLeaderboard(game: string): Promise<LeaderboardData> {
        const params = {
            game,
        };
        const response = await this.getData('/game/monthly/player/{game}/{player}/{year}/{month}', params);
        return this.calculateExtraLeaderboardStats(response.data);
    }

    public static async getAllTimePlayerStatistics(game: string, player: string): Promise<PlayerData> {
        const params = {
            game,
            player,
        };
        const response = await this.getData('/game/all/{game}/{player}', params);
        return this.calculateExtraPlayerStats(response.data);
    }

    // Calculate extra statistics for a player. There are many obscure calculations for the Hive Tools website.
    public static calculateExtraPlayerStats(data: PlayerData): PlayerData {
        ({
            win_percentage: data.win_percentage,
            win_percentage_raw: data.win_percentage_raw,
            games_lost: data.games_lost,
        } = this.calculateWinLossInfo(data));

        if (this.objectHasOwnProperty.call(data, "kills") || this.objectHasOwnProperty.call(data, "hider_kills")) {
            let kills: number;

            // Use either normal kills stat or Hide and Seek kills stat.
            if (this.objectHasOwnProperty.call(data, "kills")) {
                kills = <number>data.kills;
            } else {
                kills = <number>data.hider_kills;
            }

            data.kpr = kills / <number>data.played;

            if (this.objectHasOwnProperty.call(data, "deaths")) {
                data.dpr = <number>data.deaths / <number>data.played;
                if (data.deaths === 0) {
                    data.kdr = kills;
                    if (this.objectHasOwnProperty.call(data, "seeker_kills")) {
                        data.skdr = <number>data.seeker_kills;
                    }
                    if (this.objectHasOwnProperty.call(data, "final_kills")) {
                        data.fkdr = <number>data.final_kills;
                    }
                    if (this.objectHasOwnProperty.call(data, "treasure_destroyed")) {
                        data.ddr = <number>data.treasure_destroyed;
                    }
                } else {
                    data.kdr = (kills / <number>data.deaths).toFixed(2);
                    if (this.objectHasOwnProperty.call(data, "seeker_kills")) {
                        data.skdr = <number>data.seeker_kills / <number>data.deaths;
                    }
                    if (this.objectHasOwnProperty.call(data, "final_kills")) {
                        data.fkdr = (<number>data.final_kills / <number>data.deaths).toFixed(2);
                    }
                    if (this.objectHasOwnProperty.call(data, "treasure_destroyed")) {
                        data.ddr = <number>data.treasure_destroyed / <number>data.deaths;
                    }
                }
            }
        }

        if (this.objectHasOwnProperty.call(data, "coins")) {
            data.cpr = <number>data.coins / <number>data.played;

            // Just in case a new game ever has the "coins" statistic
            if (this.objectHasOwnProperty.call(data, "murderer_eliminations")) {
                data.efficiency = <number>data.murderer_eliminations / (<number>data.coins / 10);
            }
        }

        if (this.objectHasOwnProperty.call(data, "deathmatches")) {
            data.dmpr = <number>data.deathmatches / <number>data.played;
        }

        if (this.objectHasOwnProperty.call(data, "checkpoints")) {
            data.cdr = <number>data.checkpoints / <number>data.deaths;
        }
        return data;
    }

    public static calculateExtraLeaderboardStats(data: LeaderboardData): LeaderboardData {
        data.forEach((player, index) => {
            data[index] = this.calculateExtraPlayerStats(player);
        });

        return data;
    }

    private static calculateWinLossInfo(data: PlayerData): CalculatedWinData {
        const returnData: CalculatedWinData = {
            win_percentage: "0%",
            win_percentage_raw: 0,
            games_lost: 0
        };
        if (data.victories !== 0) {
            returnData.win_percentage_raw = <number>data.victories / <number>data.played;
            returnData.win_percentage = `${(<number>data.win_percentage_raw * 100).toFixed(2)}%`;
        }
        returnData.games_lost = <number>data.played - <number>data.victories;

        return returnData;
    }
}
