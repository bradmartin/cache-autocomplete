let LOCAL_STORAGE: Storage;

class AutoComplete {

    private rootElement: HTMLElement;

    constructor(elementId: string) {
        console.log(`constructor AutoComplete`);
        console.log(`elementId: ${elementId}`);
        this.rootElement = document.getElementById(elementId);
        console.log(this.rootElement);
    }

    async query(url: string, cacheData: boolean = true, cacheBust: boolean = false): Promise<AutoCompleteHttpResponse> {
        let result: AutoCompleteHttpResponse; /// data to return
        let isUrlCached: boolean = false;

        /// check if this url has been cached previously
        for (let key in window.localStorage) {
            if (key.lastIndexOf("autocomplete", 0) === 0) {
                isUrlCached = true;
            }
        }

        /// is the urlCached already and are we busting the cache
        if (isUrlCached === true && cacheBust === true) {
            result = await httpAsync(url);
        } else if (isUrlCached === true && cacheBust === false) {
            result = getCachedData(`autocomplete-${url}`);
        } else if (isUrlCached === false) {
            result = await httpAsync(url);
        } else {
            /// wtf
            console.log(`WHAT DO WE DO?!?!?`);
        }

        if (cacheData === true && isCacheAvailable()) {
            saveDataToCache(`autocomplete-${url}`, result);
        }

        return result;
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
    if (keyName && data && isCacheAvailable()) {
        try {
            LOCAL_STORAGE.setItem(keyName, JSON.stringify(data));
        } catch (error) {
            console.log(error);
        }
    }
}

function getCachedData(keyName: string) {
    if (keyName && isCacheAvailable()) {
        try {
            return JSON.parse(LOCAL_STORAGE.getItem(keyName));
        } catch (error) {
            console.log(error);
        }
    }
}

function isCacheAvailable(): boolean {
    try {
        if (window.localStorage) {
            LOCAL_STORAGE = window.localStorage;
            return true;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}



interface AutoCompleteOptions {
    cache: boolean;
    bustCache: boolean;
}


interface AutoCompleteHttpResponse {
    data: any;
    status: number;
    statusText: string;
}