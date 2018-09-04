/*
* Advanced Cloud Code Example
*/

var _ = require('underscore');
var express = require('express');
var app = express();
var path = require('path');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var Iamport = require('iamport');
var cheerio = require('cheerio');
var functionBase = require('./functionBase');

var cookieParser = require('cookie-parser');

var iamport = new Iamport({
  impKey: '7704069457107016',
  impSecret: '45gUkbk5VmvX3qrEcCHZERB3fpd5dEyiKPc41x9WTFTX5kBhXihCaSFpiSvvx4OhU0lVxvSraMog7Zx5'
});

var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');




//app.set('views', 'cloud/views');
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');  

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//app.use(express.cookieParser("ssamkyu"));
app.use(cookieParser("ssamkyu"));
//app.use(parseExpressCookieSession({ cookie: { maxAge: 36000000 } }));


//pc app uri

app.get('/login', function(req, res) {
    // Renders the login form asking for username and password.
    
    var currentUser = Parse.User.current();
    
    console.log(currentUser);
    
    if(currentUser == null){
        
        res.render('login.ejs');
        
    } else {
        
        res.redirect('/manage');
        
    }
    
});


app.post("/login/excute", function(req,res){
    
    console.log(req.body)
    
    var email = req.body.email;
    var password = req.body.password;
    
    console.log(email);
    console.log(password);
    
    Parse.User.logIn(email, password, {
      
        success: function(user) {
        
            // Do stuff after successful login.
            var successData = {
                user:user,
                msg:"success"
                
            }
            
            res.send(successData);
      
        },
      
        error: function(user, error) {
        
            // The login failed. Check error to see why.
            var errorData = {
                user:user,
                error:error,
                msg:"error"
                
            }
            
            res.send(errorData);
            
        }
    
    });
    
    
})



app.get('/manage', function(req, res) { 

    //res.render('admin', { message: 'Congrats, you just set up your app!' });
    
    var currentUser = Parse.User.current();
    
    if(currentUser != null){

        res.render('manage', { message: 'Congrats, you just set up your app!' });
        
        
    } else {
        
        res.redirect('/login');        
        
    }


})



//mobile app uri

var SUCCESS = 1;
var INVALID_HASH_KEY = 1100;
var DUPLICATE_TRANSACTION = 3100;
var INVALID_USER_KEY = 3200;
var UNDEFINED_ERROR = 4000;
var PROTOCOL_ERROR = 9000;
var PROTOCOL_INVALID_DATA_TYPE = 9100;


var SUCCESS_MESSAGE = "success";
var INVALID_HASH_KEY_MESSAGE = "invalid hash key";
var DUPLICATE_TRANSACTION_MESSAGE = "duplicate transaction";
var INVALID_USER_KEY_MESSAGE = "invalid user key";
var PROTOCOL_ERROR_MESSAGE = "protocol error";
var PROTOCOL_INVALID_DATA_TYPE_MESSAGE = "protocol invalid data type";


app.get('/hello-advanced', function (req, res){

    var uid = req.query.imp_uid;
    var merchant = req.query.merchant_uid;
    var amount = req.query.amount;
    
    
    iamport.payment.getByImpUid({
        
        imp_uid: uid  
    
    }).then(function(result){
      // To do
        console.info(1);
        console.info(result["amount"]);
        console.info(result["buyer_name"]);
        console.info(result["buyer_email"]);
        console.info(result["imp_uid"]);
        console.info(result["status"]);
        console.info(result["merchant_uid"])
        
        
        if( result["status"] == "paid" && Number(amount) == Number(result["amount"]) ){
            
            res.send("payment success");
            
        } else if( result["status"] == "ready" && result["pay_method"] == "vbank" ){
            
            res.send("vurtual bank success");
            
        } else {
            
            res.send("fail");
            
        }
        
        
    }).catch(function(error){
      // handle error
        console.info(2);
        console.info(error);
        res.send("error");
        
    });

});

app.get('/iamport', function (req, res){
    
    data = {"url":"url", "topMargin":"margin"}

	res.render("iamport", data);

});

app.get('/payments/complete/success', function (req, res){
    
	res.send("success");

});

app.get('/payments/complete/fail', function (req, res){
    
    res.send("fail");

});

app.get('/payments/fail', function (req, res){
    
    res.send("fail");

});

