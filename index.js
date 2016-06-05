var nani = require('nani').init(auth.clientId, auth.clientSecret);
var username = "bote795";
nani.get('user/'+username+'/animelist')
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.log(error);
  });
function  ListsOfAnime (userData){
 var completed = userData.lists.completed;
 var dropped = userData.lists.dropped;
 var on_hold = userData.lists.on_hold;
 var watching = userData.lists.watching;
 array.forEach(function(animeItem){
 	return animeItem.anime.id;
 });
}
//genres
function retrieveGenres(id){
	var deferred = $.Deferred();
	nani.get('anime/'+id)
	  .then(data => {
	  	console.log(data);
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
	  	console.log("staff ",staff);
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
function checkForAnimeDetails (animeIds,callback) {
  var promises=[];
  for (var i = 0; i < animeIds.length; i++) {
    promises.push( retrieveGenres(animeIds[i]) );
    promises.push(retrieveStaff(nimeIds[i]));
  };
  $.when.apply($, promises).then(function() {
    var temp=arguments; // The array of resolved objects as a pseudo-array
    callback(temp);
  });
}
function processInfo(data){

}
retrieveGenres(18679);
retrieveStaff(18679);