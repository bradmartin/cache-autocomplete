"use strict";
var CAComplete = (function () {
    function CAComplete(options) {
        var _this = this;
        this.items = [];
        this.cache = true;
        this.rootElement = options.rootElement;
        this.list = document.createElement("ul");
        this.cache = options.cache;
        this.onItemSelect = options.onItemSelect;
        this.onItemsSet = options.onItemsSet;
        this.rootElement.addEventListener("keydown", function (ev) {
            if (ev.keyCode === 9 && _this.items.length > 0) {
                ev.preventDefault();
                _this.list.childNodes[0].focus();
            }
            if (ev.keyCode === 40 && _this.items.length > 0) {
                ev.preventDefault();
                _this.list.childNodes[0].focus();
            }
        });
        this.rootElement.addEventListener("keyup", function (ev) {
            var trgt = (ev.target);
            if (trgt.value === "") {
                _this.xItems();
                _this.xPopup();
                return;
            }
            if (trgt.value.trim().length >= options.minStringLength) {
                _this.queryUrl = options.queryUrl.replace(options.wildCard, _this.rootElement.value);
                _this.get(_this.queryUrl, false).then(function (data) {
                    _this.xItems();
                    if (typeof data === "string") {
                        data = JSON.parse(data);
                    }
                    _this.setItems(data, options.itemValue, options.listClass, options.itemClass);
                }, function (err) {
                    _this.xItems();
                    _this.setItems([{ key: "No Matches" }], "key", options.listClass, options.itemClass, true);
                });
            }
        });
        document.body.addEventListener("click", function (ev) {
            if (_this.items.length > 0) {
                _this.xItems();
                _this.xPopup();
            }
        });
    }
    CAComplete.prototype.clearCache = function (url) {
        if (url) {
            localStorage.removeItem("CAC-" + url);
        }
        else {
            for (var i = localStorage.length; i--;) {
                var key = localStorage.key(i);
                if (key.lastIndexOf("CAC", 0) === 0) {
                    localStorage.removeItem(key);
                }
            }
        }
    };
    CAComplete.prototype.get = function (url, bustCache) {
        var _this = this;
        if (bustCache === void 0) { bustCache = false; }
        return new Promise(function (resolve, reject) {
            var isUrlCached = false;
            for (var i = localStorage.length; i--;) {
                var key = localStorage.key(i);
                if (key.lastIndexOf("CAC", 0) === 0) {
                    var keyMatchUrl = key.indexOf(url) > -1;
                    if (keyMatchUrl === true) {
                        isUrlCached = true;
                    }
                }
                if (isUrlCached === true) {
                    break;
                }
            }
            if (isUrlCached && bustCache) {
                _this.http(url).then(function (result) {
                    if (_this.cache) {
                        _this.cacheIt(url, result);
                    }
                    resolve(result);
                }, function (err) {
                    reject(err);
                });
            }
            else if (isUrlCached && !bustCache) {
                var cachedData = localStorage.getItem("CAC-" + url);
                resolve(JSON.parse(cachedData));
            }
            else if (!isUrlCached) {
                _this.http(url).then(function (result) {
                    if (_this.cache) {
                        _this.cacheIt(url, result);
                    }
                    resolve(result);
                }, function (err) {
                    reject(err);
                });
            }
            else {
                reject("get outta here");
            }
        });
    };
    CAComplete.prototype.setItems = function (data, itemValue, listClass, itemClass, noMatchesFound) {
        var _this = this;
        if (noMatchesFound === void 0) { noMatchesFound = false; }
        var _loop_1 = function (i) {
            var li = document.createElement("li");
            li.id = data.indexOf(data[i]).toString();
            li.tabIndex = 0;
            li.innerHTML = "" + data[i][itemValue];
            li.classList.add(itemClass);
            if (!noMatchesFound) {
                li.addEventListener("keydown", function (ev) {
                    var trgt = ev.target;
                    if (ev.keyCode === 13) {
                        var item = data[parseInt(trgt.id, 10)];
                        _this.rootElement.value = item[itemValue];
                        _this.xPopup();
                        _this.onItemSelect(item);
                    }
                    if (ev.keyCode === 40 && _this.items.length > 0) {
                        ev.preventDefault();
                        var nSib = li.nextSibling;
                        if (nSib) {
                            if (nSib.nodeName.toLowerCase() === "li") {
                                nSib.focus();
                            }
                        }
                        else {
                            _this.list.childNodes[0].focus();
                        }
                    }
                    if (ev.keyCode === 38 && _this.items.length > 0) {
                        ev.preventDefault();
                        var pSib = li.previousSibling;
                        if (pSib) {
                            if (pSib.nodeName.toLowerCase() === "li") {
                                pSib.focus();
                            }
                        }
                        else {
                            _this.rootElement.focus();
                        }
                    }
                });
                li.addEventListener("click", function (ev) {
                    var trgt = ev.target;
                    if (trgt && trgt.nodeName.toLowerCase() === "li") {
                        var item = data[parseInt(trgt.id, 10)];
                        _this.rootElement.value = item[itemValue];
                        _this.xItems();
                        _this.xPopup();
                        if (_this.onItemSelect) {
                            _this.onItemSelect(item);
                        }
                    }
                });
            }
            this_1.items.push(li);
            this_1.list.appendChild(li);
        };
        var this_1 = this;
        for (var i = 0; i < data.length; i++) {
            _loop_1(i);
        }
        Object.assign(this.list.style, { listStyle: "none", padding: "0", margin: "0" });
        if (!this.popup) {
            this.popup = document.createElement("div");
        }
        this.popup.classList.add(listClass);
        Object.assign(this.popup.style, {
            position: "absolute",
            zIndex: "999999999",
            overflowY: "auto",
            maxHeight: "300px",
            width: this.rootElement.clientWidth.toString() + "px"
        });
        this.popup.appendChild(this.list);
        this.rootElement.parentNode.insertBefore(this.popup, this.rootElement.nextSibling);
        this.list.focus();
        if (this.onItemsSet) {
            this.onItemsSet();
        }
    };
    CAComplete.prototype.xItems = function () {
        if (this.list.getElementsByTagName("li").length > 0) {
            while (this.list.firstChild) {
                this.list.removeChild(this.list.firstChild);
            }
            this.items = [];
        }
    };
    CAComplete.prototype.xPopup = function () {
        if (this.popup) {
            this.popup.parentNode.removeChild(this.popup);
        }
    };
    CAComplete.prototype.cacheIt = function (url, data) {
        if (localStorage) {
            localStorage.setItem("CAC-" + url, JSON.stringify(data));
        }
    };
    CAComplete.prototype.http = function (url, method) {
        if (method === void 0) { method = "GET"; }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                }
                else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = function () {
                reject(xhr.statusText);
            };
            xhr.send();
        });
    };
    return CAComplete;
}());
exports.CAComplete = CAComplete;
//# sourceMappingURL=autocomplete.js.map