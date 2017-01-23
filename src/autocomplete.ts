class CacheAutoComplete {

    public rootElement: HTMLInputElement;
    public popup: HTMLDivElement;
    public list: HTMLUListElement;
    public items: any[] = [];
    public cacheData: boolean = true;
    public queryUrl: string;

    constructor(options: CacheAutoCompleteOptions) {
        console.log(`start constructor: ${performance.now()}`);

        this.rootElement = options.rootElement;
        this.list = <HTMLUListElement>document.createElement("ul");
        this.cacheData = options.cacheData;

        this.rootElement.addEventListener("keydown", (ev) => {
            console.log(ev);
            /// if TAB press send focus to list
            if (ev.keyCode === 9) {
                ev.preventDefault();
                if (this.items.length > 0) {
                    console.log(this.list);
                    (<HTMLLIElement>this.list.childNodes[0]).focus();
                }
            }
        })

        /// Add keyup event listener to trigger the GET request
        this.rootElement.addEventListener("keyup", (ev: KeyboardEvent) => {
            let trgt = <HTMLInputElement>(ev.target);

            console.log(ev.keyCode);

            /// if the input is empty go ahead and close the suggestion list
            if (trgt.value === "") {
                this.dumpItems();
                this.destroyPopup();
                return;
            }

            if (trgt.value.trim().length >= options.minStringLength) {

                this.queryUrl = options.queryUrl.replace(options.wildCard, this.rootElement.value);

                this.get(this.queryUrl, false).then((data) => {
                    this.dumpItems();

                    if (typeof data === "string") {
                        data = JSON.parse(data);
                    }

                    this.setItems(data, options.itemValue, options.listClass, options.itemClass);

                }, (err) => {
                    this.dumpItems();
                    this.setItems([{ key: "No Matches" }], "key", "listClass", "itemClass");
                })

            }

        })

        /// if a click occurs on the body close the popup
        document.body.addEventListener("click", (ev) => {
            if (this.items.length > 0) {
                this.dumpItems();
                this.destroyPopup();
            }
        })

        console.log(`end constructor: ${performance.now()}`);
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
            if (isUrlCached === true && bustCache === true) {

                this.httpAsync(url).then((result) => {
                    if (this.cacheData === true) {
                        this.cacheIt(url, result);
                    }
                    resolve(result);
                }, (err) => {
                    reject(err);
                })

            } else if (isUrlCached === true && bustCache === false) {

                let cachedData: string = window.localStorage.getItem(`CAC-${url}`);

                resolve(JSON.parse(cachedData));

            } else if (isUrlCached === false) {

                this.httpAsync(url).then((result) => {
                    if (this.cacheData === true) {
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
        console.log(`start setItems(): ${performance.now()}`);

        for (let i = 0; i < data.length; i++) {
            let li: HTMLLIElement = document.createElement("li");

            li.id = data.indexOf(data[i]).toString();
            li.tabIndex = 0;
            li.innerHTML = `${data[i][optionText]}`;
            li.classList.add(itemClass);

            this.items.push(li);
            li.addEventListener("keydown", (ev: KeyboardEvent) => {
                let trgt = <HTMLLIElement>ev.target;

                /// ENTER KEY press
                if (ev.keyCode === 13) {
                    // get the selected item and map to the data for all items
                    let selectedItem = data[parseInt(trgt.id, 10)];
                    /// set the rootElement value
                    this.rootElement.value = selectedItem[optionText];
                    this.destroyPopup();
                }

                /// DOWN ARROW press
                if (ev.keyCode === 40 && li.nextSibling) {
                    ev.preventDefault(); /// prevent scrolling of the list
                    if (li.nextSibling.nodeName.toLowerCase() === "li") {
                        (<HTMLLIElement>li.nextSibling).focus();
                    }
                }

                /// UP ARROW press
                if (ev.keyCode === 38 && li.previousSibling) {
                    ev.preventDefault(); /// prevent scrolling of the list
                    if (li.previousSibling.nodeName.toLowerCase() === "li") {
                        (<HTMLLIElement>li.previousSibling).focus();
                    }
                }

            })

            this.list.style.listStyle = "none";
            // this.list.style.padding = "5px";
            this.list.appendChild(li);
        }

        /// get coords of the doc.body
        let bodyRect: ClientRect = document.body.getBoundingClientRect();
        let rect: ClientRect = this.rootElement.getBoundingClientRect();
        let top = rect.top - bodyRect.top + this.rootElement.clientHeight;
        let left = rect.left;

        if (!this.popup) {
            this.popup = document.createElement("div");
        }
        this.popup.style.maxHeight = "300px";
        this.popup.style.overflowY = "auto";
        this.popup.classList.add(listClass);

        // this.popup.style.maxWidth = `${this.rootElement.clientWidth.toString()}px`;
        this.popup.style.top = top.toString();
        this.popup.style.left = left.toString();
        this.popup.appendChild(this.list);

        /// add the this.popup to the body (the position is set above)
        document.body.appendChild(this.popup);

        this.list.focus();

        // add event listener to the <list> list and then parse the element and update the textboxes
        this.list.addEventListener("click", (listClickEvent: Event) => {
            let listTarget = <HTMLLIElement>listClickEvent.target;
            if (listTarget && listTarget.nodeName.toLowerCase() === "li") {
                // get id of the clicked <li> and map to the data array
                let selectedItem = data[parseInt(listTarget.id, 10)];
                this.rootElement.value = selectedItem[optionText];
                this.dumpItems();
                this.destroyPopup();
            }
        })

        console.log(`end setItems(): ${performance.now()}`);

    }


    /**
     * Remove the list items from the list.
     */
    private dumpItems() {
        if (this.list.getElementsByTagName("li").length > 0) {
            console.log(`start dumpSuggestions(): ${performance.now()}`);

            while (this.list.firstChild) {
                this.list.removeChild(this.list.firstChild);
            }
            this.items = [];
            console.log(`end dumpSuggestions(): ${performance.now()}`);
        }
    }


    /**
     * Helper function to remove the popup from DOM.
     */
    private destroyPopup(): void {
        console.log(`start destroyPopup(): ${performance.now()}`);
        if (this.popup.parentNode) {
            this.popup.parentNode.removeChild(this.popup);
        }
        console.log(`end destroyPopup(): ${performance.now()}`);
    }


    /**
     * Cache the response for the url in the query()
     * @param {string} url - the query Url for the AutoComplete
     * @param {AutoCompleteHttpResponse} result - the response from httpAsync();
     */
    private cacheIt(url: string, result: any) {
        if (window.localStorage) {
            console.log(`start saveDataToCache(): ${performance.now()}`);
            window.localStorage.setItem(`CAC-${url}`, JSON.stringify(result));
            console.log(`end saveDataToCache(): ${performance.now()}`);
        }
    }

    /**
     * Async XMLHttpRequest
     */
    private httpAsync(url: string, method: string = "GET"): Promise<any> {
        return new Promise((resolve, reject) => {

            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open(method, url, true);

            xhr.onload = () => {

                let result: any = xhr.response;

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(result);
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