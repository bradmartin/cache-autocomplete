declare class CacheAutoComplete {
    rootElement: HTMLInputElement;
    popup: HTMLDivElement;
    list: HTMLUListElement;
    items: any[];
    cacheData: boolean;
    queryUrl: string;
    constructor(options: CacheAutoCompleteOptions);
    private get(url, bustCache?);
    private setItems(data, optionText, listClass, itemClass);
    private dumpItems();
    private destroyPopup();
    private cacheIt(url, result);
    private httpAsync(url, method?);
}
interface CacheAutoCompleteOptions {
    rootElement: HTMLInputElement;
    cacheData: boolean;
    queryUrl: string;
    wildCard: string;
    minStringLength: number;
    itemValue: any;
    listClass: string;
    itemClass: string;
}