app.get('/payments/complete', function (req, res){
    
    console.info("payments init");
    var uid = req.query.imp_uid;
    var merchant = req.query.merchant_uid;
    var amount = req.query.amount;
    
    iamport.payment.getByImpUid({
        
        imp_uid: uid  
    
    }).then(function(result){
      // To do
        console.info(1);
        console.info(result["amount"]);
        console.info(result["buyer_name"]);
        console.info(result["buyer_email"]);
        console.info(result["imp_uid"]);
        console.info(result["status"]);
        console.info(result["merchant_uid"])
        console.info(result["pay_method"])
        
        if( result["status"] == "paid" && Number(amount) == Number(result["amount"]) ){
            
            var updatePoint = Number(result["amount"]) * 0.1;
            var userObId = result["buyer_name"];
            console.info(userObId);
            
            var userQuery = new Parse.Query(Parse.User);
            userQuery.get(userObId, {
                
                success:function(currentUserOb){
                    
                    var PointObject = Parse.Object.extend("Point");
                    var pointQuery = new Parse.Query(PointObject);
                    pointQuery.equalTo("user", currentUserOb);
                    pointQuery.first({
                        success:function(pointOb){
                            
                            var PointManager = Parse.Object.extend("PointManager");
                            var pointMOb = new PointManager();
                            pointMOb.set("user", currentUserOb);
                            pointMOb.set("type", "paid");
                            pointMOb.set("from", "purchase");
                            pointMOb.set("imp_uid", result["imp_uid"])
                            pointMOb.set("merchant_uid", result["merchant_uid"])
                            pointMOb.set("amount", updatePoint);
                            pointMOb.set("status", true);
                            pointMOb.set("point", pointOb);
                            pointMOb.set("pay_method", result["pay_method"]);
                            pointMOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){
                                
                                pointOb.increment("current_point", updatePoint);
                                pointOb.increment("total_point", updatePoint);
                                pointOb.increment("current_purchase_point", updatePoint);
                                pointOb.increment("total_purchase_point", updatePoint);
                                pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){
                                    
                                    var currentTime = new Date();

                                    currentUserOb.increment("current_point", updatePoint);
                                    currentUserOb.increment("total_point", updatePoint);
                                    currentUserOb.save(null, { useMasterKey: true }).then(function(){

                                        res.redirect('/payments/complete/success');
                                        //res.send("payment success");

                                    }, function(error){

                                        var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
                                        var paymentFailRecordOb = new PaymentFailRecord();
                                        paymentFailRecordOb.set("user", currentUserOb);
                                        paymentFailRecordOb.set("userId", userObId);
                                        paymentFailRecordOb.set("stage", 4);
                                        paymentFailRecordOb.set("msg", "payment success but currentUserOb save fail");
                                        paymentFailRecordOb.set("status", true);
                                        paymentFailRecordOb.save();
                                        
                                        res.redirect('/payments/complete/fail');
                                        //res.send("payment success but currentUserOb save fail");

                                    })
                                    
                                }, function(error){
                                    
                                    var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
                                    var paymentFailRecordOb = new PaymentFailRecord();
                                    paymentFailRecordOb.set("user", currentUserOb);
                                    paymentFailRecordOb.set("userId", userObId);
                                    paymentFailRecordOb.set("stage", 3);
                                    paymentFailRecordOb.set("msg", "payment success but save pointOb fail");
                                    paymentFailRecordOb.set("status", true);
                                    paymentFailRecordOb.save();
                                    
                                    res.redirect('/payments/complete/fail');
                                    
                                    //res.send("payment success but save pointOb fail");
                                    
                                })
                                
                                
                            }, function(error){
                                
                                var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
                                var paymentFailRecordOb = new PaymentFailRecord();
                                paymentFailRecordOb.set("user", currentUserOb);
                                paymentFailRecordOb.set("userId", userObId);
                                paymentFailRecordOb.set("stage", 2);
                                paymentFailRecordOb.set("msg", "payment success but save pointMOb fail");
                                paymentFailRecordOb.set("status", true);
                                paymentFailRecordOb.save();
                                
                                res.redirect('/payments/complete/fail');
                                //res.send("payment success but save pointMOb fail");
                                
                            }) 
                            
                        },

                        error:function(error){

                            var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
                            var paymentFailRecordOb = new PaymentFailRecord();
                            paymentFailRecordOb.set("user", currentUserOb);
                            paymentFailRecordOb.set("userId", userObId);
                            paymentFailRecordOb.set("stage", 1);
                            paymentFailRecordOb.set("msg", "payment success but find pointOb fail");
                            paymentFailRecordOb.set("status", true);
                            paymentFailRecordOb.save();
                            
                            res.redirect('/payments/complete/fail');
                            
                            //res.send("payment success but find pointOb fail");

                        }
                    })
                    
                },
                
                error:function(error){
                    
                    var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
                    var paymentFailRecordOb = new PaymentFailRecord();
                    paymentFailRecordOb.set("user", null);
                    paymentFailRecordOb.set("userId", userObId);
                    paymentFailRecordOb.set("stage", 0);
                    paymentFailRecordOb.set("msg", "payment success but find user fail");
                    paymentFailRecordOb.set("status", true);
                    paymentFailRecordOb.save();
                    
                    res.redirect('/payments/complete/fail');
                    
                    //res.send("payment success but find user fail");
                    
                }
                
            })

            
            
        } else if( result["status"] == "ready" && result["pay_method"] == "vbank" ){
            
            res.send("virtual bank success");
            
        } else {
            
            var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
            var paymentFailRecordOb = new PaymentFailRecord();
            paymentFailRecordOb.set("user", null);
            paymentFailRecordOb.set("userId", userObId);
            paymentFailRecordOb.set("stage", -1);
            paymentFailRecordOb.set("msg", "fail");
            paymentFailRecordOb.set("status", true);
            paymentFailRecordOb.save();
            
            res.redirect('/payments/fail');
            
            //res.send("payment success but find user fail");
            
        }
        
        
    }).catch(function(error){
      // handle error
        var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
        var paymentFailRecordOb = new PaymentFailRecord();
        paymentFailRecordOb.set("user", null);
        paymentFailRecordOb.set("userId", userObId);
        paymentFailRecordOb.set("stage", -1);
        paymentFailRecordOb.set("msg", "getByImpUid fail");
        paymentFailRecordOb.set("status", true);
        paymentFailRecordOb.save();
        
        res.redirect('/payments/fail');
        
    });

});

