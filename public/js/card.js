
var cardId;
var imageUrl;
var contents;
var selectedContentId;
var youtubeList=[];
var currentYoutubeItems;



function dataCall(contentId){

	youtubeList = [];

	selectedContentId = contentId;

	youtubeListMaker(selectedContentId);

	var callData = searchData(contentId);

	if(callData != null){

		var data = callData.val();
		
		var call_name = data.name;
		var call_description = data.description;
		var call_imageUrl = data.imageUrl;
		var call_status = data.status;
		var call_source = data.source;
		
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
		$("#status").val(call_status_value).attr("selected", "selected");;
		$("#delete").val(call_delete_value).attr("selected", "selected");;
		$("#source").val(call_source);
		imageUrl = call_imageUrl;

	} else {

		alert("no data")

	}

}




function searchData(contentId){

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


function youtubeListMaker(id){


	var youtubeRef = firebase.database().ref("cards").child(cardId).child("youtube");
	youtubeRef.on("value", function(youtubeSnapshots){

		$("#youtube_list").empty();
		
		currentYoutubeItems = youtubeSnapshots;
		currentYoutubeItems.forEach(function(youtubeSnapshot){

			var youtubeOb = youtubeSnapshot.val();
			var youtube_key = youtubeSnapshot.key;


			var status = "";

			if (youtubeOb.delete != true){

				var status = ""

			} else {

				var status = "(삭제)"

			}
			
			
			$("#youtube_list").append(
			
				"<option value=" + youtube_key + ">"+ youtubeOb.name + status +"</option>"

			)


		})

		

	})

	

}





function youtubeCountUpdate(){

	firebase.database().ref("/cards/"+ cardId ).once("value").then(function(snapshot){

		var count = snapshot.val().youtubeCount;

		console.log(count)

		count += 1

		var updates = {};

		console.log(count);

		updates['cards/' + cardId + "/youtubeCount"] = count

		var viewCountUpdate = firebase.database().ref().update(updates)

		return viewCountUpdate

	})


}

function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {

        	console.log(e.target.result);
        	
            $('#preview').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}


function writeContentOnFirebase(name, description, status, source){

	var newPostKey = firebase.database().ref().child('cards').child("photo").push().key;

	var updates = {};
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/name"] = name;
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/description"] = description;
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/source"] = source;
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/photo"] = imageUrl;
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/status"] = true;
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/delete"] = false;
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/created"] = firebase.database.ServerValue.TIMESTAMP;
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/updated"] = firebase.database.ServerValue.TIMESTAMP;
	updates['/cards/' + cardId + "/photo/"+ newPostKey +"/viewCount"] = 0;

  return firebase.database().ref().update(updates);

}




function writeYoutubeOnFirebase(name, description, thumbnail, channelId, id){

	var newPostKey = firebase.database().ref().child('cards').child("youtube").push().key;

	var updates = {};
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/name"] = name;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/description"] = description;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/thumbnail"] = thumbnail;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/channelId"] = channelId;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/status"] = true;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/delete"] = false;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/created"] = firebase.database.ServerValue.TIMESTAMP;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/updated"] = firebase.database.ServerValue.TIMESTAMP;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/youtubeId"] = id;
	updates['/cards/' + cardId + "/youtube/"+ newPostKey +"/viewCount"] = 0;



	return firebase.database().ref().update(updates);

}




function updateYotubeOnFirebase(youtubeId, deleteStatus){

	var updates = {};
	updates['/youtube/' + youtubeId + "/delete"] = deleteStatus;

  return firebase.database().ref().update(updates);

}


$(document).ready(function(){


	var paramUrl = location.search;
	cardId = paramUrl.split("=")[1]
	type = paramUrl.split("=")[2]

	console.log(type);

	var storageRef = firebase.storage().ref();

	$("#container").load("/html/topnav.html", function(){


		if(type == "youtube"){

			$("#sub_container").load("/html/contentlist.html", function(){

				var cardRef = firebase.database().ref("cards").child(cardId);

				$("#add_youtube").on("click", function(){

					var youtubeId = $("#youtube_input").val();

					youtubeListMaker(youtubeId);

					var youtubeRequestUrl = "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBI_4ULpg5_AAfC9CA-naH1D23J8ayylhA&&part=snippet&id="+ youtubeId
					var thumbUrl = "https://img.youtube.com/vi/" + youtubeId + "/1.jpg"
					


					$.ajax({      
				        type:"GET",  
				        url:youtubeRequestUrl,          
				        success:function(result){   

				        	console.log(result.items[0].snippet.title);

				        	title = result.items[0].snippet.title;
				        	description = result.items[0].snippet.description;
				        	channelId = result.items[0].snippet.channelId;

				        	var firebaseSaveResult = writeYoutubeOnFirebase(title, description, thumbUrl, channelId, youtubeId);
				        	var youtubeUpdateResult = youtubeCountUpdate()
				        	console.log(firebaseSaveResult);
				        	console.log(youtubeUpdateResult);

				        },   
				        
				        error:function(e){  
				        
				            console.log(e);  
				        
				        }  
				    }); 

				})


				$("#save_youtube").on("click", function(){

					var youtubeId = $("#youtube_input").val();

					


				})

				$("#delete_youtube").on("click", function(){

					var currentYoutubeIds = $("#youtube_list").val();
					console.log(currentYoutubeIds)	

					
					currentYoutubeIds.forEach(function(item){

						updateYotubeOnFirebase(item, true)

					})
					
					youtubeListMaker(selectedContentId)

				})



			})

		} else {

			$("#sub_container").load("/html/contentphoto.html", function(){

				var cardRef = firebase.database().ref("cards").child(cardId).child("photo").orderByChild("created");
			
				cardRef.on("value", function(snapshot){

					contents = snapshot;

					$("#contentlist").empty();
					
					snapshot.forEach(function(childSnapshot) {
						
						var data = childSnapshot.val();

						var funcName = "dataCall('"+ childSnapshot.key +"')";

						$("#contentlist").append("<li class='list-group-item'><a href='#' onclick="+ funcName + ">" + 

							data.name +
						
							"</a></li>")

					
					})
					
				})


				$("#save_content").on("click", function(){

					console.log("save start");

					var name = $("#name").val();
					var description = $("#description").val();
					var source = $("#source").val();
					
					var statusInput = $("#status").val();
					var status = false;

					if(statusInput == "open"){

						status = true;

					} else {

						status = false;

					}


					if(name.length == 0 || description.length == 0 || imageUrl.length == 0){

						alert("내용이 입력되지 않았습니다.")

					} else {

						var writeResult = writeContentOnFirebase(name, description, status, source);

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

					var uploadTask = storageRef.child('images/card/' + cardId +"/"+ fileName).put(imageFile);

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


		}

		
		


	})


	


	






})