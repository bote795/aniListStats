var User = {
	name: null,
	animelist: null,
	init: function(name,animelist)
	{
		this.name = name;
		this.animelist = animelist;
	},
	load: function()
	{
		if(StorageHelper.getKey("user"));
		{
			var temp = StorageHelper.getKey("user");
			this.name = temp.name;
			this.animelist = temp.animelist;
			return true;
		}
		return false;
	}
	save: function()
	{
		StorageHelper.setKey("user", this.JSON());
	},
	JSON: function()
	{
		return {
			name: this.name,
			animelist: this.animelist
		};
	}
}