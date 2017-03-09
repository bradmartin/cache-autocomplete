!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("cacheautocomplete",[],t):"object"==typeof exports?exports.cacheautocomplete=t():e.cacheautocomplete=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var n={};return t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=6)}([function(e,t,n){"use strict";function r(e){return e.replace(/([A-Z])/g,"-$1").replace(/^ms-/,"-ms-").toLowerCase()}function i(e){return"@"===e.charAt(0)}function o(e){return null!=e&&"object"==typeof e&&!Array.isArray(e)}function a(e){for(var t=5381,n=e.length;n;)t=33*t^e.charCodeAt(--n);return(t>>>0).toString(36)}function s(e,t){return"number"!=typeof t||0===t||m[e]||(t+="px"),e+":"+String(t)}function u(e){return e.sort(function(e,t){return e[0]>t[0]?1:-1})}function c(e,n){for(var i=[],a=[],s=!1,c=0,d=Object.keys(e);c<d.length;c++){var l=d[c],f=e[l];l===t.IS_UNIQUE?s=!!f:o(f)?a.push([l.trim(),f]):i.push([r(l.trim()),f])}return{properties:u(i),nestedStyles:n?a:u(a),isUnique:s}}function d(e){for(var t=[],n=function(e,n){null!=n&&(Array.isArray(n)?n.forEach(function(n){n&&t.push(s(e,n))}):t.push(s(e,n)))},r=0,i=e;r<i.length;r++){var o=i[r];n(o[0],o[1])}return t.join(";")}function l(e,t){return e.indexOf("&")>-1?e.replace(/&/g,t):t+" "+e}function f(e,t,n,r,o){var a=c(n,!!t),s=a.properties,u=a.nestedStyles,h=a.isUnique,p=d(s),g=p;if(i(t)){var v=e.add(new E(t,o?void 0:p,e.hash));if(p&&o){var m=v.add(new R(p,v.hash,h?"u"+(++y).toString(36):void 0));r.push([o,m])}for(var _=0,S=u;_<S.length;_++){var w=S[_],x=w[0],b=w[1];g+=x+f(v,x,b,r,o)}}else{var C=o?l(t,o):t;if(p){var m=e.add(new R(p,e.hash,h?"u"+(++y).toString(36):void 0));r.push([C,m])}for(var k=0,I=u;k<I.length;k++){var N=I[k],x=N[0],b=N[1];g+=x+f(e,x,b,r,C)}}return g}function h(e,t,n,r,i){for(var o=new k(e.hash),a=[],s=f(o,t,n,a),u="f"+o.hash(s),c=i?i+"_"+u:u,d=0,h=a;d<h.length;d++){var p=h[d],g=p[0],v=p[1],y=r?l(g,"."+c):g;v.add(new I(y,v.hash,void 0,s))}return{cache:o,pid:s,id:c}}function p(e){return e.values().map(function(e){return e.getStyles()}).join("")}function g(e,t){return void 0===e&&(e=a),void 0===t&&(t=0),new N(e,t)}var v=this&&this.__extends||function(e,t){function n(){this.constructor=e}for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)},y=0;t.IS_UNIQUE="__DO_NOT_DEDUPE_STYLE__";for(var m={"animation-iteration-count":!0,"box-flex":!0,"box-flex-group":!0,"column-count":!0,"counter-increment":!0,"counter-reset":!0,flex:!0,"flex-grow":!0,"flex-positive":!0,"flex-shrink":!0,"flex-negative":!0,"font-weight":!0,"line-clamp":!0,"line-height":!0,opacity:!0,order:!0,orphans:!0,"tab-size":!0,widows:!0,"z-index":!0,zoom:!0,"fill-opacity":!0,"stroke-dashoffset":!0,"stroke-opacity":!0,"stroke-width":!0},_=0,S=["-webkit-","-ms-","-moz-","-o-"];_<S.length;_++)for(var w=S[_],x=0,b=Object.keys(m);x<b.length;x++){var C=b[x];m[w+C]=!0}t.stringHash=a;var k=function(){function e(e){this.hash=e,this.changeId=0,this._children={},this._keys=[],this._counters={}}return e.prototype.values=function(){var e=this;return this._keys.map(function(t){return e._children[t]})},e.prototype.add=function(t){var n=this._counters[t.id]||0,r=this._children[t.id]||t.clone();if(this._counters[t.id]=n+1,0===n)this._keys.push(r.id),this._children[r.id]=r,this.changeId++;else{if(r.getIdentifier()!==t.getIdentifier())throw new TypeError("Hash collision: "+t.getStyles()+" === "+r.getStyles());if(this._keys.splice(this._keys.indexOf(t.id),1),this._keys.push(t.id),r instanceof e&&t instanceof e){var i=r.changeId;r.merge(t),r.changeId!==i&&this.changeId++}}return r},e.prototype.remove=function(t){var n=this._counters[t.id];if(n>0){this._counters[t.id]=n-1;var r=this._children[t.id];if(1===n)delete this._counters[t.id],delete this._children[t.id],this._keys.splice(this._keys.indexOf(t.id),1),this.changeId++;else if(r instanceof e&&t instanceof e){var i=r.changeId;r.unmerge(t),r.changeId!==i&&this.changeId++}}},e.prototype.merge=function(e){for(var t=0,n=e.values();t<n.length;t++){var r=n[t];this.add(r)}return this},e.prototype.unmerge=function(e){for(var t=0,n=e.values();t<n.length;t++){var r=n[t];this.remove(r)}return this},e.prototype.clone=function(){return new e(this.hash).merge(this)},e}();t.Cache=k;var I=function(){function e(e,t,n,r){void 0===n&&(n="s"+t(e)),void 0===r&&(r=""),this.selector=e,this.hash=t,this.id=n,this.pid=r}return e.prototype.getStyles=function(){return this.selector},e.prototype.getIdentifier=function(){return this.pid+"."+this.selector},e.prototype.clone=function(){return new e(this.selector,this.hash,this.id,this.pid)},e}();t.Selector=I;var R=function(e){function t(t,n,r){void 0===r&&(r="c"+n(t));var i=e.call(this,n)||this;return i.style=t,i.hash=n,i.id=r,i}return v(t,e),t.prototype.getStyles=function(){return this.values().map(function(e){return e.getStyles()}).join(",")+"{"+this.style+"}"},t.prototype.getIdentifier=function(){return this.style},t.prototype.clone=function(){return new t(this.style,this.hash,this.id).merge(this)},t}(k);t.Style=R;var E=function(e){function t(t,n,r,i,o){void 0===n&&(n=""),void 0===i&&(i="a"+r(t+"."+n)),void 0===o&&(o="");var a=e.call(this,r)||this;return a.rule=t,a.style=n,a.hash=r,a.id=i,a.pid=o,a}return v(t,e),t.prototype.getStyles=function(){return this.rule+"{"+this.style+p(this)+"}"},t.prototype.getIdentifier=function(){return this.pid+"."+this.rule+"."+this.style},t.prototype.clone=function(){return new t(this.rule,this.style,this.hash,this.id,this.pid).merge(this)},t}(k);t.Rule=E;var N=function(e){function t(t,n,r){void 0===r&&(r="f"+(++y).toString(36));var i=e.call(this,t)||this;return i.hash=t,i.debug=n,i.id=r,i}return v(t,e),t.prototype.registerStyle=function(e,t){var n=h(this,"&",e,!0,this.debug?t:void 0),r=n.cache,i=n.id;return this.merge(r),i},t.prototype.registerKeyframes=function(e,t){return this.registerHashRule("@keyframes",e,t)},t.prototype.registerHashRule=function(e,t,n){var r=h(this,"",t,!1,this.debug?n:void 0),i=r.cache,o=r.pid,a=r.id,s=new E(e+" "+a,void 0,this.hash,void 0,o);return this.add(s.merge(i)),a},t.prototype.registerRule=function(e,t){this.merge(h(this,e,t,!1).cache)},t.prototype.registerCss=function(e){this.merge(h(this,"",e,!1).cache)},t.prototype.getStyles=function(){return p(this)},t.prototype.getIdentifier=function(){return this.id},t.prototype.clone=function(){return new t(this.hash,this.debug,this.id).merge(this)},t}(k);t.FreeStyle=N,t.create=g},function(e,t,n){"use strict";function r(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return e.filter(function(e){return!!e}).join(" ")}function i(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var n={},r=0,o=e;r<o.length;r++){var a=o[r];if(null!=a&&a!==!1)for(var s in a){var u=a[s];(u||0===u)&&("$nest"===s&&u?n[s]=n.$nest?i(n.$nest,u):u:s.indexOf("&")!==-1||0===s.indexOf("@media")?n[s]=n[s]?i(n[s],u):u:n[s]=u)}}return n}n.d(t,"d",function(){return o}),t.b=r,t.a=i,n.d(t,"c",function(){return a});var o="undefined"==typeof requestAnimationFrame?setTimeout:requestAnimationFrame.bind(window),a=function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];var r=[];e.type&&r.push(e.type),e.orientation&&r.push(e.orientation),e.minWidth&&r.push("(min-width: "+e.minWidth+"px)"),e.maxWidth&&r.push("(max-width: "+e.maxWidth+"px)");var o="@media "+r.join(" and ");return{$nest:(a={},a[o]=i.apply(void 0,t),a)};var a}},function(e,t,n){"use strict";function r(e){var t=new i.a({autoGenerateTag:!1});return e&&t.setStylesTarget(e),t}Object.defineProperty(t,"__esModule",{value:!0});var i=n(4),o=n(5);n.n(o);n.d(t,"types",function(){return o});var a=n(1);n.d(t,"extend",function(){return a.a}),n.d(t,"classes",function(){return a.b}),n.d(t,"media",function(){return a.c}),n.d(t,"setStylesTarget",function(){return u}),n.d(t,"cssRaw",function(){return c}),n.d(t,"cssRule",function(){return d}),n.d(t,"forceRenderStyles",function(){return l}),n.d(t,"fontFace",function(){return f}),n.d(t,"getStyles",function(){return h}),n.d(t,"keyframes",function(){return p}),n.d(t,"reinit",function(){return g}),n.d(t,"style",function(){return v}),t.createTypeStyle=r;var s=new i.a({autoGenerateTag:!0}),u=s.setStylesTarget,c=s.cssRaw,d=s.cssRule,l=s.forceRenderStyles,f=s.fontFace,h=s.getStyles,p=s.keyframes,g=s.reinit,v=s.style},function(e,t,n){"use strict";function r(e){var t={},n="";for(var i in e){var a=e[i];if("$unique"===i)t[o.IS_UNIQUE]=a;else if("$nest"===i){var s=a;for(var u in s){var c=s[u];t[u]=r(c).result}}else"$debugName"===i?n=a:t[i]=a}return{result:t,debugName:n}}function i(e){var t={$debugName:void 0,keyframes:{}};for(var n in e){var r=e[n];"$debugName"===n?t.$debugName=r:t.keyframes[n]=r}return t}var o=n(0);n.n(o);t.a=r,t.b=i},function(e,t,n){"use strict";var r=n(3),i=n(1),o=n(0);n.n(o);n.d(t,"a",function(){return a});var a=function(){function e(e){var t=e.autoGenerateTag,a=this;this.cssRaw=function(e){e&&(a._raw+=e||"",a._pendingRawChange=!0,a._styleUpdated())},this.cssRule=function(e){for(var t=[],o=1;o<arguments.length;o++)t[o-1]=arguments[o];var s=n.i(r.a)(i.a.apply(void 0,t)).result;a._freeStyle.registerRule(e,s),a._styleUpdated()},this.forceRenderStyles=function(){var e=a._getTag();e&&(e.textContent=a.getStyles())},this.fontFace=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var n=a._freeStyle,r=0,i=e;r<i.length;r++){var o=i[r];n.registerRule("@font-face",o)}a._styleUpdated()},this.getStyles=function(){return(a._raw||"")+a._freeStyle.getStyles()},this.keyframes=function(e){var t=n.i(r.b)(e),i=t.keyframes,o=t.$debugName,s=a._freeStyle.registerKeyframes(i,o);return a._styleUpdated(),s},this.reinit=function(){var e=o.create();a._freeStyle=e,a._lastFreeStyleChangeId=e.changeId,a._raw="",a._pendingRawChange=!1;var t=a._getTag();t&&(t.textContent="")},this.setStylesTarget=function(e){a._tag&&(a._tag.textContent=""),a._tag=e,a.forceRenderStyles()},this.style=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var o=a._freeStyle,s=n.i(r.a)(i.a.apply(void 0,e)),u=s.result,c=s.debugName,d=c?o.registerStyle(u,c):o.registerStyle(u);return a._styleUpdated(),d};var s=o.create();this._autoGenerateTag=t,this._freeStyle=s,this._lastFreeStyleChangeId=s.changeId,this._pending=0,this._pendingRawChange=!1,this._raw="",this._tag=void 0}return e.prototype._afterAllSync=function(e){var t=this;this._pending++;var r=this._pending;n.i(i.d)(function(){r===t._pending&&e()})},e.prototype._getTag=function(){if(this._tag)return this._tag;if(this._autoGenerateTag){var e="undefined"==typeof window?{textContent:""}:document.createElement("style");return"undefined"!=typeof document&&document.head.appendChild(e),this._tag=e,e}},e.prototype._styleUpdated=function(){var e=this,t=this._freeStyle.changeId,n=this._lastFreeStyleChangeId;(this._pendingRawChange||t!==n)&&(this._lastFreeStyleChangeId=t,this._pendingRawChange=!1,this._afterAllSync(function(){return e.forceRenderStyles()}))},e}()},function(e,t){},function(e,t,n){"use strict";function r(e){f=e.rootElement,S=!e.cache||e.cache,v=e.onItemSelect,_=e.templateKeys,p=document.createElement("ul"),f.addEventListener("keydown",function(e){if(9===e.keyCode&&m.length>0){e.preventDefault();var t=p.childNodes[0];t.focus()}if(40===e.keyCode&&m.length>0){e.preventDefault();var t=p.childNodes[0];t.focus()}}),f.addEventListener("keyup",function(t){var n=t.target;if(""===n.value)return u(),void c();var r=e.minStringLength?e.minStringLength:1;n.value.trim().length>=r&&(g=e.queryUrl.replace("{{ value }}",encodeURIComponent(f.value)),a(g,!1).then(function(t){u(),t&&"string"==typeof t&&(t=JSON.parse(t)),t&&(s(t,e.itemTemplate,e.listClass,e.itemClass),document.addEventListener("click",o),window.addEventListener("resize",o))},function(t){u(),s([{key:"No Matches"}],"<p>No Matches</p>",e.listClass,e.itemClass,!0),document.addEventListener("click",o),window.addEventListener("resize",o)}))})}function i(e){if(e)localStorage.removeItem("CAC-"+e);else for(var t=localStorage.length;t--;){var n=localStorage.key(t);0===n.lastIndexOf("CAC",0)&&localStorage.removeItem(n)}}function o(e){m.length>0&&(u(),c())}function a(e,t){return void 0===t&&(t=!1),new Promise(function(n,r){for(var i=!1,o=localStorage.length;o--;){var a=localStorage.key(o);if(0===a.lastIndexOf("CAC",0)){a.indexOf(e)>-1===!0&&(i=!0)}if(i===!0)break}if(i&&t)l(e).then(function(t){S&&d(e,t),n(t)},function(e){r(e)});else if(i&&!t){var s=localStorage.getItem("CAC-"+e);n(JSON.parse(s))}else i?r("get outta here"):l(e).then(function(t){S&&d(e,t),n(t)},function(e){r(e)})})}function s(e,t,n,r,i){void 0===i&&(i=!1);var o=0,a=function(){var n=document.createElement("li");n.id=o.toString(),n.tabIndex=0,n.setAttribute("cacheautocomplete-id",o.toString());var a=t,s=void 0,d=0;for(d;d<_.length;d++){var l=_[d];if(a=a.replace("{{ "+l+" }}",""+e[o][l]),s=a,d===_.length-1){n.innerHTML=s;break}}if(r)n.classList.add(r);else{var h=y.style({color:"rgb(33, 33, 33)",cursor:"pointer",textOverflow:"ellipsis",height:"auto",padding:"0 15px",overflow:"hidden",whiteSpace:"nowrap",background:"transparent",transition:"background-color .15s linear",$nest:{"&:hover":{backgroundColor:"rgb(238,238,238)"},"&:focus":{outline:"none",backgroundColor:"#eeeeee",color:"#444"}}});n.classList.add(h)}i||(n.addEventListener("keydown",function(t){var r=t.target;if(13===t.keyCode){var i=e[parseInt(r.id,10)];c(),v(i)}if(40===t.keyCode&&m.length>0){t.preventDefault();var o=n.nextSibling;o?"li"===o.nodeName.toLowerCase()&&o.focus():p.childNodes[0].focus()}if(38===t.keyCode&&m.length>0){t.preventDefault();var a=n.previousSibling;a?"LI"===a.nodeName&&a.focus():f.focus()}}),n.addEventListener("click",function(t){var r=n.getAttribute("cacheautocomplete-id");if(t.target&&r){var i=e[parseInt(r,10)];u(),c(),v&&v(i)}})),m.push(n),p.appendChild(n)};for(o;o<e.length;o++)a();p.setAttribute("style","list-style: none; padding: 0; margin: 0; max-height: 300px");var s=document.body.getBoundingClientRect(),d=f.getBoundingClientRect(),l=d.top-s.top+f.clientHeight,g=d.left;if(h||(h=document.createElement("div")),n)h.classList.add(n);else{var S=y.style({fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",backgroundColor:"#fff",borderRadius:"0",boxShadow:"0 1px 3px 0 rgba(0,0,0,.2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 2px 1px -1px rgba(0, 0, 0, .12)"});h.classList.add(S)}var w=y.style({position:"absolute",top:""+Math.round(l).toString(),left:""+Math.round(g).toString(),zIndex:9999999,overflowY:"auto",maxHeight:"300px",width:f.clientWidth.toString()+"px"});h.classList.add(w),h.appendChild(p),document.body.appendChild(h),p.focus()}function u(){if(p.getElementsByTagName("li").length>0){for(;p.firstChild;)p.removeChild(p.firstChild);m=[]}}function c(){h&&h.parentNode&&h.parentNode.removeChild(h),document.removeEventListener("click",o),window.removeEventListener("resize",o)}function d(e,t){localStorage&&localStorage.setItem("CAC-"+e,JSON.stringify(t))}function l(e,t){return void 0===t&&(t="GET"),new Promise(function(n,r){var i=new XMLHttpRequest;i.open(t,e,!0),i.onloadend=function(){i.status>=200&&i.status<300?n(i.response):r(i.statusText)},i.send()})}Object.defineProperty(t,"__esModule",{value:!0});var f,h,p,g,v,y=n(2),m=[],_=[],S=!0;t.create=r,t.clearCache=i}])});
//# sourceMappingURL=cacheautocomplete.js.map