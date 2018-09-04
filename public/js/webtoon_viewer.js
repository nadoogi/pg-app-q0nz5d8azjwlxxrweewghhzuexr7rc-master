
var cardId;
var imageUrl;
var contents;
var selectedContentId;
var youtubeList=[];
var currentYoutubeItems;

var config = {
	
    apiKey: "AIzaSyC0l395nOIDB0bEUCDXnNmWduKUSzwWUMo",
    authDomain: "admanga-33a90.firebaseapp.com",
    databaseURL: "https://admanga-33a90.firebaseio.com",
    storageBucket: "admanga-33a90.appspot.com",
    messagingSenderId: "987198032907"

};


firebase.initializeApp(config);





$(document).ready(function(){


	var paramUrl = location.search;
	cardId = paramUrl.split("=")[1]
	type = paramUrl.split("=")[2]

	
	
	console.log(1)
	var webtoonRef = firebase.database().ref("webtoons").child(cardId).child("webtoon").orderByChild("pageOrder");
	console.log(webtoonRef);

	console.log(2)

	webtoonRef.on("value", function(snapshot){

		console.log(3)
		contents = snapshot;

		//$("#container").empty();
		console.log(4)
		snapshot.forEach(function(childSnapshot) {
			console.log(5)
			var data = childSnapshot.val();

			var funcName = "dataCall('"+ childSnapshot.key +"')";

			console.log(data.image)
			$("#container").append("<img src=" + data.image +" class='img-responsive' alt='Responsive image'>")

		
		})
		
	})




})