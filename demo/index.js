var caComplete;

document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        var rootInput = document.getElementById("autoThis");
        caComplete = new CAComplete({
            rootElement: rootInput,
            cache: true,
            queryUrl: `https://api.nastek.com/api/customer/typeahead?name=~QUERY&apikey=324`,
            wildCard: `~QUERY`,
            minStringLength: 1,
            listClass: 'listClass',
            itemClass: 'itemClass',
            itemValue: 'CST_Name',
            onItemSelect: function (selectedItem) {
                console.log(selectedItem);
            },
            onItemsSet: function () {
                /// do whatever you want here
                console.log(this);
            }
        });

    }
})

