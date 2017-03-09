let rootElement: HTMLInputElement
let popup: HTMLDivElement
let list: HTMLUListElement
let items: any[] = []
let cache: boolean = true
let queryUrl: string
let onItemSelect: Function

export function create(opts: CACompleteOptions): void {
    rootElement = opts.rootElement
    cache = opts.cache ? opts.cache : true
    onItemSelect = opts.onItemSelect
    list = document.createElement("ul") as HTMLUListElement

    rootElement.addEventListener("keydown", (ev) => {
        /// if TAB press send focus to list - this is handled natively by browsers with most layouts
        /// However, some weird layouts might have shitty layout/tabIndex order so this will improve the awesomeness.
        if (ev.keyCode === 9 && items.length > 0) {
            ev.preventDefault()
            const x = list.childNodes[0] as HTMLLIElement
            x.focus()
        }
        /// DOWN ARROW press - if in the focused input move the focus to the first item
        if (ev.keyCode === 40 && items.length > 0) {
            ev.preventDefault()
            /// prevent scrolling of the list
            const x = list.childNodes[0] as HTMLLIElement;
            x.focus()
        }
    })

    /// Add keyup event listener to trigger the GET request
    rootElement.addEventListener("keyup", (ev: KeyboardEvent) => {
        let trgt = (ev.target) as HTMLInputElement
        /// if the input is empty go ahead and close the suggestion list
        if (trgt.value === "") {
            // deleteItems()
            removePopup()
            return
        }

        const stringLength = opts.minStringLength ? opts.minStringLength : 2
        if (trgt.value.trim().length >= stringLength) {
            queryUrl = opts.queryUrl.replace(`{{ value }}`, encodeURIComponent(rootElement.value))
            get(queryUrl, false).then((data) => {
                deleteItems()
                if (data && typeof data === "string") {
                    data = JSON.parse(data)
                }
                if (data) {
                    setItems(data, opts.itemTemplate, opts.listClass, opts.itemClass)
                    document.addEventListener("click", trashEventListener)
                }
            }, (err) => {
                deleteItems()
                setItems([{ key: "No Matches" }], "<p>No Matches</p>", opts.listClass, opts.itemClass, true)
                /// if a click occurs on the body close the popup
                document.addEventListener("click", trashEventListener)
                window.addEventListener("resize", trashEventListener)
            })
        }
    })
}


/**
 * Delete a single key (url) from storage or all CacheAutoComplete keys.
 * If no url is passed as an argument, all keys and data will be removed from storage.
 * @param {string} [url] - The url to delete from storage.
 */
export function clearCache(url?: string): void {
    /// delete a single key in storage
    if (url) {
        localStorage.removeItem(`CAC-${url}`)
    } else {
        /// delete all CAcomplete keys in storage
        for (let i: number = localStorage.length; i--;) {
            let key: string = localStorage.key(i)
            if (key.lastIndexOf("CAC", 0) === 0) {
                localStorage.removeItem(key)
            }
        }
    }
}


function trashEventListener(ev: KeyboardEvent) {
    console.log(ev)
    if (items.length > 0) {
        deleteItems()
        removePopup()
    }
}



/**
 * Query a url using the AutoComplete instance
 * @param {string} url - the url to query.
 * @param {boolean} bustCache - true to not return cached data if exists.
 */
