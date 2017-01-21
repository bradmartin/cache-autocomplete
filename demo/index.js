document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        var autoComplete = new AutoComplete("autoThis", false);
        autoComplete.query('https://api.nastek.com/api/shipper/typeahead?name=al&apikey=84', true).then((resp) => {
            autoComplete.setSuggestions(JSON.parse(resp), 'CST_Name', 'CST_Key');
        }, (err) => {
            console.warn(err)
        })

    }
})