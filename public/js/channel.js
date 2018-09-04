var cardId;
var imageUrl;
var contents;
var selectedContent;



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
		
		
		$("#name").val(call_name);
		$("#description").val(call_description);
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


function writeContentOnFirebase(name, description){

	var newPostKey = firebase.database().ref().child('cards').push().key;

	var updates = {};
	updates['/channels/' + newPostKey + "/name"] = name;
	updates['/channels/' + newPostKey + "/description"] = description;
	updates['/channels/' + newPostKey + "/thumnail"] = imageUrl;
	updates['/channels/' + newPostKey + "/status"] = true;
	updates['/channels/' + newPostKey + "/delete"] = false;
	updates['/channels/' + newPostKey + "/created"] = firebase.database.ServerValue.TIMESTAMP;
	updates['/channels/' + newPostKey + "/updated"] = firebase.database.ServerValue.TIMESTAMP;
	updates['/channels/' + newPostKey + "/countentCount"] = 0;
	updates['/channels/' + newPostKey + "/subscriberCount"] = 0;
	updates['/channels/' + newPostKey + "/viewCount"] = 0;
	
  return firebase.database().ref().update(updates);

}





$(document).ready(function(){

	var storageRef = firebase.storage().ref();

	$("#container").load("/html/topnav.html", function(){

		console.log("hello topnav.html");

		$("#sub_container").load("/html/channel_detail.html", function(){


			console.log("hello card.html");
			var channelRef = firebase.database().ref("channels");
			
			channelRef.on("value", function(snapshot){

				$("#contentlist").empty();
				
				snapshot.forEach(function(childSnapshot) {
					
					var data = childSnapshot.val();

					console.log(data);

					$("#contentlist").append("<li class='list-group-item'>" + 

						data.name 	+
					
						"</a></li>")

				
				})
				
			})



			$("#save_content").on("click", function(){

				console.log("save start");

				var name = $("#name").val();
				var description = $("#description").val();
				

				if(name.length == 0 || description.length == 0 || imageUrl.length == 0){

					alert("내용이 입력되지 않았습니다.")

				} else {

					var writeResult = writeContentOnFirebase(name, description);

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