
var _ = require('underscore');


exports.pointDecreaseCalculator = function(currentPointOb, price){

    var currentPurchasePoint = currentPointOb.get("current_purchase_point");//
    var currentAdPoint = currentPointOb.get("current_ad_point");//
    var currentCheerPoint = currentPointOb.get("current_cheer_point");//
    var currentPatronWithdrawPoint = currentPointOb.get("current_patron_withdraw_point");
    var currentRevenuePoint = currentPointOb.get("current_revenue_point");
    var currentAdminRewardPoint = currentPointOb.get("current_admin_reward_point");
    var currentRewardPoint = currentPointOb.get("current_reward_point");
    var currentFreePoint = currentPointOb.get("current_free_point");

    var decreasePurchaseAmount = 0;
    var decreaseAdAmount = 0;
    var decreaseCheerAmount = 0;
    var decreasePatronWithdrawAmount = 0;
    var decreaseRevenueAmount = 0;
    var decreaseAdminRewardAmount = 0;
    var decreaseRewardAmount = 0;
    var decreaseFreeAmount = 0;
    
    var leftPrice = price;
    
	console.info("step1:" + leftPrice.toString());

    if(currentPurchasePoint >= leftPrice){

        decreasePurchaseAmount = price;
        decreaseAdAmount = 0;
        decreaseCheerAmount = 0;
        decreasePatronWithdrawAmount = 0;
        decreaseRevenueAmount = 0;
        decreaseAdminRewardAmount = 0;
        decreaseRewardAmount = 0;
        decreaseFreeAmount = 0;

    } else {

    	decreasePurchaseAmount = currentPurchasePoint;
    	leftPrice = leftPrice - decreasePurchaseAmount;

    	console.info("step2:" + leftPrice.toString());

    	if(currentAdPoint >= leftPrice){

	        decreaseAdAmount = leftPrice;
	        decreaseCheerAmount = 0;
	        decreasePatronWithdrawAmount = 0;
	        decreaseRevenueAmount = 0;
	        decreaseAdminRewardAmount = 0;
	        decreaseRewardAmount = 0;
	        decreaseFreeAmount = 0;

	    } else {

	    	decreaseAdAmount = currentAdPoint;
	    	leftPrice = leftPrice - decreaseAdAmount;

	    	console.info("step3:" + leftPrice.toString());

	        if(currentCheerPoint >= leftPrice){

	        	decreaseCheerAmount = leftPrice;
		        decreasePatronWithdrawAmount = 0;
		        decreaseRevenueAmount = 0;
		        decreaseAdminRewardAmount = 0;
		        decreaseRewardAmount = 0;
		        decreaseFreeAmount = 0;

	        } else {

	        	console.info(currentCheerPoint);
	        	console.info(decreaseCheerAmount);

	        	decreaseCheerAmount = currentCheerPoint;
	        	leftPrice = leftPrice - decreaseCheerAmount;

	        	console.info("step4:" + leftPrice.toString());

	        	if(currentPatronWithdrawPoint >= leftPrice){

	        		decreasePatronWithdrawAmount = leftPrice;
			        decreaseRevenueAmount = 0;
			        decreaseAdminRewardAmount = 0;
			        decreaseRewardAmount = 0;
			        decreaseFreeAmount = 0;

	        	} else {

	        		decreasePatronWithdrawAmount = currentPatronWithdrawPoint;
	        		leftPrice = leftPrice - decreasePatronWithdrawAmount;

	        		console.info("step5:" + leftPrice.toString());

	        		if(currentRevenuePoint >= leftPrice){

	        			decreaseRevenueAmount = leftPrice;
				        decreaseAdminRewardAmount = 0;
				        decreaseRewardAmount = 0;
				        decreaseFreeAmount = 0;

	        		} else {

	        			decreaseRevenueAmount = currentRevenuePoint;
	        			leftPrice = leftPrice - decreaseRevenueAmount;

	        			console.info("step6:" + leftPrice.toString());

	        			if(currentAdminRewardPoint >= leftPrice){

	        				decreaseAdminRewardAmount = leftPrice;
					        decreaseRewardAmount = 0;
					        decreaseFreeAmount = 0;

	        			} else {

	        				decreaseAdminRewardAmount = currentAdminRewardPoint;
	        				leftPrice = leftPrice - decreaseAdminRewardAmount;

	        				console.info("step7:" + leftPrice.toString());

	        				if(currentRewardPoint >= leftPrice){

	        					decreaseRewardAmount = leftPrice;
					        	decreaseFreeAmount = 0;

	        				} else {

	        					decreaseRewardAmount = currentRewardPoint;
	        					leftPrice = leftPrice - decreaseRewardAmount;

	        					console.info("step8:" + leftPrice.toString());

	        					decreaseFreeAmount = leftPrice;

	        				}
					        

	        			}

	        		}



	        	}

	        }

	    }

    }

    var result = {

		"decreasePurchaseAmount":decreasePurchaseAmount,
    	"decreaseAdAmount":decreaseAdAmount,
    	"decreaseCheerAmount":decreaseCheerAmount,
    	"decreasePatronWithdrawAmount":decreasePatronWithdrawAmount,
    	"decreaseRevenueAmount": decreaseRevenueAmount,
    	"decreaseAdminRewardAmount":decreaseAdminRewardAmount,
    	"decreaseRewardAmount": decreaseRewardAmount ,
    	"decreaseFreeAmount": decreaseFreeAmount

    };

    return result;    

}


