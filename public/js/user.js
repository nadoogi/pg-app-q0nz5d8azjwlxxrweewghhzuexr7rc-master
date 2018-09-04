var currentUser_id;
var user_data = false;





function writeContentOnFirebase(name, photo, type, channel, level){

	if(level == "admin"){

		var updates = {};
		updates['/users/' + currentUser_id + "/name"] = name;
		updates['/users/' + currentUser_id + "/photo"] = photo;
		updates['/users/' + currentUser_id + "/type"] = type;
		updates['/users/' + currentUser_id + "/level"] = level;
		updates['/users/' + currentUser_id + "/channel"] = channel;

	  	return firebase.database().ref().update(updates);

	} else {

		var updates = {};
		updates['/users/' + currentUser_id + "/name"] = name;
		updates['/users/' + currentUser_id + "/photo"] = photo;
		updates['/users/' + currentUser_id + "/type"] = type;
		updates['/users/' + currentUser_id + "/level"] = level;

	  	return firebase.database().ref().update(updates);

	}

	

}




$(document).ready(function(){


	$("#container").load("/html/topnav.html", function(){

		console.log("hello topnav.html");

		$("#sub_container").load("/html/user_detail.html", function(){

			firebase.auth().onAuthStateChanged(function(currentUser) {
	  
				if (currentUser) {
			    	
			    	// User is signed in.

			    	console.log("hello");

			    	currentUser_id = currentUser.uid;

			    	console.log(currentUser_id)

					var userRef = firebase.database().ref("users").child(currentUser_id);
					
					userRef.on("value", function(snapshot){

						console.log(snapshot.val());

						var userData = snapshot.val();
						$("#user_name").append(userData.name);
						$("#user_photo").attr("src", userData.photo);
						$("#user_type").append(userData.type);
						$("#user_channel").append(userData.channel);
						$("#user_level").append(userData.level);


					})
			  
			  	} else {
			    	// No user is signed in.
			  		console.log("no user");

				}

			});


			var channelRef = firebase.database().ref("channels");
			channelRef.on("value", function(snapshot){

				console.log(snapshot.val());

				var channels = snapshot.val();

				snapshot.forEach(function(childSnapshot) {
					
					var data = childSnapshot.val();

					console.log(data);
					console.log(childSnapshot.key);

					$("#channel").append("<option value='"+ childSnapshot.key +"'"+">" + 

						data.name 	+
					
						"</a></li>")

				
				})


			}); 


			$("#save_content").on("click", function(){

				console.log("save start");

				if(currentUser_id == null){

					console.log("no user data");

					
				} else {

					
					var name = $("#name").val();
					var photo = $("#photo").val();
					var type = $("#type").val();
					var channel = $("#channel").val();
					var level = $("#level").val();
					

					if(name.length == 0 || photo.length == 0 || type.length == 0){

						alert("내용이 입력되지 않았습니다.")

					} else {

						var writeResult = writeContentOnFirebase(name, photo, type, channel, level);

						console.log(writeResult)

					}

				}

			});


			




		})


	})


})