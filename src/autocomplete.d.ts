declare let LOCAL_STORAGE: Storage;
declare class AutoComplete {
    private rootElement;
    constructor(elementId: string);
    query(url: string, cacheData?: boolean, cacheBust?: boolean): Promise<AutoCompleteHttpResponse>;
}
/**
 * Async XMLHttpRequest
 */
declare function httpAsync(url: string, method?: string): Promise<AutoCompleteHttpResponse>;
declare function saveDataToCache(keyName: string, data: Object): void;
declare function getCachedData(keyName: string): any;
declare function isCacheAvailable(): boolean;
interface AutoCompleteOptions {
    cache: boolean;
    bustCache: boolean;
}
interface AutoCompleteHttpResponse {
    data: any;
    status: number;
    statusText: string;
}
