import Axios, { AxiosResponse } from 'axios';

export interface Params {
  [key: string]: any;
}

interface CacheData {
  [key: string]: {
    expires: number;
    data: AxiosResponse;
  };
}

export default class ApiClient {
  private static basePath: string = 'https://api.playhive.com/v0';
  private static cacheTimeout: number = 0;

  public static async callApi(path: string, pathParams: object): Promise<AxiosResponse> {
    return await Axios.get(this.buildUrl(path, pathParams));
  }

  public static buildUrl(path: string, pathParams: Params) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }

    let url: string = ApiClient.buildPath(path, pathParams);
    url = this.basePath + url;

    return url;
  }

  public static paramToString(param: any): string {
    if (param === undefined) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }

    return param.toString();
  }

  public static buildPath(path: string, pathParams: Params): string {
    return path.replace(/\{([\w-]+)\}/g, (fullMatch, key) => {
      let value;
      if (pathParams.hasOwnProperty(key)) {
        value = ApiClient.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }

      return encodeURIComponent(value);
    });
  }

  private static cacheData: CacheData = {};
  public static async getData(path: string, pathParams: Params) {
    const key = ApiClient.buildPath(path, pathParams);
    const now = new Date().getTime();
    if (this.cacheData.hasOwnProperty(key)) {
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

  public static setCacheTimeout(_cacheTimeout: number) {
    this.cacheTimeout = _cacheTimeout;
  }
}
