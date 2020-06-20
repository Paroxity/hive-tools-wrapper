import Axios, {AxiosResponse} from "axios";

export interface params {
    [key: string]: any;
}

interface cacheData {
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

    public buildUrl(path: string, pathParams: params) {
        if (!path.match(/^\//)) {
            path = '/' + path;
        }

        let url: string = ApiClient.buildPath(path, pathParams);
        url = this.basePath + url;

        return url;
    }

    public static paramToString(param: any): string {
        if (param == undefined) {
            return '';
        }
        if (param instanceof Date) {
            return param.toJSON();
        }

        return param.toString();
    }

    public static buildPath(path: string, pathParams: params): string {
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

    cacheData: cacheData = {};
    public async getData(path: string, params: params, cache: boolean) {
        let key = ApiClient.buildPath(path, params);
        let now = new Date().getTime();
        if (this.cacheData.hasOwnProperty(key) && cache) {
            if (this.cacheData[key].timestamp + (this.cacheTimeout * 1000) < now) {
                this.cacheData[key] = {
                    timestamp: now,
                    data: await this.callApi(path, params)
                }
            }
        } else {
            this.cacheData[key] = {
                timestamp: now,
                data: await this.callApi(path, params)
            }
        }
        return this.cacheData[key].data;
    }
}