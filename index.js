var nani = require('nani').init(auth.clientId, auth.clientSecret);
var genres = new Map();
var staff = new Map();
$( "#target" ).click(function( event ) {
  var username = $("#username").val();
  retrieveUser(username);
  event.preventDefault();
});
function retrieveUser(username){
 nani.get('user/'+username+'/animelist')
  .then(data => {
    console.log(data);
    ListsOfAnime(data).then(function(result){
    	console.log(result);
    	console.log(genres);
    	console.log(staff);
    });
  })
  .catch(error => {
    console.log(error);
  });
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
//genres
function retrieveGenres(id){
	var deferred = $.Deferred();
	nani.get('anime/'+id)
	  .then(data => {
	  	//console.log("retrieveGenres ",data);
	    deferred.resolve({genres: data.genres , action: "genres", id: id});
	  })
	  .catch(error => {
	    console.log(error);
	  });
	 return deferred.promise();
}

function retrieveStaff(id) {
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
	    deferred.resolve({staff:  staff, action: "staff", id: id});
	  })
	  .catch(error => {
	    console.log(error);
	  });
	 return deferred.promise();	
}

//page to get stuido
//anime/{id}/page
function retrieveStudio(id){
	var deferred = $.Deferred();
	nani.get('anime/'+id+"/page")
	  .then(data => {
	  	//console.log("retrieveGenres ",data);
	    deferred.resolve({studios: data.studios , action: "studio", id: id});
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
    promises.push( retrieveGenres(animeIds[i]) );
    promises.push(retrieveStaff(animeIds[i]));
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
  */
function processInfo(name,data){
	var deferred = $.Deferred();
	var animeList = new Map();
	var genresStats = new Map();
	var staffStats = new Map();
	for(var i = 0; i < data.length; i++)
	{
		var item = data[i];
		switch(item.action){
			case "genres":
				//find frequency for each genre
				item.genres.forEach(function(val)
				{
					dictAdd(genresStats,val);
					dictAdd(genres,val);
				});
				//add genre staff data to anime
				if(!animeList.has(item.id))
				{
					var anime = {id: item.id, genres: item.genres};
					animeList.set(item.id, anime);
				}
				else
				{
					var anime = animeList.get(item.id);
					anime.genres = item.genres;
					animeList.set(item.id, anime);
				}
			break;
			case "staff":
				//find frequenc for each staff
				Object.keys(item.staff).forEach(function(val)
				{
					dictAdd(staffStats, val);
					dictAdd(staff, val);
				});
				//add anime staff data to anime
				if(!animeList.has(item.id))
				{
					var anime = {id: item.id, staff: item.staff};
					animeList.set(item.id, anime);
				}
				else
				{
					var anime = animeList.get(item.id);
					anime.staff = item.staff;
					animeList.set(item.id, anime);
				}
			break;
		}
	}
	deferred.resolve({name: name,map: animeList, 
		stats: {genre: genresStats, staff: staffStats}});
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