exports.duplicationCheck = function(currentUserOb, columName ,uid){

	var array = currentUserOb.get(columName);

	if(array == null){

		return true;

	} else {

		if(array.indexOf(uid) == -1){

			return true;

		} else {

			return false;
		}

	}

}

exports.stringToDate = function(inputString){

	var stringArray = inputString.split("-");
    var returnDate = new Date(stringArray[0], stringArray[1]-1, stringArray[2]);
    return returnDate;

}


exports.dateToString = function(inputDate){

	var monthInt = inputDate.getMonth()+1;

	var yearMonthDate = inputDate.getFullYear().toString() + monthInt.toString() + inputDate.getDate().toString();
    
    return yearMonthDate;

}

exports.dateToStringFormat = function(createdDate){

	var year = createdDate.getFullYear();
    var month = createdDate.getMonth()+1;
    var date = createdDate.getDate();

    var saveMonth = "";
    var saveDate = "";

    if(month < 10){

        saveMonth = "0" + month.toString();

    } else {

        saveMonth = month.toString();

    }

    if(date < 10){

        saveDate = "0" + date.toString();

    } else {

        saveDate = date.toString();

    }

    var saveDateString = year.toString() + saveMonth + saveDate; 

    return saveDateString;

}

exports.dateToStringFormatWithoutInput = function(){

	var today = new Date();
    var saveDate = new Date();
    saveDate.setHours(today.getHours() + 9);

	var year = saveDate.getFullYear();
    var month = saveDate.getMonth()+1;
    var date = saveDate.getDate();

    var saveMonth = "";
    var saveDate = "";

    if(month < 10){

        saveMonth = "0" + month.toString();

    } else {

        saveMonth = month.toString();

    }

    if(date < 10){

        saveDate = "0" + date.toString();

    } else {

        saveDate = date.toString();

    }

    var saveDateString = year.toString() + saveMonth + saveDate; 

    return saveDateString;

}

exports.stringToDate = function(dataString){

	var result;




	return result;

}


exports.duplicationCheckUserDataSave = function(userOb, uid){

	console.info("duplication prevent data save start");

	userOb.addUnique("duplication_array", uid);
    userOb.save(null, {useMasterKey:true});

}

exports.failResponse = function(message, location){

	console.info("duplication prevent data save start");

	var CloudCodeError = Parse.Object.extend("CCError");
	var ccErrorOb = new CloudCodeError();
	ccErrorOb.set("message", message);
	ccErrorOb.set("location", location);
	ccErrorOb.save(null, {useMasterKey:true});

	var responseDate = {
        "status":false,
        "message":message
    }

    return responseDate;

}

exports.successResponse = function(message, location){

	var responseDate = {
        "status":true,
        "message":message
    }

    return responseDate;

}

exports.countLogSave = function(userOb, postOb, location){

	var CountLog = Parse.Object.extend("CountLog");
    var countLogOb = new CountLog();

    if(userOb != null){

    	countLogOb.set("user", userOb);

    }

    if(postOb != null){

    	countLogOb.set("post", postOb);

    }

    countLogOb.save("location", location);
    countLogOb.save(null, {useMasterKey:true});

    console.info("user info Saved");

}




