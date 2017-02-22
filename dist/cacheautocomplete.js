(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("cacheautocomplete", [], factory);
	else if(typeof exports === 'object')
		exports["cacheautocomplete"] = factory();
	else
		root["cacheautocomplete"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var rootElement;
var popup;
var list;
var items = [];
var cache = true;
var queryUrl;
var onItemSelect;
function create(options) {
    rootElement = options.rootElement;
    list = document.createElement("ul");
    cache = options.cache;
    onItemSelect = options.onItemSelect;
    rootElement.addEventListener("keydown", function (ev) {
        if (ev.keyCode === 9 && items.length > 0) {
            ev.preventDefault();
            list.childNodes[0].focus();
        }
        if (ev.keyCode === 40 && items.length > 0) {
            ev.preventDefault();
            list.childNodes[0].focus();
        }
    });
    rootElement.addEventListener("keyup", function (ev) {
        var trgt = (ev.target);
        if (trgt.value === "") {
            xItems();
            xPopup();
            return;
        }
        if (trgt.value.trim().length >= options.minStringLength) {
            queryUrl = options.queryUrl.replace(options.wildCard, rootElement.value);
            get(queryUrl, false).then(function (data) {
                xItems();
                if (typeof data === "string") {
                    data = JSON.parse(data);
                }
                setItems(data, options.itemValue, options.listClass, options.itemClass);
                document.addEventListener("click", docBodyClickEvent);
            }, function (err) {
                xItems();
                setItems([{ key: "No Matches" }], "key", options.listClass, options.itemClass, true);
                document.addEventListener("click", docBodyClickEvent);
            });
        }
    });
}
exports.create = create;
function clearCache(url) {
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
}
exports.clearCache = clearCache;
function docBodyClickEvent(ev) {
    console.log(ev);
    if (items.length > 0) {
        xItems();
        xPopup();
    }
}
function get(url, bustCache) {
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
            http(url).then(function (result) {
                if (cache) {
                    cacheIt(url, result);
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
            http(url).then(function (result) {
                if (cache) {
                    cacheIt(url, result);
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
}
function setItems(data, itemValue, listClass, itemClass, noMatchesFound) {
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
                    rootElement.value = item[itemValue];
                    xPopup();
                    onItemSelect(item);
                }
                if (ev.keyCode === 40 && items.length > 0) {
                    ev.preventDefault();
                    var nSib = li.nextSibling;
                    if (nSib) {
                        if (nSib.nodeName.toLowerCase() === "li") {
                            nSib.focus();
                        }
                    }
                    else {
                        list.childNodes[0].focus();
                    }
                }
                if (ev.keyCode === 38 && items.length > 0) {
                    ev.preventDefault();
                    var pSib = li.previousSibling;
                    if (pSib) {
                        if (pSib.nodeName.toLowerCase() === "li") {
                            pSib.focus();
                        }
                    }
                    else {
                        rootElement.focus();
                    }
                }
            });
            li.addEventListener("click", function (ev) {
                var trgt = ev.target;
                if (trgt && trgt.nodeName.toLowerCase() === "li") {
                    var item = data[parseInt(trgt.id, 10)];
                    rootElement.value = item[itemValue];
                    xItems();
                    xPopup();
                    if (onItemSelect) {
                        onItemSelect(item);
                    }
                }
            });
        }
        items.push(li);
        list.appendChild(li);
    };
    for (var i = 0; i < data.length; i++) {
        _loop_1(i);
    }
    Object.assign(list.style, { listStyle: "none", padding: "0", margin: "0" });
    if (!popup) {
        popup = document.createElement("div");
    }
    popup.classList.add(listClass);
    Object.assign(popup.style, {
        position: "absolute",
        zIndex: "999999999",
        overflowY: "auto",
        maxHeight: "300px",
        width: rootElement.clientWidth.toString() + "px"
    });
    popup.appendChild(list);
    rootElement.parentNode.insertBefore(popup, rootElement.nextSibling);
    list.focus();
}
function xItems() {
    if (list.getElementsByTagName("li").length > 0) {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
        items = [];
    }
}
function xPopup() {
    if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup);
    }
    document.removeEventListener("click", docBodyClickEvent);
}
function cacheIt(url, data) {
    if (localStorage) {
        localStorage.setItem("CAC-" + url, JSON.stringify(data));
    }
}
function http(url, method) {
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
}
//# sourceMappingURL=cacheautocomplete.js.map

/***/ })
/******/ ]);
});
//# sourceMappingURL=cacheautocomplete.js.map