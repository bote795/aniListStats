var nani = require('nani').init(auth.clientId, auth.clientSecret);
var genres = new Map(); //map with genres frequency
var staff = new Map(); //map with id and staff frequency
var completeStaff = new Map(); //map with id and staff info
var completeStudios = new Map();
var studio  = new Map();
$( "#target" ).click(function( event ) {
  var username = $("#username").val();
  retrieveUser(username);
  event.preventDefault();
});
function retrieveUser(username){
 if(!User.load())
 nani.get('user/'+username+'/animelist')
  .then(data => {
    console.log(data);
    ListsOfAnime(data).then(function(result){
    	User.init(username, data);
    	Stats.init({lists:result, genres:genres , staff:staff, studio:studio,
    	 staffNamesMap:completeStaff, studiosNamesMap: completeStudios });
    	console.log(result);
    	console.log(genres);
    	console.log(staff);
    	console.log(studio);
    });
  })
  .catch(error => {
    console.log(error);
  });
  else
  {
  	console.log("load everything");
  }
}
//create a genre and staff maps
function statsMaps (animeList)
{
}

 //TODO: need to extract name, pic, desc 
function  ListsOfAnime (userData){
 var deferred = $.Deferred();
 var animeLists = new Map();
 var promises = [];
 var lists = ["completed", "dropped", "on_hold", "watching"];
 for (var i = lists.length - 1; i >= 0; i--) {
 	var list = [].concat.apply([], userData.lists[lists[i]]);
 	var watchList = list.map(function(animeItem){
	 	return animeItem.anime.id;
	 });
	promises.push(checkForAnimeDetails(lists[i],watchList));
 }
 $.when.apply($, promises).then(function() {
    var temp=arguments; // The array of resolved objects as a pseudo-array
    deferred.resolve(arguments);
 });
 return deferred.promise();
}

function retrieveStaffAndGenres(id) {
	var deferred = $.Deferred();
	nani.get('anime/'+id+'/staff')
	  .then(data => {
	  	var staff = {};
	  	data.staff.forEach(function(staffMember){
	  		staff[staffMember.id]= {
	  			name_first: staffMember.name_first,
	  			name_last: staffMember.name_last,
	  			role: staffMember.role
	  		};
	  	});
	  	//console.log("staff ",staff);
	    deferred.resolve({genres: data.genres ,staff:  staff, action: "staff&genres", id: id});
	  })
	  .catch(error => {
	    console.log(error);
	  });
	 return deferred.promise();	
}

//studio is an array of studios
//made of 
//id
//main_studio
//studio_name
//studio_wiki
function retrieveStudio(id){
	var deferred = $.Deferred();
	nani.get('anime/'+id+"/page")
	  .then(data => {
	  	var staff = {};
	  	data.staff.forEach(function(staffMember){
	  		staff[staffMember.id]= {
	  			name_first: staffMember.name_first,
	  			name_last: staffMember.name_last,
	  			role: staffMember.role
	  		};
	  	});
	    deferred.resolve({genres: data.genres ,staff:  staff, studios: data.studio , action: "studio", id: id});
	  })
	  .catch(error => {
	    console.log(error);
	  });
	 return deferred.promise();
}

/**
 * checkForAnimeDetails Promise creates and sends all promses for that list of anime and formats it
 * @param  {string}  name      name of list
 * @param  {array}   animeIds  an array of anime Ids
 * @return {[type]}            [description]
 */
function checkForAnimeDetails (name,animeIds) {
  var deferred = $.Deferred();
  var promises=[];
  for (var i = 0; i < animeIds.length; i++) {
   // promises.push( retrieveStaffAndGenres(animeIds[i]) );
    promises.push( retrieveStudio(animeIds[i]));

  };
  $.when.apply($, promises).then(function() {
    var temp=arguments; // The array of resolved objects as a pseudo-array
    processInfo(name,temp).then(function(response){
    		deferred.resolve(response);
    });
  });
  return deferred.promise();
}
/**
 * processInfo Promise that fuses genres and staff to one item 
 * @param  {[type]} name [name of the list]
 * @param  {[type]} data [psudo array of resolved promosises]
 * @return {[object]}      [object with name and a map of animes id as key and anime object with genres and staff]
 *                         	
 */
 /*
 Current Anime Object
 object in map Anime item
 id: Number
 Genres: Array of Strings
 Staff: Object of key staff ids
 			with value as
 			name_first:
  			name_last: 
  			role: 
 Studios: Object of key studio ids
			id
			main_studio
			studio_name
			studio_wiki
  */
function processInfo(name,data){
	var deferred = $.Deferred();
	var animeList = new Map();
	var genresStats = new Map();
	var staffStats = new Map();
	var studioStats = new Map();
	for(var i = 0; i < data.length; i++)
	{
		var item = data[i];
		switch(item.action){
			case "studio":
			//find frequency for each genre
			item.studios.forEach(function(val)
			{
				dictAdd(studioStats,val.id);
				dictAdd(studio,val.id);
				dictSave(completeStudios,val.id,val);
			});
			if(!animeList.has(item.id))
			{
				var anime = {id: item.id, studios: item.studios };
				animeList.set(item.id, anime);
			}
			else
			{
				var anime = animeList.get(item.id);
				anime.studios = item.studios;
				animeList.set(item.id, anime);
			}
			//break;
			//case "staff&genres":
				//find frequency for each genre
				item.genres.forEach(function(val)
				{
					dictAdd(genresStats,val);
					dictAdd(genres,val);
				});
				//find frequenc for each staff
				Object.keys(item.staff).forEach(function(val)
				{
					dictAdd(staffStats, val);
					dictAdd(staff, val);
					dictSave(completeStaff,val,item.staff[val]);

				});
				//add anime staff data to anime
				if(!animeList.has(item.id))
				{
					var anime = {id: item.id, staff: item.staff, genres: item.genres};
					animeList.set(item.id, anime);
				}
				else
				{
					var anime = animeList.get(item.id);
					anime.staff = item.staff;
					anime.genres = item.genres;
					animeList.set(item.id, anime);
				}
			break;
		}
	}
	deferred.resolve({name: name,map: animeList, 
		stats: {genre: genresStats, staff: staffStats, studios: studioStats}});
	return deferred.promise();
}

/**
 * dictAdd adds one to value if found or adds it to map
 * @param  {map} dictionary [a js map]
 * @param  {[type]} val        [a value]
 * @return {[type]}            [description]
 */
function dictAdd(dictionary, val)
{
	if(dictionary.has(val))
	{
		var num = dictionary.get(val);
		num++;
		dictionary.set(val, num);
	}
	else
	{
		dictionary.set(val,1);
	}
}
/**
 * dictSave save key in dictionary if it doesnt exist yet
 * @param  {[map]} dictionary [map of staff info]
 * @param  {[type]} key        [key id]
 * @param  {[object]} value      [information about the staff]
 */
function dictSave(dictionary, key, value)
{
	if(!dictionary.has(key))
	{
		dictionary.set(key,value);
	}

}