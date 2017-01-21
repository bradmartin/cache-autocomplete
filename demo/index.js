document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {

        var autoComplete = new AutoComplete("autoThis");
        console.log(performance.now());
        autoComplete.query('https://api.nastek.com/api/shipper/typeahead?name=al&apikey=1', true, false).then((resp) => {
            console.log(performance.now());

            let data = JSON.parse(resp.data);
            let optionItems = [];
            let dataInfo;
            for (let i = 0; i < data.length - 1; i++) {
                optionItems[optionItems.length] = `<option value=${data[i].CST_Key}> ${data[i].CST_Name} </option>`;
            }

            let div = document.getElementById(`autoThis`);
            let itemSelect = document.createElement("select");
            itemSelect.style.color = "#333";
            itemSelect.id = "myDick";
            itemSelect.innerHTML = optionItems.join("");
            div.appendChild(itemSelect);

            console.log(performance.now());

        }, (err) => {
            console.warn(err)
        })
    }
})