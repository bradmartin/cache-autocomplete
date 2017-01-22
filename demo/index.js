var autoComplete;

document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        autoComplete = new CacheAutoComplete({
            elementId: "autoThis",
            cacheData: true,
            remoteUrl: `https://api.demo.com/api/clients/typeahead?name=~QUERY&apikey=1282289`,
            wildCard: `~QUERY`,
            listCssClass: 'listClass',
            itemCssClass: 'itemClass',
            listItemValue: 'CST_Name'
        });

    }
})