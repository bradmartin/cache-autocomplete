[![npm](https://img.shields.io/npm/v/cache-autocomplete.svg)](https://www.npmjs.com/package/cache-autocomplete)
[![npm](https://img.shields.io/npm/dt/cache-autocomplete.svg?label=npm%20downloads)](https://www.npmjs.com/package/cache-autocomplete)
# Cache-AutoComplete
### Probably not what you're looking for, but it works for me :stuck_out_tongue: :poop:

### Minified = 3.7kb 
### .min gzipped = 1.39kb

![CacheAutoComplete](screens/cacheAutoComplete.gif)

## Explanation
I needed a simple auto complete component for a web app that supported keyboard navigation.
I wanted something light weight and flexible.
After searching around, nothing fit my use case or desire. This component
is not styled out of the box. Below are some styles that mimic 
Google's Material Design spec. PRs welcome to improve functionality.
Just want to keep this light weight :smile:


## Installation
`npm install cache-autocomplete`

### Usage
`cacheautocomplete` is exposed as a library so using a <script> tag on your html will work. You can also import/require what you need using the module.
#### JS
```js
var rootInput = document.getElementById("myAutoComplete");
var CACompleteOptions = {
            rootElement: rootInput,
            cache: true,
            queryUrl: `https://api.test.com/api/customer/typeahead?name=~QUERY&apikey=84`,
            wildCard: `~QUERY`,
            minStringLength: 1,
            listClass: 'listClass',
            itemClass: 'itemClass',
            itemValue: 'CST_Name',
            onItemSelect: function (selectedItem) {
                console.log(selectedItem);
            },
            onItemsSet: function() {
                console.log("The items in the datalist have been set.");
            }
        };

cacheautocomplete.create(autoCompleteOptions);

```

#### HTML
```html
<input id="myAutoComplete" type="text" />
```

#### CSS
```css
.listClass {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #fff;
    border-radius: 0;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12);
}
.itemClass {
    color: rgb(33,33,33);
    padding: 6px;
    cursor: pointer;
    text-overflow: ellipsis;
    height: 48px;
    line-height: 48px;
    padding: 0 15px;
    overflow: hidden;
    white-space: nowrap;
    transition: background .15s linear;
    background: transparent;
}
.itemClass:hover {
    background-color: rgb(238,238,238);
}

.itemClass:focus {
    outline: none;
    background-color: #EEEEEE;
    color: #444;
}
```


#### Public Methods
- `create(opts: CACompleteOptions)` - create a cache autocomplete using the options object.
- `clearCache(url?: string)` - If a url is specified only that url is removed from storage.
If no url is specified all CacheAutoComplete items are removed from storage.


#### CacheAutoCompleteOptions 
```ts
interface CACompleteOptions {
    rootElement: HTMLInputElement; /// The HTML Input element to use as the anchor.
    cache: boolean; /// True to cache response data.
    queryUrl: string; /// The URL to ping for remote data.
    wildCard: string; /// The wildcard should be set in the `queryUrl` - we use it to inject the input's value into the queryUrl.
    minStringLength: number; /// Minimum input string length before triggering XMLHttpRequest
    itemValue: any; /// The response data Key property to display
    listClass: string; /// css class to style the list
    itemClass: string; /// css class to style items in the list.
    onItemSelect: Function; /// function to execute when an item is selected - returns the selected item object
}
```
