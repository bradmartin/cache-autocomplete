export declare function create(opts: CACompleteOptions): void;
/**
 * Delete a single key (url) from storage or all CacheAutoComplete keys.
 * If no url is passed as an argument, all keys and data will be removed from storage.
 * @param {string} [url] - The url to delete from storage.
 */
export declare function clearCache(url?: string): void;
export interface CACompleteOptions {
    rootElement: HTMLInputElement;
    queryUrl: string;
    itemTemplate: string;
    cache?: boolean;
    minStringLength?: number;
    listClass?: string;
    itemClass?: string;
    onItemSelect?: Function;
}
