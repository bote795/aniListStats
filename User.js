var User = {
	name: null,
	animelist: null,
	created_on: null,
	init: function(name,animelist)
	{
		this.name = name;
		this.animelist = animelist;
		this.created_on = new Date();
		this.save();
	},
	load: function()
	{
		if(StorageHelper.getKey("user"))
		{
			var temp = StorageHelper.getKey("user");
			this.name = temp.name;
			this.animelist = temp.animelist;
			this.created_on = new Date(temp.created_on);
			var diff = (((new Date()).getTime() - this.created_on.getTime()) / 1000);
			//120  = min 
			//* 5 for five minutes
			if( diff > (120 * 5) )
			{
				return false;
			}
			return true;
		}
		return false;
	},
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