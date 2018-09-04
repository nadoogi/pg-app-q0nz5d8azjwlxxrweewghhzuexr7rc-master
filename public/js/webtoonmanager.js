parseSyncSessionWithApp(); // instead of Parse.initialize([ApplicationID], [Javascriptkey]);

var currentUser = Parse.User.current();

// strongly recommended to fetch to get user data.
currentUser.fetch().then(function(userOb){

	

}, function(error){

	

});