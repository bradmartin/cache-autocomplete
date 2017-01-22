declare class CacheAutoComplete {
    RootDomElement: HTMLInputElement;
    List: HTMLUListElement;
    Suggestions: any[];
    CacheData: boolean;
    QueryUrl: string;
    private PopupDiv;
    constructor(options: CacheAutoCompleteOptions);
    private get(url, bustCache?);
    setSuggestions(dataArray: any[], optionText: string, itemClass: string): Error;
    private clearSuggestions();
    private destroyLocationSearchPopup();
    private cacheIt(url, result);
    private httpAsync(url, method?);
    private saveDataToCache(keyName, data);
    private getCachedData(keyName);
    private isCacheAvailable();
}
interface CacheAutoCompleteHttpResponse {
    data: any;
    status: number;
    statusText: string;
}
interface CacheAutoCompleteOptions {
    elementId: string;
    cacheData: boolean;
    remoteUrl: string;
    wildCard: string;
    listItemValue: any;
    listCssClass: string;
    itemCssClass: string;
}
