let rootElement: HTMLInputElement;
let popup: HTMLDivElement;
let list: HTMLUListElement;
let items: any[] = [];
let cache: boolean = true;
let queryUrl: string;
let onItemSelect: Function;

export function create(options: CACompleteOptions): void {
    rootElement = options.rootElement;
    list = <HTMLUListElement>document.createElement("ul");
    cache = options.cache;
    onItemSelect = options.onItemSelect;

    rootElement.addEventListener("keydown", (ev) => {
        /// if TAB press send focus to list - this is handled natively by browsers with most layouts
        /// However, some weird layouts might have shitty layout/tabIndex order so this will improve the awesomeness.
        if (ev.keyCode === 9 && items.length > 0) {
            ev.preventDefault();
            (list.childNodes[0] as HTMLLIElement).focus();
        }

        /// DOWN ARROW press - if in the focused input move the focus to the first item
        if (ev.keyCode === 40 && items.length > 0) {
            ev.preventDefault(); /// prevent scrolling of the list
            (list.childNodes[0] as HTMLLIElement).focus();
        }

    });

    /// Add keyup event listener to trigger the GET request
    rootElement.addEventListener("keyup", (ev: KeyboardEvent) => {
        let trgt = (ev.target) as HTMLInputElement;

        /// if the input is empty go ahead and close the suggestion list
        if (trgt.value === "") {
            xItems();
            xPopup();
            return;
        }

        if (trgt.value.trim().length >= options.minStringLength) {

            queryUrl = options.queryUrl.replace(options.wildCard, rootElement.value);

            get(queryUrl, false).then((data) => {
                xItems();

                if (typeof data === "string") {
                    data = JSON.parse(data);
                }

                setItems(data, options.itemValue, options.listClass, options.itemClass);
                /// if a click occurs on the body close the popup
                document.addEventListener("click", trashEventListener);


            }, (err) => {
                xItems();
                setItems([{ key: "No Matches" }], "key", options.listClass, options.itemClass, true);
                /// if a click occurs on the body close the popup
                document.addEventListener("click", trashEventListener);

                window.addEventListener("resize", trashEventListener);

            });

        }

    });

}


/**
 * Delete a single key (url) from storage or all CacheAutoComplete keys.
 * If no url is passed as an argument, all keys and data will be removed from storage.
 * @param {string} [url] - The url to delete from storage.
 */
export function clearCache(url?: string): void {
    /// delete a single key in storage
    if (url) {
        localStorage.removeItem(`CAC-${url}`);
    } else {
        /// delete all CAcomplete keys in storage
        for (let i: number = localStorage.length; i--;) {
            let key: string = localStorage.key(i);
            if (key.lastIndexOf("CAC", 0) === 0) {
                localStorage.removeItem(key);
            }
        }
    }
}


function trashEventListener(ev: KeyboardEvent) {
    console.log(ev);
    if (items.length > 0) {
        xItems();
        xPopup();
    }
}



/**
 * Query a url using the AutoComplete instance
 * @param {string} url - the url to query.
 * @param {boolean} bustCache - true to not return cached data if exists.
 */
function get(url: string, bustCache: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
        let isUrlCached: boolean = false;

        for (let i: number = localStorage.length; i--;) {
            let key: string = localStorage.key(i);
            if (key.lastIndexOf("CAC", 0) === 0) {
                let keyMatchUrl: boolean = key.indexOf(url) > -1;
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

            http(url).then((result) => {
                if (cache) {
                    cacheIt(url, result);
                }
                resolve(result);
            }, (err) => {
                reject(err);
            });

        } else if (isUrlCached && !bustCache) {

            let cachedData: string = localStorage.getItem(`CAC-${url}`);

            resolve(JSON.parse(cachedData));

        } else if (!isUrlCached) {

            http(url).then((result) => {
                if (cache) {
                    cacheIt(url, result);
                }
                resolve(result);
            }, (err) => {
                reject(err);
            });

        } else {
            /// wtf
            reject("get outta here");
        }

    });
}



/**
 * Set the items for the AutoComplete
 * @param {Array} data - the array of objects for the list of options.
 * @param {string} itemValue - the text property in the data objects for the <li>TEXT</li>.
 */
