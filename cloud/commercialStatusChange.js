
var _ = require('underscore');
var functionBase = require('./functionBase');



Parse.Cloud.job("commercialStatusChange", function(request, status) {
  
    var today = new Date();

    var currentHour = today.getHours();

    console.info(currentHour)

    if(currentHour == 0){
        //9

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })


    } else if(currentHour == 1) {
        //10

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })


    } else if(currentHour == 2) {
        //11

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })


    } else if(currentHour == 3) {

        //12

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 4) {
        //13

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 5) {
        //14

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 6) {

        //15

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 7) {

        //16

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 8) {

        //17

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 9) {
        //18

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 10) {
        //19

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 11) {
        //20

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 12) {
        //21

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 13) {
        //22

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            functionBase.igaworksOpenApi();

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
        
    } else if(currentHour == 14) {

        //23

        var Commercial = Parse.Object.extend("Commercial");
        var commercialQuery = new Parse.Query(Commercial);
        commercialQuery.equalTo("type", "preview_charge");
        commercialQuery.lessThan("free_date", today);
        commercialQuery.include("arist_post");
        commercialQuery.find({

            success:function(commericalObs){

                var pointArray = [];

                var endExcution = _.after(commericalObs.length, function(){

                    var MyAlert = Parse.Object.extend("MyAlert");
                    var myAlertOb = new MyAlert();
                    myAlertOb.set("type", "job");
                    myAlertOb.set("hours", currentHour);
                    myAlertOb.set("now", today);
                    myAlertOb.set("status", true);
                    myAlertOb.save(null,{ useMasterKey: true })

                    status.success("Function is working");
                
                })

                _.each(commericalObs, function(commercialOb){

                    commercialOb.set("type", "free");
                    commercialOb.save(null, { useMasterKey: true });

                    var artistPostOb = commercialOb.get("artist_post");
                    artistPostOb.set("charge_flag", false);
                    artistPostOb.save(null, { useMasterKey: true });

                    endExcution();

                })

            }, 

            error:function(error){

                status.error("Something went wrong.");

            }


        })

        

        
    } else if(currentHour == 15) {
        //0
        var ArtistPost = Parse.Object.extend("ArtistPost");
        var postQuery = new Parse.Query(ArtistPost);
        postQuery.equalTo("seriese_in", true);
        postQuery.equalTo("post_type", "webtoon");
        postQuery.equalTo("status", true);
        postQuery.equalTo("open_flag", false);
        postQuery.lessThan("open_date", today);
        postQuery.find().then(function(postObs){

            var pointArray = [];

            var endExcution = _.after(postObs.length, function(){

                var MyAlert = Parse.Object.extend("MyAlert");
                var myAlertOb = new MyAlert();
                myAlertOb.set("type", "job");
                myAlertOb.set("hours", currentHour);
                myAlertOb.set("now", today);
                myAlertOb.set("status", true);
                myAlertOb.save(null,{ useMasterKey: true })

                status.success("Function is working");
            
            })

            _.each(postObs, function(postOb){

                postOb.set("open_flag", true);
                postOb.save(null, { useMasterKey: true });

                endExcution();

            })


        }, function(error){


        });


        
    } else if(currentHour == 16) {
        //1

        var User = Parse.Object.extend("_User");
        var userCountQuery = new Parse.Query(User);
        userCountQuery.count().then(function(countNum){

            if(countNum <= 1000){

                var userQuery = new Parse.Query(User);
                userQuery.limit(1000);
                userQuery.find().then(function(userObs){

                    var endExcution = _.after(userObs.length, function(){

                        var MyAlert = Parse.Object.extend("MyAlert");
                        var myAlertOb = new MyAlert();
                        myAlertOb.set("type", "job");
                        myAlertOb.set("hours", currentHour);
                        myAlertOb.set("now", today);
                        myAlertOb.set("status", true);
                        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

                            status.success("Function is working");

                        }, function(error){

                            status.error("Function error");

                        })
                    
                    })

                    _.each(userObs, function(userOb){

                        userOb.set("duplication_array", []);
                        userOb.save(null, {useMasterKey:true});

                        endExcution();

                    })

                }, function(error){

                    console.info(error);
                    status.error("Function error1");

                })

            } else {

                var times = Math.ceil(countNum / 1000);

                var timeArray = [];

                for(var j=0;times > j;j++){

                    timeArray.push(j)

                }

                var endExcution = _.after(timeArray.length, function(){

                    var MyAlert = Parse.Object.extend("MyAlert");
                    var myAlertOb = new MyAlert();
                    myAlertOb.set("type", "job");
                    myAlertOb.set("hours", currentHour);
                    myAlertOb.set("now", today);
                    myAlertOb.set("status", true);
                    myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

                        status.success("Function is working");

                    }, function(error){

                        status.error("Function error");

                    })

                
                })

                _.each(timeArray, function(time){

                    var skip = 0;
                    var skip = 0 + 1000*time;

                    var userQuery = new Parse.Query(User);
                    userQuery.limit(1000);
                    userQuery.skip(skip);
                    userQuery.find().then(function(userObs){

                        for(var i=0;userObs.length>i;i++){

                            var userOb = userObs[i];
                            userOb.set("duplication_array", []);
                            userOb.save(null, {useMasterKey:true});

                            endExcution();

                        }

                    }, function(error){

                        console.info(error);
                        console.info("user find fail");

                        endExcution();

                    })

                    

                })



            }

        }, function(error){

            console.info(error);
            status.error("user count fail")

        })

        
    } else if(currentHour == 17) {
        //2

        var User = Parse.Object.extend("_User");
        var userCountQuery = new Parse.Query(User);
        userCountQuery.count().then(function(countNum){

            if(countNum <= 1000){

                var userQuery = new Parse.Query(User);
                userQuery.limit(1000);
                userQuery.find().then(function(userObs){

                    var endExcution = _.after(userObs.length, function(){

                        var yesterdayDate = new Date();
                        yesterdayDate.setDate(yesterdayDate.getDate()-1);
                        yesterdayDate.setHours(0);
                        yesterdayDate.setMinutes(0)
                        yesterdayDate.setSeconds(1);
                        yesterdayDate.setMilliseconds(0)

                        console.info(yesterdayDate);

                        var Score = Parse.Object.extend("Score");
                        var scoreQuery = new Parse.Query(Score);
                        scoreQuery.equalTo("to", userOb);
                        scoreQuery.greaterThan("createdAt", yesterdayDate);
                        scoreQuery.find().then(function(scoreObs){

                            var minusInt = 0;
                            var checkedScoreList = [];

                            for(var i=0;scoreObs.length>i;i++){

                                var scoreInt = functionBase.scoreMaker(scoreObs[i]);
                                var toUser = scoreObs[i].get("to");
                                toUser.increment("today_score", scoreInt);
                                toUser.save(null, {useMasterKey:true});

                            }

                            var MyAlert = Parse.Object.extend("MyAlert");
                            var myAlertOb = new MyAlert();
                            myAlertOb.set("type", "job");
                            myAlertOb.set("hours", currentHour);
                            myAlertOb.set("now", today);
                            myAlertOb.set("status", true);
                            myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

                                status.success("Function is working");

                            }, function(error){

                                status.error("Function error");

                            })


                        }, function(error){

                            status.error("scoreQuery error");

                        })
                        
                    
                    })

                    _.each(userObs, function(userOb){

                        userOb.set("today_score", 0);
                        userOb.save(null, {useMasterKey:true});

                        endExcution();

                    })

                }, function(error){

                    console.info(error);
                    status.error("Function error1");

                })

            } else {

                var times = Math.ceil(countNum / 1000);

                var timeArray = [];

                for(var j=0;times > j;j++){

                    timeArray.push(j)

                }

                var endExcution = _.after(timeArray.length, function(){

                    var yesterdayDate = new Date();
                    yesterdayDate.setDate(yesterdayDate.getDate()-1);
                    yesterdayDate.setHours(0);
                    yesterdayDate.setMinutes(0)
                    yesterdayDate.setSeconds(1);
                    yesterdayDate.setMilliseconds(0)

                    console.info(yesterdayDate);

                    var Score = Parse.Object.extend("Score");
                    var scoreQuery = new Parse.Query(Score);
                    scoreQuery.equalTo("to", userOb);
                    scoreQuery.greaterThan("createdAt", yesterdayDate);
                    scoreQuery.find().then(function(scoreObs){

                        var minusInt = 0;
                        var checkedScoreList = [];

                        for(var i=0;scoreObs.length>i;i++){

                            var scoreInt = functionBase.scoreMaker(scoreObs[i]);
                            var toUser = scoreObs[i].get("to");
                            toUser.increment("today_score", scoreInt);
                            toUser.save(null, {useMasterKey:true});

                        }

                        var MyAlert = Parse.Object.extend("MyAlert");
                        var myAlertOb = new MyAlert();
                        myAlertOb.set("type", "job");
                        myAlertOb.set("hours", currentHour);
                        myAlertOb.set("now", today);
                        myAlertOb.set("status", true);
                        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

                            status.success("Function is working");

                        }, function(error){

                            status.error("Function error");

                        })


                    }, function(error){

                        status.error("scoreQuery error");

                    })

                
                })

                _.each(timeArray, function(time){

                    var skip = 0;
                    var skip = 0 + 1000*time;

                    var userQuery = new Parse.Query(User);
                    userQuery.limit(1000);
                    userQuery.skip(skip);
                    userQuery.find().then(function(userObs){

                        for(var i=0;userObs.length>i;i++){

                            var userOb = userObs[i];
                            userOb.set("today_score", 0);
                            userOb.save(null, {useMasterKey:true});

                            endExcution();

                        }

                    }, function(error){

                        console.info(error);
                        console.info("user find fail");

                        endExcution();

                    })

                    

                })



            }

        }, function(error){

            console.info(error);
            status.error("user count fail")

        })

        
    } else if(currentHour == 18) {
        //3

        var ArtistPost = Parse.Object.extend("ArtistPost");
        var postQuery = new Parse.Query(ArtistPost);

        postQuery.limit(1000);
        postQuery.equalTo("status", true);
        postQuery.find().then(function(postObs){

            var endExcution = _.after(postObs.length, function(){

                var yesterdayDate = new Date();
                yesterdayDate.setDate(yesterdayDate.getDate()-1);
                yesterdayDate.setHours(0);
                yesterdayDate.setMinutes(0)
                yesterdayDate.setSeconds(1);
                yesterdayDate.setMilliseconds(0)

                console.info(yesterdayDate);


                var Score = Parse.Object.extend("Score");
                var scoreQuery = new Parse.Query(Score);
                scoreQuery.equalTo("to", userOb);
                scoreQuery.notEqualTo("post", null);
                scoreQuery.greaterThan("createdAt", yesterdayDate);
                scoreQuery.find().then(function(scoreObs){

                    var minusInt = 0;
                    var checkedScoreList = [];

                    for(var i=0;scoreObs.length>i;i++){

                        var scoreInt = functionBase.scoreMaker(scoreObs[i]);
                        var post = scoreObs[i].get("post");
                        post.increment("today_score", scoreInt);
                        post.save(null, {useMasterKey:true});

                    }

                    var MyAlert = Parse.Object.extend("MyAlert");
                    var myAlertOb = new MyAlert();
                    myAlertOb.set("type", "job");
                    myAlertOb.set("hours", currentHour);
                    myAlertOb.set("now", today);
                    myAlertOb.set("status", true);
                    myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

                        status.success("Function is working");

                    }, function(error){

                        status.error("Function error");

                    })


                }, function(error){

                    status.error("scoreQuery error");

                })

            
            })

            _.each(postObs, function(postOb){

                postOb.set("today_score", 0);
                postOb.save(null, {useMasterKey:true});
                endExcution();

            })

        },function(error){


        })

        
    } else if(currentHour == 19) {

        //4

        var today = new Date();

        var dateArray = [];

        for(var i=1;20>i;i++){

            var yesterDay = new Date();
            yesterDay.setDate(today.getDate()-i);

            var createdDateString = functionBase.dateToStringFormat(yesterDay);

            dateArray.push(createdDateString);

        }

        var endExcution = _.after(dateArray.length, function(){

            console.info("데이터 서버에 저장");

            functionBase.igaworksOpenApi();
            
            var MyAlert = Parse.Object.extend("MyAlert");
            var myAlertOb = new MyAlert();
            myAlertOb.set("type", "job");
            myAlertOb.set("hours", currentHour);
            myAlertOb.set("now", today);
            myAlertOb.set("status", true);
            myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

                status.success("AdLog working Fine");

            }, function(error){

                status.error("Function error");

            })

        })

        _.each(dateArray, function(data){

            var yearString = data.substring(0, 4);
            var monthString = data.substring(4,6);
            var dateString = data.substring(6,8);

            var saveDate = new Date();
            saveDate.setFullYear(Number(yearString));
            saveDate.setMonth(Number(monthString) +1);
            saveDate.setDate(Number(dateString));
            saveDate.setHours(10);
            saveDate.setMinutes(0);


            var AdLog2 = Parse.Object.extend("AdLog");
            var adLogQuery2 = new Parse.Query(AdLog2);
            adLogQuery2.equalTo("unique", true);
            adLogQuery2.equalTo("date_string", data);
            adLogQuery2.count().then(function(countInt){

                console.info(countInt);
                
                var AdDailyResult = Parse.Object.extend("AdDailyResult");
                var adResultQuery = new Parse.Query(AdDailyResult);
                adResultQuery.equalTo("date_string", data);
                adResultQuery.first().then(function(itemOb){
                    
                
                    if(itemOb == null){
                        
                        var adResultOb = new AdDailyResult();
                        adResultOb.set("date_string", data);
                        adResultOb.set("total_count", countInt);
                        adResultOb.set("date", saveDate);
                        //test
                        //adResultOb.save(null)
                        adResultOb.save(null, {useMasterKey:true});
                        
                        endExcution();
                        
                    } else {
                        
                        itemOb.set("date_string", data);
                        itemOb.set("total_count", countInt);
                        itemOb.set("date", saveDate);
                        //test
                        //itemOb.save(null);
                        itemOb.save(null, {useMasterKey:true});
                        
                        endExcution();
                        
                    }
                    
                }, function(error){
                    
                    console.info(error);
                    endExcution();
                    
                })
        

            }, function(error){

                endExcution();

            })

        })

        
    } else if(currentHour == 20) {
        //5

        var TagItem = Parse.Object.extend("TagItem");
        var tagItemQuery = new Parse.Query(TagItem);
        
        tagItemQuery.equalTo("status", true);
        tagItemQuery.find().then(function(tagItems){
            
            console.info(tagItems.length);
            
            var endExcution = _.after(tagItems.length, function(){

                console.info("데이터 서버에 저장");
                status.success("TagItem Count success");
                

            })

            _.each(tagItems, function(item){
                
                var today = new Date();
                
                var monthBefore = new Date();
                monthBefore.setMonth(today.getMonth()-1);
                
                console.info(today);
                console.info(monthBefore);
                

                var tag_array = item.get("tag_array");
                
                console.info(tag_array);
                
                var ArtistPost = Parse.Object.extend("ArtistPost");
                var postQuery = new Parse.Query(ArtistPost);
                postQuery.containedIn("tag_array", tag_array);
                postQuery.greaterThanOrEqualTo("createdAt", monthBefore);
                postQuery.lessThan("createdAt", today);
                postQuery.count().then(function(num){
                    
                    console.info(num);
                    
                    item.set("count", num);
                    item.save(null);
                    
                    endExcution();
                    
                }, function(error){
                    
                    endExcution();
                    
                })
            

            })
            
            
            
        }, function(error){
            
            
            status.error("TagItem Function error");

            
        })

        
    } else if(currentHour == 21) {
        //6

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 22) {

        //7

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } else if(currentHour == 23) {
        //8

        var MyAlert = Parse.Object.extend("MyAlert");
        var myAlertOb = new MyAlert();
        myAlertOb.set("type", "job");
        myAlertOb.set("hours", currentHour);
        myAlertOb.set("now", today);
        myAlertOb.set("status", true);
        myAlertOb.save(null,{ useMasterKey: true }).then(function(savedAlertOb){

            status.success("Function is working");

        }, function(error){

            status.error("Function error");

        })

        
    } 

});