exports.favorTagMaker = function(tagLogObs){

	var tempArray = [];

	for(var i=0;tagLogObs.length>i;i++){

		var tag = tagLogObs[i].get("tag");

        if(tempArray.indexOf(tag) == -1){

        	tempArray.push(tag);

        } 

	}

	var result = [];

	for(var j=0;tempArray.length>j;j++){

		var tagItem = tempArray[j];

		var dataDict = {

			'count':0,
        	'tag':tagItem

		}

		for(var k=0;tagLogObs.length>k;k++){

        	var tagString = tagLogObs[k].get("tag");

        	if(tagItem == tagString){

        		var currentCount = dataDict.count;
        		currentCount += 1;

        		dataDict.count = currentCount;

        	}

        }

        result.push(dataDict);

	}

	result.sort(function(a, b) {
	    return  b.count - a.count;
	});

	var arrayLength = 0

	if(result.length > 20){

		arrayLength = 20;

	} else {

		arrayLength = result.length;

	}

	var result = result.slice(0, arrayLength-1);

	return result;

}


var scoreMaker = function(savedScoreOb){

	var type = savedScoreOb.get("type");

	//Post Ranking Index
    var viewScore = 1;
    var likeScore = 10;
    var commentScore = 20;
    var shareScore = 30;
    var adScore = 40;

    //Personal Ranking & multiply
    var boxScore = 10;

    //Relation Ranking Index
    var pokeScore = 5;
    var followScore = 5;
    var followRelationScore = 100;

	var score = 0;

	if(type == "like_post"){

		score = likeScore;

	} else if(type == "like_post_cancel"){

		score = -likeScore;

	} else if(type == "follow"){

		score = followScore;

	} else if(type == "follow_cancel"){

		score = -followScore;

	} else if(type == "poke_response"){

		score = pokeScore;

	} else if(type == "poke"){

		score = pokeScore;

	} else if(type == "cheer_point"){

		var amount = savedScoreOb.get("amount");

		score = boxScore * amount;

	} else if(type == "patron_point_send"){

		var amount = savedScoreOb.get("amount");

		score = boxScore * amount;

	} else if(type == "revenue"){

		var amount = savedScoreOb.get("amount");

		score = boxScore * amount;

	} else if(type == "post_comment"){

		score = commentScore;

	} else if(type == "social_comment"){

		score = commentScore;

	} else if(type == "post_comment_cancel"){

		score = -commentScore;

	} else if(type == "social_comment_cancelss"){

		score = -commentScore;

	} else if(type == "share"){

		score = shareScore;

	} else if(type == "ad_log"){

		score = adScore;

	}

	return score;

}


exports.relationScoreManager = function(savedScoreOb){

	console.info("location: relationScoreManager");

	var from = savedScoreOb.get("from");
	var to = savedScoreOb.get("to");
	var type = savedScoreOb.get("type");

	var followRelationScore = 100;

	var score = scoreMaker(savedScoreOb);

	var RelationLog = Parse.Object.extend("RelationLog");
    var relationLogQuery = new Parse.Query(RelationLog);

    relationLogQuery.equalTo("from", from);
    relationLogQuery.equalTo("to", to);
    relationLogQuery.first().then(function(relationLogOb){
        //find something
        if(relationLogOb == null){

        	console.info("relationLog find nothing");

        	if(type == "like_post_cancel" || type == "follow_cancel"){

	        	console.info(error);
	            console.info("relation find fail or already liked before relation score function update");

	        } else {

	        	var newRelationLogOb = new RelationLog();
		        newRelationLogOb.set("from", from);
		        newRelationLogOb.set("to", to);

		        if(type == "follow"){

		        	newRelationLogOb.increment("score", score);

		        } else {

		        	newRelationLogOb.increment("score", score);

		        }
		        
		        newRelationLogOb.save(null,{useMasterKey:true}).then(function(savedRelationOb){

		            var fromRelation = from.relation("from_relation");
		            fromRelation.add(savedRelationOb);

		            from.increment("today_my_score", score);
		            from.increment("week_my_score", score);
		            from.increment("total_my_score", score);
		            from.save(null, {useMasterKey:true});

		            var toRelation = to.relation("to_relation");
		            toRelation.add(savedRelationOb);

		            to.increment("today_score", score);
		            to.increment("week_score", score);
		            to.increment("total_score", score);
		            to.save(null, {useMasterKey:true});

		            

		        }, function(error){

		            console.info(error);
		            console.info("new relation save fail");

		        });

	        }


        } else {

        	console.info("relationLog find something");

        	if(type == "follow"){

	        	relationLogOb.increment("score", score);
	        	relationLogOb.save(null, {useMasterKey:true});

	        } else if( type == "follow_cancel"){

	        	relationLogOb.increment("score", -score);
	        	relationLogOb.save(null, {useMasterKey:true});

	        } else {

	        	relationLogOb.increment("score", score);
	        	relationLogOb.save(null, {useMasterKey:true});

	        }

	        from.increment("today_my_score", score);
	        from.increment("week_my_score", score);
	        from.increment("total_my_score", score);
	        from.save(null, {useMasterKey:true});

	        to.increment("today_score", score);
	        to.increment("week_score", score);
	        to.increment("total_score", score);
	        to.save(null, {useMasterKey:true});

        }

        

    }, function(error){
        //noting make new object

        console.info("error");

        


    })

}


