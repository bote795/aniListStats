var nani = require('nani').init(auth.clientId, auth.clientSecret);
var username = "bote795";
nani.get('user/'+username+'/animelist')
  .then(data => {
    console.log(data);
    ListsOfAnime(data);
  })
  .catch(error => {
    console.log(error);
  });
function  ListsOfAnime (userData){
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
    console.log(temp)
 });

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

/**
 * checkForAnimeDetails creates and sends all primses
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
	for(var i = 0; i < data.length; i++)
	{
		var item = data[i];
		switch(item.action){
			case "genres":
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
	deferred.resolve({name: name,map: animeList});
	return deferred.promise();
}