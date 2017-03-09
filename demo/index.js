/// if using a module loader you can import what you need from the 'cache-autocomplete' module
/// or just use the exposed library 'cache-autocomplete'

document.addEventListener("readystatechange", () => {
  if (document.readyState === "complete") {
    var rootInput = document.getElementById("autoThis");
    cacheautocomplete.create({
      rootElement: rootInput,
      queryUrl: `https://api.nastek.com/api/customer/typeahead?name={{ value }}&apikey=324`,
      itemTemplate: `<p>{{ CST_Name }} - {{ CST_Code }}</p>`,
      templateKeys: ["CST_Name", "CST_Code"],
      onItemSelect: function(selectedItem) {
        /// returns the selected item object from the items array
        console.log(selectedItem);
        rootInput.value = selectedItem.CST_Name;
      }
    });
  }
});

function clearTheCache() {
  cacheautocomplete.clearCache();
  console.log("cleared cache urls");
}