app.get('/gifmanager', function (req, res){

	var imageId = req.query.objectid;

	console.log(imageId);

	var ImageObject = Parse.Object.extend("Image");
	var query = new Parse.Query(ImageObject);
	query.equalTo("objectId", imageId );
    query.equalTo("status", true);
	query.first({

		success:function(imageOb){

			var result = imageOb.get("image_cdn");
			var imageWidth = imageOb.get("pic_width");
			var topMargin = 0;

			data = {"url":result, "topMargin":topMargin}

			res.render("gifmanager", data);

		},

		error:function(error){

			console.log(error)
		}

	})

});

app.get('/webtoonmanager', function (req, res){

    console.info("webtoonmanager start");

	var contentId = req.query.objectid;

    var PostObject = Parse.Object.extend("ArtistPost");
    var query = new Parse.Query(PostObject);
    query.get(contentId, {
        
        success:function(postOb){
        
            var imageObs = postOb.get("image_array");
            console.info(imageObs)
            
            var dataArray = []

			for (var i=0;imageObs.length > i; i++){

				var order = imageObs[i]["order"]
				var url = imageObs[i]["url"];
				//var url = imageObs[i].get("image_cdn");
                
                console.info(order);
                console.info(url);

				var dictData = {

					"order":order,
					"url":url

				}

				dataArray.push(dictData);

			}
            
            function compare(a,b) {
              if (a.order < b.order)
                return -1;
              if (a.order > b.order)
                return 1;
              return 0;
            }

            dataArray.sort(compare);
            
            console.info(dataArray);
            
            data = { "files":dataArray }
            
            res.render("webtoonmanager", data );
            
        },
        
        error:function(error){
            
            console.info(error);
            
        }
        
    })
	
});


app.get('/webtoonviewer', function (req, res){

    var contentId = req.query.objectid;

    var data = {

        objectid:contentId

    }

    res.render("webtoonviewer", data );
    
});


