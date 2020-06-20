import Axios, {AxiosResponse} from "axios";

export interface Params {
    [key: string]: any;
}

interface CacheData {
    [key: string]: {
        timestamp: number,
        data: AxiosResponse
    }
}

export default class ApiClient {
    cacheTimeout: number;
    constructor(cacheTimeout: number) {
        this.cacheTimeout = cacheTimeout;
    }
    private basePath: string = "https://api.playhive.com/v0";

    public async callApi(path: string, pathParams: object):Promise<AxiosResponse> {
        return await Axios.get(this.buildUrl(path, pathParams));
    }

    public buildUrl(path: string, pathParams: Params) {
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

    cacheData: CacheData = {};
    public async getData(path: string, pathParams: Params, cache: boolean) {
        const key = ApiClient.buildPath(path, pathParams);
        const now = new Date().getTime();
        if (this.cacheData.hasOwnProperty(key) && cache) {
            if (this.cacheData[key].timestamp + (this.cacheTimeout * 1000) < now) {
                this.cacheData[key] = {
                    timestamp: now,
                    data: await this.callApi(path, pathParams)
                }
            }
        } else {
            this.cacheData[key] = {
                timestamp: now,
                data: await this.callApi(path, pathParams)
            }
        }
        return this.cacheData[key].data;
    }
}