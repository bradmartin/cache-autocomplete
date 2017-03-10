import { style } from 'typestyle';

export class AutoComplete {
    public items: any[];
    public itemClass: string;
    public listClass: string;
    public queryUrl: string;
    public rootElement: HTMLInputElement
    public cache: boolean;
    public itemTemplate: string;
    public templateKeys: any[];
    public itemSelect: any;
    public minStringLength: number;
    // public static itemSelect: Function;
    private _POPUP: HTMLDivElement;
    private _LIST: HTMLUListElement;
    // private _ITEMSELECT: Function;

    constructor(opts: CACompleteOptions) {
        this.rootElement = opts.rootElement;
        this.queryUrl = opts.queryUrl;
        this.itemTemplate = opts.itemTemplate;
        this.templateKeys = opts.templateKeys;
        this.items = [];
        this.cache = opts.cache ? opts.cache : true
        this.minStringLength = opts.minStringLength ? opts.minStringLength : 1;
        this.itemClass = opts.itemClass;
        this.listClass = opts.listClass;
        this._POPUP = document.createElement("div") as HTMLDivElement;
        this._LIST = document.createElement("ul") as HTMLUListElement;
        this.itemSelect = opts.itemSelect;
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
                let key = localStorage.key(i)
                if (key.lastIndexOf("CAC", 0) === 0) {
                    localStorage.removeItem(key)
                }
            }
        }
    }

    private static test() {
        console.log('test');
    }

    private createComponent() {
        // this._LIST = document.createElement("ul") as HTMLUListElement
        this.rootElement.addEventListener("keydown", (ev) => {
            /// if TAB press send focus to list - this is handled natively by browsers with most layouts
            /// However, some weird layouts might have shitty layout/tabIndex order so this will improve the awesomeness.
            /// DOWN ARROW press - if in the focused input move the focus to the first item
            if (ev.keyCode === 9 || ev.keyCode === 40 && this.items.length > 0) {
                ev.preventDefault();
                (this._LIST.childNodes[0] as HTMLLIElement).focus();
            }
        })

        /// Add keyup event listener to trigger the GET request
        this.rootElement.addEventListener("keyup", (ev: KeyboardEvent) => {
            const trgt = ev.target as HTMLInputElement
            /// if the input is empty go ahead and close the suggestion list
            if (trgt.value === "") {
                this.deleteItems()
                this.removePopup()
                return
            }

            if (trgt.value.trim().length >= this.minStringLength) {
                const url = this.queryUrl.replace(`{{ value }}`, encodeURIComponent(this.rootElement.value))
                this.get(url, false).then((data) => {
                    this.deleteItems()
                    if (data) {
                        if (typeof data === "string") {
                            data = JSON.parse(data)
                        }
                        this.setItems(data, this.itemTemplate)
                        // document.addEventListener("click", (ev) => {
                        //     this.deleteItems();
                        //     this.removePopup();
                        // });
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
        // return this;
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
                let key = localStorage.key(i) as string;
                if (key.lastIndexOf("CAC", 0) === 0) {
                    let keyMatchUrl = key.indexOf(url) > -1 as boolean;
                    if (keyMatchUrl === true) {
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
                let cachedData: string = localStorage.getItem(`CAC-${url}`);
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
        this.createListItems(data, itemTemplate, noMatchesFound)
        this.stylePopup()
        this._POPUP.appendChild(this._LIST)
        document.body.appendChild(this._POPUP)
        this._LIST.focus()
    }


    private createListItems(data, itemTemplate, noMatchesFound) {
        /// parse the itemTemplate
        let template = itemTemplate;
        let i = 0
        for (i; i < data.length; i++) {
            let li = document.createElement("li") as HTMLLIElement
            li.id = i.toString()
            li.tabIndex = 0
            li.setAttribute("cacheautocomplete-id", i.toString())

            let originalTemplate = template
            let replacedKeyString
            let j = 0
            for (j; j < this.templateKeys.length; j++) {
                let key = this.templateKeys[j]
                originalTemplate = originalTemplate.replace(`{{ ${key} }}`, `${data[i][key]}`)
                replacedKeyString = originalTemplate
                if (j === this.templateKeys.length - 1) {
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
            this._LIST.appendChild(li)
        }
    }

    private styleListItem(li: HTMLLIElement) {
        // default style or custom item class
        if (this.itemClass) {
            li.classList.add(this.itemClass)
        } else {
            const styledItemClass = style({
                color: 'rgb(33, 33, 33)',
                cursor: 'pointer',
                textOverflow: 'ellipsis',
                height: 'auto',
                padding: '0 15px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                background: 'transparent',
                transition: 'background-color .15s linear',
                $nest: {
                    '&:hover': {
                        backgroundColor: 'rgb(238,238,238)'
                    },
                    '&:focus': {
                        outline: 'none',
                        backgroundColor: '#eeeeee',
                        color: '#444'
                    }
                }
            })
            li.classList.add(styledItemClass)
        }
    }

    private stylePopup() {
        /// Set the styles for the list
        this._LIST.setAttribute("style", "list-style: none; padding: 0; margin: 0; max-height: 300px")

        /// get coords of the doc.body
        const bodyRect: ClientRect = document.body.getBoundingClientRect()
        const rect: ClientRect = this.rootElement.getBoundingClientRect()
        const top: number = rect.top - bodyRect.top + this.rootElement.clientHeight
        const left: number = rect.left

        /// set popup list styles
        if (this.listClass) {
            this._POPUP.classList.add(this.listClass)
        } else {
            const styledListClass = style({
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                backgroundColor: '#fff',
                borderRadius: '0',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,.2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 2px 1px -1px rgba(0, 0, 0, .12)',
            })
            this._POPUP.classList.add(styledListClass)
        }

        const defaultPopupStylePositioning = style({
            position: 'absolute',
            left: `${Math.round(left).toString()}px`,
            zIndex: 9999999,
            overflowY: 'auto',
            maxHeight: '300px',
            width: `${this.rootElement.clientWidth.toString()}px`
        })
        this._POPUP.classList.add(defaultPopupStylePositioning)
    }

    private setupListItemEventListeners(li: HTMLLIElement, data) {
        li.addEventListener("keydown", (ev: KeyboardEvent) => {
            const trgt = ev.target as HTMLLIElement
            /// ENTER KEY press
            if (ev.keyCode === 13) {
                this.removePopup()
                this.itemSelect(data[parseInt(trgt.id, 10)])
            }

            /// DOWN ARROW press
            if (ev.keyCode === 40 && this.items.length > 0) {
                ev.preventDefault()
                const nSib = li.nextSibling
                if (li.nextSibling && li.nextSibling.nodeName === "LI") {
                    (li.nextSibling as HTMLLIElement).focus()
                } else {
                    /// shift focus to the top of the list if we are at the bottom
                    (this._LIST.childNodes[0] as HTMLLIElement).focus()
                }
            }

            /// UP ARROW press
            if (ev.keyCode === 38 && this.items.length > 0) {
                ev.preventDefault()
                /// shift focus to the next list item
                if (li.previousSibling && li.previousSibling.nodeName === "LI") {
                    (li.previousSibling as HTMLLIElement).focus()
                } else { /// move focus to the rootElement (input)
                    this.rootElement.focus()
                }
            }
        })

        // add event listener to the <list> list and then parse the element and update the textboxes
        li.addEventListener("click", (ev: Event) => {
            const autocompleteItemId = li.getAttribute("cacheautocomplete-id")
            const trgt = ev.target as HTMLLIElement
            if (trgt && autocompleteItemId) {
                // get id of the clicked <li> and map to the data array
                let item = data[parseInt(autocompleteItemId, 10)]
                this.deleteItems();
                this.removePopup()
                if (this.itemSelect) {
                    this.itemSelect(item)
                }
            }
        })
    }

    /**
     * Remove the list items from the list.
     */
    private deleteItems(): void {
        if (this._LIST.getElementsByTagName("li").length > 0) {
            while (this._LIST.firstChild) {
                this._LIST.removeChild(this._LIST.firstChild)
            }
            this.items = []
        }
    }

    /**
     * function to remove the popup from DOM.
     */
    private removePopup(): void {
        if (this._POPUP && this._POPUP.parentNode) {
            this._POPUP.parentNode.removeChild(this._POPUP)
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
    rootElement: HTMLInputElement;
    queryUrl: string;
    itemTemplate: string;
    templateKeys: string[];
    cache?: boolean;
    minStringLength?: number;
    listClass?: string;
    itemClass?: string;
    itemSelect?: Function;
}