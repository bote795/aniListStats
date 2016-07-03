(function() {

	angular.module('app').controller('viewCtrl',[ viewCtrl ])
	function viewCtrl(){
			var vm =this; 
			vm.studios=[];
			vm.staff = [];
			vm.genre = [];
			function formatStaffName(item)
			{
				return item.name_first + " " + item.name_last; //+"  :\n "+;
			}
			vm.request = function(username)
			{
				vm.studios=[];
				vm.staff = [];
				vm.genre = [];
			  	window.anime(username).then(function(){
				  	//studio pie Chart
				  	var orderedStudios = Stats.getSortedMap("studio");
				  	for (var i = 0; i < orderedStudios.length; i++) {
				  		vm.studios.push({label: Stats.studiosNamesMap.get(orderedStudios[i][0] ).studio_name, value: orderedStudios[i][1]});
				  	}


				  	//staff pie chart
				  	var orderedStaff = Stats.getSortedMap("staff");
				  	for (var i = 0; i < orderedStaff.length; i++) {
				  		vm.staff.push({label: formatStaffName(Stats.staffNamesMap.get(orderedStaff[i][0])), value: orderedStaff[i][1], role:  Stats.staffNamesMap.get(orderedStaff[i][0]).role});
				  	}

				  	var orderedGenre = Stats.getSortedMap("genres");
				  	for (var i = 0; i < orderedGenre.length; i++) {
				  		vm.genre.push({label: orderedGenre[i][0], value: orderedGenre[i][1]});
				  	}
			  	});
			}
	}
})();	