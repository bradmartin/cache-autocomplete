export class CAComplete {

    public rootElement: HTMLInputElement;
    public popup: HTMLDivElement;
    public list: HTMLUListElement;
    public items: any[] = [];
    public cache: boolean = true;
    public queryUrl: string;
    public onItemSelect: Function;
    public onItemsSet: Function;

    constructor(options: CACompleteOptions) {
        this.rootElement = options.rootElement;
        this.list = <HTMLUListElement>document.createElement("ul");
        this.cache = options.cache;
        this.onItemSelect = options.onItemSelect;
        this.onItemsSet = options.onItemsSet;

        this.rootElement.addEventListener("keydown", (ev) => {
            /// if TAB press send focus to list - this is handled natively by browsers with most layouts
            /// However, some weird layouts might have shitty layout/tabIndex order so this will improve the awesomeness.
            if (ev.keyCode === 9 && this.items.length > 0) {
                ev.preventDefault();
                (<HTMLLIElement>this.list.childNodes[0]).focus();
            }

            /// DOWN ARROW press - if in the focused input move the focus to the first item
            if (ev.keyCode === 40 && this.items.length > 0) {
                ev.preventDefault(); /// prevent scrolling of the list
                (<HTMLLIElement>this.list.childNodes[0]).focus();
            }

        })

        /// Add keyup event listener to trigger the GET request
        this.rootElement.addEventListener("keyup", (ev: KeyboardEvent) => {
            let trgt = <HTMLInputElement>(ev.target);

            /// if the input is empty go ahead and close the suggestion list
            if (trgt.value === "") {
                this.xItems();
                this.xPopup();
                return;
            }

            if (trgt.value.trim().length >= options.minStringLength) {

                this.queryUrl = options.queryUrl.replace(options.wildCard, this.rootElement.value);

                this.get(this.queryUrl, false).then((data) => {
                    this.xItems();

                    if (typeof data === "string") {
                        data = JSON.parse(data);
                    }

                    this.setItems(data, options.itemValue, options.listClass, options.itemClass);

                }, (err) => {
                    this.xItems();
                    this.setItems([{ key: "No Matches" }], "key", options.listClass, options.itemClass);
                })

            }

        })

        /// if a click occurs on the body close the popup
        document.body.addEventListener("click", (ev) => {
            if (this.items.length > 0) {
                this.xItems();
                this.xPopup();
            }
        })

    }


    /**
     * Delete a single key (url) from storage or all CacheAutoComplete keys.
     * If no url is passed as an argument, all keys and data will be removed from storage.
     * @param {string} [url] - The url to delete from storage.
     */
    public clearCache(url?: string) {
        /// delete a single key in storage
        if (url) {
            localStorage.removeItem(`CAC-${url}`);
        } else {
            /// delete all CAcomplete keys in storage
            for (let i = localStorage.length; i--;) {
                let key = localStorage.key(i);
                if (key.lastIndexOf("CAC", 0) === 0) {
                    localStorage.removeItem(key);
                }
            }
        }
    }


    /**
     * Query a url using the AutoComplete instance
     * @param {string} url - the url to query.
     * @param {boolean} bustCache - true to not return cached data if exists.
     */
    private get(url: string, bustCache: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => {
            let isUrlCached: boolean = false;

            for (let i = localStorage.length; i--;) {
                let key = localStorage.key(i);
                if (key.lastIndexOf("CAC", 0) === 0) {
                    let keyMatchUrl = key.indexOf(url) > -1;
                    if (keyMatchUrl === true) {
                        isUrlCached = true;
                    }
                }
                if (isUrlCached === true) {
                    break;
                }
            }

            /// is the urlCached already and are we busting the cache
            if (isUrlCached && bustCache) {

                this.http(url).then((result) => {
                    if (this.cache) {
                        this.cacheIt(url, result);
                    }
                    resolve(result);
                }, (err) => {
                    reject(err);
                })

            } else if (isUrlCached && !bustCache) {

                let cachedData: string = localStorage.getItem(`CAC-${url}`);

                resolve(JSON.parse(cachedData));

            } else if (!isUrlCached) {

                this.http(url).then((result) => {
                    if (this.cache) {
                        this.cacheIt(url, result);
                    }
                    resolve(result);
                }, (err) => {
                    reject(err);
                })

            } else {
                /// wtf
                reject("get outta here");
            }

        })
    }



    /**
     * Set the items for the AutoComplete
     * @param {Array} data - the array of objects for the list of options.
     * @param {string} itemValue - the text property in the data objects for the <li>TEXT</li>.
     */
    private setItems(data: any[], itemValue: string, listClass: string, itemClass: string) {
        for (let i = 0; i < data.length; i++) {
            let li: HTMLLIElement = document.createElement("li");

            li.id = data.indexOf(data[i]).toString();
            li.tabIndex = 0;
            li.innerHTML = `${data[i][itemValue]}`;
            li.classList.add(itemClass);

            li.addEventListener("keydown", (ev: KeyboardEvent) => {
                let trgt = <HTMLLIElement>ev.target;

                /// ENTER KEY press
                if (ev.keyCode === 13) {
                    // get the selected item and map to the data for all items
                    let item = data[parseInt(trgt.id, 10)];
                    /// set the rootElement value
                    this.rootElement.value = item[itemValue];
                    this.xPopup();
                    this.onItemSelect(item);
                }

                /// DOWN ARROW press
                if (ev.keyCode === 40 && this.items.length > 0) {
                    ev.preventDefault(); /// prevent scrolling of the list
                    /// shift focus down the list
                    let nSib = li.nextSibling;
                    if (nSib) {
                        if (nSib.nodeName.toLowerCase() === "li") {
                            (<HTMLLIElement>nSib).focus();
                        }
                    } else {
                        /// shift focus to the top of the list if we are at the bottom
                        (<HTMLLIElement>this.list.childNodes[0]).focus();
                    }
                }

                /// UP ARROW press
                if (ev.keyCode === 38 && this.items.length > 0) {
                    ev.preventDefault(); /// prevent scrolling of the list
                    /// shift focus to the next list item
                    let pSib = li.previousSibling;
                    if (pSib) {
                        if (pSib.nodeName.toLowerCase() === "li") {
                            (<HTMLLIElement>pSib).focus();
                        }
                    } else { /// move focus to the rootElement (input)
                        this.rootElement.focus();
                    }
                }

            })

            // add event listener to the <list> list and then parse the element and update the textboxes
            li.addEventListener("click", (ev: Event) => {
                let trgt = <HTMLLIElement>ev.target;
                if (trgt && trgt.nodeName.toLowerCase() === "li") {
                    // get id of the clicked <li> and map to the data array
                    let item = data[parseInt(trgt.id, 10)];
                    this.rootElement.value = item[itemValue];
                    this.xItems();
                    this.xPopup();
                    if (this.onItemSelect) {
                        this.onItemSelect(item);
                    }
                }
            })

            /// push to the items prop - if not worth having, remove in update
            this.items.push(li);

            this.list.appendChild(li);
        }

        /// Set the styles for the list
        Object.assign(this.list.style, { listStyle: "none", padding: "0", margin: "0" });

        if (!this.popup) {
            this.popup = document.createElement("div");
        }

        /// Add user specified Css class
        this.popup.classList.add(listClass);

        /// Set styles for the popup div
        Object.assign(this.popup.style, {
            position: "absolute",
            zIndex: "999999999",
            overflowY: "auto",
            maxHeight: "300px",
            width: `${this.rootElement.clientWidth.toString()}px`
        });

        this.popup.appendChild(this.list);

        /// add the popup to the DOM
        this.rootElement.parentNode.insertBefore(this.popup, this.rootElement.nextSibling);

        this.list.focus();

        if (this.onItemsSet) {
            this.onItemsSet();
        }
    }


    /**
     * Remove the list items from the list.
     */
    private xItems() {
        if (this.list.getElementsByTagName("li").length > 0) {
            while (this.list.firstChild) {
                this.list.removeChild(this.list.firstChild);
            }
            this.items = [];
        }
    }


    /**
     * Helper function to remove the popup from DOM.
     */
    private xPopup(): void {
        if (this.popup) {
            this.popup.parentNode.removeChild(this.popup);
        }
    }


    /**
     * Cache the response for the url in the query()
     * @param {string} url - the query Url for the AutoComplete
     * @param {any} result - the response from httpAsync();
     */
    private cacheIt(url: string, data: any) {
        if (localStorage) {
            localStorage.setItem(`CAC-${url}`, JSON.stringify(data));
        }
    }


    /**
     * XMLHttpRequest
     */
    private http(url: string, method: string = "GET"): Promise<any> {
        return new Promise((resolve, reject) => {

            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open(method, url, true);

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            };

            xhr.onerror = () => {
                reject(xhr.statusText);
            };

            xhr.send();
        });
    }


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