exports.igaworksOpenApi = function(){

	var now = new Date();
    var nowAgoResult = now.setDate(now.getDate());
    var nowAgo = new Date(nowAgoResult);

    var today = new Date();
    var monthAgoResult = today.setDate(today.getDate()-40);
    var monthAgo = new Date(monthAgoResult);

    var token = "263576d831c2e96006758ee8cd2c4cc8";
    var startDate = (monthAgo.getYear()+1900).toString() + "-"+ (monthAgo.getMonth()+1).toString()+ "-"+ monthAgo.getDate();
    var endDate = (nowAgo.getYear()+1900).toString() + "-"+ (nowAgo.getMonth()+1).toString()+ "-"+ nowAgo.getDate();;
    var format = "json";

    var url = "https://report.ad-brix.com/v1/Revenue?access_token="+ token +"&startDate="+startDate+"&endDate="+endDate+"&format="+format;    

    console.info(url);

    Parse.Cloud.httpRequest({
        method: 'GET',
        url: url,
        followRedirects: true
    }).then(function(httpResponse) {
      // success
        console.info("success");
        
        var body = httpResponse.text;
        var jsonResult = JSON.parse(body);
        var datas = jsonResult.Datas;

        var AdDailyResult = Parse.Object.extend("AdDailyResult");
        var adDailyQuery = new Parse.Query(AdDailyResult);
        adDailyQuery.descending("date");
        adDailyQuery.find().then(function(adDailyObs){

            console.info("total:" + adDailyObs.length.toString());

            var endExcution = _.after(adDailyObs.length, function(){

                console.info("done");

            })

            _.each(adDailyObs, function(adDailyOb){

                var excuted = false;

                var dateString = adDailyOb.get('date_string').replace(" ", "");

                for(var i=0;datas.length>i;i++){

                    var data = datas[i];

                    var reportDate = data.ReportDate.replace(" ", "");

                    if(reportDate == dateString){

                        excuted = true;

                        console.info("find something");

                        var displayAd = data.DisplayAd;

                        var impression = displayAd.Impression;
                        var click = displayAd.Click;
                        var ctr = displayAd.CTR;
                        var ecpm = displayAd.ECPM;
                        var revenue = displayAd.Revenue;
                        
                        adDailyOb.set("impression", impression);
                        adDailyOb.set("click", click);
                        adDailyOb.set("ctr", ctr);
                        adDailyOb.set("ecpm", ecpm);
                        adDailyOb.set("ad_revenue", Number(revenue));
                        adDailyOb.save(null, {useMasterKey:true}).then(function(savedAdDailyOb){

                            console.info("save success");
                            endExcution();

                        },function(error){

                            console.info("save error");
                            console.info(error);

                            endExcution();

                        });

                    } 

                }

                if(excuted == false){

                    console.info("not found");
                    endExcution();

                }

            })

        },function(error){

            console.info(error);

        })

    },function(httpResponse) {
      // error
        console.info("error");
        console.info(httpResponse);
        console.error('Request failed with response code ' + httpResponse.status);
    
    });

}


