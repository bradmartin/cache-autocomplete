# Cache-AutoComplete
### not the auto complete you're looking for but it works.


### Usage

```js
var autoComplete = new AutoComplete("rootElement");
autoComplete.query('https://whatever.com/api/suggestions?value=' + yourValue, true, false).then((response) => {
    /// whatever
})
```