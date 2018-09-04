var cardId;
var imageUrl;
var contents;
var selectedContent;
var channel;


function searchData(contentId){

	var selected;

	contents.forEach(function(snapshot){

		if(snapshot.key == contentId){

			selected = snapshot;

		}

	})

	if(selected != null){

		return selected;
	
	} else {

		return null;

	}



}

function dataCall(contentId){

	console.log(contentId);
	var callData = searchData(contentId);

	if(callData != null){

		var data = callData.val();
		
		var call_name = data.name;
		var call_description = data.description;
		var call_imageUrl = data.imageUrl;
		var call_status = data.status;
		
		if(call_status == true){

			call_status_value = "open";
		
		} else {

			call_status_value = "close";

		}

		var call_delete = data.delete;

		if(call_delete == true){

			call_delete_value = "delete";
		
		} else {

			call_delete_value = "undelete";

		}

		console.log(call_status_value);
		console.log(call_delete_value);

		$("#name").val(call_name);
		$("#description").val(call_description);
		$("#status").val(call_status_value).attr("selected", "selected");
		$("#delete").val(call_delete_value).attr("selected", "selected");
		imageUrl = call_imageUrl;


	} else {

		alert("no data")

	}

}


function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
        	
            $('#preview').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}


function writeContentOnFirebase(name, description, status, type){

	var newPostKey = firebase.database().ref().child('webtoons').push().key;

	
	var updates = {};
	updates['/webtoons/' + newPostKey + "/name"] = name;
	updates['/webtoons/' + newPostKey + "/description"] = description;
	updates['/webtoons/' + newPostKey + "/thumnail"] = imageUrl;
	updates['/webtoons/' + newPostKey + "/status"] = status;
	updates['/webtoons/' + newPostKey + "/delete"] = false;
	//updates['/webtoons/' + newPostKey + "/type"] = type;
	updates['/webtoons/' + newPostKey + "/created"] = firebase.database.ServerValue.TIMESTAMP;
	updates['/webtoons/' + newPostKey + "/updated"] = firebase.database.ServerValue.TIMESTAMP;
	updates['/webtoons/' + newPostKey + "/webtoonCount"] = 0;
	//updates['/webtoons/' + newPostKey + "/channel"] = channel;

	var cardSavedResult = firebase.database().ref().update(updates)
	
  return cardSavedResult;

}


function writeChannelContentOnFirebase( cardSavedResult ){

	var newCardsKey = firebase.database().ref().child('channels').child(channel).child("cards").push().key;

	var updates = {};
	updates['/channels/' + channel + "/cards/"+ newCardsKey + "/cardObject" ] = cardSavedResult;

  return firebase.database().ref().update(updates);

}


$(document).ready(function(){

	var storageRef = firebase.storage().ref();

	$("#container").load("/html/topnav.html", function(){

		console.log("hello topnav.html");

		$("#sub_container").load("/html/webtoon_create.html", function(){

			console.log("hello card.html");
			var cardRef = firebase.database().ref("webtoons")
			
			console.log(cardRef);

			cardRef.on("value", function(snapshot){

				$("#cardlist").empty();
				
				snapshot.forEach(function(childSnapshot) {
					
					var data = childSnapshot.val();

					$("#cardlist").append("<li class='list-group-item'><a href='/webtoon.html?id="+ childSnapshot.key + "=" + data.type + "'>" + 

						data.name +
					
						"</a></li>")

				
				})
				
			})

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

					})
			  
			  	} else {
			    	// No user is signed in.
			  		console.log("no user");

				}

			});

		


			$("#save_content").on("click", function(){

				console.log("save start");

				var name = $("#name").val();
				var description = $("#description").val();
				
				var statusInput = $("#status").val();
				var status = false;

				if(statusInput == "open"){

					status = true;

				} else {

					status = false;

				}

				var type = $("#type").val();


				if(name.length == 0 || description.length == 0 || imageUrl.length == 0){

					alert("내용이 입력되지 않았습니다.")

				} else {

					var writeResult = writeContentOnFirebase(name, description, status, type);

					console.log(writeResult)

				}

				

			});


			$("#image").on("change" , function(){

				readURL($("#image")[0]);

				var imageFile = $("#image")[0].files[0];

				var imageType = imageFile.type;

				var fileEndPoint = ".jpg"

				if(imageType == "image/jpeg"){

					fileEndPoint = ".jpg";

				} else if (imageType == "image/png"){

					fileEndPoint = ".png";

				} else if (imageType == "image/gif"){

					fileEndPoint = ".gif"

				} else if(imageType == "image/jpg"){

					fileEndPoint = ".jpg"
				}

				var today = new Date();

				var fileName = today.toString() + imageFile.name;

				console.log(fileName)

				var uploadTask = storageRef.child('images/' + fileName).put(imageFile);

				uploadTask.on('state_changed', function(snapshot){
				  // Observe state change events such as progress, pause, and resume
				  // See below for more detail
				  console.log(snapshot);

				}, function(error) {
					console.log(error);
				  // Handle unsuccessful uploads
				}, function() {
				  // Handle successful uploads on complete
				  // For instance, get the download URL: https://firebasestorage.googleapis.com/...
				  var downloadURL = uploadTask.snapshot.downloadURL;
				  imageUrl = downloadURL;

				  console.log(imageUrl);

				});


			})



		})


	})


})