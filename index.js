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
 var completed = userData.lists.completed;
 var dropped = userData.lists.dropped;
 var on_hold = userData.lists.on_hold;
 var watching = userData.lists.watching;
 var watchList = watching.map(function(animeItem){
 	return animeItem.anime.id;
 });
checkForAnimeDetails("watching",watchList,processInfo);
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
 * @param  {array}   animeIds  an array of anime Ids
 * @param  {Function} callback function that takes in an array of results
 * @return {[type]}            [description]
 */
function checkForAnimeDetails (name,animeIds,callback) {
  var promises=[];
  for (var i = 0; i < animeIds.length; i++) {
    promises.push( retrieveGenres(animeIds[i]) );
    promises.push(retrieveStaff(animeIds[i]));
  };
  $.when.apply($, promises).then(function() {
    var temp=arguments; // The array of resolved objects as a pseudo-array
    callback(name,temp);
  });
}
/**
 * processInfo fuse genres and staff to one item
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function processInfo(name,data){
	var deferred = $.Deferred();
	console.log("Process Info", data);
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