class CAComplete {

    public rootElement: HTMLInputElement;
    public popup: HTMLDivElement;
    public list: HTMLUListElement;
    public items: any[] = [];
    public cache: boolean = true;
    public queryUrl: string;
    public onItemSelect: Function;
    public onItemsSet: Function;

    constructor(options: CACompleteOptions) {
        let t0 = performance.now();

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

        let t1 = performance.now();
        console.log(`Constructor took ${(t1 - t0)}`);
    }


    /**
     * Query a url using the AutoComplete instance
     * @param {string} url - the url to query.
     * @param {boolean} bustCache - true to not return cached data if exists.
     */
    private get(url: string, bustCache: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => {
            let isUrlCached: boolean = false;

            // console.log(`start localStorage loop: ${performance.now()}`);
            for (let i = window.localStorage.length; i--;) {
                let key = window.localStorage.key(i);
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
            // console.log(`end localStorage loop: ${performance.now()}`);

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

                let cachedData: string = window.localStorage.getItem(`CAC-${url}`);

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
     * @param {string} optionText - the text property in the data objects for the <option>TEXT</option>.
     * @param {string} optionValue - the <option value="optionValue"></option> for the options in the data.
     */
    private setItems(data: any[], optionText: string, listClass: string, itemClass: string) {
        let t0 = performance.now();

        for (let i = 0; i < data.length; i++) {
            let li: HTMLLIElement = document.createElement("li");

            li.id = data.indexOf(data[i]).toString();
            li.tabIndex = 0;
            li.innerHTML = `${data[i][optionText]}`;
            li.classList.add(itemClass);

            li.addEventListener("keydown", (ev: KeyboardEvent) => {
                let trgt = <HTMLLIElement>ev.target;

                /// ENTER KEY press
                if (ev.keyCode === 13) {
                    // get the selected item and map to the data for all items
                    let selectedItem = data[parseInt(trgt.id, 10)];
                    /// set the rootElement value
                    this.rootElement.value = selectedItem[optionText];
                    this.xPopup();
                    this.onItemSelect(selectedItem);
                }

                /// DOWN ARROW press
                if (ev.keyCode === 40 && this.items.length > 0) {
                    ev.preventDefault(); /// prevent scrolling of the list
                    /// shift focus down the list
                    if (li.nextSibling) {
                        if (li.nextSibling.nodeName.toLowerCase() === "li") {
                            (<HTMLLIElement>li.nextSibling).focus();
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
                    if (li.previousSibling) {
                        if (li.previousSibling.nodeName.toLowerCase() === "li") {
                            (<HTMLLIElement>li.previousSibling).focus();
                        }
                    } else { /// move focus to the rootElement (input)
                        this.rootElement.focus();
                    }
                }

            })

            // add event listener to the <list> list and then parse the element and update the textboxes
            li.addEventListener("click", (listClickEvent: Event) => {
                let trgt = <HTMLLIElement>listClickEvent.target;
                if (trgt && trgt.nodeName.toLowerCase() === "li") {
                    // get id of the clicked <li> and map to the data array
                    let selectedItem = data[parseInt(trgt.id, 10)];
                    this.rootElement.value = selectedItem[optionText];
                    this.xItems();
                    this.xPopup();
                    this.onItemSelect(selectedItem);
                }
            })

            /// push to the items prop - if not worth having, remove in update
            this.items.push(li);

            this.list.style.listStyle = "none";
            this.list.style.padding = "0";
            this.list.style.margin = "0";
            this.list.appendChild(li);
        }

        /// get coords of the doc.body
        let bodyRect: ClientRect = document.body.getBoundingClientRect();
        let rect: ClientRect = this.rootElement.getBoundingClientRect();
        let top: number = rect.top - bodyRect.top + this.rootElement.clientHeight;
        let left: number = rect.left;

        if (!this.popup) {
            this.popup = document.createElement("div");
        }

        this.popup.classList.add(listClass);
        this.popup.style.top = top.toString();
        this.popup.style.left = left.toString();
        this.popup.style.position = "absolute";
        this.popup.style.zIndex = "99999";
        this.popup.style.overflowY = "auto";
        this.popup.style.maxHeight = "300px";
        this.popup.style.width = `${this.rootElement.clientWidth.toString()}px`;
        this.popup.appendChild(this.list);

        /// add the popup to the DOM
        this.rootElement.parentNode.insertBefore(this.popup, this.rootElement.nextSibling);

        this.list.focus();

        this.onItemsSet();

        let t1 = performance.now();
        console.log(`setItems() took ${(t1 - t0)} milliseconds.`);

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
        if (this.popup.parentNode) {
            this.popup.parentNode.removeChild(this.popup);
        }
    }


    /**
     * Cache the response for the url in the query()
     * @param {string} url - the query Url for the AutoComplete
     * @param {any} result - the response from httpAsync();
     */
    private cacheIt(url: string, data: any) {
        let t0 = performance.now();

        if (window.localStorage) {
            window.localStorage.setItem(`CAC-${url}`, JSON.stringify(data));
        }

        let t1 = performance.now();
        console.log(`cacheIt() took ${(t1 - t0)} milliseconds.`);
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


interface CACompleteOptions {
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