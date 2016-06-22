var User = {
	name: null,
	animelist: null,
	created_on: null,
	init: function(name,animelist)
	{
		this.name = name;
		this.animelist = animelist;
		this.created_on = new Date();
	},
	load: function()
	{
		if(StorageHelper.getKey("user"));
		{
			var temp = StorageHelper.getKey("user");
			this.name = temp.name;
			this.animelist = temp.animelist;
			this.created_on = temp.created_on;
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
			animelist: this.animelist,
			created_on: this.created_on
		};
	}
}