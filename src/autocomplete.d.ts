declare class CAComplete {
    rootElement: HTMLInputElement;
    popup: HTMLDivElement;
    list: HTMLUListElement;
    items: any[];
    cache: boolean;
    queryUrl: string;
    constructor(options: CACompleteOptions);
    private get(url, bustCache?);
    private setItems(data, optionText, listClass, itemClass);
    private xItems();
    private xPopup();
    private cacheIt(url, data);
    private http(url, method?);
}
interface CACompleteOptions {
    rootElement: HTMLInputElement;
    cache: boolean;
    queryUrl: string;
    wildCard: string;
    minStringLength: number;
    itemValue: any;
    listClass: string;
    itemClass: string;
}
