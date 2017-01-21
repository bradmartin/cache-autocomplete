declare class AutoComplete {
    SELECT: HTMLSelectElement;
    private ROOT_ELEMENT;
    private SUGGESTIONS;
    private CACHE_DATA;
    constructor(elementId: string, cacheData: boolean);
    query(url: string, bustCache?: boolean): Promise<any>;
    /**
     * Set the suggestions for the AutoComplete
     * @param {Array} dataArray - the array of objects for the list of options.
     * @param {string} optionText - the text property in the dataArrays objects for the <option>TEXT</option>.
     * @param {string} optionValue - the <option value="optionValue"></option> for the options in the dataArray.
     */
    setSuggestions(dataArray: any[], optionText: string, optionValue: string): void;
    /**
     * Cache the response for the url in the query()
     * @param {string} url - the query Url for the AutoComplete
     * @param {AutoCompleteHttpResponse} result - the response from httpAsync();
     */
    private cacheIt(url, result);
}
/**
 * Async XMLHttpRequest
 */
declare function httpAsync(url: string, method?: string): Promise<AutoCompleteHttpResponse>;
declare function saveDataToCache(keyName: string, data: Object): void;
declare function getCachedData(keyName: string): string;
declare function isCacheAvailable(): boolean;
interface AutoCompleteHttpResponse {
    data: any;
    status: number;
    statusText: string;
}
