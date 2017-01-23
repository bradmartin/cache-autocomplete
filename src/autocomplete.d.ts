declare class CAComplete {
    rootElement: HTMLInputElement;
    popup: HTMLDivElement;
    list: HTMLUListElement;
    items: any[];
    cacheData: boolean;
    queryUrl: string;
    constructor(options: CACompleteOptions);
    private get(url, bustCache?);
    private setItems(data, optionText, listClass, itemClass);
    private xItems();
    private xPopup();
    private cacheIt(url, result);
    private httpAsync(url, method?);
}
interface CACompleteOptions {
    rootElement: HTMLInputElement;
    cacheData: boolean;
    queryUrl: string;
    wildCard: string;
    minStringLength: number;
    itemValue: any;
    listClass: string;
    itemClass: string;
}
