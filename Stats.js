var Stats = {
 	genres: null, //map with genres frequency
 	staff: null,  //map with id and staff frequency
 	studio: null, //map with id and studio frequency
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
		this.studio = items.studio;
		this.save();
	},
	load: function()
	{
		if(StorageHelper.getKey("stats"));
		{
			var temp = StorageHelper.getKey("stats");
			this.genres = this.jsonToMap(temp.genres);
			this.staff = this.jsonToMap(temp.staff);
			this.studio = this.jsonToMap(temp.studio);
			this.staffNamesMap = this.jsonToMap(temp.staffNamesMap);
			this.studiosNamesMap = this.jsonToMap(temp.studiosNamesMap);
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
			genres: [...this.genres],
			staff: [...this.staff],
			studio: [...this.studio],
			staffNamesMap: [...this.staffNamesMap] ,
			studiosNamesMap: [...this.studiosNamesMap],
			lists: this.lists 
		};
	},
	getSortedMap: function(name)
	{
		var temps= [...this[name]];
		//greatest to least
		return temps.sort(function(a,b){return b[1] - a[1];});
	},
	mapToJson: function(map) 
	{
        return JSON.stringify([...map]);
    },
    jsonToMap: function(jsonStr) 
    {
        return new Map(jsonStr);
    }
};

