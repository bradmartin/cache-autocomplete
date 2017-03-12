/// if using a module loader you can import what you need from the 'cache-autocomplete' module
/// or just use the exposed library 'cache-autocomplete'
var inputOne;
document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    inputOne = new cacheautocomplete.AutoComplete({
      element: document.getElementById("autoThis"),
      url: `//api.demo.com/api/customer/typeahead?name={{ value }}&apikey=1`,
      itemTemplate: `<p>{{ CST_Name }} - {{ CST_Code }}</p>`,
      keys: ["CST_Name", "CST_Code"],
      onSelect: function(item, autoComplete) {
        /// returns the selected item object from the items array and the instance of the AutoComplete
        /// useful to set the inputs value if that is your desired outcome
        autoComplete.element.value = item.CST_Name;
      }
    });

    var y = new cacheautocomplete.AutoComplete({
      element: document.getElementById("autoTwo"),
      url: `//api.demo.com/api/shipper/typeahead?name={{ value }}&apikey=1`,
      itemTemplate: `<p>{{ CST_Name }} - {{ CST_Code }}</p>`,
      keys: ["CST_Name", "CST_Code"],
      itemClass: "customItemClass",
      listClass: "customListClass",
      onSelect: function(item, autoComplete) {
        /// returns the selected item object from the items array and the instance of the AutoComplete
        /// useful to set the inputs value if that is your desired outcome
        console.log(autoComplete);
        autoComplete.element.value = item.CST_Name;
      }
    });
  }
});

function clearTheCache() {
  cacheautocomplete.AutoComplete.clearCache();
  console.log("cleared cache urls");
}

function getTheComponent() {
  console.log(inputOne);
}
