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

```js
/// create a new instance of the AutoComplete(elementId: string, cacheData: boolean);
var autoComplete = new AutoComplete("rootElement", true);

/// call the `.query(url: string, cacheBust: boolean)` method that returns a Promise();
autoComplete.query('https://whatever.com/api/suggestions?value=' + yourValue, true, false).then((response) => {
    /// here is where you pass the data from the query() to `setSuggestions()` which creates the list of items.
    autoComplete.setSuggestions(JSON.parse(resp), 'CST_Name', 'CST_Key');
}, (err) => {
    console.warn(err)
})
```
