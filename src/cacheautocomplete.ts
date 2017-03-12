export class AutoComplete {
    public items: any[];
    public itemClass: string;
    public listClass: string;
    public url: string;
    public element: HTMLInputElement
    public cache: boolean;
    public itemTemplate: string;
    public keys: string[];
    public onSelect: Function;
    public minLength: number;
    readonly POPUP: HTMLDivElement;
    readonly LIST: HTMLUListElement;
    readonly LI_CLASS: string = "CacheAutoCompleteItem";

    constructor(opts: CACompleteOptions) {
        this.element = opts.element;
        this.url = opts.url;
        this.itemTemplate = opts.itemTemplate;
        this.keys = opts.keys;
        this.items = [];
        this.cache = opts.cache ? opts.cache : true
        this.minLength = opts.minLength ? opts.minLength : 1;
        this.itemClass = opts.itemClass;
        this.listClass = opts.listClass;
        this.POPUP = document.createElement("div") as HTMLDivElement;
        this.LIST = document.createElement("ul") as HTMLUListElement;
        this.onSelect = opts.onSelect;
        this.createComponent();
    }

    /**
      * Delete a single key (url) from storage or all CacheAutoComplete keys.
      * If no url is passed as an argument, all keys and data will be removed from storage.
      * @param {string} [url] - The url to delete from storage.
      */
    public static clearCache(url?: string): void {
        if (url) {
            localStorage.removeItem(`CAC-${url}`)
        } else {
            for (let i = localStorage.length; i--;) {
                const key = localStorage.key(i)
                if (key.lastIndexOf("CAC", 0) === 0) {
                    localStorage.removeItem(key)
                }
            }
        }
    }

    private createComponent() {
        this.addEventListeners();
    }

    private addEventListeners() {
        // this.LIST = document.createElement("ul") as HTMLUListElement
        this.element.addEventListener("keydown", (ev) => {
            /// if TAB press send focus to list - this is handled natively by browsers with most layouts
            /// However, some weird layouts might have shitty layout/tabIndex order so this will improve the awesomeness.
            /// DOWN ARROW press - if in the focused input move the focus to the first item
            if (ev.keyCode === 9 || ev.keyCode === 40 && this.items.length > 0) {
                ev.preventDefault();
                (this.LIST.childNodes[0] as HTMLLIElement).focus();
            }
        })

        /// Add keyup event listener to trigger the GET request
        this.element.addEventListener("keyup", (ev: KeyboardEvent) => {
            const trgt = ev.target as HTMLInputElement
            /// if the input is empty go ahead and close the suggestion list
            if (trgt.value === "") {
                this.deleteItems()
                this.removePopup()
                return
            }

            if (trgt.value.trim().length >= this.minLength) {
                const url = this.url.replace(`{{ value }}`, encodeURIComponent(this.element.value))
                this.get(url, false).then((data) => {
                    this.deleteItems()
                    if (data) {
                        if (typeof data === "string") {
                            data = JSON.parse(data)
                        }
                        this.setItems(data, this.itemTemplate)
                        document.addEventListener("click", this.destroy);
                        window.addEventListener("resize", this.destroy)
                    }
                }, (err) => {
                    this.deleteItems()
                    this.setItems([{ key: "No Matches" }], '<p> No Matches </p>', true)
                    /// if a click occurs on the body close the popup or window resize
                    document.addEventListener("click", this.destroy)
                    window.addEventListener("resize", this.destroy)
                })
            }
        })
    }

    /**
     * Query a url using the AutoComplete instance
     * @param {string} url - the url to query.
     * @param {boolean} bustCache - true to not return cached data if exists.
     */
    private get(url: string, bustCache: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => {
            let isUrlCached = false as boolean;
            for (let i = localStorage.length; i--;) {
                const key = localStorage.key(i) as string;
                if (key.lastIndexOf("CAC", 0) === 0) {
                    if (key.indexOf(url) > -1 === true) {
                        isUrlCached = true
                    }
                }
                if (isUrlCached === true) {
                    break
                }
            }

            /// is the urlCached already and are we busting the cache
            if (isUrlCached && bustCache) {
                this.http(url).then((result) => {
                    if (this.cache) {
                        this.cacheIt(url, result)
                    }
                    resolve(result)
                }, (err) => {
                    reject(err)
                })
            } else if (isUrlCached && !bustCache) {
                const cachedData: string = localStorage.getItem(`CAC-${url}`);
                resolve(JSON.parse(cachedData))
            } else if (!isUrlCached) {
                this.http(url).then((result) => {
                    if (this.cache) {
                        this.cacheIt(url, result)
                    }
                    resolve(result)
                }, (err) => {
                    reject(err)
                })
            } else {
                /// wtf
                reject("get outta here")
            }
        })
    }

    /**
     * Set the items for the AutoComplete
     * @param {Array} data - the array of objects for the list of options.
     * @param {string} itemTemplate - the innerHTML template for the list items
     */
    private setItems(data: any[], itemTemplate, noMatchesFound: boolean = false): void {
        this.addListItems(data, itemTemplate, noMatchesFound)
        this.stylePopup()
        this.POPUP.appendChild(this.LIST)
        document.body.appendChild(this.POPUP)
        this.LIST.focus()
    }


    private addListItems(data, itemTemplate, noMatchesFound) {
        /// parse the itemTemplate
        const template = itemTemplate;
        let i = 0
        for (i; i < data.length; i++) {
            const li = document.createElement("li") as HTMLLIElement
            li.id = i.toString()
            li.tabIndex = 0
            li.setAttribute("cacheautocomplete-id", i.toString())

            let originalTemplate = template
            let replacedKeyString
            let j = 0
            for (j; j < this.keys.length; j++) {
                const key = this.keys[j]
                originalTemplate = originalTemplate.replace(`{{ ${key} }}`, `${data[i][key]}`)
                replacedKeyString = originalTemplate
                if (j === this.keys.length - 1) {
                    li.innerHTML = replacedKeyString
                    li.title = li.innerText
                    break
                }
            }

            this.styleListItem(li)
            /// Only set event listeners if there are matching items. When we set `No Matches found` we pass a flag to skip this
            if (!noMatchesFound) {
                this.setupListItemEventListeners(li, data)
            }
            /// push to the items prop - if not worth having, remove in update
            this.items.push(li)
            this.LIST.appendChild(li)
        }
    }

    /**
     * Style the list item using the options.itemClass - or default to component defaults
     * @param li
     */
    private styleListItem(li: HTMLLIElement) {
        // default style or custom item class
        if (this.itemClass) {
            li.classList.add(this.itemClass)
        } else {
            if (this.hasListStyleClass()) {
                li.classList.add(`${this.LI_CLASS}`)
            } else {
                this.addItemStyle();
                li.classList.add(`${this.LI_CLASS}`);
            }
        }
    }


    private addItemStyle() {
        if (!this.itemClass && !this.hasListStyleClass()) {
            let iClass = document.createElement("style") as HTMLStyleElement
            iClass.id = `${this.LI_CLASS}`
            iClass.type = 'text/css'
            iClass.innerHTML = `.${this.LI_CLASS} {
                    color: rgb(33, 33, 33);
                    cursor: pointer;
                    text-overflow: ellipsis;
                    height: auto;
                    padding: 5px 12px 5px 12px;
                    overflow: hidden;
                    white-space: nowrap;
                    background: transparent;
                    transition: background-color .15s linear;
                }
               .${this.LI_CLASS}:hover {
                    background-color: rgb(238,238,238);
                }
                .${this.LI_CLASS}:focus {
                    outline: none;
                    background-color: #eeeeee;
                    color: #444;
                }
        }`
            document.head.appendChild(iClass)
        }
    }

    /**
     * Checks whether the Document has the default item class
     */
    private hasListStyleClass() {
        return document.getElementById(`${this.LI_CLASS}`) ? true : false;
    }

    /**
     * Style the popup div
     */
    private stylePopup() {
        this.LIST.setAttribute("style", "list-style: none; padding: 0; margin: 0; max-height: 300px")

        /// get coords of the doc.body for positioning in the document.body
        /// use this approach for the many use cases of an input (modals and shit layouts)
        const bodyRect: ClientRect = document.body.getBoundingClientRect()
        const rect: ClientRect = this.element.getBoundingClientRect()
        const top: number = rect.top - bodyRect.top + this.element.clientHeight
        const left: number = rect.left

        /// set popup list styles
        if (this.listClass) {
            this.POPUP.classList.add(this.listClass)
        } else {
            this.POPUP.setAttribute("style", `
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                background-color: #FFF;
                border-radius: 0 0 3px 3px;
                box-shadow: 0 1px 3px 0 rgba(0,0,0,.2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 2px 1px -1px rgba(0, 0, 0, .12);
            `)
        }

        let originalStyleValue = this.POPUP.getAttribute("style") ? this.POPUP.getAttribute("style").valueOf() : "";
        this.POPUP.setAttribute("style", `
            ${originalStyleValue} position: absolute;
            top: ${Math.round(top).toString()}px;
            left: ${Math.round(left).toString()}px;
            z-index: 9999999;
            overflow-y: auto;
            max-height: 300px;
            width: ${this.element.clientWidth.toString()}px;
        `)
    }

    /**
     * Setup the event listeners for keyboard/mouse events on the list items
     * @param li 
     * @param data 
     */
    private setupListItemEventListeners(li: HTMLLIElement, data) {
        li.addEventListener("keydown", (ev: KeyboardEvent) => {
            const trgt = ev.target as HTMLLIElement
            /// ENTER KEY press
            if (ev.keyCode === 13) {
                this.removePopup()
                this.onSelect(data[parseInt(trgt.id, 10)], this)
            }

            /// DOWN ARROW press
            if (ev.keyCode === 40 && this.items.length > 0) {
                ev.preventDefault()
                if (li.nextSibling && li.nextSibling.nodeName === "LI") {
                    (li.nextSibling as HTMLLIElement).focus()
                } else {
                    /// shift focus to the top of the list if we are at the bottom
                    (this.LIST.childNodes[0] as HTMLLIElement).focus()
                }
            }

            /// UP ARROW press
            if (ev.keyCode === 38 && this.items.length > 0) {
                ev.preventDefault()
                /// shift focus to the next list item
                if (li.previousSibling && li.previousSibling.nodeName === "LI") {
                    (li.previousSibling as HTMLLIElement).focus()
                } else { /// move focus to the rootElement (input)
                    this.element.focus()
                }
            }
        })

        // add event listener to the <list> list and then parse the element and update the textboxes
        li.addEventListener("click", (ev: Event) => {
            const autocompleteItemId = li.getAttribute("cacheautocomplete-id")
            if (ev.target && autocompleteItemId) {
                // get id of the clicked <li> and map to the data array
                const item = data[parseInt(autocompleteItemId, 10)]
                this.deleteItems();
                this.removePopup()
                if (this.onSelect) {
                    this.onSelect(item, this)
                }
            }
        })
    }

    /**
     * Remove the list items from the list.
     */
    private deleteItems(): void {
        if (this.LIST.getElementsByTagName("li").length > 0) {
            while (this.LIST.firstChild) {
                this.LIST.removeChild(this.LIST.firstChild)
            }
            this.items = []
        }
    }

    /**
     * function to remove the popup from DOM.
     */
    private removePopup(): void {
        if (this.POPUP && this.POPUP.parentNode) {
            this.POPUP.parentNode.removeChild(this.POPUP)
        }
        document.removeEventListener("click", this.destroy);
        window.removeEventListener("resize", this.destroy)
    }

    /**
     * Cache the response for the url in the query()
     * @param {string} url - the query Url for the AutoComplete
     * @param {any} result - the response from httpAsync();
     */
    private cacheIt(url: string, data: any): void {
        if (localStorage) {
            localStorage.setItem(`CAC-${url}`, JSON.stringify(data))
        }
    }

    /**
     * XMLHttpRequest
     */
    private http(url: string, method: string = "GET"): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr: XMLHttpRequest = new XMLHttpRequest()
            xhr.open(method, url, true)
            xhr.onloadend = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response)
                } else {
                    reject(xhr.statusText)
                }
            }
            xhr.send()
        })
    }

    /**
     * Reusable function for the event listeners to clear the popup/list
     * @param ev 
     */
    private destroy = (ev: KeyboardEvent) => {
        if (this.items.length > 0) {
            this.deleteItems()
            this.removePopup()
        }
    }

}

export interface CACompleteOptions {
    element: HTMLInputElement;
    url: string;
    itemTemplate: string;
    keys: string[];
    cache?: boolean;
    minLength?: number;
    listClass?: string;
    itemClass?: string;
    onSelect?: Function;
}