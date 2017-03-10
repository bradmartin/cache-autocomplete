/// if using a module loader you can import what you need from the 'cache-autocomplete' module
/// or just use the exposed library 'cache-autocomplete'
var inputOne;
document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    var rootInput = document.getElementById("autoThis");
    var opts = {
      rootElement: rootInput,
      queryUrl: `https://api.demo.com/api/customer/typeahead?name={{ value }}&apikey=1`,
      itemTemplate: `<p>{{ CST_Name }} - {{ CST_Code }}</p>`,
      templateKeys: ["CST_Name", "CST_Code"],
      itemSelect: function(selectedItem) {
        /// returns the selected item object from the items array
        console.log(selectedItem);
        rootInput.value = selectedItem.CST_Name;
      }
    };

    inputOne = new cacheautocomplete.AutoComplete(opts);
    console.log(inputOne);

    var rootInput2 = document.getElementById("autoTwo");
    var opts2 = {
      rootElement: rootInput2,
      queryUrl: `https://api.demo.com/api/shipper/typeahead?name={{ value }}&apikey=1`,
      itemTemplate: `<p>{{ CST_Name }} - {{ CST_Code }}</p>`,
      templateKeys: ["CST_Name", "CST_Code"],
      itemSelect: function(selectedItem) {
        /// returns the selected item object from the items array
        console.log(selectedItem);
        rootInput2.value = selectedItem.CST_Name;
      }
    };

    var y = new cacheautocomplete.AutoComplete(opts2);
    console.log(y);
  }
});

function clearTheCache() {
  cacheautocomplete.AutoComplete.clearCache();
  console.log("cleared cache urls");
}

function getTheComponent() {
  console.log(inputOne);
}