app.get('/webtoonmanagerpreview', function (req, res){

	var contentId = req.query.objectid;

	
	var ImageObject = Parse.Object.extend("Image");
	var query = new Parse.Query(ImageObject);
	query.equalTo("content_id", contentId );
    query.equalTo("preview", true);
	query.ascending("order")
	query.find({

		success:function(imageObs){

			var dataArray = []

			for (var i=0;imageObs.length > i; i++){

				var order = imageObs[i].get("order");
				var url = imageObs[i].get("image").url();
				//var url = imageObs[i].get("image_cdn");

				var dictData = {

					"order":order,
					"url":url

				}

				dataArray.push(dictData);

			}


			data = { "files":dataArray }

			res.render("webtoonmanager", data);

		},

		error:function(error){

			console.log(error)
		}

	})


	

	

});

app.get('/test', function(req,res){

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

                functionBase.igaworksOpenApi();

                console.log("done");
                res.send("done");

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


    
    
})

app.get("/youtube_data", function(req,res){
    
    var url = req.query.url;
    console.info("hello node");
    console.info(url);
    
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: url,
        followRedirects: true
    }).then(function(httpResponse) {
      // success
        console.info("success");
        
        var body = httpResponse.text;
        
        var $ = cheerio.load(body);
        
        console.info($);
        
        var description = $("#eow-description").text();
        var title = $("#eow-title").text();
        console.info(description);
        console.info(title);
        
        var responseData = {
            
            title:title,
            description:description
            
        };
        
        res.send(responseData);
        
    
    },function(httpResponse) {
      // error
        console.info("error");
        console.info(httpResponse);
        console.error('Request failed with response code ' + httpResponse.status);
    
    });
    
})

