var autoComplete;

document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        var rootInput = document.getElementById("autoThis");
        autoComplete = new CacheAutoComplete({
            rootElement: rootInput,
            cacheData: true,
            queryUrl: `https://api.test.com/api/customer/typeahead?name=~QUERY&apikey=84`,
            wildCard: `~QUERY`,
            minStringLength: 1,
            listClass: 'listClass',
            itemClass: 'itemClass',
            itemValue: 'CST_Name'
        });

    }
})