function setItems(data: any[], itemValue: string, listClass: string, itemClass: string, noMatchesFound: boolean = false): void {
    for (let i: number = 0; i < data.length; i++) {
        let li: HTMLLIElement = document.createElement("li");

        li.id = data.indexOf(data[i]).toString();
        li.tabIndex = 0;
        li.innerHTML = `${data[i][itemValue]}`;
        li.classList.add(itemClass);

        /// Only set event listeners if there are matching items. When we set `No Matches found` we pass a flag to skip this
        if (!noMatchesFound) {
            li.addEventListener("keydown", (ev: KeyboardEvent) => {
                let trgt = ev.target as HTMLLIElement;

                /// ENTER KEY press
                if (ev.keyCode === 13) {
                    // get the selected item and map to the data for all items
                    let item = data[parseInt(trgt.id, 10)];
                    /// set the rootElement value
                    rootElement.value = item[itemValue];
                    xPopup();
                    onItemSelect(item);
                }

                /// DOWN ARROW press
                if (ev.keyCode === 40 && items.length > 0) {
                    ev.preventDefault(); /// prevent scrolling of the list
                    /// shift focus down the list
                    let nSib = li.nextSibling;
                    if (nSib) {
                        if (nSib.nodeName.toLowerCase() === "li") {
                            (nSib as HTMLLIElement).focus();
                        }
                    } else {
                        /// shift focus to the top of the list if we are at the bottom
                        (list.childNodes[0] as HTMLLIElement).focus();
                    }
                }

                /// UP ARROW press
                if (ev.keyCode === 38 && items.length > 0) {
                    ev.preventDefault(); /// prevent scrolling of the list
                    /// shift focus to the next list item
                    let pSib: Node = li.previousSibling;
                    if (pSib) {
                        if (pSib.nodeName.toLowerCase() === "li") {
                            (pSib as HTMLLIElement).focus();
                        }
                    } else { /// move focus to the rootElement (input)
                        rootElement.focus();
                    }
                }

            });

            // add event listener to the <list> list and then parse the element and update the textboxes
            li.addEventListener("click", (ev: Event) => {
                let trgt = ev.target as HTMLLIElement;
                if (trgt && trgt.nodeName.toLowerCase() === "li") {
                    // get id of the clicked <li> and map to the data array
                    let item: any[] = data[parseInt(trgt.id, 10)];
                    rootElement.value = item[itemValue];
                    xItems();
                    xPopup();
                    if (onItemSelect) {
                        onItemSelect(item);
                    }
                }
            });
        }


        /// push to the items prop - if not worth having, remove in update
        items.push(li);

        list.appendChild(li);
    }

    /// Set the styles for the list
    Object.assign(list.style, { listStyle: "none", padding: "0", margin: "0" });


    /// get coords of the doc.body
    const bodyRect: ClientRect = document.body.getBoundingClientRect();
    const rect: ClientRect = rootElement.getBoundingClientRect();
    const top: number = rect.top - bodyRect.top + rootElement.clientHeight;
    const left: number = rect.left;

    if (!popup) {
        popup = document.createElement("div");
    }

    /// Add user specified Css class
    popup.classList.add(listClass);

    /// Set styles for the popup div
    Object.assign(popup.style, {
        position: "absolute",
        top: top.toString(),
        left: left.toString(),
        zIndex: "999999999",
        overflowY: "auto",
        maxHeight: "300px",
        width: `${rootElement.clientWidth.toString()}px`
    });

    popup.appendChild(list);

    /// add the popup to the DOM
    document.body.appendChild(popup);

    list.focus();
}


/**
 * Remove the list items from the list.
 */
function xItems(): void {
    if (list.getElementsByTagName("li").length > 0) {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
        items = [];
    }
}


/**
 * Helper function to remove the popup from DOM.
 */
function xPopup(): void {
    if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup);
    }
    document.removeEventListener("click", trashEventListener);
    window.removeEventListener("resize", trashEventListener);
}


/**
 * Cache the response for the url in the query()
 * @param {string} url - the query Url for the AutoComplete
 * @param {any} result - the response from httpAsync();
 */
function cacheIt(url: string, data: any): void {
    if (localStorage) {
        localStorage.setItem(`CAC-${url}`, JSON.stringify(data));
    }
}


/**
 * XMLHttpRequest
 */
function http(url: string, method: string = "GET"): Promise<any> {
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
}