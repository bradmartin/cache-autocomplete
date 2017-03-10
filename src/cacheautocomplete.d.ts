export declare class AutoComplete {
    items: any[];
    itemClass: string;
    listClass: string;
    queryUrl: string;
    element: HTMLInputElement;
    cache: boolean;
    itemTemplate: string;
    templateKeys: any[];
    itemSelectCallback: any;
    minLength: number;
    private POPUP;
    private LIST;
    private LI_CLASS;
    constructor(opts: CACompleteOptions);
    private addItemStyle();
    /**
      * Delete a single key (url) from storage or all CacheAutoComplete keys.
      * If no url is passed as an argument, all keys and data will be removed from storage.
      * @param {string} [url] - The url to delete from storage.
      */
    static clearCache(url?: string): void;
    private createComponent();
    /**
     * Query a url using the AutoComplete instance
     * @param {string} url - the url to query.
     * @param {boolean} bustCache - true to not return cached data if exists.
     */
    private get(url, bustCache?);
    /**
     * Set the items for the AutoComplete
     * @param {Array} data - the array of objects for the list of options.
     * @param {string} itemTemplate - the innerHTML template for the list items
     */
    private setItems(data, itemTemplate, noMatchesFound?);
    private createListItems(data, itemTemplate, noMatchesFound);
    /**
     * Style the list item using the options.itemClass - or default to component defaults
     * @param li
     */
    private styleListItem(li);
    /**
     * Checks whether the Document has the default item class
     */
    private hasListStyleClass();
    /**
     * Style the popup div
     */
    private stylePopup();
    /**
     * Setup the event listeners for keyboard/mouse events on the list items
     * @param li
     * @param data
     */
    private setupListItemEventListeners(li, data);
    /**
     * Remove the list items from the list.
     */
    private deleteItems();
    /**
     * function to remove the popup from DOM.
     */
    private removePopup();
    /**
     * Cache the response for the url in the query()
     * @param {string} url - the query Url for the AutoComplete
     * @param {any} result - the response from httpAsync();
     */
    private cacheIt(url, data);
    /**
     * XMLHttpRequest
     */
    private http(url, method?);
    /**
     * Reusable function for the event listeners to clear the popup/list
     * @param ev
     */
    private destroy;
}
export interface CACompleteOptions {
    element: HTMLInputElement;
    queryUrl: string;
    itemTemplate: string;
    templateKeys: string[];
    cache?: boolean;
    minLength?: number;
    listClass?: string;
    itemClass?: string;
    itemSelectCallback?: Function;
}
