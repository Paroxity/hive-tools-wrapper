import Axios, { AxiosResponse } from 'axios';
import {Params} from "../ts/types/api_types";

interface CacheData {
  [key: string]: {
    expires: number;
    data: AxiosResponse;
  };
}

export default class ApiClient {
  private static basePath = 'https://api.playhive.com/v0';
  private static cacheTimeout = 0;

  public static async callApi(path: string, pathParams: Params): Promise<AxiosResponse> {
    return await Axios.get(this.buildUrl(path, pathParams));
  }

  public static buildUrl(path: string, pathParams: Params): string {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }

    let url: string = ApiClient.buildPath(path, pathParams);
    url = this.basePath + url;

    return url;
  }


  public static buildPath(path: string, pathParams: Params): string {
    return path.replace(/{([\w-]+)}/g, (fullMatch, key) => {
      let value;
      if (this.objectHasOwnProperty.call(pathParams, key)) {
        value = <string>pathParams[key];
      } else {
        value = fullMatch;
      }

      return encodeURIComponent(value);
    });
  }

  private static cacheData: CacheData = {};
  public static async getData(path: string, pathParams: Params): Promise<AxiosResponse> {
    const key = ApiClient.buildPath(path, pathParams);
    const now = new Date().getTime();
    if (this.objectHasOwnProperty.call(this.cacheData, key)) {
      if (this.cacheData[key].expires < now) {
        this.cacheData[key] = {
          expires: now + this.cacheTimeout * 1000,
          data: await this.callApi(path, pathParams),
        };
      }
    } else {
      this.cacheData[key] = {
        expires: now + this.cacheTimeout * 1000,
        data: await this.callApi(path, pathParams),
      };
    }

    // TODO: implement rate limit checks

    return this.cacheData[key].data;
  }

  public static setCacheTimeout(_cacheTimeout: number): void {
    this.cacheTimeout = _cacheTimeout;
  }

  // Using this to prevent issues with shadowed methods
  public static objectHasOwnProperty = Object.prototype.hasOwnProperty;
}