app.get('/popcorn', function(req, res) {
    
	var Reward = Parse.Object.extend("Reward");
    
    var amount = req.query.quantity;
    var ad_id = req.query.campaign_key;
    var reward_key = req.query.reward_key;

    var reward = new Reward();
    reward.set("amount", req.query.quantity);
    reward.set("wall_type", "popcorn");
    reward.set("user_data", req.query.usn);
    reward.set("ad_id", req.query.campaign_key);
    reward.set("reward_key", req.query.reward_key);
 
    var result = {};
    var expected_hash = req.query.signed_value;
    var actual_hash = crypto.createHmac("md5", "b00d91cec74242cd").update(req.query.usn + req.query.reward_key + req.query.quantity + req.query.campaign_key).digest("hex");
    
    
    if (expected_hash == actual_hash) {
        
        var query = new Parse.Query(Reward);
        
        query.equalTo("reward_key", reward.get("reward_key"));
        
        query.find({
            success: function(results) {

            	if (results.length == 0) {

                	var userQuery = new Parse.Query(Parse.User);

                    userQuery.get(req.query.usn, {
                        
                        success: function(user) {

                            reward.set("user", user);                            
                            reward.save(null, {
                                
                                success: function(reward) {

                                	var PointObject = Parse.Object.extend("Point");
                                    var pointQuery = new Parse.Query(PointObject);
                                    pointQuery.equalTo("user", user);
                                    pointQuery.first({
                                        success:function(pointOb){
                                            
                                            var PointManager = Parse.Object.extend("PointManager");
                                            var pointMOb = new PointManager();
                                            pointMOb.set("user", user);
                                            pointMOb.set("type", "ad");
                                            pointMOb.set("from", "popcorn");
                                            pointMOb.set("reward", reward);
                                            pointMOb.set("amount", Number(amount));
                                            pointMOb.set("status", true);
                                            pointMOb.set("point", pointOb);
                                            pointMOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){
                                                
                                                pointOb.increment("current_point", Number(amount));
                                                pointOb.increment("total_point", Number(amount));
                                                pointOb.increment("current_ad_point", Number(amount));
                                                pointOb.increment("total_ad_point", Number(amount));
                                                pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){
                                                    
                                                    result.Result = true;
                                                    result.ResultCode = SUCCESS;
                                                    result.ResultMsg = SUCCESS_MESSAGE;
                                                    
                                                    res.send(result);
                                                    
                                                }, function(error){
                                                    
                                                    var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
                                                    var paymentFailRecordOb = new PaymentFailRecord();
                                                    paymentFailRecordOb.set("user", user);
                                                    paymentFailRecordOb.set("userId", user.id);
                                                    paymentFailRecordOb.set("stage", 3);
                                                    paymentFailRecordOb.set("msg", "pointob save fail");
                                                    paymentFailRecordOb.set("status", true);
                                                    paymentFailRecordOb.save();
                                                    
                                                    result.Result = false;
                                                    result.ResultCode = UNDEFINED_ERROR;
                                                    result.ResultMsg = "pointob save fail";
                                                    result.error = error;
                                                    res.send(result);
                                                    
                                                    //res.send("payment success but save pointOb fail");
                                                    
                                                })
                                                
                                                
                                            }, function(error){
                                                
                                                var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
                                                var paymentFailRecordOb = new PaymentFailRecord();
                                                paymentFailRecordOb.set("user", user);
                                                paymentFailRecordOb.set("userId", user.id);
                                                paymentFailRecordOb.set("stage", 2);
                                                paymentFailRecordOb.set("msg", "point manager save fail");
                                                paymentFailRecordOb.set("status", true);
                                                paymentFailRecordOb.save();
                                                
                                                result.Result = false;
                                                result.ResultCode = UNDEFINED_ERROR;
                                                result.ResultMsg = "point manager save fail";
                                                result.error = error;
                                                res.send(result);
                                                //res.send("payment success but save pointMOb fail");
                                                
                                            }) 
                                            
                                        },

                                        error:function(error){

                                            var PaymentFailRecord = Parse.Object.extend("PaymentFailRecord");
                                            var paymentFailRecordOb = new PaymentFailRecord();
                                            paymentFailRecordOb.set("user", user);
                                            paymentFailRecordOb.set("userId", user.id);
                                            paymentFailRecordOb.set("stage", 1);
                                            paymentFailRecordOb.set("msg", "find pointob fail");
                                            paymentFailRecordOb.set("status", true);
                                            paymentFailRecordOb.save();
                                            
                                            result.Result = false;
                                            result.ResultCode = UNDEFINED_ERROR;
                                            result.ResultMsg = "find pointob fail";
                                            result.error = error;
                                            res.send(result);
                                            
                                            //res.send("payment success but find pointOb fail");

                                        }
                                    })
                                    
                                    
                              
                                },
                                error:function(error){
                                    
                                    //res.setHeader("Content-Type", "application/json")
                                    //res.writeHead(200);
                                    result.Result = false;
                                    result.ResultCode = UNDEFINED_ERROR;
                                    result.ResultMsg = "reward not saved error";
                                    result.error = error;
                                    res.send(result);
                                    
                                }
                            
                            });                         
                    
                        }
                
                    });
            
                } else {
                    //res.setHeader("Content-Type", "application/json")
                    //res.writeHead(200);
                    result.Result = false;
                    result.ResultCode = DUPLICATE_TRANSACTION;
                    result.ResultMsg = DUPLICATE_TRANSACTION_MESSAGE;
                    res.send(result);
                
                }
            
            }
    
        
        });
     
    
    } else {
        //res.setHeader("Content-Type", "application/json")
        //res.writeHead(200);
        result.Result = false;
        result.ResultCode = INVALID_HASH_KEY;
        result.ResultMsg = INVALID_HASH_KEY_MESSAGE;
        res.send(result);
    
    }

});

app.get('/event/vipinvitation', function(req, res) {

    res.redirect('/event/betatest');

});


app.get('/event/betatest', function(req, res) {

    var data = {

        "result": "hello"
    }

    res.render("event_vip_invitation", data);


});

app.post('/event/counter', function(req, res) {

    console.info("/event/counter");
    
    var BetaTester = Parse.Object.extend("BetaTester");
    var btQuery = new Parse.Query(BetaTester);
    btQuery.equalTo("type", "second");
    btQuery.limit(1000);
    btQuery.find({
        
        success:function(btObs){
            
            
            if(btObs == null){

                console.info(0);
                
                var result = {

                    result:0,
                    msg:"0"

                }
                
                res.send(result)
                
            } else {

                console.info(1);
                console.info(btObs.lessThan);

                
                var countNum = btObs.length;
                var result = {

                    result:countNum,
                    msg:"0"

                }
                res.send(result)
                
            }
            
            
        },
        error:function(error){

            console.info(3);

            var result = {

                result:0,
                msg:"error"

            }

            res.send(result)
            
        }
        
    })

});

