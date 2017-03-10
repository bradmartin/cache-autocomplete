/// if using a module loader you can import what you need from the 'cache-autocomplete' module
/// or just use the exposed library 'cache-autocomplete'
var inputOne;
document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    var rootInput = document.getElementById("autoThis");
    inputOne = new cacheautocomplete.AutoComplete({
      element: rootInput,
      queryUrl: `https://api.demo.com/api/customer/typeahead?name={{ value }}&apikey=1`,
      itemTemplate: `<p>{{ CST_Name }} - {{ CST_Code }}</p>`,
      templateKeys: ["CST_Name", "CST_Code"],
      itemSelectCallback: function(selectedItem) {
        /// returns the selected item object from the items array
        console.log(selectedItem);
        rootInput.value = selectedItem.CST_Name;
      }
    });

    var rootInput2 = document.getElementById("autoTwo");
    var y = new cacheautocomplete.AutoComplete({
      element: rootInput2,
      queryUrl: `https://api.demo.com/api/shipper/typeahead?name={{ value }}&apikey=1`,
      itemTemplate: `<p>{{ CST_Name }} - {{ CST_Code }}</p>`,
      templateKeys: ["CST_Name", "CST_Code"],
      itemClass: "customItemClass",
      listClass: "customListClass",
      itemSelectCallback: function(selectedItem) {
        /// returns the selected item object from the items array
        console.log(selectedItem);
        rootInput2.value = selectedItem.CST_Name;
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
