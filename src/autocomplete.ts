class AutoComplete {

    public SELECT: HTMLSelectElement;
    private ROOT_ELEMENT: HTMLElement;
    private SUGGESTIONS;
    private CACHE_DATA;

    constructor(elementId: string, cacheData: boolean) {
        console.log(`start constructor: ${performance.now()}`);
        this.ROOT_ELEMENT = document.getElementById(elementId);
        this.CACHE_DATA = cacheData;
        console.log(`end constructor: ${performance.now()}`);
    }

    public query(url: string, bustCache: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => {
            let isUrlCached: boolean = false;

            console.log(`start key loop: ${performance.now()}`);

            /// check if this url has been cached previously
            for (let key in window.localStorage) {
                if (key.lastIndexOf("autocomplete", 0) === 0) {
                    let keyMatchUrl = key.indexOf(url) > -1;
                    if (keyMatchUrl === true) {
                        isUrlCached = true;
                    }
                }

                if (isUrlCached === true) { break; }

            }

            console.log(`end key loop: ${performance.now()}`);

            /// is the urlCached already and are we busting the cache
            if (isUrlCached === true && bustCache === true) {
                httpAsync(url).then((response) => {
                    if (this.CACHE_DATA === true) {
                        this.cacheIt(url, response);
                    }
                    resolve(response.data);
                });
            } else if (isUrlCached === true && bustCache === false) {
                let cachedData: any = getCachedData(`autocomplete-${url}`);
                resolve(JSON.parse(cachedData).data);
            } else if (isUrlCached === false) {
                httpAsync(url).then((response) => {
                    if (this.CACHE_DATA === true) {
                        this.cacheIt(url, response);
                    }
                    resolve(response.data);
                });
            } else {
                /// wtf
                console.log(`WHAT DO WE DO?!?!?`);
                reject("get outta here");
            }

        });
    }

    /**
     * Set the suggestions for the AutoComplete
     * @param {Array} dataArray - the array of objects for the list of options.
     * @param {string} optionText - the text property in the dataArrays objects for the <option>TEXT</option>.
     * @param {string} optionValue - the <option value="optionValue"></option> for the options in the dataArray.
     */
    public setSuggestions(dataArray: any[], optionText: string, optionValue: string) {
        console.log(`start setSuggestions(): ${performance.now()}`);

        if (!dataArray) {
            console.log("Suggestions needs an array.");
            return;
        }

        this.SELECT = <HTMLSelectElement>document.createElement("select");

        this.SUGGESTIONS = [];

        for (let i = 0; i < dataArray.length; i++) {
            this.SUGGESTIONS[this.SUGGESTIONS.length] = `<option value=${dataArray[i][optionValue]}>${dataArray[i][optionText]}</option>`;
        }

        this.SELECT.innerHTML = this.SUGGESTIONS.join("");
        this.ROOT_ELEMENT.appendChild(this.SELECT);

        console.log(`end setSuggestions(): ${performance.now()}`);

    }

    /**
     * Cache the response for the url in the query()
     * @param {string} url - the query Url for the AutoComplete
     * @param {AutoCompleteHttpResponse} result - the response from httpAsync();
     */
    private cacheIt(url: string, result: AutoCompleteHttpResponse) {
        if (isCacheAvailable()) {
            saveDataToCache(`autocomplete-${url}`, result);
        }
    }



}


/**
 * Async XMLHttpRequest
 */
function httpAsync(url: string, method: string = "GET"): Promise<AutoCompleteHttpResponse> {
    return new Promise((resolve, reject) => {

        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open(method, url, true);

        xhr.onload = () => {
            let result: AutoCompleteHttpResponse = {
                data: xhr.response,
                status: xhr.status,
                statusText: xhr.statusText
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(result);
            } else {
                reject(new Error(xhr.statusText));
            }
        }

        xhr.onerror = () => {
            reject(new Error(xhr.statusText));
        }

        xhr.send();
    })
}



function saveDataToCache(keyName: string, data: Object): void {
    if (keyName && data) {
        try {
            window.localStorage.setItem(keyName, JSON.stringify(data));
        } catch (error) {
            console.log(error);
        }
    }
}

function getCachedData(keyName: string) {
    if (keyName && isCacheAvailable()) {
        try {
            return window.localStorage.getItem(keyName);
        } catch (error) {
            console.log(error);
        }
    }
}

function isCacheAvailable(): boolean {
    try {
        if (window.localStorage) {
            return true;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}


interface AutoCompleteHttpResponse {
    data: any;
    status: number;
    statusText: string;
}