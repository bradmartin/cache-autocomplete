var autoComplete;

document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        autoComplete = new CacheAutoComplete({
            rootElement: "autoThis",
            cacheData: true,
            queryUrl: `https://api.test.com/api/clients/typeahead?name=~QUERY&apikey=84`,
            wildCard: `~QUERY`,
            minStringLength: 1,
            listClass: 'listClass',
            itemClass: 'itemClass',
            itemValue: 'CST_Name'
        });

    }
})