app.post("/kakaosave", function(req, res){
    
    var success = 0;
    var ip_error = 1;
    var extra_error = 2;
    var kakao_aleady = 3;

    var kakaoId = req.body.kakao;
    var ip = req.body.ip;
    var email = req.body.email;

    var BetaTester = Parse.Object.extend("BetaTester");
    var confirmQuery1 = new Parse.Query(BetaTester);
    confirmQuery1.equalTo("kakao_id", kakaoId);
    confirmQuery1.find({

        success:function(kakaoObs){

            if(kakaoObs.length == 0){

                //FirstRegister

                var confirmQuery2 = new Parse.Query(BetaTester);
                confirmQuery2.equalTo("ip", ip);
                confirmQuery2.find({

                    success:function(ipObs){


                        if(ipObs.length > 10){

                            //Same ip 10 times. deny to reg

                            var result = {

                                result:ip_error,
                                msg:"there are too much reg request at same ip. looks like abusing"

                            }

                            res.send(result)

                        } else {

                            //let's reg

                            var BetaTester2 = Parse.Object.extend("BetaTester");
                            var betaTester = new BetaTester2();

                            betaTester.set("ip", ip);
                            betaTester.set("kakao_id", kakaoId);
                            betaTester.set("email", email);
                            betaTester.set("type", "second")
                            betaTester.save(null, {

                                success:function(betaOb){

                                    var result = {

                                        result:success,
                                        msg:"reg done"

                                    }

                                    res.send(result)

                                },

                                error:function(error){

                                    var result = {

                                        result:extra_error,
                                        msg:"beta test data save fail"

                                    }

                                    res.send(result)


                                }

                            })





                        }

                    },

                    error:function(error){

                        var result = {

                            result:extra_error,
                            msg:"ip abusing check fail"

                        }

                        res.send(result)

                    }

                })




            } else {
                //aleady done
                var result = {

                    result:kakao_aleady,
                    msg:"kakao id is already reged"

                }

                res.send(result)

            }

        },
        error:function(error){

            var result = {

                result:extra_error,
                msg:"kakao id redundancy check fail"

            }

            res.send(result)


        }

    })

})

app.get('/api/ddayChecker', function(req,res){
    
    var key = req.query.key;
    var today = new Date();
    
    var ApiKey = Parse.Object.extend("ApiKey");
    var keyQuery = new Parse.Query(ApiKey);
    keyQuery.get(key,{
        
        success:function(keyOb){
            
            console.info(1);
            
            var AritstPost = Parse.Object.extend("ArtistPost");
            var postQuery = new Parse.Query(AritstPost);
            postQuery.equalTo("post_type", "patron");
            postQuery.equalTo("progress", "start");
            postQuery.equalTo("status", true);
            postQuery.lessThan("endDate", today);
            postQuery.each(function(postOb){
	   
                console.info(2);
                postOb.set("progress", "finish");
                postOb.set("finish_date", today );
                return postOb.save(null, { useMasterKey: true });

            }, { useMasterKey: true }).then(function(){

                console.info(3);
                var result = {

                    result:true,
                    msg:"status change success"

                }

                res.send(result)

            }, function(error){

                console.info(4);
                var result = {

                    result:false,
                    msg:"status change fail"

                }

                res.send(result)

            });
            
            
        },
        error:function(error){
            
            var result = {

                result:false,
                msg:"auth denied"

            }

            res.send(result)
            
        }
        
        
    })
    
    
})



