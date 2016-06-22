var StorageHelper = {
	clear: function()
	{
		localStorage.clear();
	},
	getKey: function(item)
	{
		return JSON.parse(localStorage.getItem(item));
	},
	setKey: function(item,values)
	{
			localStorage.setItem(item, JSON.stringify(values));
	}
};