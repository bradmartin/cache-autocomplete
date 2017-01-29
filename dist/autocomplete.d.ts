export declare class CAComplete {
    rootElement: HTMLInputElement;
    popup: HTMLDivElement;
    list: HTMLUListElement;
    items: any[];
    cache: boolean;
    queryUrl: string;
    onItemSelect: Function;
    onItemsSet: Function;
    constructor(options: CACompleteOptions);
    clearCache(url?: string): void;
    private get(url, bustCache?);
    private setItems(data, itemValue, listClass, itemClass);
    private xItems();
    private xPopup();
    private cacheIt(url, data);
    private http(url, method?);
}
export interface CACompleteOptions {
    rootElement: HTMLInputElement;
    cache: boolean;
    queryUrl: string;
    wildCard: string;
    minStringLength: number;
    itemValue: any;
    listClass: string;
    itemClass: string;
    onItemSelect: Function;
    onItemsSet: Function;
}