app.get('/api/patron/progress/statuschange/withdraw', function(req,res){
    
    var key = req.query.key;
    var today = new Date();

    var dayOfToday = today.getDate();
    var threeDaysAgo = today.setDate(dayOfToday - 3);    

    console.info(threeDaysAgo);
    
    var ApiKey = Parse.Object.extend("ApiKey");
    var keyQuery = new Parse.Query(ApiKey);
    keyQuery.get(key,{
        
        success:function(keyOb){
            
            console.info(1);
            
            var AritstPost = Parse.Object.extend("ArtistPost");
            var postQuery = new Parse.Query(AritstPost);
            postQuery.equalTo("post_type", "patron");
            postQuery.equalTo("progress", "finish");
            postQuery.equalTo("status", true);
            postQuery.each(function(postOb){
       
                console.info(2);

                if(postOb.get("finish_date") != null){

                    if( postOb.get("finish_date") < threeDaysAgo  ){

                        postOb.set("progress", "withdraw");
                        postOb.set("withdraw_date", today);

                        return postOb.save(null, { useMasterKey: true });

                    } else {

                        return postOb.save(null, { useMasterKey: true });

                    }

                    

                } else if(postOb.get("endDate") < threeDaysAgo ){

                    postOb.set("progress", "withdraw");
                    postOb.set("withdraw_date", today);

                    return postOb.save(null, { useMasterKey: true });

                } else {

                    return postOb.save(null, { useMasterKey: true });

                }

                

            }, { useMasterKey: true }).then(function(){

                console.info(3);
                var result = {

                    result:true,
                    msg:"status change success"

                }

                res.send(result)

            }, function(error){

                console.info(4);
                var result = {

                    result:false,
                    msg:"status change fail"

                }

                res.send(result)

            });
            
            
        },
        error:function(error){
            
            var result = {

                result:false,
                msg:"auth denied"

            }

            res.send(result)
            
        }
        
        
    })

})

    
app.get('/invitation', function(req, res){

    var Invitaion = Parse.Object.extend("Invitation");//Invitaion db를 상속받는 Invitaion 선언
    var invitaionQuery = new Parse.Query(Invitaion); //선언된 Invitaion을 상속받는 쿼리문 선언

    invitaionQuery.count().then(function(count){ // 쿼리가 가운트 되는 기능

        var rankingQuery = new Parse.Query(Invitaion);  // 랭킹 출력을 위해 랭킹 쿼리에 디비 상속받는 쿼리문 생성
        rankingQuery.ascending("recommend_count");  //쿼리 오름차순 정렬
        rankingQuery.limit(20); // 20개 맥스
        rankingQuery.find().then(function(rankingObs){  // rakingobs 테이블을 find 하며,

            var result = {
                "count" : count,    //카운트 수 응답 및 치환
                "result" : true,   // 기능 돌아았다는 응답
                "ranking" : rankingObs  // 20개의 오름차순 정렬 완료된 ranking db 응답

            }

            res.render('invitation.ejs', result); //result의 치환된 값을 ejs에 응답

        }, function(error){ // find 기능이 에러 날때

            var result = {"result" : false,   //안됨
                "msg":"ranking query error",//쿼리 에러 메세지
                "error":error} // 에러라고 응답



            res.render("error.ejs", result); // ejs에 응답

        })


    }, function(error){ //카운트 오류일때

        var result = {
           "result" : false, // 안됨
            "msg":"count query error" , //에러임
            "error":error // 에러

        }

        res.render("error.ejs", result);

    })

    app.post('invitaion/search'. funtion(req, res){
        var Joinuser = req.Query.objectid; // 검색 입력값 리퀘스트로 받기

        var Invitaion2 = Parse.Object.extend("Invitation");//Invitaion db를 상속받는 Invitaion2 선언
        var searchQy = new Parse.Query(Invitaion2); //선언된 Invitaion을 상속받는 쿼리문 선언

        searchQy.equalTo("name",Joinuser); // seargQy에서 검색 입력값  Joinuser를 name에서

        searchQy.first().then(function (name) {
            var result = {
                "result": true
                "name" : name,
                "msg" : "해당 유저를 추천하셨습니다"

            }
            res.render("invitaion.ejs", result);
          },  function(error){
                var result = {
                    "result" : false,
                    "error":error,
                    "msg" : "해당 유저가 존재하지않아요" }
             res.render("error.ejs". result);  })


    app.post('invitaion/save', function (req, res) {

        var  Invitaion = Parse.Object.extend("Invitaion");
        var  invitaion = new Invitaion();

        var  name =  req.body.name, // 각각 변수에 클라이언트에서 쏴준 데이터를 치환
             email = req.body,email
             kakaoid = req.body.kakaoid
             recommnd = req.body.recommnd;

        invitaion.save({            //파라미터로 치환 받은 데이터를 객체 저장
            name : "name",
            email : "email",
            kakaoid : "kakaoid",
            recommnd : "recommnd"})
            .then(function () {
            var result = {
                "result": true,
                "msg": "저장 완료 되었습니다"}

            res.render("invitaion.ejs", result);
            }, function (error) {
            var result = {
                "result" : false,
                "msg" : "데이터 저장 실패",
                "error" : error}
        res.render("error.ejs" , result);
        })

    })






/*
* Exporting of module.exports.app is required.
* we mount it automaticaly to the Parse Server Deployment.
*/

module.exports = app