function get(url: string, bustCache: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
        let isUrlCached: boolean = false
        for (let i: number = localStorage.length; i--;) {
            let key: string = localStorage.key(i)
            if (key.lastIndexOf("CAC", 0) === 0) {
                let keyMatchUrl: boolean = key.indexOf(url) > -1
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
            http(url).then((result) => {
                if (cache) {
                    cacheIt(url, result)
                }
                resolve(result)
            }, (err) => {
                reject(err)
            })
        } else if (isUrlCached && !bustCache) {
            let cachedData: string = localStorage.getItem(`CAC-${url}`);
            resolve(JSON.parse(cachedData))
        } else if (!isUrlCached) {
            http(url).then((result) => {
                if (cache) {
                    cacheIt(url, result)
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



function occurrences(string, substring) {
    let n = 0
    let pos = 0
    let l = substring.length

    while (true) {
        pos = string.indexOf(substring, pos)
        if (pos != -1) {
            n++
            pos += l
        } else {
            break
        }
    }
    return (n)
}

/**
 * Set the items for the AutoComplete
 * @param {Array} data - the array of objects for the list of options.
 * @param {string} itemTemplate - the innerHTML template for the list items
 */
function setItems(data: any[], itemTemplate: string, listClass?: string, itemClass?: string, noMatchesFound: boolean = false): void {
    /// parse the itemTemplate
    var n = occurrences(itemTemplate, "{{")
    console.log(n)



    let i = 0
    for (i; i < data.length; i++) {
        let li = document.createElement("li") as HTMLLIElement
        li.id = data.indexOf(data[i]).toString()
        li.tabIndex = 0
        // li.innerHTML =  `${data[i][itemValue]}`;

        /// NEED TO REPLATE THE KEYS passed in the template bindings with the objects key props
        // console.log(itemTemplate)

        // let j = 0;
        // for (j; j < itemTemplate.length; j++) {
        //     const item = itemTemplate[j];
        //     const x = itemTemplate.indexOf("{{");
        //     const y = itemTemplate.indexOf("}}");
        //     console.log(x);
        //     console.log(y);

        // }


        // var x = itemTemplate.indexOf("{{");
        // console.log(x);
        // var y = itemTemplate.lastIndexOf("}}");
        // console.log(y);
        // var key = itemTemplate.slice(x + 2, y);
        // console.log(key);
        // var z = itemTemplate.replace(`{{${key}}}`, `${data[i][key]}`);
        // console.log(z);

        // li.innerHTML = z;

        // default style or custom item class
        if (itemClass) {
            li.classList.add(itemClass)
        } else {
            li.setAttribute("style", `
            color: rgb(33, 33, 33); 
            padding: 6px; 
            cursor: pointer; 
            text-overflow: ellipsis;
            padding: 0 15px;
            overflow: hidden;
            white-space: nowrap;
            transition: background .15s linear;
            background: transparent;
            `)
        }

        /// Only set event listeners if there are matching items. When we set `No Matches found` we pass a flag to skip this
        if (!noMatchesFound) {
            li.addEventListener("keydown", (ev: KeyboardEvent) => {
                let trgt = ev.target as HTMLLIElement
                /// ENTER KEY press
                if (ev.keyCode === 13) {
                    // get the selected item and map to the data for all items
                    let item = data[parseInt(trgt.id, 10)]
                    removePopup()
                    onItemSelect(item)
                }

                /// DOWN ARROW press
                if (ev.keyCode === 40 && items.length > 0) {
                    ev.preventDefault() /// prevent scrolling of the list
                    /// shift focus down the list
                    let nSib = li.nextSibling
                    if (nSib) {
                        if (nSib.nodeName.toLowerCase() === "li") {
                            (nSib as HTMLLIElement).focus()
                        }
                    } else {
                        /// shift focus to the top of the list if we are at the bottom
                        (list.childNodes[0] as HTMLLIElement).focus()
                    }
                }

                /// UP ARROW press
                if (ev.keyCode === 38 && items.length > 0) {
                    ev.preventDefault() /// prevent scrolling of the list
                    /// shift focus to the next list item
                    let pSib = li.previousSibling as Node;
                    if (pSib) {
                        if (pSib.nodeName.toLowerCase() === "li") {
                            (pSib as HTMLLIElement).focus()
                        }
                    } else { /// move focus to the rootElement (input)
                        rootElement.focus()
                    }
                }
            })

            // add event listener to the <list> list and then parse the element and update the textboxes
            li.addEventListener("click", (ev: Event) => {
                let trgt = ev.target as HTMLLIElement
                if (trgt && trgt.nodeName.toLowerCase() === "li") {
                    // get id of the clicked <li> and map to the data array
                    let item: any[] = data[parseInt(trgt.id, 10)]
                    // deleteItems();
                    removePopup()
                    if (onItemSelect) {
                        onItemSelect(item)
                    }
                }
            })
        }
        /// push to the items prop - if not worth having, remove in update
        items.push(li)
        list.appendChild(li)
    }

    /// Set the styles for the list
    list.setAttribute("style", "list-style: none; padding: 0; margin: 0;")

    /// get coords of the doc.body
    const bodyRect: ClientRect = document.body.getBoundingClientRect()
    const rect: ClientRect = rootElement.getBoundingClientRect()
    const top: number = rect.top - bodyRect.top + rootElement.clientHeight
    const left: number = rect.left

    if (!popup) {
        popup = document.createElement("div")
    }

    /// set popup list styles
    if (listClass) {
        popup.classList.add(listClass)
    } else {
        popup.setAttribute("style", `
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #fff;
            border-radius: 0;
            box-shadow: 0 1px 3px 0 rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12);
        `)
    }

    const currentStyles = popup.getAttribute("style").valueOf()
    popup.setAttribute("style", `
    ${currentStyles}
    position: absolute;
    top: ${top.toString()};
    left: ${left.toString()};
    zIndex: "999999999";
    overflowY: "auto";
    maxHeight: "300px";
    width: ${rootElement.clientWidth.toString()}px;
    `)

    popup.appendChild(list)

    /// add the popup to the DOM
    document.body.appendChild(popup)

    list.focus()
}


/**
 * Remove the list items from the list.
 */
function deleteItems(): void {
    if (list.getElementsByTagName("li").length > 0) {
        while (list.firstChild) {
            list.removeChild(list.firstChild)
        }
        items = []
    }
}


/**
 * Helper function to remove the popup from DOM.
 */
function removePopup(): void {
    if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup)
    }
    document.removeEventListener("click", trashEventListener)
    window.removeEventListener("resize", trashEventListener)
}


/**
 * Cache the response for the url in the query()
 * @param {string} url - the query Url for the AutoComplete
 * @param {any} result - the response from httpAsync();
 */
function cacheIt(url: string, data: any): void {
    if (localStorage) {
        localStorage.setItem(`CAC- ${url}`, JSON.stringify(data))
    }
}


/**
 * XMLHttpRequest
 */
function http(url: string, method: string = "GET"): Promise<any> {
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

export interface CACompleteOptions {
    rootElement: HTMLInputElement;
    queryUrl: string;
    itemTemplate: string;
    cache?: boolean;
    minStringLength?: number;
    listClass?: string;
    itemClass?: string;
    onItemSelect?: Function;
}