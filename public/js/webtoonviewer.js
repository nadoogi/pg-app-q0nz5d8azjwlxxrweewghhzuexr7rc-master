parseSyncSessionWithApp(); // instead of Parse.initialize([ApplicationID], [Javascriptkey]);

$(document).ready(function(){

	var currentUser = Parse.User.current();
	var objectid = $("#id").text();
	var container = $("#container");
	
	currentUser.fetch().then(function(userOb){

		var Post = Parse.Object.extend("ArtistPost");
      	var postQuery = new Parse.Query(Post);

      	postQuery.get(objectid).then(function(postOb){

      		var imageArray = postOb.get("image_array");

      		function compare(a,b) {
              if (a.order < b.order)
                return -1;
              if (a.order > b.order)
                return 1;
              return 0;
            }

            imageArray.sort(compare);

      		for(var i=0;imageArray.length>i;i++){

      			var appendElement = "<img src='https://res.cloudinary.com/dqn5e8b6u/image/upload/c_scale,w_600/" + imageArray[i].url + "'>";
      			container.append(appendElement);

      		}



      	}, function(error){

      		console.log(error.code);

      	})

	}, function(error){

		console.log(error.code);

	})


})