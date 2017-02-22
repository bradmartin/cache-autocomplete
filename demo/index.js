/// if using a module loader you can import what you need from the 'cache-autocomplete' module
/// or just use the exposed library 'cache-autocomplete'

document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        var rootInput = document.getElementById("autoThis");
        cacheautocomplete.create({
            rootElement: rootInput,
            cache: true,
            queryUrl: `https://api.demo.com/api/customer/typeahead?name=~QUERY&apikey=324`,
            wildCard: `~QUERY`,
            minStringLength: 1,
            listClass: 'listClass',
            itemClass: 'itemClass',
            itemValue: 'CST_Name',
            onItemSelect: function (selectedItem) {
                /// returns the selected item object from the items array
                console.log(selectedItem);
            }
        });

    }
})

function clearTheCache() {
    cacheautocomplete.clearCache();
}