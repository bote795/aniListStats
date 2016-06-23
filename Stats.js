var Stats = {
 	genres: null, //map with genres frequency
 	staff: null,  //map with id and staff frequency
 	staffNamesMap: null,  //map with id and staff info
 	studiosNamesMap: null,  //map with id and studio info
 	lists: null,
 	/*
 		array of object with
 			map of the animes
 				id , genres, id, staff, studios
 			name of list
 			stats
 				genre
 				staff
 				studios
 	 */
 	init: function(items)
	{
		this.genres = items.genres;
		this.staff = items.staff;
		this.staffNamesMap = items.staffNamesMap;
		this.studiosNamesMap = items.studiosNamesMap;
		this.lists = items.lists;
		this.save();
	},
	load: function()
	{
		if(StorageHelper.getKey("stats"));
		{
			var temp = StorageHelper.getKey("stats");
			this.genres = temp. genres;
			this.staff = temp.staff;
			this.staffNamesMap = temp.staffNamesMap;
			this.studiosNamesMap = temp.studiosNamesMap;
			this.lists =  temp.lists;
			return true;
		}
		return false;
	},
	save: function()
	{
		StorageHelper.setKey("stats", this.JSON());
	},
	JSON: function()
	{
		return {
			genres: this.genres,
			staff: this.staff,
			staffNamesMap: this.staffNamesMap ,
			studiosNamesMap: this.studiosNamesMap,
			lists: this.lists 
		};
	}
};