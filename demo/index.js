var autoComplete;

document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        autoComplete = new CacheAutoComplete({
            elementId: "autoThis",
            cacheData: true,
            remoteUrl: `https://api.demo.com/api/client/typeahead?name=~QUERY&apikey=84`,
            wildCard: `~QUERY`,
            listCssClass: 'listClass',
            itemCssClass: 'itemClass',
            listItemValue: 'CST_Name'
        });

    }
})