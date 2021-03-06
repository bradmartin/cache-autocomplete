[![npm](https://img.shields.io/npm/v/cache-autocomplete.svg)](https://www.npmjs.com/package/cache-autocomplete)
[![npm](https://img.shields.io/npm/dt/cache-autocomplete.svg?label=npm%20downloads)](https://www.npmjs.com/package/cache-autocomplete)
[![GitHub stars](https://img.shields.io/github/stars/bradmartin/cache-autocomplete.svg)](https://github.com/bradmartin/cache-autocomplete/stargazers)
[![PayPal Donate](https://img.shields.io/badge/Donate-PayPal-ff4081.svg)](https://www.paypal.me/bradwayne88)


# Cache-AutoComplete
#### Probably not what you're looking for, but it works for me :stuck_out_tongue: :poop:

### File size = *7.09kb* - gzipped = *2.44kb*

![CacheAutoComplete](screens/cacheAutoComplete.gif)

### Explanation
I needed a simple auto complete component for a web app that supported keyboard navigation.
I wanted something light weight and flexible.
After searching around, nothing fit my use case or desire. The component
defaults to Material Design-like styling. This is customizable by setting `itemClass` and `listClass` when creating the component. PRs welcome to improve functionality.
Just want to keep this light weight :smile:


### Installation
`npm install cache-autocomplete`

### Usage
`cacheautocomplete` is exposed as a library thanks to Webpack so using a `<script>` tag on your html will work. You can also import/require what you need using the module if you're using a module loader for your app.
### JS
```js
var CAC = new cacheautocomplete.AutoComplete({
            element: document.getElementById("myAutoComplete"), // required - the dom element to tie into
            url: 'https://api.test.com/api/customer/typeahead?name={{ value }}&apikey=84', // required and must use the `{{ value }}` to inject the rootElement's current value when typing
            itemTemplate: '<div> <h3>{{ Name }}</h3> <img src="{{ ProfilePic }} /> </div>', // required
            keys: ['Name', 'ProfilePic']
            onSelect: function (selectedItem, autoComplete) { // optional - callback when an item is selected via keyboard or mouse event
                console.log(selectedItem);
                rootInput.value = selectedItem.SomeProp;
            }
        });

```

### HTML
```html
<input id="myAutoComplete" type="text" />
```

### Public Methods
- `clearCache(url?: string)` - If a url is specified only that url is removed from storage.
If no url is specified all CacheAutoComplete items are removed from storage.


### CacheAutoCompleteOptions 
```ts
interface CACompleteOptions {
    element: HTMLInputElement; /// The HTML Input element to use as the anchor.
    url: string; /// The URL to ping for remote data.
    itemTemplate: any; /// The response data Key property to display
    keys: string[]; // The keys are used to create the correct template for the items. See example for correct usage.
    onSelect: Function; /// callback function when a list item is selected via keyboard or mouse - this is optional but you likely need to use it and set the rootInput value to some prop in your list objects
    minLength?: number; /// optional - default is 1
    cache?: boolean; /// optional - default is true
    listClass?: string; /// css class to style the list
    itemClass?: string; /// css class to style items in the list.
}
```
### Contributing
- `git clone https://github.com/bradmartin/cache-autocomplete.git`
- `npm install` - install deps
- `npm run dev` - will transpile and kick off the webpack dev server
