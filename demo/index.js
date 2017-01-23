var caComplete;

document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        var rootInput = document.getElementById("autoThis");
        caComplete = new CAComplete({
            rootElement: rootInput,
            cache: true,
            queryUrl: `https://api.test.com/api/customer/typeahead?name=~QUERY&apikey=84`,
            wildCard: `~QUERY`,
            minStringLength: 1,
            listClass: 'listClass',
            itemClass: 'itemClass',
            itemValue: 'CST_Name'
        });

    }
})

