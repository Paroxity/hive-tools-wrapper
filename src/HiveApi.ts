import ApiClient from './api/ApiClient';

export default class HiveToolsAPI extends ApiClient {
  public static async getMonthlyLeaderboard(game: string): Promise<any[]> {
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
  ): Promise<any[]> {
    const params = {
      game,
      year,
      month,
      amount,
      skip,
    };
    const response = await this.getData('/game/monthly/{game}/{year}/{month}/{amount}/{skip}', params);

    return this.calculateExtraLeaderboardStats(response.data);
  }

  public static async getMonthlyPlayerStatistics(game: string, player: string): Promise<any> {
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
  ): Promise<any> {
    const params = {
      game,
      player,
      year,
      month,
    };
    const response = await this.getData('/game/monthly/player/{game}/{player}/{year}/{month}', params);
    return this.calculateExtraPlayerStats(response.data);
  }

  public static async getAllTimeLeaderboard(game: string): Promise<any[]> {
    const params = {
      game,
    };
    const response = await this.getData('/game/monthly/player/{game}/{player}/{year}/{month}', params);
    return this.calculateExtraLeaderboardStats(response.data);
  }

  public static async getAllTimePlayerStatistics(game: string, player: string): Promise<any> {
    const params = {
      game,
      player,
    };
    const response = await this.getData('/game/all/{game}/{player}', params);
    return this.calculateExtraPlayerStats(response.data);
  }

  // Calculate extra statistics for a player. There are many obscure calculations for the Hive Tools website.
  public static calculateExtraPlayerStats(data: any): any {
    ({
      win_percentage: data.win_percentage,
      win_percentage_raw: data.win_percentage_raw,
      games_lost: data.games_lost,
    } = this.calculateWinLossInfo(data));

    if (data.hasOwnProperty('kills') || data.hasOwnProperty('hider_kills')) {
      let kills;

      // Use either normal kills stat or Hide and Seek kills stat.
      if (data.hasOwnProperty('kills')) {
        kills = data.kills;
      } else {
        kills = data.hider_kills;
      }

      data.kpr = kills / data.played;

      if (data.hasOwnProperty('deaths')) {
        data.dpr = data.deaths / data.played;
        if (data.deaths === 0) {
          data.kdr = kills;
          if (data.hasOwnProperty('seeker_kills')) {
            data.skdr = data.seeker_kills;
          }
          if (data.hasOwnProperty('final_kills')) {
            data.fkdr = data.final_kills;
          }
          if (data.hasOwnProperty('treasure_destroyed')) {
            data.ddr = data.treasure_destroyed;
          }
        } else {
          data.kdr = (kills / data.deaths).toFixed(2);
          if (data.hasOwnProperty('seeker_kills')) {
            data.skdr = data.seeker_kills / data.deaths;
          }
          if (data.hasOwnProperty('final_kills')) {
            data.fkdr = (data.final_kills / data.deaths).toFixed(2);
          }
          if (data.hasOwnProperty('treasure_destroyed')) {
            data.ddr = data.treasure_destroyed / data.deaths;
          }
        }
      }

      return data;
    }

    if (data.hasOwnProperty('coins')) {
      data.cpr = data.coins / data.played;

      // Just in case a new game ever has the "coins" statistic
      if (data.hasOwnProperty('murderer_eliminations')) {
        data.efficiency = data.murderer_eliminations / (data.coins / 10);
      }
    }

    if (data.hasOwnProperty('deathmatches')) {
      data.dmpr = data.deathmatches / data.played;
    }

    if (data.hasOwnProperty('checkpoints')) {
      data.cdr = data.checkpoints / data.deaths;
    }
  }

  public static calculateExtraLeaderboardStats(data: any[]): any[] {
    data.forEach((player, index) => {
      data[index] = this.calculateExtraPlayerStats(player);
    });

    return data;
  }

  private static calculateWinLossInfo(data: any): any {
    const returnData: any = {};
    if (data.victories === 0) {
      returnData.win_percentage = '0%';
      returnData.win_percentage_raw = 0;
    } else {
      returnData.win_percentage_raw = data.victories / data.played;
      returnData.win_percentage = `${(data.win_percentage_raw * 100).toFixed(2)}%`;
    }
    returnData.games_lost = data.played - data.victories;

    return returnData;
  }
}
