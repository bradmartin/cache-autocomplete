# Cache-AutoComplete
### Probably not what you're looking for, but it works for me :stuck_out_tongue: :poop:

## Explanation
I needed a simple auto complete for a web app I was working on.
After searching around, nothing fit my use case or desire. 
This provides a simple auto complete that caches the response 
from the HTTP request into localStorage. This is optional but utilizing
the cache you remove the network request. Generating the component with
cached data takes on avg. 10ms with 200 items in the data list and avoiding
the network requests.

### Usage


#### CacheAutoCompleteOptions 
```ts
interface CacheAutoCompleteOptions {
    elementId: string; /// the input element to create autocomplete with
    cacheData: boolean; /// boolean to set whether to cache the response
    remoteUrl: string; /// the url to request
    wildCard: string; /// the wildCard tells the autoComplete where to inject the root element's value into the query
    listItemValue: any; /// the object property in the response data from the server.
    listCssClass: string; /// cssClass for the created <ul> element.
    itemCssClass: string; /// cssClass for the <li> in the <ul> list
}
```
#### HTML
```html
<input id="myAutoComplete" type="text" />
```
#### CSS
```css
.listClass {
    border-radius: 4;
    border: 1px solid #444;
}
.itemClass {
    color: #fff;
    padding: 5px;
    background-color: #333;
}
```
#### JS
```js
var autoCompleteOptions = {
            elementId: "myAutoComplete",
            cacheData: true,
            remoteUrl: `https://api.demo.com/api/clients/typeahead?name=~QUERY`,
            wildCard: `~QUERY`,
            listCssClass: 'listClass',
            itemCssClass: 'itemClass',
            listItemValue: 'CustomerName'
        }

var autoComplete = new AutoComplete(autoCompleteOptions);

```
