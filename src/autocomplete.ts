class CacheAutoComplete {

    public RootDomElement: HTMLInputElement;
    public List: HTMLUListElement;
    public Suggestions: any[] = [];
    public CacheData: boolean = true;
    public QueryUrl: string;
    private PopupDiv: HTMLDivElement;

    constructor(options: CacheAutoCompleteOptions) {
        console.log(`start constructor: ${performance.now()}`);

        this.List = <HTMLUListElement>document.createElement("List");
        this.List.classList.add(options.listCssClass);

        this.RootDomElement = <HTMLInputElement>document.getElementById(options.elementId);
        this.CacheData = options.cacheData;

        /// Add keyup event listener to trigger the GET request
        this.RootDomElement.addEventListener("keyup", (ev: KeyboardEvent) => {
            let target = <HTMLInputElement>(ev.target);

            /// if the input is empty go ahead and close the suggestion list
            if (target.value === "") {
                this.clearSuggestions();
                this.destroyLocationSearchPopup();
                return;
            }

            if (target.value.trim().length >= 2) {

                this.QueryUrl = options.remoteUrl.replace(options.wildCard, this.RootDomElement.value);
                console.log(this);

                this.get(this.QueryUrl, false).then((data) => {
                    this.clearSuggestions();

                    if (typeof data === "string") {
                        data = JSON.parse(data);
                    }

                    let items = [];

                    this.setSuggestions(data, options.listItemValue, options.itemCssClass);

                }, (err) => {
                    console.log(err);
                })

            }

            if (ev.keyCode === 40) {
                console.log('go down to list');
                console.log(this);
            }

        })

        /// if a click occurs on the body close the popup
        document.body.addEventListener("click", (ev) => {
            this.clearSuggestions();
            this.destroyLocationSearchPopup();
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

            /// check if this url has been cached previously
            for (let key in window.localStorage) {
                if (key.lastIndexOf("autocomplete", 0) === 0) {
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
            if (isUrlCached === true && bustCache === true) {

                this.httpAsync(url).then((response) => {
                    if (this.CacheData === true) {
                        this.cacheIt(url, response);
                    }
                    resolve(response.data);
                })

            } else if (isUrlCached === true && bustCache === false) {

                let cachedData: string = this.getCachedData(`autocomplete-${url}`);
                resolve(JSON.parse(cachedData).data);

            } else if (isUrlCached === false) {

                this.httpAsync(url).then((response) => {
                    if (this.CacheData === true) {
                        this.cacheIt(url, response);
                    }
                    resolve(response.data);
                })

            } else {
                /// wtf
                console.log(`WHAT DO WE DO?!?!?`);
                reject("get outta here");
            }

        })
    }

    /**
     * Set the Suggestions for the AutoComplete
     * @param {Array} dataArray - the array of objects for the list of options.
     * @param {string} optionText - the text property in the dataArrays objects for the <option>TEXT</option>.
     * @param {string} optionValue - the <option value="optionValue"></option> for the options in the dataArray.
     */
    public setSuggestions(dataArray: any[], optionText: string, itemClass: string) {
        console.log(`start setSuggestions(): ${performance.now()}`);

        if (!dataArray) {
            return new Error("A dataArray is required.");
        }


        for (let i = 0; i < dataArray.length; i++) {
            let item = dataArray[i];
            let li: HTMLLIElement = document.createElement("li");
            li.setAttribute("class", itemClass);
            li.setAttribute("id", dataArray.indexOf(item).toString());
            li.setAttribute("tabindex", "0");
            li.innerHTML = `${item[optionText]}`;
            this.Suggestions.push(li);
            li.addEventListener("keydown", (ev: KeyboardEvent) => {
                let target = <HTMLLIElement>ev.target;

                /// ENTER KEY press
                if (ev.keyCode === 13) {
                    // get the selected item and map to the dataArray for all items
                    let selectedItem = dataArray[parseInt(target.id, 10)];
                    /// set the RootDomElement value
                    this.RootDomElement.value = selectedItem[optionText];
                    this.destroyLocationSearchPopup();
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

            this.List.appendChild(li);
        }

        /// get coords of the doc.body
        let bodyRect: ClientRect = document.body.getBoundingClientRect();
        let rect: ClientRect = this.RootDomElement.getBoundingClientRect();
        let top = rect.top - bodyRect.top + this.RootDomElement.style.height;
        let left = rect.left;
        this.PopupDiv = document.createElement("div");
        this.PopupDiv.style.maxHeight = "260px";
        this.PopupDiv.style.overflowY = "auto";
        // this.PopupDiv.style.maxWidth = `${this.RootDomElement.clientWidth.toString()}px`;
        this.PopupDiv.style.top = top.toString();
        this.PopupDiv.style.left = left.toString();
        this.PopupDiv.appendChild(this.List);


        /// add the this.PopupDiv to the body (the position is set above)
        document.body.appendChild(this.PopupDiv);

        this.List.focus();


        // add event listener to the <List> list and then parse the element and update the textboxes
        this.List.addEventListener("click", (listClickEvent: Event) => {
            let listTarget = <HTMLLIElement>listClickEvent.target;
            if (listTarget && listTarget.nodeName === "LI") {
                // get id of the clicked <li> and map to the data array
                let selectedItem = dataArray[parseInt(listTarget.id, 10)];
                console.log(selectedItem);
                this.RootDomElement.value = selectedItem[optionText];
                this.clearSuggestions();
                this.destroyLocationSearchPopup();
            }
        })

        console.log(`end setSuggestions(): ${performance.now()}`);

    }


    /**
     * Remove the list items from the List.
     */
    private clearSuggestions() {
        if (this.List.getElementsByTagName("li").length > 0) {
            console.log(`start clearSuggestions(): ${performance.now()}`);

            while (this.List.firstChild) {
                this.List.removeChild(this.List.firstChild);
            }
            this.Suggestions = [];
            console.log(`end clearSuggestions(): ${performance.now()}`);
        }
    }


    /**
     * Helper function to remove the location search popup from DOM.
     */
    private destroyLocationSearchPopup(): void {
        console.log(`start destroyLocationSearchPopup(): ${performance.now()}`);
        if (this.PopupDiv && this.PopupDiv.parentNode) {
            this.PopupDiv.parentNode.removeChild(this.PopupDiv);
        }
        console.log(`end destroyLocationSearchPopup(): ${performance.now()}`);
    }


    /**
     * Cache the response for the url in the query()
     * @param {string} url - the query Url for the AutoComplete
     * @param {AutoCompleteHttpResponse} result - the response from httpAsync();
     */
    private cacheIt(url: string, result: CacheAutoCompleteHttpResponse) {
        if (this.isCacheAvailable()) {
            console.log(`start cacheIt(): ${performance.now()}`);
            this.saveDataToCache(`autocomplete-${url}`, result);
            console.log(`end cacheIt(): ${performance.now()}`);
        }
    }

    /**
     * Async XMLHttpRequest
     */
    private httpAsync(url: string, method: string = "GET"): Promise<CacheAutoCompleteHttpResponse> {
        return new Promise((resolve, reject) => {

            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open(method, url, true);

            xhr.onload = () => {
                let result: CacheAutoCompleteHttpResponse = {
                    data: xhr.response,
                    status: xhr.status,
                    statusText: xhr.statusText
                };

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

    private saveDataToCache(keyName: string, data: Object) {
        console.log(`start saveDataToCache(): ${performance.now()}`);
        if (keyName && data) {
            window.localStorage.setItem(keyName, JSON.stringify(data));
        }
        console.log(`end saveDataToCache(): ${performance.now()}`);
    }

    private getCachedData(keyName: string) {
        if (keyName && this.isCacheAvailable()) {
            return window.localStorage.getItem(keyName);
        }
    }

    private isCacheAvailable(): boolean {
        if (window.localStorage) {
            return true;
        } else {
            return false;
        }
    }


}

interface CacheAutoCompleteHttpResponse {
    data: any;
    status: number;
    statusText: string;
}

interface CacheAutoCompleteOptions {
    elementId: string;
    cacheData: boolean;
    remoteUrl: string;
    wildCard: string;
    listItemValue: any;
    listCssClass: string;
    itemCssClass: string;
}