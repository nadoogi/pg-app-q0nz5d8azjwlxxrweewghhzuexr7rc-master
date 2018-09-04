/*
* Simple Cloud Code Example
*/
var functionBase = require('./functionBase');
var _ = require('underscore');



Parse.Cloud.define("uv_count", function(request, response){

    console.info("location : view_count");

    var key = request.params.key;   
    var uid = request.params.uid;
    var postId = request.params.postId;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready checked");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Post = Parse.Object.extend("ArtistPost");
            var postQuery = new Parse.Query(Post);

            postQuery.get(postId).then(function(postOb){

                var viewChecker = functionBase.duplicationCheck(postOb, "view_check", userOb.id);

                if(viewChecker){

                    postOb.addUnique("view_check", userOb.id);
                    postOb.increment("uv_count");
                    postOb.increment("pv_count");
                    postOb.save(null, {useMasterKey:true});

                    functionBase.countLogSave(userOb, postOb,"uv_count");

                    var responseDate = functionBase.successResponse("pv uv count icreased", "uv_count");
                    response.success(responseDate);

                } else {

                    postOb.increment("pv_count");
                    postOb.save(null, {useMasterKey:true});

                    functionBase.countLogSave(userOb, postOb, "uv_count");

                    var responseDate = functionBase.successResponse("pv view count icreased", "uv_count");
                    response.success(responseDate);
                    
                }

            }, function(error){

                var responseDate = functionBase.failResponse("post query fail", "uv_count"); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request", "uv_count"); 
            response.success(responseDate);

        }
        
    }, function(error){

        var responseDate = functionBase.failResponse("access denied","uv_count"); 
        response.success(responseDate);

    })

})

Parse.Cloud.define("pv_count", function(request, response){

    console.info("location : view_count");

    var uid = request.params.uid;
    var postId = request.params.postId;

    var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

    if(duplicationCheck){

        functionBase.duplicationCheckUserDataSave(userOb, uid);

        var Post = Parse.Object.extend("ArtistPost");
        var postQuery = new Parse.Query(Post);

        postQuery.get(postId).then(function(postOb){

            postOb.increment("pv_count");
            postOb.save(null, {useMasterKey:true});

            functionBase.countLogSave(null, postOb, "pv_count");

            var responseDate = functionBase.successResponse("pv view count icreased", "pv_count");
            response.success(responseDate);

        }, function(error){

            var responseDate = functionBase.failResponse("post query fail", "pv_count"); 
            response.success(responseDate);

        })

    } else {

        var responseDate = functionBase.failResponse("duplication request", "pv_count"); 
        response.success(responseDate);

    }

})



Parse.Cloud.define("ad_log_save", function(request, response){

    console.info("location : ad_log_save");

    var key = request.params.key;   
    var uid = request.params.uid;
    var postId = request.params.postId;
    var type = request.params.type;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Post = Parse.Object.extend("ArtistPost");
            var postQuery = new Parse.Query(Post);
            postQuery.include("user");
            postQuery.get(postId).then(function(postOb){

                var postUser = postOb.get("user");

                var today = new Date();
                var saveDate = new Date();
                saveDate.setHours(today.getHours() + 9);

                var yearString = saveDate.getFullYear();
                var monthString = saveDate.getMonth()+1;
                var dateString = saveDate.getDate();

                var saveMonth = "";
                var saveDate = "";

                if(monthString < 10){

                    saveMonth = "0" + monthString.toString();

                } else {

                    saveMonth = monthString.toString();

                }

                if(dateString < 10){

                    saveDate = "0" + dateString.toString();

                } else {

                    saveDate = dateString.toString();
                
                }

                var saveDateString = yearString.toString() + saveMonth + saveDate; 

                var AdLog = Parse.Object.extend("AdLog");
                var adLogQuery = new Parse.Query(AdLog);
                adLogQuery.equalTo("from", userOb);
                adLogQuery.equalTo("to", postUser);
                adLogQuery.equalTo("post", postOb);
                adLogQuery.first().then(function(foundAdLogOb){

                    if(foundAdLogOb == null){

                        var AdLog = Parse.Object.extend("AdLog");
                        var adLogOb = new AdLog();
                        adLogOb.set("from", userOb);
                        adLogOb.set("to", postUser);
                        adLogOb.set("post", postOb);
                        adLogOb.set("type", type);
                        adLogOb.set("unique", true);
                        adLogOb.set("saved", false);
                        adLogOb.set("date_string", saveDateString);
                        adLogOb.save(null, {useMasterKey:true}).then(function(adLogOb){

                            var Score = Parse.Object.extend("Score");
                            var scoreOb = new Score();
                            scoreOb.set("from", userOb);
                            scoreOb.set("to", postUser);
                            scoreOb.set("post", postOb);
                            scoreOb.set("type", "ad_log");
                            scoreOb.set("adLog", adLogOb);
                            scoreOb.set("action_type", type);
                            scoreOb.set("done", false);
                            scoreOb.save(null, {useMasterKey:true});

                            postOb.increment("ad_count");
                            postOb.save(null, {useMasterKey:true});

                            var responseDate = functionBase.successResponse("adlog save success", "ad_log_save");
                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("adlog save fail", "ad_log_save"); 
                            response.success(responseDate);

                        })

                    } else {

                        var AdLog = Parse.Object.extend("AdLog");
                        var adLogOb = new AdLog();
                        adLogOb.set("from", userOb);
                        adLogOb.set("to", postUser);
                        adLogOb.set("post", postOb);
                        adLogOb.set("type", type);
                        adLogOb.set("unique", false);
                        adLogOb.set("saved", false);
                        adLogOb.set("date_string", saveDateString);
                        adLogOb.save(null, {useMasterKey:true}).then(function(adLogOb){

                            var Score = Parse.Object.extend("Score");
                            var scoreOb = new Score();
                            scoreOb.set("from", userOb);
                            scoreOb.set("to", postUser);
                            scoreOb.set("post", postOb);
                            scoreOb.set("type", "ad_log");
                            scoreOb.set("adLog", adLogOb);
                            scoreOb.set("action_type", type);
                            scoreOb.set("done", false);
                            scoreOb.save(null, {useMasterKey:true});

                            postOb.increment("ad_count");
                            postOb.save(null, {useMasterKey:true});

                            var responseDate = functionBase.successResponse("adlog save success2", "ad_log_save");
                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("adlog save fail", "ad_log_save"); 
                            response.success(responseDate);

                        })

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("adlog unique query fail", "ad_log_save");
                    response.success(responseDate);

                })

            }, function(error){

                var responseDate = functionBase.failResponse("post query fail", "ad_log_save");
                response.success(responseDate);

            })

            
        } else {

            var responseDate = functionBase.failResponse("duplication request", "ad_log_save"); 
            response.success(responseDate);

        }

        
    }, function(error){

        var responseDate = functionBase.failResponse("access denied", "ad_log_save"); 
        response.success(responseDate);

    })

})

Parse.Cloud.define("comment_save", function(request, response){

    console.info("location : comment_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var body = request.params.body;
    var parent_id = request.params.parent_id;
    var immoticonId = request.params.immoticonId;
    var type = request.params.type;
    var lastAction = request.params.lastAction;
    var commentId = request.params.commentId;
    
    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            console.info("duplication check : done");
            functionBase.duplicationCheckUserDataSave(userOb, uid);

            if(immoticonId.length == 0){

                var Parent = Parse.Object.extend("ArtistPost");
                var parentQuery = new Parse.Query(Parent);
                parentQuery.get(parent_id).then(function(parentOb){

                    if(lastAction == "commentSave"){

                        console.info("commentSave");

                        //save data firstime
                        var Comment = Parse.Object.extend("Comment");
                        var commentOb = new Comment();

                        commentOb.set("body", body);
                        commentOb.set("user", userOb);
                        commentOb.set("parent_id", parent_id);
                        commentOb.set("parentOb", parentOb);
                        commentOb.set("like_count", 0);
                        commentOb.set("comment_count", 0);
                        commentOb.set("status", true);
                        commentOb.set("open_flag", true)
                        commentOb.set("type", type);
                        commentOb.set("lastAction", lastAction);
                        commentOb.save(null, {useMasterKey:true}).then(function(savedCommentOb){

                            console.info("commentSaved");

                            var parentRelation = parentOb.relation("comment");
                            parentOb.increment("comment_count");
                            parentOb.save(null, {useMasterKey:true}).then(function(savedParentOb){

                                console.info("parentSaved");

                                var Score = Parse.Object.extend("Score");
                                var scoreOb = new Score();
                                scoreOb.set("from", userOb);
                                scoreOb.set("to", savedParentOb.get("user"));
                                scoreOb.set("post", savedParentOb);
                                scoreOb.set("type", "post_comment");
                                scoreOb.set("done", false);
                                scoreOb.save(null, {useMasterKey:true});

                                console.info("scoreSaved");

                                var MyAlert = Parse.Object.extend("MyAlert");
                                var myAlertOb = new MyAlert();
                                myAlertOb.set("from", userOb);
                                myAlertOb.set("to", savedParentOb.get("user"));
                                myAlertOb.set("type", "comment_post");
                                myAlertOb.set("artist_post", savedParentOb);
                                myAlertOb.set("status", true);
                                myAlertOb.save(null,{ useMasterKey: true })

                                console.info("alertSaved");

                                userOb.increment("comment_count");
                                userOb.save(null, {useMasterKey:true});

                                var responseDate = functionBase.successResponse("comment save success", "comment_save");
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("post and comment relation make fail", "comment_save"); 
                                response.success(responseDate);

                            });

                        }, function(error){

                            var responseDate = functionBase.failResponse("comment save fail", "comment_save"); 
                            response.success(responseDate);

                        })

                    } else {

                        //edit
                        console.info("edit : start");

                        //save data firstime
                        var Comment = Parse.Object.extend("Comment");
                        var commentQuery = new Parse.Query(Comment);
                        commentQuery.get(commentId).then(function(commentOb){

                            console.info("comment find success");

                            commentOb.set("body", body);
                            commentOb.set("lastAction", lastAction);

                            commentOb.save(null, {useMasterKey:true}).then(function(savedCommentOb){

                                var responseDate = functionBase.successResponse("comment edit success", "comment_save");
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("comment edit fail", "comment_save"); 
                                response.success(responseDate);

                            })

                        }, function(error){

                            console.info("comment find error");
                            var responseDate = functionBase.failResponse("comment find error", "comment_save"); 
                            response.success(responseDate);

                        })
                        
                    }


                },function(error){

                    console.info("parent post find fail");
                    var responseDate = functionBase.failResponse("parent post find fail", "comment_save"); 
                    response.success(responseDate);
                    
                })


            } else {

                var PokeItem = Parse.Object.extend("PokeItem");
                var pokeItemQuery = new Parse.Query(PokeItem);
                pokeItemQuery.get(immoticonId).then(function(pokeItemOb){

                    var Parent = Parse.Object.extend("ArtistPost");
                    var parentQuery = new Parse.Query(Parent);
                    parentQuery.get(parent_id).then(function(parentOb){

                        if(lastAction == "commentSave"){

                            console.info("commentSave");

                            //save data firstime
                            var Comment = Parse.Object.extend("Comment");
                            var commentOb = new Comment();

                            commentOb.set("user", userOb);
                            commentOb.set("parent_id", parent_id);
                            commentOb.set("parentOb", parentOb);
                            commentOb.set("poke_item", pokeItemOb);
                            commentOb.set("like_count", 0);
                            commentOb.set("comment_count", 0);
                            commentOb.set("status", true);
                            commentOb.set("open_flag", true)
                            commentOb.set("type", type);
                            commentOb.set("lastAction", lastAction);
                            commentOb.save(null, {useMasterKey:true}).then(function(savedCommentOb){

                                console.info("commentSaved");

                                var parentRelation = parentOb.relation("comment");
                                parentOb.increment("comment_count");
                                parentOb.save(null, {useMasterKey:true}).then(function(savedParentOb){

                                    console.info("parentSaved");

                                    var Score = Parse.Object.extend("Score");
                                    var scoreOb = new Score();
                                    scoreOb.set("from", userOb);
                                    scoreOb.set("to", savedParentOb.get("user"));
                                    scoreOb.set("post", savedParentOb);
                                    scoreOb.set("type", "post_comment");
                                    scoreOb.set("done", false);
                                    scoreOb.save(null, {useMasterKey:true});

                                    console.info("scoreSaved");

                                    var MyAlert = Parse.Object.extend("MyAlert");
                                    var myAlertOb = new MyAlert();
                                    myAlertOb.set("from", userOb);
                                    myAlertOb.set("to", savedParentOb.get("user"));
                                    myAlertOb.set("type", "comment_post");
                                    myAlertOb.set("artist_post", savedParentOb);
                                    myAlertOb.set("status", true);
                                    myAlertOb.save(null,{ useMasterKey: true })

                                    console.info("alertSaved");

                                    userOb.increment("comment_count");
                                    userOb.save(null, {useMasterKey:true});

                                    var responseDate = functionBase.successResponse("comment save success", "comment_save");
                                    response.success(responseDate);

                                }, function(error){

                                    var responseDate = functionBase.failResponse("post and comment relation make fail", "comment_save"); 
                                    response.success(responseDate);

                                });

                            }, function(error){

                                var responseDate = functionBase.failResponse("comment save fail", "comment_save"); 
                                response.success(responseDate);

                            })

                        } else {

                            //edit
                            console.info("edit : start");

                            //save data firstime
                            var Comment = Parse.Object.extend("Comment");
                            var commentQuery = new Parse.Query(Comment);
                            commentQuery.get(commentId).then(function(commentOb){

                                console.info("comment find success");
                                commentOb.set("poke_item", pokeItemOb);
                                commentOb.set("lastAction", lastAction);
                                commentOb.save(null, {useMasterKey:true}).then(function(savedCommentOb){

                                    var responseDate = functionBase.successResponse("comment edit success", "comment_save");
                                    response.success(responseDate);

                                }, function(error){

                                    console.info("comment Save fail");
                                    var responseDate = functionBase.failResponse("comment edit fail", "comment_save"); 
                                    response.success(responseDate);

                                })

                            }, function(error){

                                console.info("comment find error");
                                var responseDate = functionBase.failResponse("comment find error", "comment_save"); 
                                response.success(responseDate);

                            })
                            
                        }

                    },function(error){

                        console.info("parent post find fail");
                        var responseDate = functionBase.failResponse("parent post find fail", "comment_save"); 
                        response.success(responseDate);
                        
                    })

                }, function(error){

                    var responseDate = functionBase.failResponse("pokeitem query fail", "comment_save"); 
                    response.success(responseDate);

                })

            }
            
        } else {

            var responseDate = functionBase.failResponse("duplication request", "comment_save"); 
            response.success(responseDate);

        }

        
    }, function(error){

        var responseDate = functionBase.failResponse("access denied", "comment_save"); 
        response.success(responseDate);

    })

})

Parse.Cloud.define("reply_save", function(request, response){

    console.info("location : comment_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var body = request.params.body;
    var parent_id = request.params.parent_id;
    var post_id = request.params.postId;
    var reply_id = request.params.replyId;
    var immoticonId = request.params.immoticonId;
    var type = request.params.type;
    var lastAction = request.params.lastAction;
    var comment_count = 0;
    var like_count = 0;
    var status = true;
    var open_flag = true;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            console.info("duplication check : done");
            functionBase.duplicationCheckUserDataSave(userOb, uid);

            if(immoticonId.length == 0){

                var Parent = Parse.Object.extend("Comment");
                var parentQuery = new Parse.Query(Parent);
                parentQuery.get(parent_id).then(function(parentOb){

                    if(lastAction == "replySave"){
                        //save data firstime
                        var Reply = Parse.Object.extend("Reply");
                        var replyOb = new Reply();

                        replyOb.set("body", body);
                        replyOb.set("user", userOb);
                        replyOb.set("parent_id", parent_id);
                        replyOb.set("parentOb", parentOb);
                        replyOb.set("post_id", post_id);
                        replyOb.set("like_count", comment_count);
                        replyOb.set("comment_count", like_count);
                        replyOb.set("status", true);
                        replyOb.set("open_flag", true)
                        replyOb.set("type", type);
                        replyOb.set("lastAction", lastAction);
                        replyOb.save(null, {useMasterKey:true}).then(function(savedReplyOb){

                            var parentRelation = parentOb.relation("reply");
                            parentOb.increment("comment_count");
                            parentOb.save(null, {useMasterKey:true}).then(function(savedParentOb){

                                var Score = Parse.Object.extend("Score");
                                var scoreOb = new Score();
                                scoreOb.set("from", userOb);
                                scoreOb.set("to", savedParentOb.get("user"));
                                scoreOb.set("comment", savedParentOb);
                                scoreOb.set("type", "comment_reply");
                                scoreOb.set("done", false);
                                scoreOb.save(null, {useMasterKey:true});

                                var MyAlert = Parse.Object.extend("MyAlert");
                                var myAlertOb = new MyAlert();
                                myAlertOb.set("from", userOb);
                                myAlertOb.set("to", savedParentOb.get("user"));
                                myAlertOb.set("type", "comment_comment");
                                myAlertOb.set("comment", savedParentOb);
                                myAlertOb.set("reply", savedReplyOb);
                                myAlertOb.set("status", true);
                                myAlertOb.save(null,{ useMasterKey: true })

                                userOb.increment("reply_count");
                                userOb.save(null, {useMasterKey:true});

                                var responseDate = functionBase.successResponse("reply save success", "reply_save");
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("comment and reply relation make fail","reply_save"); 
                                response.success(responseDate);

                            });

                        }, function(error){

                            var responseDate = functionBase.failResponse("replyOb save fail","reply_save"); 
                            response.success(responseDate);

                        })

                    } else {
                        //edit
                        console.info("edit : start");

                        var Reply = Parse.Object.extend("Reply");
                        var replyQuery = new Parse.Query(Reply);
                        replyQuery.get(reply_id).then(function(replyOb){

                            replyOb.set("body", body);
                            replyOb.set("lastAction", lastAction);

                            replyOb.save(null, {useMasterKey:true}).then(function(savedReplyOb){

                                var responseDate = functionBase.successResponse("reply edit success", "reply_save");
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("comment and reply relation make fail","reply_save"); 
                                response.success(responseDate);

                            })

                        }, function(error){

                            var responseDate = functionBase.failResponse("replyOb edit save fail","reply_save"); 
                            response.success(responseDate);

                        })
                        
                    }

                },function(error){

                    var responseDate = functionBase.failResponse("find parent fail","reply_save"); 
                    response.success(responseDate);

                })

            } else {

                var PokeItem = Parse.Object.extend("PokeItem");
                var pokeItemQuery = new Parse.Query(PokeItem);
                pokeItemQuery.get(immoticonId).then(function(pokeItemOb){

                    var Parent = Parse.Object.extend("Comment");
                    var parentQuery = new Parse.Query(Parent);
                    parentQuery.get(parent_id).then(function(parentOb){

                        if(lastAction == "replySave"){

                            //save data firstime
                            var Reply = Parse.Object.extend("Reply");
                            var replyOb = new Reply();

                            replyOb.set("body", body);
                            replyOb.set("user", userOb);
                            replyOb.set("parent_id", parent_id);
                            replyOb.set("poke_item", pokeItemOb);
                            replyOb.set("parentOb", parentOb);
                            replyOb.set("post_id", post_id);
                            replyOb.set("like_count", comment_count);
                            replyOb.set("comment_count", like_count);
                            replyOb.set("status", true);
                            replyOb.set("open_flag", true)
                            replyOb.set("type", type);
                            replyOb.set("lastAction", lastAction);
                            replyOb.save(null, {useMasterKey:true}).then(function(savedReplyOb){

                                var parentRelation = parentOb.relation("reply");
                                parentOb.increment("comment_count");
                                parentOb.save(null, {useMasterKey:true}).then(function(savedParentOb){

                                    var Score = Parse.Object.extend("Score");
                                    var scoreOb = new Score();
                                    scoreOb.set("from", userOb);
                                    scoreOb.set("to", savedParentOb.get("user"));
                                    scoreOb.set("comment", savedParentOb);
                                    scoreOb.set("type", "comment_reply");
                                    scoreOb.set("done", false);
                                    scoreOb.save(null, {useMasterKey:true});

                                    var MyAlert = Parse.Object.extend("MyAlert");
                                    var myAlertOb = new MyAlert();
                                    myAlertOb.set("from", userOb);
                                    myAlertOb.set("to", savedParentOb.get("user"));
                                    myAlertOb.set("type", "comment_comment");
                                    myAlertOb.set("comment", savedParentOb);
                                    myAlertOb.set("reply", savedReplyOb);
                                    myAlertOb.set("status", true);
                                    myAlertOb.save(null,{ useMasterKey: true })

                                    userOb.increment("reply_count");
                                    userOb.save(null, {useMasterKey:true});

                                    var responseDate = functionBase.successResponse("reply save success2", "reply_save");
                                    response.success(responseDate);

                                }, function(error){

                                    var responseDate = functionBase.failResponse("comment and reply relation make fail", "reply_save"); 
                                    response.success(responseDate);

                                });

                            }, function(error){

                                var responseDate = functionBase.failResponse("replyOb save fail", "reply_save"); 
                                response.success(responseDate);

                            })

                        } else {
                            //edit
                            console.info("edit : start");
                            var Reply = Parse.Object.extend("Reply");
                            var replyQuery = new Parse.Query(Reply);
                            replyQuery.get(reply_id).then(function(replyOb){

                                replyOb.set("poke_item", pokeItemOb);
                                replyOb.set("lastAction", lastAction);

                                replyOb.save(null, {useMasterKey:true}).then(function(savedReplyOb){

                                    var responseDate = functionBase.successResponse("reply edit success2", "reply_save");
                                    response.success(responseDate);

                                }, function(error){

                                    var responseDate = functionBase.failResponse("comment and reply relation make fail", "reply_save"); 
                                    response.success(responseDate);

                                })

                            }, function(error){

                                var responseDate = functionBase.failResponse("replyOb edit save fail", "reply_save"); 
                                response.success(responseDate);

                            })
                            
                        }

                    },function(error){

                        var responseDate = functionBase.failResponse("find parent fail","reply_save"); 
                        response.success(responseDate);

                    })

                }, function(error){

                    var responseDate = functionBase.failResponse("poke item query fail", "reply_save"); 
                    response.success(responseDate);

                })

            }
            
        } else {

            var responseDate = functionBase.failResponse("duplication request", "reply_save"); 
            response.success(responseDate);

        }
        
    }, function(error){

        var responseDate = functionBase.failResponse("access denied","reply_save"); 
        response.success(responseDate);

    })

})

Parse.Cloud.define('sms_send', function(request, response){

    var key = request.params.key;
    var uid = request.params.uid;
    var phone = request.params.phone;

    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            var SMS_SECURE = "4de9dac063770468d4431a7ec86cebfa";
            var APPNAME = "크래프토리";

            var intString1 = Math.floor(Math.random() * 10).toString();
            var intString2 = Math.floor(Math.random() * 10).toString();
            var intString3 = Math.floor(Math.random() * 10).toString();
            var intString4 = Math.floor(Math.random() * 10).toString();
            var intString5 = Math.floor(Math.random() * 10).toString();
            var intString6 = Math.floor(Math.random() * 10).toString();

            var codeNumber = intString1 + intString2 + intString3 + intString4 + intString5 + intString6;

            var sms_url = "http://api.coolsms.co.kr/sendmsg";
            var from = "01099707390";
            var userId = "ssamkyu";
            var password = "tkdrb01"
            var msg = APPNAME + " 인증번호는 [" + codeNumber + "] 입니다";
            
            var getUrl = "http://api.coolsms.co.kr/sendmsg?user=ssamkyu&password=tkdrb01&to="+ encodeURI(phone) +"&from=01099707390&text=" + encodeURI(msg);
            
            console.info(getUrl);
            
            Parse.Cloud.httpRequest({
                
                url: getUrl,
                
                success: function(httpResponse) {
                    
                    console.info(httpResponse.text.indexOf("RESULT-MESSAGE=Success"))

                    if (httpResponse.text.indexOf("RESULT-MESSAGE=Success") != -1) {

                        userOb.set("phone_confirm_code", codeNumber);
                        userOb.addUnique("duplication_array", uid);
                        userOb.save(null, {useMasterKey:true});
                    
                        var responseDate = functionBase.successResponse("success", 'sms_send');
                        response.success(responseDate);

                    } else {

                        var responseDate = functionBase.failResponse("인증번호 발송에 오류가 있습니다 에러코드: " + httpResponse.text , 'sms_send'); 
                        response.success(responseDate);

                    }

                },

                error: function(httpResponse) {

                    console.log("SMS Code send error"+httpResponse);
                    console.error('Request failed with response code ' + httpResponse.status);
                    response.error("인증번호 발송에 오류가 있습니다. "+ httpResponse + httpResponse.status );

                }

            });  

        } else {

            var responseDate = functionBase.failResponse("duplication request", 'sms_send'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied", 'sms_send'); 
        response.success(responseDate);
    
    });

})

Parse.Cloud.define('phone_num_save', function(request, response){

    var key = request.params.key;
    var uid = request.params.uid;
    var phone = request.params.phone;

    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var existPersonalOb = userOb.get("personal");

            if(existPersonalOb == null){

                var Personal = Parse.Object.extend("Personal");

                var personalOb = new Personal();
                personalOb.set("phone", phone);
                personalOb.set("user", userOb);
                personalOb.save(null, {useMasterKey:true}).then(function(savedPersonalOb){

                    userOb.set("personal", personalOb);
                    userOb.save(null, {useMasterKey:true});

                    var responseDate = functionBase.successResponse("save phone number success", 'phone_num_save');
                    response.success(responseDate);

                }, function(error){

                    var responseDate = functionBase.failResponse("personal object svae error", 'phone_num_save'); 
                    response.success(responseDate);

                })

            } else {

                existPersonalOb.set("phone", phone);
                existPersonalOb.save(null, {useMasterKey:true}).then(function(savedPersonalOb){

                    var responseDate = functionBase.successResponse("save phone number success2", 'phone_num_save');
                    response.success(responseDate);

                }, function(error){

                    var responseDate = functionBase.failResponse("personal object svae error2", 'phone_num_save'); 
                    response.success(responseDate);

                })

            }

            

        } else {

            var responseDate = functionBase.failResponse("duplication request", 'phone_num_save'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied", 'phone_num_save'); 
        response.success(responseDate);
    
    });

})


Parse.Cloud.define('funding_join', function(request, response){

    var key = request.params.key;
    var uid = request.params.uid;
    var phone = request.params.phone;
    var toName = request.params.toName;
    var message = request.params.message;
    var patronId = request.params.patronId;
    var address_detail = request.params.address_detail;

    var item_price = request.params.item_price;
    var delivery_cost = request.params.delivery_cost;

    console.info("delivery_cost", delivery_cost);
    console.info("item_price", item_price);

    //주소
    var roadAddr = request.params.roadAddr;
    var roadAddrPart1 = request.params.roadAddrPart1;
    var roadAddrPart2 = request.params.roadAddrPart2;
    var jibunAddr = request.params.jibunAddr;
    var engAddr = request.params.engAddr;
    var zipNo = request.params.zipNo;
    //도로명 관리 번호
    var admCd = request.params.admCd;
    var rnMgtSn = request.params.rnMgtSn;
    var bdMgtSn = request.params.bdMgtSn;
    var detBdNmList = request.params.detBdNmList;
    var bdNm = request.params.bdNm;
    var bdKdcd = request.params.bdKdcd;
    var siNm = request.params.siNm;
    var sggNm = request.params.sggNm;
    var emdNm = request.params.emdNm;
    var liNm = request.params.liNm;
    var rn = request.params.rn;
    var udrtYn = request.params.udrtYn;
    var buldMnnm = request.params.buldMnnm;
    var buldSlno = request.params.buldSlno;
    var mtYn = request.params.mtYn;
    var lnbrMnnm = request.params.lnbrMnnm;
    var lnbrSlno = request.params.lnbrSlno;
    var emdNo = request.params.emdNo;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Post = Parse.Object.extend("ArtistPost");
            var postQuery = new Parse.Query(Post);
            postQuery.include("item");
            postQuery.get(patronId).then(function(patronOb){

                var amount = patronOb.get("price") + delivery_cost;
                var from = userOb.id;
                var to = patronOb.id;
                var type = "patron";

                console.info("amount", amount);
                console.info("delivery_cost", delivery_cost);
                console.info("item_price", item_price);

                var AddressBook = Parse.Object.extend("AddressBook");
                var addressQuery = new Parse.Query(AddressBook);
                addressQuery.equalTo("roadAddr", roadAddr);
                addressQuery.first().then(function(addressOb){

                    if(addressOb == null){

                        //save
                        var newAddressOb = new AddressBook();
                        newAddressOb.set("roadAddr", roadAddr);
                        newAddressOb.set("roadAddrPart1", roadAddrPart1);
                        newAddressOb.set("roadAddrPart2", roadAddrPart2);
                        newAddressOb.set("jibunAddr", jibunAddr);
                        newAddressOb.set("engAddr", engAddr);
                        newAddressOb.set("zipNo", zipNo);
                        newAddressOb.set("admCd", admCd);
                        newAddressOb.set("rnMgtSn", rnMgtSn);
                        newAddressOb.set("bdMgtSn", bdMgtSn);
                        newAddressOb.set("detBdNmList", detBdNmList);
                        newAddressOb.set("bdNm", bdNm);
                        newAddressOb.set("bdKdcd", bdKdcd);
                        newAddressOb.set("siNm", siNm);
                        newAddressOb.set("sggNm", sggNm);
                        newAddressOb.set("emdNm", emdNm);
                        newAddressOb.set("liNm", liNm);
                        newAddressOb.set("rn", rn);
                        newAddressOb.set("udrtYn", udrtYn);
                        newAddressOb.set("buldMnnm", buldMnnm);
                        newAddressOb.set("buldSlno", buldSlno);
                        newAddressOb.set("mtYn", mtYn);
                        newAddressOb.set("lnbrMnnm", lnbrMnnm);
                        newAddressOb.set("lnbrSlno", lnbrSlno);
                        newAddressOb.set("emdNo", emdNo);
                        newAddressOb.save(null, {useMasterKey:true}).then(function(savedAddressOb){

                            var FundingOrder = Parse.Object.extend("FundingOrder");
                            var fundingOrderOb = new FundingOrder();
                            fundingOrderOb.set("toName", toName);
                            fundingOrderOb.set("message", message);
                            fundingOrderOb.set("status", true);
                            fundingOrderOb.set("phone", phone);
                            fundingOrderOb.set("address", savedAddressOb);
                            fundingOrderOb.set("address_detail", address_detail);
                            fundingOrderOb.set("user", userOb);
                            fundingOrderOb.set("price", amount);
                            fundingOrderOb.set("item_price", item_price);
                            fundingOrderOb.set("delivery_cost", delivery_cost);
                            fundingOrderOb.set("patron", patronOb);
                            fundingOrderOb.set("paid", false);
                            fundingOrderOb.save(null,{useMasterKey:true}).then(function(savedOrderOb){

                                var pointFetch = userOb.get("point");
                                pointFetch.fetch({

                                    success:function(pointOb){

                                        console.info("step: 2");
                                        
                                        if(pointOb.get("current_point") >= amount ){

                                            console.info("step: 3");

                                            var decreasePointResult = functionBase.pointDecreaseCalculator(pointOb, amount);

                                            var decreasePurchaseAmount = decreasePointResult.decreasePurchaseAmount;
                                            var decreaseAdAmount = decreasePointResult.decreaseAdAmount;
                                            var decreaseCheerAmount = decreasePointResult.decreaseCheerAmount;
                                            var decreasePatronWithdrawAmount = decreasePointResult.decreasePatronWithdrawAmount;
                                            var decreaseRevenueAmount = decreasePointResult.decreaseRevenueAmount;
                                            var decreaseAdminRewardAmount = decreasePointResult.decreaseAdminRewardAmount;
                                            var decreaseRewardAmount = decreasePointResult.decreaseRewardAmount;
                                            var decreaseFreeAmount = decreasePointResult.decreaseFreeAmount;
                                            
                                            var totalDecrease = decreasePurchaseAmount + decreaseAdAmount + decreaseCheerAmount + decreasePatronWithdrawAmount + decreaseRevenueAmount + decreaseAdminRewardAmount + decreaseRewardAmount + decreaseFreeAmount;

                                            console.info("step: 4");

                                            if(amount == totalDecrease){
                                                                // pass
                                                console.info("step: 6");

                                                pointOb.increment("current_purchase_point", -decreasePurchaseAmount);
                                                console.info("step: 6.1");
                                                pointOb.increment("current_free_point", -decreaseFreeAmount);
                                                console.info("step: 6.2");
                                                pointOb.increment("current_ad_point", -decreaseAdAmount);
                                                console.info("step: 6.3");
                                                pointOb.increment("current_cheer_point", -decreaseCheerAmount);
                                                console.info("step: 6.4");
                                                pointOb.increment("current_patron_withdraw_point", -decreasePatronWithdrawAmount);
                                                console.info("step: 6.5");
                                                pointOb.increment("current_revenue_point", -decreaseRevenueAmount);
                                                console.info("step: 6.6");
                                                pointOb.increment("current_admin_reward_point", -decreaseAdminRewardAmount);
                                                console.info("step: 6.7");
                                                pointOb.increment("current_reward_point", -decreaseRewardAmount);
                                                console.info("step: 6.8");
                                                pointOb.increment("current_point", -amount);

                                                console.info("step: 6.9");
                                                
                                                pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                                                    console.info("step: 7");
                                                    var PointMObject = Parse.Object.extend("PointManager");
                                                    var pointMOb = new PointMObject();
                                                    pointMOb.set("user", userOb);
                                                    pointMOb.set("type", type);
                                                    pointMOb.set("from", from);
                                                    pointMOb.set("to", to);
                                                    pointMOb.set("status", true);
                                                    pointMOb.set("amount", amount);
                                                    pointMOb.set("free_amount", decreaseFreeAmount);
                                                    pointMOb.set("ad_amount", decreaseAdAmount);
                                                    pointMOb.set("purchase_amount", decreasePurchaseAmount);
                                                    pointMOb.set("cheer_amount", decreaseCheerAmount);
                                                    pointMOb.set("patron_withdraw_amount", decreasePatronWithdrawAmount);
                                                    pointMOb.set("revenue_amount", decreaseRevenueAmount);
                                                    pointMOb.set("admin_reward_amount", decreaseAdminRewardAmount);
                                                    pointMOb.set("reward_amount", decreaseRewardAmount);
                                                    pointMOb.set("point", pointOb);
                                                    pointMOb.save(null, { useMasterKey: true }).then(function(savedPointMOb){

                                                        console.info("step: 8");

                                                        var PatronPointManager = Parse.Object.extend("PatronPointManager");
                                                        var patronPMOb = new PatronPointManager();
                                                        patronPMOb.set("point", savedPointOb);
                                                        patronPMOb.set("point_manager", savedPointMOb);
                                                        patronPMOb.set("artist_post", patronOb);
                                                        patronPMOb.set("user", userOb);
                                                        patronPMOb.set("status", true);
                                                        patronPMOb.set("amount", amount);
                                                        patronPMOb.set("free_amount", decreaseFreeAmount);
                                                        patronPMOb.set("ad_amount", decreaseAdAmount);
                                                        patronPMOb.set("purchase_amount", decreasePurchaseAmount);
                                                        patronPMOb.set("cheer_amount", decreaseCheerAmount);
                                                        patronPMOb.set("patron_withdraw_amount", decreasePatronWithdrawAmount);
                                                        patronPMOb.set("revenue_amount", decreaseRevenueAmount);
                                                        patronPMOb.set("admin_reward_amount", decreaseAdminRewardAmount);
                                                        patronPMOb.set("reward_amount", decreaseRewardAmount);
                                                        patronPMOb.set("item_price", item_price);
                                                        patronPMOb.set("delivery_cost", delivery_cost);
                                                        patronPMOb.save(null, { useMasterKey: true }).then(function(savedPatronPMOb){

                                                            var patronPMrelation = patronOb.relation("patron_point_manager");
                                                            patronPMrelation.add(savedPatronPMOb);
                                                            patronOb.increment("achieve_amount", amount);
                                                            patronOb.increment("production_cost", item_price);
                                                            patronOb.increment("delivery_cost", delivery_cost);
                                                            patronOb.increment("patron_count");
                                                            patronOb.increment("order_count");
                                                            patronOb.addUnique("patron_array", userOb.id);

                                                            var patronRelation = patronOb.relation("order_list");
                                                            patronRelation.add(fundingOrderOb);
                                                            
                                                            patronOb.save(null, { useMasterKey: true }).then(function(savedPatronOb){

                                                                var addressRelation = userOb.relation("address_list");
                                                                addressRelation.add(savedAddressOb);

                                                                var orderRelation = userOb.relation("order_list");
                                                                orderRelation.add(savedOrderOb);

                                                                fundingOrderOb.set("paid", true);
                                                                fundingOrderOb.save(null, {useMasterKey:true});

                                                                console.info("step", "eight2");

                                                                var Score = Parse.Object.extend("Score");
                                                                var scoreOb = new Score();
                                                                scoreOb.set("from", userOb);
                                                                scoreOb.set("to", patronOb.get("user") );
                                                                scoreOb.set("post", patronOb);
                                                                scoreOb.set("type", "patron_point_send");
                                                                scoreOb.set("amount", amount);
                                                                scoreOb.set("done", false);
                                                                scoreOb.save(null, {useMasterKey:true});

                                                                var MyAlert = Parse.Object.extend("MyAlert");
                                                                var myAlertOb = new MyAlert();

                                                                myAlertOb.set("from", userOb);
                                                                myAlertOb.set("to", patronOb.get("user"));
                                                                myAlertOb.set("type", "patron");
                                                                myAlertOb.set("artist_post", patronOb);
                                                                myAlertOb.set("status", true);
                                                                myAlertOb.set("price", amount);
                                                                myAlertOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){

                                                                    var responseDate = {
                                                                        "point":savedPointOb.id,
                                                                        "pointMOb":savedPointMOb.id,
                                                                        "artistPost":patronOb.id,
                                                                        "patronPM":savedPatronPMOb.id,
                                                                        "status":true
                                                                    }

                                                                    response.success(responseDate);
                                                                    

                                                                }, function(error){

                                                                    var responseDate = functionBase.failResponse("pointMOb save fail", 'funding_join'); 
                                                                    response.success(responseDate);

                                                                });    

                                                            }, function(error){

                                                                var responseDate = functionBase.failResponse("artistpost save fail", 'funding_join'); 
                                                                response.success(responseDate);

                                                            })

                                                        })

                                                    }, function(error){

                                                        var responseDate = functionBase.failResponse("pointOb save fail", 'funding_join'); 
                                                        response.success(responseDate);

                                                    })

                                                }, function(error){

                                                    var responseDate = functionBase.failResponse("pointMg save fail", 'funding_join'); 
                                                    response.success(responseDate);
                                                    
                                                });

                                            } else {
                                                // error
                                                var responseDate = functionBase.failResponse("decrease total is not equal to price", 'funding_join'); 
                                                response.success(responseDate);

                                            }
                                                        

                                        } else {

                                            var responseDate = functionBase.failResponse("not enough point", 'funding_join'); 
                                            response.success(responseDate);
                                            
                                        }

                                    },
                                    error:function(error){

                                        var responseDate = functionBase.failResponse("point fetch fail", 'funding_join'); 
                                        response.success(responseDate);

                                    }

                                })

                            }, function(error){

                                var responseDate = functionBase.failResponse("funding order save fail 2", 'funding_join'); 
                                response.success(responseDate);

                            });

                        }, function(error){

                            var responseDate = functionBase.failResponse("new address save fail", 'funding_join'); 
                            response.success(responseDate);

                        })

                    } else {
                        //ex
                        var FundingOrder = Parse.Object.extend("FundingOrder");
                        var fundingOrderOb = new FundingOrder();
                        fundingOrderOb.set("toName", toName);
                        fundingOrderOb.set("message", message);
                        fundingOrderOb.set("status", true);
                        fundingOrderOb.set("phone", phone);
                        fundingOrderOb.set("address", addressOb);
                        fundingOrderOb.set("address_detail", address_detail);
                        fundingOrderOb.set("user", userOb);
                        fundingOrderOb.set("price", amount);
                        fundingOrderOb.set("item_price", item_price);
                        fundingOrderOb.set("delivery_cost", delivery_cost);
                        fundingOrderOb.set("patron", patronOb);
                        fundingOrderOb.set("paid", false);
                        fundingOrderOb.save(null,{useMasterKey:true}).then(function(savedOrderOb){

                            var pointFetch = userOb.get("point");
                            pointFetch.fetch({

                                success:function(pointOb){

                                    console.info("step: 2");
                                    
                                    if(pointOb.get("current_point") >= amount ){

                                        console.info("step: 3");

                                        var decreasePointResult = functionBase.pointDecreaseCalculator(pointOb, amount);

                                        var decreasePurchaseAmount = decreasePointResult.decreasePurchaseAmount;
                                        var decreaseAdAmount = decreasePointResult.decreaseAdAmount;
                                        var decreaseCheerAmount = decreasePointResult.decreaseCheerAmount;
                                        var decreasePatronWithdrawAmount = decreasePointResult.decreasePatronWithdrawAmount;
                                        var decreaseRevenueAmount = decreasePointResult.decreaseRevenueAmount;
                                        var decreaseAdminRewardAmount = decreasePointResult.decreaseAdminRewardAmount;
                                        var decreaseRewardAmount = decreasePointResult.decreaseRewardAmount;
                                        var decreaseFreeAmount = decreasePointResult.decreaseFreeAmount;
                                        
                                        var totalDecrease = decreasePurchaseAmount + decreaseAdAmount + decreaseCheerAmount + decreasePatronWithdrawAmount + decreaseRevenueAmount + decreaseAdminRewardAmount + decreaseRewardAmount + decreaseFreeAmount;

                                        console.info("step: 4");

                                        if(amount == totalDecrease){
                                                            // pass
                                            console.info("step: 6");

                                            pointOb.increment("current_purchase_point", -decreasePurchaseAmount);
                                            console.info("step: 6.1");
                                            pointOb.increment("current_free_point", -decreaseFreeAmount);
                                            console.info("step: 6.2");
                                            pointOb.increment("current_ad_point", -decreaseAdAmount);
                                            console.info("step: 6.3");
                                            pointOb.increment("current_cheer_point", -decreaseCheerAmount);
                                            console.info("step: 6.4");
                                            pointOb.increment("current_patron_withdraw_point", -decreasePatronWithdrawAmount);
                                            console.info("step: 6.5");
                                            pointOb.increment("current_revenue_point", -decreaseRevenueAmount);
                                            console.info("step: 6.6");
                                            pointOb.increment("current_admin_reward_point", -decreaseAdminRewardAmount);
                                            console.info("step: 6.7");
                                            pointOb.increment("current_reward_point", -decreaseRewardAmount);
                                            console.info("step: 6.8");
                                            pointOb.increment("current_point", -amount);
                                            console.info("step: 6.9");
                                            
                                            pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                                                console.info("step: 7");
                                                var PointMObject = Parse.Object.extend("PointManager");
                                                var pointMOb = new PointMObject();
                                                pointMOb.set("user", userOb);
                                                pointMOb.set("type", type);
                                                pointMOb.set("from", from);
                                                pointMOb.set("to", to);
                                                pointMOb.set("status", true);
                                                pointMOb.set("amount", amount);
                                                pointMOb.set("free_amount", decreaseFreeAmount);
                                                pointMOb.set("ad_amount", decreaseAdAmount);
                                                pointMOb.set("purchase_amount", decreasePurchaseAmount);
                                                pointMOb.set("cheer_amount", decreaseCheerAmount);
                                                pointMOb.set("patron_withdraw_amount", decreasePatronWithdrawAmount);
                                                pointMOb.set("revenue_amount", decreaseRevenueAmount);
                                                pointMOb.set("admin_reward_amount", decreaseAdminRewardAmount);
                                                pointMOb.set("reward_amount", decreaseRewardAmount);
                                                pointMOb.set("point", pointOb);
                                                pointMOb.save(null, { useMasterKey: true }).then(function(savedPointMOb){

                                                    console.info("step: 8");

                                                    var PatronPointManager = Parse.Object.extend("PatronPointManager");
                                                    var patronPMOb = new PatronPointManager();
                                                    patronPMOb.set("point", savedPointOb);
                                                    patronPMOb.set("point_manager", savedPointMOb);
                                                    patronPMOb.set("artist_post", patronOb);
                                                    patronPMOb.set("user", userOb);
                                                    patronPMOb.set("status", true);
                                                    patronPMOb.set("amount", amount);
                                                    patronPMOb.set("free_amount", decreaseFreeAmount);
                                                    patronPMOb.set("ad_amount", decreaseAdAmount);
                                                    patronPMOb.set("purchase_amount", decreasePurchaseAmount);
                                                    patronPMOb.set("cheer_amount", decreaseCheerAmount);
                                                    patronPMOb.set("patron_withdraw_amount", decreasePatronWithdrawAmount);
                                                    patronPMOb.set("revenue_amount", decreaseRevenueAmount);
                                                    patronPMOb.set("admin_reward_amount", decreaseAdminRewardAmount);
                                                    patronPMOb.set("reward_amount", decreaseRewardAmount);
                                                    patronPMOb.save(null, { useMasterKey: true }).then(function(savedPatronPMOb){
    
                                                        var patronPMrelation = patronOb.relation("patron_point_manager");
                                                        patronPMrelation.add(savedPatronPMOb);
                                                        patronOb.increment("achieve_amount", amount);
                                                        patronOb.increment("patron_count");
                                                        patronOb.addUnique("patron_array", userOb.id);
                                                    
                                                        patronOb.save(null, { useMasterKey: true }).then(function(savedPatronOb){

                                                            var addressRelation = userOb.relation("address_list");
                                                            addressRelation.add(addressOb);

                                                            var orderRelation = userOb.relation("order_list");
                                                            orderRelation.add(savedOrderOb);

                                                            var patronRelation = patronOb.relation("order_list");
                                                            patronRelation.add(fundingOrderOb);
                                                            patronOb.increment("order_count");
                                                            patronOb.save(null, {useMasterKey:true});

                                                            fundingOrderOb.set("paid", true);
                                                            fundingOrderOb.save(null, {useMasterKey:true});

                                                            console.info("step", "eight2");

                                                            var Score = Parse.Object.extend("Score");
                                                            var scoreOb = new Score();
                                                            scoreOb.set("from", userOb);
                                                            scoreOb.set("to", patronOb.get("user") );
                                                            scoreOb.set("post", patronOb);
                                                            scoreOb.set("type", "patron_point_send");
                                                            scoreOb.set("amount", amount);
                                                            scoreOb.set("done", false);
                                                            scoreOb.save(null, {useMasterKey:true});

                                                            var MyAlert = Parse.Object.extend("MyAlert");
                                                            var myAlertOb = new MyAlert();

                                                            myAlertOb.set("from", userOb);
                                                            myAlertOb.set("to", patronOb.get("user"));
                                                            myAlertOb.set("type", "patron");
                                                            myAlertOb.set("artist_post", patronOb);
                                                            myAlertOb.set("status", true);
                                                            myAlertOb.set("price", amount);
                                                            myAlertOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){

                                                                var responseDate = {
                                                                    "point":savedPointOb.id,
                                                                    "pointMOb":savedPointMOb.id,
                                                                    "artistPost":patronOb.id,
                                                                    "patronPM":savedPatronPMOb.id,
                                                                    "status":true
                                                                }

                                                                response.success(responseDate);

                                                            }, function(error){

                                                                var responseDate = functionBase.failResponse("pointMOb save fail", 'funding_join'); 
                                                                response.success(responseDate);

                                                            });    

                                                        }, function(error){

                                                            var responseDate = functionBase.failResponse("artistpost save fail", 'funding_join'); 
                                                            response.success(responseDate);

                                                        })

                                                    })


                                                }, function(error){

                                                    var responseDate = functionBase.failResponse("pointOb save fail", 'funding_join'); 
                                                    response.success(responseDate);

                                                })

                                            }, function(error){

                                                var responseDate = functionBase.failResponse("pointMg save fail", 'funding_join'); 
                                                response.success(responseDate);

                                            });

                                        } else {
                                            // error
                                            var responseDate = functionBase.failResponse("decrease total is not equal to price", 'funding_join'); 
                                            response.success(responseDate);

                                        }

                                    } else {

                                        var responseDate = functionBase.failResponse("not enough point", 'funding_join'); 
                                        response.success(responseDate);
                                        
                                    }

                                },
                                error:function(error){

                                    var responseDate = functionBase.failResponse("point fetch fail", 'funding_join'); 
                                    response.success(responseDate);

                                }

                            })

                        }, function(error){

                            var responseDate = functionBase.failResponse("funding order save fail 2", 'funding_join'); 
                            response.success(responseDate);

                        });

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("address query fail", 'funding_join'); 
                    response.success(responseDate);

                })

            }, function(error){

                var responseDate = functionBase.failResponse("patronOb query fail", 'funding_join'); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request",'funding_join'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'funding_join'); 
        response.success(responseDate);
    
    });

})


Parse.Cloud.define('funding_join_edit', function(request, response){

    var key = request.params.key;
    var uid = request.params.uid;
    var phone = request.params.phone;
    var toName = request.params.toName;
    var message = request.params.message;
    var patronId = request.params.patronId;
    var fundingId = request.params.fundingId;
    var item_price = request.params.item_price;
    var delivery_cost = request.params.delivery_cost;
    //주소
    var roadAddr = request.params.roadAddr;
    var roadAddrPart1 = request.params.roadAddrPart1;
    var roadAddrPart2 = request.params.roadAddrPart2;
    var jibunAddr = request.params.jibunAddr;
    var engAddr = request.params.engAddr;
    var zipNo = request.params.zipNo;
    //도로명 관리 번호
    var admCd = request.params.admCd;
    var rnMgtSn = request.params.rnMgtSn;
    var bdMgtSn = request.params.bdMgtSn;
    var detBdNmList = request.params.detBdNmList;
    var bdNm = request.params.bdNm;
    var bdKdcd = request.params.bdKdcd;
    var siNm = request.params.siNm;
    var sggNm = request.params.sggNm;
    var emdNm = request.params.emdNm;
    var liNm = request.params.liNm;
    var rn = request.params.rn;
    var udrtYn = request.params.udrtYn;
    var buldMnnm = request.params.buldMnnm;
    var buldSlno = request.params.buldSlno;
    var mtYn = request.params.mtYn;
    var lnbrMnnm = request.params.lnbrMnnm;
    var lnbrSlno = request.params.lnbrSlno;
    var emdNo = request.params.emdNo;

    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Post = Parse.Object.extend("ArtistPost");
            var postQuery = new Parse.Query(Post);
            postQuery.include("item");
            postQuery.get(patronId).then(function(patronOb){

                var amount = patronOb.get("price") + delivery_cost;
                var from = userOb.id;
                var to = patronOb.id;
                var type = "patron";

                console.info("amount", amount);
                console.info("delivery_cost", delivery_cost);
                console.info("item_price", item_price);

                var FundingOrder = Parse.Object.extend("FundingOrder");
                var orderQuery = new Parse.Query(FundingOrder);
                orderQuery.get(fundingId).then(function(fundingOrderOb){

                    var AddressBook = Parse.Object.extend("AddressBook");
                    var addressQuery = new Parse.Query(AddressBook);
                    addressQuery.equalTo("roadAddr", roadAddr);
                    addressQuery.first().then(function(addressOb){

                        if(addressOb == null){

                            //save
                            var newAddressOb = new AddressBook();
                            newAddressOb.set("roadAddr", roadAddr);
                            newAddressOb.set("roadAddrPart1", roadAddrPart1);
                            newAddressOb.set("roadAddrPart2", roadAddrPart2);
                            newAddressOb.set("jibunAddr", jibunAddr);
                            newAddressOb.set("engAddr", engAddr);
                            newAddressOb.set("zipNo", zipNo);
                            newAddressOb.set("admCd", admCd);
                            newAddressOb.set("rnMgtSn", rnMgtSn);
                            newAddressOb.set("bdMgtSn", bdMgtSn);
                            newAddressOb.set("detBdNmList", detBdNmList);
                            newAddressOb.set("bdNm", bdNm);
                            newAddressOb.set("bdKdcd", bdKdcd);
                            newAddressOb.set("siNm", siNm);
                            newAddressOb.set("sggNm", sggNm);
                            newAddressOb.set("emdNm", emdNm);
                            newAddressOb.set("liNm", liNm);
                            newAddressOb.set("rn", rn);
                            newAddressOb.set("udrtYn", udrtYn);
                            newAddressOb.set("buldMnnm", buldMnnm);
                            newAddressOb.set("buldSlno", buldSlno);
                            newAddressOb.set("mtYn", mtYn);
                            newAddressOb.set("lnbrMnnm", lnbrMnnm);
                            newAddressOb.set("lnbrSlno", lnbrSlno);
                            newAddressOb.set("emdNo", emdNo);
                            newAddressOb.save(null, {useMasterKey:true}).then(function(savedAddressOb){
                                
                                fundingOrderOb.set("toName", toName);
                                fundingOrderOb.set("message", message);
                                fundingOrderOb.set("status", true);
                                fundingOrderOb.set("phone", phone);
                                fundingOrderOb.set("address", savedAddressOb);
                                fundingOrderOb.set("address_detail", address_detail);
                                fundingOrderOb.set("user", userOb);
                                fundingOrderOb.set("price", amount);
                                fundingOrderOb.set("item_price", item_price);
                                fundingOrderOb.set("delivery_cost", delivery_cost);
                                fundingOrderOb.set("patron", patronOb);
                                fundingOrderOb.set("paid", false);
                                fundingOrderOb.save(null,{useMasterKey:true}).then(function(savedOrderOb){

                                    var addressRelation = userOb.relation("address_list");
                                    addressRelation.add(savedAddressOb);

                                    var responseDate = functionBase.successResponse("save success", 'funding_join_edit');
                                    response.success(responseDate);

                                }, function(error){

                                    var responseDate = functionBase.failResponse("funding order save fail 2", 'funding_join_edit'); 
                                    response.success(responseDate);

                                });

                            }, function(error){

                                var responseDate = functionBase.failResponse("new address save fail", 'funding_join_edit'); 
                                response.success(responseDate);

                            })

                        } else {
                            //ex
                            fundingOrderOb.set("toName", toName);
                            fundingOrderOb.set("message", message);
                            fundingOrderOb.set("status", true);
                            fundingOrderOb.set("phone", phone);
                            fundingOrderOb.set("address", addressOb);
                            fundingOrderOb.set("address_detail", address_detail);
                            fundingOrderOb.set("user", userOb);
                            fundingOrderOb.set("price", amount);
                            fundingOrderOb.set("item_price", item_price);
                            fundingOrderOb.set("delivery_cost", delivery_cost);
                            fundingOrderOb.set("patron", patronOb);
                            fundingOrderOb.set("paid", false);
                            fundingOrderOb.save(null,{useMasterKey:true}).then(function(savedOrderOb){

                                var addressRelation = userOb.relation("address_list");
                                addressRelation.add(addressOb);

                                var responseDate = functionBase.successResponse("save success2", 'funding_join_edit');
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("funding order save fail 2", 'funding_join_edit'); 
                                response.success(responseDate);

                            });

                        }

                    }, function(error){

                        var responseDate = functionBase.failResponse("address query fail", 'funding_join_edit'); 
                        response.success(responseDate);

                    })

                }, function(error){

                    var responseDate = functionBase.failResponse("fundingOrder query fail", 'funding_join_edit'); 
                    response.success(responseDate);

                })

            }, function(error){

                var responseDate = functionBase.failResponse("patronOb query fail", 'funding_join_edit'); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request", 'funding_join_edit'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied", 'funding_join_edit'); 
        response.success(responseDate);
    
    });

})


Parse.Cloud.define("subscription_count", function(request, response){

    console.info("location : subscription_count");

    var key = request.params.key;
    var uid = request.params.uid;
    var type = request.params.type;
    var serieseId = request.params.serieseId;

    Parse.User.become(key).then(function(userOb){

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Post = Parse.Object.extend("ArtistPost");
            var postQuery = new Parse.Query(Post);
            postQuery.get(serieseId).then(function(serieseOb){

                if(type){

                    serieseOb.increment("subscriber_count", -1);
                    var subsRelation = serieseOb.relation("subscribe_user");
                    subsRelation.remove(userOb);

                    serieseOb.save(null, {useMasterKey:true}).then(function(savedSerieseOb){

                        var responseDate = functionBase.successResponse("save success", "subscription_count");
                        response.success(responseDate);

                    }, function(error){

                        var responseDate = functionBase.failResponse("serieseOb save fail", 'subscription_count'); 
                        response.success(responseDate);

                    })

                } else {

                    serieseOb.increment("subscriber_count");
                    var subsRelation = serieseOb.relation("subscribe_user");
                    subsRelation.add(userOb);

                    serieseOb.save(null, {useMasterKey:true}).then(function(savedSerieseOb){
                        
                        var responseDate = functionBase.successResponse("save success2", "subscription_count");
                        response.success(responseDate);
                        
                    }, function(error){

                        var responseDate = functionBase.failResponse("serieseOb save fail2", 'subscription_count'); 
                        response.success(responseDate);

                    })

                }

            }, function(error){

                var responseDate = functionBase.failResponse("postOb query fail", 'subscription_count'); 
                response.success(responseDate);

            })
            
        } else {

            var responseDate = functionBase.failResponse("duplication request",'subscription_count'); 
            response.success(responseDate);

        }

        
    }, function(error){

        var responseDate = functionBase.failResponse("access denied",'subscription_count'); 
        response.success(responseDate);

    })

})



Parse.Cloud.define('test', function(request, response){

    var key = request.params.key;
    var uid = request.params.uid;

    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            var today = new Date();

            var dateArray = [];

            for(var i=1; 40>i ;i++){

                var yesterDay = new Date();

                yesterDay.setDate(today.getDate()-i);

                var createdDateString = functionBase.dateToStringFormat(yesterDay);

                console.info(createdDateString);

                dateArray.push(createdDateString);

            }

            var endExcution = _.after(dateArray.length, function(){

                console.info("데이터 서버에 저장");
                
                var responseDate = functionBase.successResponse("save success", "test");
                response.success(responseDate);

            })

            _.each(dateArray, function(data){

                console.info("loop start:" + data);

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

        } else {

            var responseDate = functionBase.failResponse("duplication request", 'subscription_count'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied", 'subscription_count'); 
        response.success(responseDate);
    
    });
    

})


Parse.Cloud.define('request_accept', function(request, response){

    console.info("location: request_accept");

    var socialMessageOB = request.params.socialOb;
    var requestPostOb = request.params.requestPostOb;
    var key = request.params.key;

    Parse.User.become(key).then(function(userOb){

        var ArtistPost = Parse.Object.extend("ArtistPost");
        var query = new Parse.Query(ArtistPost);

        console.info(requestPostOb);

        query.get(requestPostOb, {

            success:function(postOb){

                console.info(socialMessageOB)
                var SocialMessage = Parse.Object.extend("SocialMessage");
                var socialQuery = new Parse.Query(SocialMessage);
                socialQuery.get(socialMessageOB, {

                    success:function(socialOb){

                        postOb.set("status", true);
                        postOb.save(null, { useMasterKey: true }).then(function(savedPostOb){
                            
                            socialOb.set("progress", "accept");
                            socialOb.save(null, { useMasterKey: true }).then(function(savedSocialOb){

                                var responseDate = functionBase.successResponse("socialOb save success", 'request_accept');
                                response.success(responseDate);
                        
                            }, function(error){

                                var responseDate = functionBase.failResponse("socialOb save fail", 'request_accept'); 
                                response.success(responseDate);

                            })

                        }, function(error){

                            var responseDate = functionBase.failResponse("postOb save fail", 'request_accept'); 
                            response.success(responseDate);
                            
                        })

                    },
                    error:function(error){

                        var responseDate = functionBase.failResponse("socialQuery fail", 'request_accept'); 
                        response.success(responseDate);

                    }

                })

            },

            error:function(error){

                var responseDate = functionBase.failResponse("postQuery fail", 'request_accept'); 
                response.success(responseDate);

            }

        })

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","request_accept"); 
        response.success(responseDate);

    })

})

Parse.Cloud.define('dm_send', function (request, response){
    
    console.info("location: dm_send");

    var key = request.params.key;
    var uid = request.params.uid;
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var from = request.params.from;
    var to = request.params.to;

    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var TargetUser = Parse.Object.extend("_User");
            var targetUserQuery = new Parse.Query(TargetUser);
            targetUserQuery.get(to).then(function(targetUserOb){

                var chatRoomQuery = [userOb.id + "-" +targetUserOb.id,  targetUserOb.id + "-" + userOb.id]

                var DMList = Parse.Object.extend("DMList");
                var dmListQuery = new Parse.Query(DMList);
                dmListQuery.containedIn("room", chatRoomQuery);
                dmListQuery.first().then(function(currentListOb){

                    if(currentListOb == null){

                        var chatRoom = userOb.id + "-" + targetUserOb.id;

                        var dmListOb = new DMList();
                        dmListOb.set("from", userOb);
                        dmListOb.set("to", targetUserOb);
                        dmListOb.set("room",chatRoom);
                        dmListOb.set("status", true);
                        dmListOb.set("open_flag", true);
                        dmListOb.save(null, {useMasterKey:true}).then(function(savedDmListOb){

                            var DMChat = Parse.Object.extend("DMChat");
                            var dmChatOb = new DMChat();
                            dmChatOb.set("from", userOb);
                            dmChatOb.set("to", targetUserOb);
                            dmChatOb.set("room", savedDmListOb.get("room"));
                            dmChatOb.set("body", body);
                            dmChatOb.set("image_cdn", image_cdn);
                            dmChatOb.set("status", true);
                            dmChatOb.set("open_flag", true);
                            dmChatOb.set("dm_list", dmListOb);
                            dmChatOb.save(null, {useMasterKey:true}).then(function(savedDMChatOb){

                                console.info("step1");
                                var dmRelation = savedDmListOb.relation("dm_chat");
                                dmRelation.add(savedDMChatOb);

                                savedDmListOb.set("last_chat", savedDMChatOb);
                                savedDmListOb.increment("to_dm_count");
                                savedDmListOb.save(null,{useMasterKey:true});

                                targetUserOb.increment("dm_count");
                                targetUserOb.save(null, {useMasterKey:true});

                                var responseDate = functionBase.successResponse("chat save success", 'dm_send');
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("dmChatOb save fail","dm_send"); 
                                response.success(responseDate);

                            })

                        }, function(error){

                            var responseDate = functionBase.failResponse("dmListOb save fail","dm_send"); 
                            response.success(responseDate);

                        })

                    } else {

                        var chatRoom = currentListOb.get("room");
                        var currentListObFromUserOb = currentListOb.get("from");
                        var currentListObToUserOb = currentListOb.get("to");
                        var fromUser = true;

                        if(targetUserOb.id == currentListObFromUserOb.id){

                            fromUser = true;

                        } else {

                            fromUser = false;
                        }

                        var DMChat = Parse.Object.extend("DMChat");
                        var dmChatOb = new DMChat();
                        dmChatOb.set("from", userOb);
                        dmChatOb.set("to", targetUserOb);
                        dmChatOb.set("room", chatRoom);
                        dmChatOb.set("body", body);
                        dmChatOb.set("image_cdn", image_cdn);
                        dmChatOb.set("status", true);
                        dmChatOb.set("open_flag", true);
                        dmChatOb.set("dm_list", currentListOb);
                        dmChatOb.save(null, {useMasterKey:true}).then(function(savedDMChatOb){

                            console.info("step1");
                            var dmRelation = currentListOb.relation("dm_chat");
                            dmRelation.add(savedDMChatOb);

                            currentListOb.set("last_chat", savedDMChatOb);

                            if(fromUser){

                                currentListOb.increment("from_dm_count");
                                targetUserOb.increment("dm_count");

                            } else {

                                currentListOb.increment("to_dm_count");
                                targetUserOb.increment("dm_count");
                            }

                            currentListOb.save(null,{useMasterKey:true});
                            targetUserOb.save(null, {useMasterKey:true});

                            var responseDate = functionBase.successResponse("chat save success2", 'dm_send');
                            response.success(responseDate);
                            
                        }, function(error){

                            var responseDate = functionBase.failResponse("dmChatOb save fail2","dm_send"); 
                            response.success(responseDate);

                        })

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("dmlist query fail2","dm_send"); 
                    response.success(responseDate);

                })

            }, function(error){

                var responseDate = functionBase.failResponse("target user find fail","dm_send"); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","dm_send"); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied","dm_send"); 
        response.success(responseDate);
    
    });
    
});


Parse.Cloud.define("post_save", function(request, response){

    console.info("location : post_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var lastAction = request.params.lastAction;
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "post";
    var postId = request.params.postId;

    var adFlag = request.params.ad_flag;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            console.info("duplication check : done");
            functionBase.duplicationCheckUserDataSave(userOb, uid);

            if(lastAction == "postSave"){
                //save data firstime
                var Post = Parse.Object.extend("ArtistPost");
                var postOb = new Post();

                postOb.set("status", status);
                postOb.set("user", userOb);
                postOb.set("userId", userOb.id);
                postOb.set("comment_count", comment_count);
                postOb.set("like_count", like_count);
                postOb.set("patron_count", patron_count);
                postOb.set("post_type", post_type);
                postOb.set("tag_array", tag_array);
                postOb.set("open_date", open_date);
                postOb.set("body", body);
                postOb.set("image_cdn", image_cdn);
                postOb.set("open_flag", open_flag);
                postOb.set("image_type", image_type);
                postOb.set("search_string", search_string);
                postOb.set("follow_flag", follow_flag);
                postOb.set("ad_flag", adFlag);
                postOb.set("lastAction", lastAction);
                postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                    console.info("post save : success");

                    userOb.increment("post_count");
                    userOb.save(null, {useMasterKey:true});

                    var responseDate = functionBase.successResponse("post save success", "post_save");
                    response.success(responseDate);

                }, function(error){

                    var responseDate = functionBase.failResponse("post save fail","post_save"); 
                    response.success(responseDate);

                })


            } else {

                //edit
                console.info("edit : start");

                var Post = Parse.Object.extend("ArtistPost");
                var postQuery = new Parse.Query(Post);
                postQuery.get(postId).then(function(postOb){

                    console.info("edit : postOb found");

                    if(postOb.get("user").id == userOb.id){

                        console.info("edit : auth check success");

                        postOb.set("tag_array", tag_array);
                        postOb.set("body", body);
                        postOb.set("image_cdn", image_cdn);
                        postOb.set("open_flag", open_flag);
                        postOb.set("image_type", image_type);
                        postOb.set("search_string", search_string);
                        postOb.set("follow_flag", follow_flag);
                        postOb.set("ad_flag", adFlag);
                        postOb.set("lastAction", lastAction);
                        postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                            console.info("post save : success");

                            var responseDate = functionBase.successResponse("post save success2", "post_save");
                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("post save fail2","post_save"); 
                            response.success(responseDate);

                        })

                    } else {

                        var responseDate = functionBase.failResponse("post save auth deny","post_save"); 
                        response.success(responseDate);

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("post find fail","post_save"); 
                    response.success(responseDate);

                })

            }
            
        } else {

            var responseDate = functionBase.failResponse("duplication request","post_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","post_save"); 
        response.success(responseDate);

    })

})

Parse.Cloud.define("seriese_post_save", function(request, response){

    console.info("location : seriese_post_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var lastAction = request.params.lastAction;
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "post";

    var postId = request.params.postId;
    var parentId = request.params.parentId;

    var adFlag = request.params.ad_flag;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);
            console.info("duplication check : done");

            var Parent = Parse.Object.extend("ArtistPost");
            var parentQuery = new Parse.Query(Parent);
            parentQuery.get(parentId).then(function(parentOb){

                if(lastAction == "postSaveFromSerise"){

                    //save data firstime
                    var Post = Parse.Object.extend("ArtistPost");
                    var postOb = new Post();

                    postOb.set("status", status);
                    postOb.set("user", userOb);
                    postOb.set("userId", userOb.id);
                    postOb.set("comment_count", comment_count);
                    postOb.set("like_count", like_count);
                    postOb.set("patron_count", patron_count);
                    postOb.set("post_type", post_type);
                    postOb.set("tag_array", tag_array);
                    postOb.set("open_date", open_date);
                    postOb.set("body", body);
                    postOb.set("image_cdn", image_cdn);
                    postOb.set("open_flag", open_flag);
                    postOb.set("image_type", image_type);
                    postOb.set("search_string", search_string);
                    postOb.set("follow_flag", follow_flag);
                    postOb.set("ad_flag", adFlag);
                    postOb.set("lastAction", lastAction);
                    postOb.set("seriese_in", true);
                    postOb.set("seriese_parent", parentOb);
                    postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                        console.info("post save : success");

                        var serieseRelation = parentOb.relation("seriese_item");
                        serieseRelation.add(postOb);
                        parentOb.increment("seriese_count");
                        parentOb.save(null, {useMasterKey:true});

                        var responseDate = functionBase.successResponse("post save from seriese success", "seriese_post_save");
                        response.success(responseDate);

                    }, function(error){

                        var responseDate = functionBase.failResponse("post save fail","seriese_post_save"); 
                        response.success(responseDate);

                    })

                } else {

                    //edit
                    console.info("edit : start");

                    var Post = Parse.Object.extend("ArtistPost");
                    var postQuery = new Parse.Query(Post);
                    postQuery.get(postId).then(function(postOb){

                        console.info("edit : postOb found");

                        if(postOb.get("user").id == userOb.id){

                            console.info("edit : auth check success");

                            postOb.set("tag_array", tag_array);
                            postOb.set("body", body);
                            postOb.set("image_cdn", image_cdn);
                            postOb.set("open_flag", open_flag);
                            postOb.set("image_type", image_type);
                            postOb.set("search_string", search_string);
                            postOb.set("follow_flag", follow_flag);
                            postOb.set("ad_flag", adFlag);
                            postOb.set("lastAction", lastAction);
                            postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                                console.info("post save : success");

                                var responseDate = functionBase.successResponse("post save success", "seriese_post_save");
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("post save fail2","seriese_post_save"); 
                                response.success(responseDate);

                            })

                        } else {

                            var responseDate = functionBase.failResponse("post save auth deny","seriese_post_save"); 
                            response.success(responseDate);

                        }

                    }, function(error){

                        var responseDate = functionBase.failResponse("post find fail","seriese_post_save"); 
                        response.success(responseDate);

                    })
                    
                }

            }, function(error){

                var responseDate = functionBase.failResponse("parent find fail","seriese_post_save"); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","seriese_post_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","seriese_post_save"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("album_save", function(request, response){

    console.info("location : album_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var body = request.params.body;

    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var ad_flag = request.params.ad_flag;
    var lastAction = request.params.lastAction;
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "album";
    var postId = request.params.postId;

    var title = request.params.title;
    var image_array = request.params.image_array;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            console.info("duplication check : done");

            if(lastAction == "albumSave"){

                //save data firstime

                var Post = Parse.Object.extend("ArtistPost");
                var postOb = new Post();

                postOb.set("status", status);
                postOb.set("user", userOb);
                postOb.set("userId", userOb.id);
                postOb.set("comment_count", comment_count);
                postOb.set("like_count", like_count);
                postOb.set("patron_count", patron_count);
                postOb.set("post_type", post_type);
                postOb.set("tag_array", tag_array);
                postOb.set("open_date", open_date);
                postOb.set("body", body);
                postOb.set("image_cdn", image_cdn);
                postOb.set("open_flag", open_flag);
                postOb.set("image_type", image_type);
                postOb.set("search_string", search_string);
                postOb.set("follow_flag", follow_flag);
                postOb.set("ad_flag", ad_flag);
                postOb.set("lastAction", lastAction);
                postOb.set("title", title);
                postOb.set("image_array", image_array);
                postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                    console.info("album save : success");

                    userOb.increment("post_count");
                    userOb.save(null, {useMasterKey:true});

                    var responseDate = functionBase.successResponse("album save success", "album_save");
                    response.success(responseDate);

                }, function(error){

                    var responseDate = functionBase.failResponse("album save fail","album_save"); 
                    response.success(responseDate);

                })

            } else {

                //edit
                var Post = Parse.Object.extend("ArtistPost");
                var postQuery = new Parse.Query(Post);
                postQuery.get(postId).then(function(postOb){

                    if(postOb.get("user").id == userOb.id){

                        postOb.set("tag_array", tag_array);
                        postOb.set("body", body);
                        postOb.set("image_cdn", image_cdn);
                        postOb.set("open_flag", open_flag);
                        postOb.set("image_type", image_type);
                        postOb.set("search_string", search_string);
                        postOb.set("follow_flag", follow_flag);
                        postOb.set("ad_flag", ad_flag);
                        postOb.set("lastAction", lastAction);
                        postOb.set("title", title);
                        postOb.set("image_array", image_array);
                        postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                            console.info("album save : success");

                            var responseDate = functionBase.successResponse("album save success2", "album_save");
                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("album save fail2","album_save"); 
                            response.success(responseDate);

                        })

                    } else {

                        var responseDate = functionBase.failResponse("album save auth deny","album_save"); 
                        response.success(responseDate);

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("album find fail","album_save"); 
                    response.success(responseDate);

                })
 
            }
            
        } else {

            var responseDate = functionBase.failResponse("duplication request","album_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","album_save"); 
        response.success(responseDate);

    })

})



Parse.Cloud.define("seriese_album_save", function(request, response){

    console.info("location : album_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var body = request.params.body;

    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var lastAction = request.params.lastAction;
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "album";
    var postId = request.params.postId;

    var parentId = request.params.parentId;

    var title = request.params.title;
    var image_array = request.params.image_array;

    var adFlag = request.params.ad_flag;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            console.info("duplication check : done");

            var Parent = Parse.Object.extend("ArtistPost");
            var parentQuery = new Parse.Query(Parent);
            parentQuery.get(parentId).then(function(parentOb){

                if(lastAction == "albumSaveFromSeriese"){

                    //save data firstime

                    var Post = Parse.Object.extend("ArtistPost");
                    var postOb = new Post();

                    postOb.set("status", status);
                    postOb.set("user", userOb);
                    postOb.set("userId", userOb.id);
                    postOb.set("comment_count", comment_count);
                    postOb.set("like_count", like_count);
                    postOb.set("patron_count", patron_count);
                    postOb.set("post_type", post_type);
                    postOb.set("tag_array", tag_array);
                    postOb.set("open_date", open_date);
                    postOb.set("body", body);
                    postOb.set("image_cdn", image_cdn);
                    postOb.set("open_flag", open_flag);
                    postOb.set("image_type", image_type);
                    postOb.set("search_string", search_string);
                    postOb.set("follow_flag", follow_flag);
                    postOb.set("lastAction", lastAction);
                    postOb.set("ad_flag", adFlag);
                    postOb.set("title", title);
                    postOb.set("image_array", image_array);
                    postOb.set("seriese_in", true);
                    postOb.set("seriese_parent", parentOb);
                    postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                        console.info("album save : success");
                        var serieseRelation = parentOb.relation("seriese_item");
                        serieseRelation.add(postOb);
                        parentOb.increment("seriese_count");
                        parentOb.save(null, {useMasterKey:true});

                        var responseDate = functionBase.successResponse("album save success", "seriese_album_save");
                        response.success(responseDate);
                        
                    }, function(error){

                        var responseDate = functionBase.failResponse("album save fail","seriese_album_save"); 
                        response.success(responseDate);

                    })

                } else {

                    //edit
                    var Post = Parse.Object.extend("ArtistPost");
                    var postQuery = new Parse.Query(Post);
                    postQuery.get(postId).then(function(postOb){

                        if(postOb.get("user").id == userOb.id){

                            postOb.set("tag_array", tag_array);
                            postOb.set("body", body);
                            postOb.set("image_cdn", image_cdn);
                            postOb.set("open_flag", open_flag);
                            postOb.set("image_type", image_type);
                            postOb.set("search_string", search_string);
                            postOb.set("follow_flag", follow_flag);
                            postOb.set("ad_flag", adFlag);
                            postOb.set("lastAction", lastAction);
                            postOb.set("title", title);
                            postOb.set("image_array", image_array);
                            postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                                console.info("album save : success");

                                var responseDate = functionBase.successResponse("album save success2", "seriese_album_save");
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("album save fail2","seriese_album_save"); 
                                response.success(responseDate);

                            })

                        } else {

                            var responseDate = functionBase.failResponse("album save auth deny","seriese_album_save"); 
                            response.success(responseDate);

                        }

                    }, function(error){

                        var responseDate = functionBase.failResponse("album find fail","seriese_album_save"); 
                        response.success(responseDate);

                    })

                }

            }, function(error){

                var responseDate = functionBase.failResponse("parent query fail","seriese_album_save"); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","seriese_album_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","seriese_album_save"); 
        response.success(responseDate);

    })

})

Parse.Cloud.define("youtube_save", function(request, response){

    console.info("location : youtube_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var body = request.params.body;
    var title = request.params.title;
    var youtubeId = request.params.youtubeId;
    var image_cdn = request.params.image_cdn;
    var image_youtube = request.params.image_youtube;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var lastAction = request.params.lastAction;
    
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "youtube";

    var postId = request.params.postId;
    var adFlag = request.params.ad_flag;

    console.info("params alright");

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            console.info("duplication check : done");

            if(lastAction == "youtubeSave"){

                //save data firstime

                var Post = Parse.Object.extend("ArtistPost");
                var postOb = new Post();

                postOb.set("status", status);
                postOb.set("user", userOb);
                postOb.set("userId", userOb.id);
                postOb.set("comment_count", comment_count);
                postOb.set("like_count", like_count);
                postOb.set("patron_count", patron_count);
                postOb.set("post_type", post_type);
                postOb.set("tag_array", tag_array);
                postOb.set("open_date", open_date);
                postOb.set("body", body);
                postOb.set("title", title);
                postOb.set("youtubeId", youtubeId);

                if(image_cdn == null){

                    postOb.set("image_youtube", image_youtube);

                } else {

                    postOb.set("image_cdn", image_cdn);

                }
                
                postOb.set("open_flag", open_flag);
                postOb.set("search_string", search_string);
                postOb.set("follow_flag", follow_flag);
                postOb.set("ad_flag", adFlag);
                postOb.set("lastAction", lastAction);
                postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                    console.info("post save : success");

                    userOb.increment("post_count");
                    userOb.save(null, {useMasterKey:true});

                    var responseDate = functionBase.successResponse("post save success", "youtube_save");
                    response.success(responseDate);

                }, function(error){

                    var responseDate = functionBase.failResponse("post save fail","youtube_save"); 
                    response.success(responseDate);

                })

            } else {

                //edit
                console.info("edit : start");
                var Post = Parse.Object.extend("ArtistPost");
                var postQuery = new Parse.Query(Post);
                postQuery.get(postId).then(function(postOb){

                    console.info("edit : postOb found");

                    if(postOb.get("user").id == userOb.id){

                        console.info("edit : auth check success");

                        postOb.set("tag_array", tag_array);
                        postOb.set("body", body);
                        postOb.set("title", title);
                        postOb.set("youtubeId", youtubeId);

                        if(image_cdn == null){

                            postOb.set("image_youtube", image_youtube);

                        } else {

                            postOb.set("image_cdn", image_cdn);

                        }

                        postOb.set("open_flag", open_flag);
                        postOb.set("search_string", search_string);
                        postOb.set("follow_flag", follow_flag);
                        postOb.set("ad_flag", adFlag);
                        postOb.set("lastAction", lastAction);
                        postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                            console.info("post edit : success");

                            var responseDate = functionBase.successResponse("post save success2", "youtube_save");
                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("post save fail2","youtube_save"); 
                            response.success(responseDate);

                        })

                    } else {

                        var responseDate = functionBase.failResponse("post save auth deny","youtube_save"); 
                        response.success(responseDate);

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("post find fail","youtube_save"); 
                    response.success(responseDate);

                })

            }
            
        } else {

            var responseDate = functionBase.failResponse("duplication request","youtube_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","youtube_save"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("webtoon_save", function(request, response){

    console.info("location : webtoon_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var ad_flag = request.params.ad_flag;
    var lastAction = request.params.lastAction;
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "webtoon";
    var postId = request.params.postId;
    var title = request.params.title;
    var image_array = request.params.image_array;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            console.info("duplication check : done");
            functionBase.duplicationCheckUserDataSave(userOb, uid);

            if(lastAction == "webtoonSave"){

                //save data firstime

                var Post = Parse.Object.extend("ArtistPost");
                var postOb = new Post();

                postOb.set("status", status);
                postOb.set("user", userOb);
                postOb.set("userId", userOb.id);
                postOb.set("comment_count", comment_count);
                postOb.set("like_count", like_count);
                postOb.set("patron_count", patron_count);
                postOb.set("post_type", post_type);
                postOb.set("tag_array", tag_array);
                postOb.set("open_date", open_date);
                postOb.set("body", body);
                postOb.set("image_cdn", image_cdn);
                postOb.set("open_flag", open_flag);
                postOb.set("image_type", image_type);
                postOb.set("search_string", search_string);
                postOb.set("follow_flag", follow_flag);
                postOb.set("ad_flag", ad_flag);
                postOb.set("lastAction", lastAction);
                postOb.set("title", title);
                postOb.set("image_array", image_array);
                postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                    console.info("webtoon save : success");

                    userOb.increment("post_count");
                    userOb.save(null, {useMasterKey:true});

                    var responseDate = functionBase.successResponse("webtoon save success", "webtoon_save");
                    response.success(responseDate);

                }, function(error){

                    var responseDate = functionBase.failResponse("webtoon save fail","webtoon_save"); 
                    response.success(responseDate);

                })

            } else {

                //edit
                var Post = Parse.Object.extend("ArtistPost");
                var postQuery = new Parse.Query(Post);
                postQuery.get(postId).then(function(postOb){

                    if(postOb.get("user").id == userOb.id){

                        postOb.set("tag_array", tag_array);
                        postOb.set("body", body);
                        postOb.set("image_cdn", image_cdn);
                        postOb.set("open_flag", open_flag);
                        postOb.set("image_type", image_type);
                        postOb.set("search_string", search_string);
                        postOb.set("follow_flag", follow_flag);
                        postOb.set("lastAction", lastAction);
                        postOb.set("ad_flag", ad_flag);
                        postOb.set("title", title);
                        postOb.set("image_array", image_array);
                        postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                            console.info("webtoon save : success");

                            var responseDate = functionBase.successResponse("webtoon save success2", "webtoon_save");
                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("webtoon save fail2","webtoon_save"); 
                            response.success(responseDate);

                        })

                    } else {

                        var responseDate = functionBase.failResponse("webtoon save auth deny","webtoon_save"); 
                        response.success(responseDate);

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("webtoon find fail","webtoon_save"); 
                    response.success(responseDate);

                })

            }
            
        } else {

            var responseDate = functionBase.failResponse("duplication request","webtoon_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","webtoon_save"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("seriese_webtoon_save", function(request, response){

    console.info("location : webtoon_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var lastAction = request.params.lastAction;
    var status = true;
    var open_flag = false;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "webtoon";
    var postId = request.params.postId;
    var parentId = request.params.parentId;
    var title = request.params.title;
    var image_array = request.params.image_array;
    var adFlag = request.params.ad_flag;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            console.info("duplication check : done");
            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Parent = Parse.Object.extend("ArtistPost");
            var parentQuery = new Parse.Query(Parent);
            parentQuery.get(parentId).then(function(parentOb){

                if(lastAction == "webtoonSaveFromSerise"){

                    //save data firstime
                    var Post = Parse.Object.extend("ArtistPost");
                    var postOb = new Post();

                    postOb.set("status", status);
                    postOb.set("user", userOb);
                    postOb.set("userId", userOb.id);
                    postOb.set("comment_count", comment_count);
                    postOb.set("like_count", like_count);
                    postOb.set("patron_count", patron_count);
                    postOb.set("post_type", post_type);
                    postOb.set("tag_array", tag_array);
                    postOb.set("open_date", open_date);
                    postOb.set("body", body);
                    postOb.set("image_cdn", image_cdn);
                    postOb.set("open_flag", open_flag);
                    postOb.set("image_type", image_type);
                    postOb.set("search_string", search_string);
                    postOb.set("follow_flag", follow_flag);
                    postOb.set("ad_flag", adFlag);
                    postOb.set("lastAction", lastAction);
                    postOb.set("title", title);
                    postOb.set("image_array", image_array);
                    postOb.set("seriese_in", true);
                    postOb.set("seriese_parent", parentOb)
                    postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                        console.info("webtoon save : success");

                        var serieseRelation = parentOb.relation("seriese_item");
                        serieseRelation.add(postOb);
                        parentOb.increment("seriese_count");
                        parentOb.save(null, {useMasterKey:true});

                        var responseDate = functionBase.successResponse("webtoon save success", "seriese_webtoon_save");
                        response.success(responseDate);

                    }, function(error){

                        var responseDate = functionBase.failResponse("webtoon save fail","seriese_webtoon_save"); 
                        response.success(responseDate);

                    })

                } else {

                    //edit
                    var Post = Parse.Object.extend("ArtistPost");
                    var postQuery = new Parse.Query(Post);
                    postQuery.get(postId).then(function(postOb){

                        if(postOb.get("user").id == userOb.id){

                            postOb.set("tag_array", tag_array);
                            postOb.set("body", body);
                            postOb.set("image_cdn", image_cdn);
                            postOb.set("image_type", image_type);
                            postOb.set("search_string", search_string);
                            postOb.set("follow_flag", follow_flag);
                            postOb.set("ad_flag", adFlag);
                            postOb.set("lastAction", lastAction);
                            postOb.set("title", title);
                            postOb.set("image_array", image_array);
                            postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                                console.info("webtoon save : success");

                                var responseDate = functionBase.successResponse("webtoon save success2", "seriese_webtoon_save");
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("webtoon save fail2","seriese_webtoon_save"); 
                                response.success(responseDate);

                            })

                        } else {

                            var responseDate = functionBase.failResponse("webtoon save auth deny","seriese_webtoon_save"); 
                            response.success(responseDate);

                        }

                    }, function(error){

                        var responseDate = functionBase.failResponse("webtoon find fail","seriese_webtoon_save"); 
                        response.success(responseDate);

                    })

                }

            }, function(error){

                var responseDate = functionBase.failResponse("parent query fail","seriese_webtoon_save"); 
                response.success(responseDate);

            })
            
        } else {

            var responseDate = functionBase.failResponse("duplication request","seriese_webtoon_save"); 
            response.success(responseDate);

        }
        
    }, function(error){

        var responseDate = functionBase.failResponse("access denied","seriese_webtoon_save"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("seriese_save", function(request, response){

    console.info("location : seriese_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var title = request.params.title;
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var lastAction = request.params.lastAction;
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "seriese";
    var postId = request.params.postId;
    var seriese_count = 0;
    var content_type = request.params.content_type;
    var open_type = request.params.open_type;
    var level = request.params.level;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            console.info("duplication check : done");
            functionBase.duplicationCheckUserDataSave(userOb, uid);

            if(lastAction == "serieseSave"){

                //save data firstime
                var Post = Parse.Object.extend("ArtistPost");
                var postOb = new Post();

                postOb.set("status", status);
                postOb.set("user", userOb);
                postOb.set("userId", userOb.id);
                postOb.set("comment_count", comment_count);
                postOb.set("like_count", like_count);
                postOb.set("patron_count", patron_count);
                postOb.set("post_type", post_type);
                postOb.set("tag_array", tag_array);
                postOb.set("open_date", open_date);
                postOb.set("body", body);
                postOb.set("image_cdn", image_cdn);
                postOb.set("open_flag", open_flag);
                postOb.set("image_type", image_type);
                postOb.set("search_string", search_string);
                postOb.set("follow_flag", follow_flag);
                postOb.set("lastAction", lastAction);
                postOb.set("seriese_count", 0);
                postOb.set("content_type", content_type);
                postOb.set("open_type", open_type);
                postOb.set("level", level);
                postOb.set("title", title);
                postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                    console.info("post save : success");

                    userOb.increment("seriese_count");
                    userOb.save(null, {useMasterKey:true});

                    var responseDate = functionBase.successResponse("post save success", "seriese_save");
                    response.success(responseDate);

                }, function(error){

                    var responseDate = functionBase.failResponse("post save fail","seriese_save"); 
                    response.success(responseDate);

                })

            } else {

                //edit
                console.info("edit : start");
                var Post = Parse.Object.extend("ArtistPost");
                var postQuery = new Parse.Query(Post);
                postQuery.get(postId).then(function(postOb){

                    console.info("edit : postOb found");

                    if(postOb.get("user").id == userOb.id){

                        console.info("edit : auth check success");

                        postOb.set("tag_array", tag_array);
                        postOb.set("body", body);
                        postOb.set("image_cdn", image_cdn);
                        postOb.set("open_flag", open_flag);
                        postOb.set("image_type", image_type);
                        postOb.set("search_string", search_string);
                        postOb.set("follow_flag", follow_flag);
                        postOb.set("lastAction", lastAction);
                        postOb.set("content_type", content_type);
                        postOb.set("open_type", open_type);
                        postOb.set("level", level);
                        postOb.set("title", title);
                        postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                            console.info("post save : success");

                            var responseDate = functionBase.successResponse("post save success2", "seriese_save");
                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("post save fail2","seriese_save"); 
                            response.success(responseDate);

                        })

                    } else {

                        var responseDate = functionBase.failResponse("post save auth deny","seriese_save"); 
                        response.success(responseDate);

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("post find fail","seriese_save"); 
                    response.success(responseDate);

                })

            }

        } else {

            var responseDate = functionBase.failResponse("duplication request","seriese_save"); 
            response.success(responseDate);

        }
        
    }, function(error){

        var responseDate = functionBase.failResponse("access denied","seriese_save"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("patron_save", function(request, response){

    console.info("location : patron_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var title = request.params.title;
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var follow_flag = request.params.follow_flag;
    var lastAction = request.params.lastAction;
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;
    var post_type = "patron";
    var postId = request.params.postId;
    var reuqest_type = "patronRequest";
    var endDate = request.params.endDate;
    var content_type = request.params.content_type;
    var target_amount = request.params.target_amount;
    var progress = request.params.progress;
    var patron_flag = request.params.patron_flag;
    var min_box = request.params.min_box;
    var reward_detail_info = request.params.reward_detail_info;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            console.info("duplication check : done");
            functionBase.duplicationCheckUserDataSave(userOb, uid);

            if(lastAction == "patronSave"){

                //save data firstime
                var Post = Parse.Object.extend("ArtistPost");
                var postOb = new Post();

                postOb.set("status", status);
                postOb.set("user", userOb);
                postOb.set("userId", userOb.id);
                postOb.set("comment_count", comment_count);
                postOb.set("like_count", like_count);
                postOb.set("patron_count", patron_count);
                postOb.set("post_type", post_type);
                postOb.set("tag_array", tag_array);
                postOb.set("open_date", open_date);
                postOb.set("body", body);
                postOb.set("image_cdn", image_cdn);
                postOb.set("open_flag", open_flag);
                postOb.set("image_type", image_type);
                postOb.set("search_string", search_string);
                postOb.set("follow_flag", follow_flag);
                postOb.set("lastAction", lastAction);
                postOb.set("title", title);
                postOb.set("content_type", content_type);
                postOb.set("reuqest_type", reuqest_type);
                postOb.set("endDate", endDate);
                postOb.set("target_amount", target_amount);
                postOb.set("progress", progress);
                postOb.set("patron_flag", patron_flag);
                postOb.set("min_box", min_box);
                postOb.set("reward_detail_info", reward_detail_info);
                postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                    console.info("post save : success");

                    userOb.increment("patron_count");
                    userOb.save(null, {useMasterKey:true});

                    var responseDate = functionBase.successResponse("post save success", "patron_save");
                    response.success(responseDate);

                }, function(error){

                    var responseDate = functionBase.failResponse("post save fail","patron_save"); 
                    response.success(responseDate);

                })


            } else {

                //edit
                console.info("edit : start");

                var Post = Parse.Object.extend("ArtistPost");
                var postQuery = new Parse.Query(Post);
                postQuery.get(postId).then(function(postOb){

                    console.info("edit : postOb found");

                    if(postOb.get("user").id == userOb.id){

                        console.info("edit : auth check success");
                        postOb.set("tag_array", tag_array);
                        postOb.set("body", body);
                        postOb.set("image_cdn", image_cdn);
                        postOb.set("open_flag", open_flag);
                        postOb.set("image_type", image_type);
                        postOb.set("search_string", search_string);
                        postOb.set("follow_flag", follow_flag);
                        postOb.set("lastAction", lastAction);
                        postOb.set("title", title);
                        postOb.set("content_type", content_type);
                        postOb.set("reuqest_type", reuqest_type);
                        postOb.set("endDate", endDate);
                        postOb.set("target_amount", target_amount);
                        postOb.set("progress", progress);
                        postOb.set("patron_flag", patron_flag);
                        postOb.set("min_box", min_box);
                        postOb.set("reward_detail_info", reward_detail_info);
                        postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                            console.info("post save : success");
                            var responseDate = functionBase.successResponse("post save success2", "patron_save");
                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("post save fail2","patron_save"); 
                            response.success(responseDate);

                        })

                    } else {

                        var responseDate = functionBase.failResponse("post save auth deny","patron_save"); 
                        response.success(responseDate);

                    }

                }, function(error){

                    var responseDate = functionBase.failResponse("post find fail","patron_save"); 
                    response.success(responseDate);

                })

            }
            
        } else {

            var responseDate = functionBase.failResponse("duplication request","patron_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","patron_save"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("goods_funding_save", function(request, response){

    console.info("location : good_funding_save");

    var key = request.params.key;
    var uid = request.params.uid;
    var tag_array = request.params.tag_array;
    var open_date = new Date();
    var title = request.params.title;
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;

    var item = request.params.item;

    var search_string = request.params.search_string;
    var lastAction = request.params.lastAction;
    var content_type = request.params.content_type;
    var endDate = request.params.endDate;
    
    var status = true;
    var open_flag = true;
    var comment_count = 0;
    var like_count = 0;
    var patron_count = 0;

    var post_type = "patron";
    var postId = request.params.postId;

    
    var reuqest_type = "patronRequest";
    
    var target_amount = request.params.target_amount;
    var price = request.params.price;
    var progress = request.params.progress;
    

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var FundingMarketItem = Parse.Object.extend("FundingMarketItem");
            var itemQuery = new Parse.Query(FundingMarketItem);
            itemQuery.get(item).then(function(itemOb){

                if(lastAction == "patronSave"){

                    //save data firstime
                    var Post = Parse.Object.extend("ArtistPost");
                    var postOb = new Post();

                    postOb.set("status", status);
                    postOb.set("user", userOb);
                    postOb.set("userId", userOb.id);
                    postOb.set("comment_count", comment_count);
                    postOb.set("like_count", like_count);
                    postOb.set("patron_count", patron_count);
                    postOb.set("post_type", post_type);
                    postOb.set("tag_array", tag_array);
                    postOb.set("open_date", open_date);
                    postOb.set("body", body);
                    postOb.set("image_cdn", image_cdn);
                    postOb.set("open_flag", open_flag);
                    postOb.set("status", true);
                    postOb.set("image_type", image_type);
                    postOb.set("search_string", search_string);
                    postOb.set("lastAction", lastAction);
                    postOb.set("item", itemOb);
                    postOb.set("price", price);
                    postOb.set("title", title);
                    postOb.set("content_type", content_type);
                    postOb.set("endDate", endDate);
                    postOb.set("target_amount", target_amount);
                    postOb.set("progress", progress);
                    postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                        console.info("post save : success");

                        userOb.increment("patron_count");
                        userOb.save(null, {useMasterKey:true});

                        var responseDate = functionBase.successResponse("post save success", "goods_funding_save");
                        response.success(responseDate);

                    }, function(error){

                        var responseDate = functionBase.failResponse("post save fail","goods_funding_save"); 
                        response.success(responseDate);
                        
                    })

                } else {

                    //edit
                    console.info("edit : start");
                    var Post = Parse.Object.extend("ArtistPost");
                    var postQuery = new Parse.Query(Post);
                    postQuery.get(postId).then(function(postOb){

                        console.info("edit : postOb found");

                        if(postOb.get("user").id == userOb.id){

                            console.info("edit : auth check success");

                            postOb.set("tag_array", tag_array);
                            postOb.set("body", body);
                            postOb.set("post_type", post_type);
                            postOb.set("image_cdn", image_cdn);
                            postOb.set("open_flag", open_flag);
                            postOb.set("status", true);
                            postOb.set("image_type", image_type);
                            postOb.set("search_string", search_string);
                            postOb.set("lastAction", lastAction);
                            postOb.set("item", itemOb);
                            postOb.set("price", price);
                            postOb.set("title", title);
                            postOb.set("content_type", content_type);
                            postOb.set("endDate", endDate);
                            postOb.set("target_amount", target_amount);
                            postOb.set("progress", progress);    
                            postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                                console.info("post save : success");

                                var responseDate = functionBase.successResponse("post save success2", "goods_funding_save");
                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("post save fail2","goods_funding_save"); 
                                response.success(responseDate);

                            })

                        } else {

                            var responseDate = functionBase.failResponse("post save auth deny","goods_funding_save"); 
                            response.success(responseDate);

                        }

                    }, function(error){

                        var responseDate = functionBase.failResponse("post find fail","goods_funding_save"); 
                        response.success(responseDate);
                    
                    })

                }

            },function(error){

                var responseDate = functionBase.failResponse("item query fail","goods_funding_save"); 
                response.success(responseDate);

            })
            
        } else {

            var responseDate = functionBase.failResponse("duplication request","goods_funding_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","goods_funding_save"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("goods_funding_premake", function(request, response){

    console.info("location : good_funding_save");

    var key = request.params.key;
    var uid = request.params.uid;

    Parse.User.become(key).then(function(userOb){

        console.info("duplication check : ready");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            console.info("duplication check : done");
            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Post = Parse.Object.extend("ArtistPost");
            var postOb = new Post();

            postOb.set("status", false);
            postOb.set("user", userOb);
            postOb.set("userId", userOb.id);
            
            postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                console.info("post save : success");

                var responseDate = functionBase.successResponse("post save success", "goods_funding_premake");
                response.success(responseDate);

            }, function(error){

                var responseDate = functionBase.failResponse("post save fail","goods_funding_premake"); 
                response.success(responseDate);

            })
            
        } else {

            var responseDate = functionBase.failResponse("duplication request","goods_funding_premake"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","goods_funding_premake"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("poke_image_save", function(request, response){

    var key = request.params.key;
    var uid = request.params.uid;
    var body = request.params.body;
    var image_cdn = request.params.image_cdn;
    var image_type = request.params.image_type;
    var search_string = request.params.search_string;
    var tag_array = request.params.tag_array;
    var title = request.params.title;

    Parse.User.become(key).then(function(userOb){
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var PokeItem = Parse.Object.extend("PokeItem");
            var pokeItemOb = new PokeItem();
            pokeItemOb.set("image_cdn", image_cdn);
            pokeItemOb.set("title", title);
            pokeItemOb.set("type", "custom");
            pokeItemOb.set("action", body);
            pokeItemOb.set("status", true);
            pokeItemOb.set("user", userOb);
            pokeItemOb.set("tag_array", tag_array);
            pokeItemOb.set("userId", userOb.id);

            pokeItemOb.save(null, {useMasterKey:true}).then(function(savedPokeItemOb){

                var responseDate = functionBase.successResponse("poke item save", "poke_image_save");
                response.success(responseDate);

            }, function(error){

                var responseDate = functionBase.failResponse("poke item save fail","poke_image_save"); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","poke_image_save"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","poke_image_save"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("installation_data_check", function(request, response){

    var key = request.params.key;
    var uid = request.params.uid;

    Parse.User.become(key).then(function(userOb){

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Installation = Parse.Object.extend("_Installation");
            var installtionQuery = new Parse.Query(Installation);
            installtionQuery.equalTo("user", userOb);
            installtionQuery.find({useMasterKey:true}).then(function(installationObs){

                for(var i=0;installationObs.length>i;i++){

                    installationObs[i].unset("user");
                    installationObs[i].unset("userId");
                    installationObs[i].save(null,{useMasterKey:true});

                }

                var responseDate = functionBase.successResponse("device save data delete", "installation_data_check");
                response.success(responseDate);

            },function(error){
                
                var responseDate = functionBase.failResponse("find installation fail","installation_data_check"); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","installation_data_check"); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied","installation_data_check"); 
        response.success(responseDate);

    })

})


Parse.Cloud.define("share_item", function(request, response){
    
    var key = request.params.key;
    var sharePostId = request.params.shareObId;
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var SharePost = Parse.Object.extend("ArtistPost");
            var sharePostQuery = new Parse.Query(SharePost);

            sharePostQuery.get(sharePostId).then(function(sharePostOb){

                var Post = Parse.Object.extend("ArtistPost");
                var postOb = new Post();

                postOb.set("status", true);
                postOb.set("open_flag", true);
                postOb.set("lastAction", "share");
                postOb.set("share_post", sharePostOb);
                postOb.set("user", userOb);
                postOb.set("userId",  userOb.id);
                postOb.set("comment_count", 0);
                postOb.set("like_count", 0);
                postOb.set("patron_count", 0);
                postOb.set("post_type", "share");

                postOb.save(null, {useMasterKey:true}).then(function(savedPostOb){

                    sharePostOb.addUnique("share_user", userOb.id);

                    var shareRelation = sharePostOb.relation("share_relation");
                    shareRelation.add(postOb);

                    sharePostOb.increment("share_count", 1);
                    sharePostOb.save(null, {useMasterKey:true});

                    var Score = Parse.Object.extend("Score");
                    var scoreOb = new Score();
                    scoreOb.set("from", userOb);
                    scoreOb.set("to", sharePostOb.get("user") );
                    //scoreOb.set("post", artistPostOb);
                    scoreOb.set("post", postOb);
                    scoreOb.set("share_post", sharePostOb);
                    scoreOb.set("type", "share");
                    scoreOb.set("done", false);
                    scoreOb.save(null, {useMasterKey:true});

                    var MyAlert = Parse.Object.extend("MyAlert");
                    var myAlertOb = new MyAlert();
                    myAlertOb.set("from", userOb);
                    myAlertOb.set("to", sharePostOb.get("user"));
                    myAlertOb.set("type", "share");
                    myAlertOb.set("artist_post", sharePostOb);
                    myAlertOb.set("status", true);
                    myAlertOb.save(null,{ useMasterKey: true })

                    var responseDate = functionBase.successResponse("share success", "share_item");
                    response.success(responseDate);
                    
                }, function(error){

                    var responseDate = functionBase.failResponse("post save fail","share_item"); 
                    response.success(responseDate);

                })

            }, function(error){

                var responseDate = functionBase.failResponse("share post retriese fail","share_item"); 
                response.success(responseDate);

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","share_item"); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied","share_item"); 
        response.success(responseDate);
    
    });
    
})

Parse.Cloud.define('purchase_item', function(request, response){

    console.info("location: purchase_item");

    var price = request.params.price;
    var key = request.params.key;
    var product = request.params.product;
    var uid = request.params.uid;

    Parse.User.become(key).then(function(userOb){

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Commercial = Parse.Object.extend("Commercial");
            var commercialQuery = new Parse.Query(Commercial);
            commercialQuery.include("point");
            commercialQuery.include("user");
            commercialQuery.get(product, {

                success:function(commercialOb){

                    var myPointOb = userOb.get("point");
                    var sellerOb = commercialOb.get("user");
                    myPointOb.fetch({

                        success:function(currentPointOb){

                            var currentPoint = currentPointOb.get("current_point");
                            currentPointOb.fetch({

                                success:function(fetchedCurrentPointOb){

                                    console.info(price);
                                    console.info(currentPoint);
                                    
                                    if(currentPoint >= price){
                                        //purchase
                                        console.info("purhcase_item : 1");
                                        var decreasePointResult = functionBase.pointDecreaseCalculator(fetchedCurrentPointOb, price);
                                        var decreasePurchaseAmount = decreasePointResult.decreasePurchaseAmount;
                                        var decreaseAdAmount = decreasePointResult.decreaseAdAmount;
                                        var decreaseCheerAmount = decreasePointResult.decreaseCheerAmount;
                                        var decreasePatronWithdrawAmount = decreasePointResult.decreasePatronWithdrawAmount;
                                        var decreaseRevenueAmount = decreasePointResult.decreaseRevenueAmount;
                                        var decreaseAdminRewardAmount = decreasePointResult.decreaseAdminRewardAmount;
                                        var decreaseRewardAmount = decreasePointResult.decreaseRewardAmount;
                                        var decreaseFreeAmount = decreasePointResult.decreaseFreeAmount;
                                        var totalDecrease = decreasePurchaseAmount + decreaseAdAmount + decreaseCheerAmount + decreasePatronWithdrawAmount + decreaseRevenueAmount + decreaseAdminRewardAmount + decreaseRewardAmount + decreaseFreeAmount;

                                        if(price == totalDecrease){
                                            // pass

                                            fetchedCurrentPointOb.increment("current_purchase_point", -decreasePurchaseAmount);
                                            fetchedCurrentPointOb.increment("current_free_point", -decreaseFreeAmount);
                                            fetchedCurrentPointOb.increment("current_ad_point", -decreaseAdAmount);
                                            fetchedCurrentPointOb.increment("current_cheer_point", -decreaseCheerAmount);
                                            fetchedCurrentPointOb.increment("current_patron_withdraw_point", -decreasePatronWithdrawAmount);
                                            fetchedCurrentPointOb.increment("current_revenue_point", -decreaseRevenueAmount);
                                            fetchedCurrentPointOb.increment("current_admin_reward_point", -decreaseAdminRewardAmount);
                                            fetchedCurrentPointOb.increment("current_reward_point", -decreaseRewardAmount);
                                            fetchedCurrentPointOb.increment("current_point", -price);

                                            fetchedCurrentPointOb.addUnique("purchase_array", commercialOb.id);

                                            var purchase_item = fetchedCurrentPointOb.relation("purchase_item");
                                            purchase_item.add(commercialOb);

                                            fetchedCurrentPointOb.save(null, { useMasterKey: true }).then(function(savedPointOb){

                                                console.info("purhcase_item : 2");

                                                var savedDateString = functionBase.dateToStringFormatWithoutInput();

                                                var PointMObject = Parse.Object.extend("PointManager");
                                                var pointMOb = new PointMObject();
                                                console.info("purhcase_item : 2-1");
                                                pointMOb.set("user", userOb);
                                                pointMOb.set("date_string", savedDateString);
                                                console.info("purhcase_item : 2-2");
                                                pointMOb.set("point", savedPointOb);
                                                console.info("purhcase_item : 2-3");
                                                pointMOb.set("type", "purchase");
                                                console.info("purhcase_item : 2-4");
                                                pointMOb.set("product", commercialOb);
                                                console.info("purhcase_item : 2-5");
                                                pointMOb.set("from", "purchase");
                                                console.info("purhcase_item : 2-6");
                                                pointMOb.set("to", sellerOb.id);
                                                console.info("purhcase_item : 2-7");
                                                pointMOb.set("seller", sellerOb);
                                                console.info("purhcase_item : 2-8");
                                                pointMOb.set("amount", price);
                                                console.info("purhcase_item : 2-9");
                                                pointMOb.set("free_amount", decreaseFreeAmount);
                                                console.info("purhcase_item : 2-10");
                                                pointMOb.set("ad_amount", decreaseAdAmount);
                                                console.info("purhcase_item : 2-11");
                                                pointMOb.set("purchase_amount", decreasePurchaseAmount);
                                                console.info("purhcase_item : 2-12");
                                                pointMOb.set("cheer_amount", decreaseCheerAmount);
                                                console.info("purhcase_item : 2-13");
                                                pointMOb.set("patron_withdraw_amount", decreasePatronWithdrawAmount);
                                                console.info("purhcase_item : 2-14");
                                                pointMOb.set("revenue_amount", decreaseRevenueAmount);
                                                console.info("purhcase_item : 2-15");
                                                pointMOb.set("admin_reward_amount", decreaseAdminRewardAmount);
                                                console.info("purhcase_item : 2-16");
                                                pointMOb.set("reward_amount", decreaseRewardAmount);
                                                console.info("purhcase_item : 2-17");
                                                pointMOb.set("status", true);
                                                pointMOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){

                                                    sellerOb.get("point").fetch({

                                                        success:function(sellerPointOb){

                                                            console.info("purhcase_item : 3");
                                                            //sellerPointOb.increment("current_point", price);
                                                            sellerPointOb.increment("current_revenue_point", price)
                                                            //sellerPointOb.increment("total_point", price);
                                                            sellerPointOb.increment("total_revenue_point", price);
                                                            sellerPointOb.addUnique("sale_array", commercialOb.id);

                                                            var sale_item = sellerPointOb.relation("sale_item");
                                                            sale_item.add(commercialOb);

                                                            sellerPointOb.save(null, { useMasterKey: true }).then(function(savedPointOb){

                                                                console.info("purhcase_item : 4");

                                                                var SellerPointMObject = Parse.Object.extend("PointManager");
                                                                var sellerPointMOb = new PointMObject();
                                                                sellerPointMOb.set("user", sellerOb);
                                                                sellerPointMOb.set("point", sellerPointOb);
                                                                sellerPointMOb.set("type", "revenue");
                                                                sellerPointMOb.set("product", commercialOb);
                                                                sellerPointMOb.set("from", "revenue");
                                                                sellerPointMOb.set("to", sellerOb.id);
                                                                sellerPointMOb.set("customer", userOb);
                                                                sellerPointMOb.set("amount", price);
                                                                sellerPointMOb.set("revenue_amount", price);
                                                                sellerPointMOb.set("date_string", savedDateString);
                                                                sellerPointMOb.set("status", true);
                                                                sellerPointMOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){

                                                                    console.info("purhcase_item : 5");

                                                                    var Score = Parse.Object.extend("Score");
                                                                    var scoreOb = new Score();
                                                                    scoreOb.set("from", userOb);
                                                                    scoreOb.set("to", sellerOb );
                                                                    scoreOb.set("commercial", commercialOb);
                                                                    scoreOb.set("type", "revenue");
                                                                    scoreOb.set("amount", price);
                                                                    scoreOb.set("done", false);
                                                                    scoreOb.save(null, {useMasterKey:true});

                                                                    var MyAlert = Parse.Object.extend("MyAlert");
                                                                    var myAlertOb = new MyAlert();

                                                                    myAlertOb.set("from", userOb);
                                                                    myAlertOb.set("to", sellerOb);
                                                                    myAlertOb.set("type", "purchase");
                                                                    myAlertOb.set("artist_post", commercialOb.get("artist_post"));
                                                                    myAlertOb.set("status", true);
                                                                    myAlertOb.set("product", commercialOb);
                                                                    myAlertOb.set("price", price);
                                                                    myAlertOb.save(null,{ useMasterKey: true }).then(function(savedMyAlertOb){

                                                                        console.info("purhcase_item : 6");

                                                                        var responseDate = functionBase.successResponse("purchase success", 'purchase_item');
                                                                        response.success(responseDate);

                                                                    }, function(error){

                                                                        var responseDate = functionBase.failResponse("myAlertOb save fail",'purchase_item'); 
                                                                        response.success(responseDate);

                                                                    });    

                                                                }, function(error){

                                                                    var responseDate = functionBase.failResponse("pointMOb save fail",'purchase_item'); 
                                                                    response.success(responseDate);

                                                                }); 
                                                        
                                                            }, function(error){

                                                                var responseDate = functionBase.failResponse("sellerPointOb save fail",'purchase_item'); 
                                                                response.success(responseDate);

                                                            })

                                                        },
                                                        error:function(error){

                                                            var responseDate = functionBase.failResponse("sellerOb fetch fail",'purchase_item'); 
                                                            response.success(responseDate);

                                                        }

                                                    })

                                                }, function(error){

                                                    var responseDate = functionBase.failResponse("pointMOb save fail",'purchase_item'); 
                                                    response.success(responseDate);

                                                }); 

                                            }, function(error){

                                                var responseDate = functionBase.failResponse("currentPointOb save fail",'purchase_item'); 
                                                response.success(responseDate);

                                            })

                                        } else {
                                            // error
                                            var responseDate = functionBase.failResponse("decrease total is not equal to price",'purchase_item'); 
                                            response.success(responseDate);
                                            
                                        }

                                    } else {

                                        var responseDate = functionBase.failResponse("no money",'purchase_item'); 
                                        response.success(responseDate);
                                        
                                    }

                                },
                                error:function(error){

                                    var responseDate = functionBase.failResponse("my point fetch fail",'purchase_item'); 
                                    response.success(responseDate);

                                }

                            })

                        },
                        error:function(error){

                            //not enough
                            var responseDate = functionBase.failResponse("my point fetch fail",'purchase_item'); 
                            response.success(responseDate);
                            
                        }

                    })

                },
                error:function(error){

                    var responseDate = functionBase.failResponse("commercial query find fail",'purchase_item'); 
                    response.success(responseDate);

                }

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request",'purchase_item'); 
            response.success(responseDate);

        }

    }, function(error){

        var responseDate = functionBase.failResponse("access denied",'purchase_item'); 
        response.success(responseDate);

    })

})


Parse.Cloud.define('daily_reward', function (request, response){
    
    console.info("location: daily_reward");

    var key = request.params.key;
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var RewardSetting = Parse.Object.extend("RewardSetting");
            var rewardSettingQuery = new Parse.Query(RewardSetting);
            rewardSettingQuery.get("BI26qHW3Eu").then(function(rewardSettingOb){

                var dailyReward = rewardSettingOb.get("daily");
                var dailyAmount = rewardSettingOb.get("daily_reard_amount");

                if(dailyReward){
                    //가입 보상 지급
                    var lastVisitQuery = new Parse.Query("LastVisit");
                    lastVisitQuery.equalTo("user", userOb);
                    lastVisitQuery.first({

                        success:function(lastVisitOb){

                            var today = new Date();
                            var todayString = String(today.getFullYear()) + String(today.getMonth() + String(today.getDate())); 

                            var lastRewardIssue = lastVisitOb.get("last_reward_issue");
                            var lastIssueDateString = String(lastRewardIssue.getFullYear()) + String(lastRewardIssue.getMonth()) + String(lastRewardIssue.getDate());

                            console.info(todayString);
                            console.info(lastIssueDateString);

                            if( todayString != lastIssueDateString){

                                lastVisitOb.set("last_reward_issue", today);
                                lastVisitOb.save(null,{ useMasterKey: true }).then(function(savedLastVisitOb){

                                    var pointOb = userOb.get("point");

                                    pointOb.increment("current_point", dailyAmount);
                                    pointOb.increment("current_free_point", dailyAmount);
                                    pointOb.increment("total_point", dailyAmount);
                                    pointOb.increment("total_free_point", dailyAmount);
                                    pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                                        var PointMObject = Parse.Object.extend("PointManager");
                                        var pointMOb = new PointMObject();
                                        pointMOb.set("user", userOb);
                                        pointMOb.set("point", pointOb);
                                        pointMOb.set("type", "free");
                                        pointMOb.set("from", "daily_reward");
                                        pointMOb.set("amount", dailyAmount);
                                        pointMOb.set("free_amount", dailyAmount);
                                        pointMOb.set("status", true);
                                        pointMOb.save(null, { useMasterKey: true }).then(function(savedPointMOb){
                                            
                                            var currentTime = new Date();
                                            userOb.set("last_reward_issue", currentTime);
                                            userOb.save(null, { useMasterKey: true }).then(function(){

                                                response.success(true);

                                            }, function(error){

                                                response.success(false);

                                            })


                                        }, function(error){

                                            response.success(false);

                                        })

                                    }, function(error){

                                        response.success(false);

                                    }); 


                                }, function(error){

                                    response.success(false);

                                }) 

                            } else {

                                response.success(false);

                            }

                        },
                        error:function(error){

                            response.success(false);

                        }

                    })
                    
                } else {
                    //가입 보상 지급 안함
                    response.success(false);

                }

            }, function(error){

                response.success(false);

            })

        } else {

            response.success(false);

        }
        
    }, function (error) {
      
        response.success(false);
    
    });

});


Parse.Cloud.define('signup_point_maker', function (request, response){

    console.info("location: signup_reward");

    var key = request.params.key;
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var pointOb = userOb.get("point");

            if(pointOb == null){

                var PointObject = Parse.Object.extend("Point");
                var pointOb = new PointObject();

                pointOb.set("current_point", 0);
                pointOb.set("total_point", 0);
                pointOb.set("user", userOb);
                pointOb.set("current_free_point", 0);
                pointOb.set("current_ad_point", 0);
                pointOb.set("current_purchase_point", 0);
                pointOb.set("current_cheer_point", 0);
                pointOb.set("current_revenue_point", 0);
                pointOb.set("current_admin_reward_point", 0);
                pointOb.set("current_reward_point", 0);
                pointOb.set("current_patron_withdraw_point", 0);
                pointOb.set("total_free_point", 0);
                pointOb.set("total_ad_point", 0);
                pointOb.set("total_purchase_point", 0);
                pointOb.set("total_cheer_point", 0);
                pointOb.set("total_revenue_point", 0);
                pointOb.set("total_admin_reward_point", 0);
                pointOb.set("total_reward_point", 0);
                pointOb.set("total_patron_withdraw_point", 0);
                pointOb.set("status", true);
                pointOb.set("signup_reward", true);
                pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                    var currentTime = new Date();
                    userOb.set("point", savedPointOb);   
                    userOb.set("noti_check_time", currentTime);
                    userOb.set("last_reward_issue", currentTime);
                    userOb.save(null, { useMasterKey: true }).then(function(){

                        response.success(true);

                    }, function(error){

                        response.success(false);

                    })

                }, function(error){

                    response.success(false);

                }); 

            } else {

                response.success(false);

            }
            
        } else {

            response.success(false);

        }
      
    }, function (error) {
        
        response.success(false);
    
    });

});



Parse.Cloud.define('signup_reward', function (request, response){

    console.info("location: signup_reward");

    var key = request.params.key;
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var RewardSetting = Parse.Object.extend("RewardSetting");
            var rewardSettingQuery = new Parse.Query(RewardSetting);
            rewardSettingQuery.get("BI26qHW3Eu").then(function(rewardSettingOb){

                var signReward = rewardSettingOb.get("sign");
                var signRewardAmount = rewardSettingOb.get("sign_reward_amount");

                if(signReward){
                    //가입 보상 지급
                    var pointOb = userOb.get("point");

                    if(pointOb == null){

                        var PointObject = Parse.Object.extend("Point");
                        var pointOb = new PointObject();

                        pointOb.set("current_point", signRewardAmount);
                        pointOb.set("total_point", signRewardAmount);
                        pointOb.set("user", userOb);
                        pointOb.set("current_free_point", signRewardAmount);
                        pointOb.set("current_ad_point", 0);
                        pointOb.set("current_purchase_point", 0);
                        pointOb.set("current_cheer_point", 0);
                        pointOb.set("current_revenue_point", 0);
                        pointOb.set("current_admin_reward_point", 0);
                        pointOb.set("current_reward_point", 0);
                        pointOb.set("current_patron_withdraw_point", 0);
                        pointOb.set("total_free_point", signRewardAmount);
                        pointOb.set("total_ad_point", 0);
                        pointOb.set("total_purchase_point", 0);
                        pointOb.set("total_cheer_point", 0);
                        pointOb.set("total_revenue_point", 0);
                        pointOb.set("total_admin_reward_point", 0);
                        pointOb.set("total_reward_point", 0);
                        pointOb.set("total_patron_withdraw_point", 0);
                        pointOb.set("status", true);
                        pointOb.set("signup_reward", true);
                        pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                            var PointMObject = Parse.Object.extend("PointManager");
                            var pointMOb = new PointMObject();
                            pointMOb.set("user", userOb);
                            pointMOb.set("point", pointOb);
                            pointMOb.set("type", "free");
                            pointMOb.set("from", "signup");
                            pointMOb.set("amount", signRewardAmount);
                            pointMOb.set("free_amount", signRewardAmount );
                            pointMOb.set("status", true);
                            pointMOb.save(null, { useMasterKey: true }).then(function(savedPointMOb){

                                var currentTime = new Date();
                                userOb.set("point", savedPointOb);
                                userOb.set("noti_check_time", currentTime);
                                userOb.set("last_reward_issue", currentTime);
                                userOb.save(null, { useMasterKey: true }).then(function(){

                                    response.success(true);

                                }, function(error){

                                    response.success(false);

                                })


                            }, function(error){

                                response.success(false);

                            })

                        }, function(error){

                            response.success(false);

                        }); 

                    } else {

                        pointOb.fetch().then(function(fecthedPointOb){

                            if(fecthedPointOb.get("signup_reward") == null || fecthedPointOb.get("signup_reward") == false){
                        
                                var PointObject = Parse.Object.extend("Point");
                                var pointOb = new PointObject();

                                pointOb.set("current_point", signRewardAmount);
                                pointOb.set("total_point", signRewardAmount);
                                pointOb.set("user", userOb);
                                pointOb.set("current_free_point", signRewardAmount);
                                pointOb.set("current_ad_point", 0);
                                pointOb.set("current_purchase_point", 0);
                                pointOb.set("current_cheer_point", 0);
                                pointOb.set("current_revenue_point", 0);
                                pointOb.set("current_admin_reward_point", 0);
                                pointOb.set("current_reward_point", 0);
                                pointOb.set("current_patron_withdraw_point", 0);
                                pointOb.set("total_free_point", signRewardAmount);
                                pointOb.set("total_ad_point", 0);
                                pointOb.set("total_purchase_point", 0);
                                pointOb.set("total_cheer_point", 0);
                                pointOb.set("total_revenue_point", 0);
                                pointOb.set("total_admin_reward_point", 0);
                                pointOb.set("total_reward_point", 0);
                                pointOb.set("total_patron_withdraw_point", 0);
                                pointOb.set("status", true);
                                pointOb.set("signup_reward", true);
                                pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                                    var PointMObject = Parse.Object.extend("PointManager");
                                    var pointMOb = new PointMObject();
                                    pointMOb.set("user", userOb);
                                    pointMOb.set("point", pointOb);
                                    pointMOb.set("type", "free");
                                    pointMOb.set("from", "signup");
                                    pointMOb.set("amount", signRewardAmount);
                                    pointMOb.set("free_amount", signRewardAmount );
                                    pointMOb.set("status", true);
                                    pointMOb.save(null, { useMasterKey: true }).then(function(savedPointMOb){

                                        var currentTime = new Date();
                                        userOb.set("point", savedPointOb);
                                        userOb.set("noti_check_time", currentTime);
                                        userOb.set("last_reward_issue", currentTime);
                                        userOb.save(null, { useMasterKey: true }).then(function(){

                                            response.success(true);

                                        }, function(error){

                                            response.success(false);

                                        })

                                    }, function(error){

                                        response.success(false);

                                    })

                                }, function(error){

                                    response.success(false);

                                });

                            } else {

                                response.success(false);

                            }

                        }, function(error){

                            response.success(false);

                        })

                    }

                } else {
                    //가입 보상 지급 안함
                    response.success(false);

                }

            }, function(error){

                response.success(false);

            })

        } else {

            response.success(false);

        }
      
    }, function (error) {
        
        response.success(false);
    
    });

});

Parse.Cloud.define('realtime_tag', function (request, response){

    var MyTag = Parse.Object.extend("TagLog");
    var tagLogQuery = new Parse.Query(MyTag);
    tagLogQuery.limit(500);
    tagLogQuery.equalTo("add", true);
    tagLogQuery.descending("createdAt");
    tagLogQuery.find().then(function(tagLogObs){

        console.info(2);

        var myTag = functionBase.favorTagMaker(tagLogObs);

        var responseDate = {
            "status":true,
            "message":myTag
        }

        response.success(responseDate);

    }, function(error){

        var responseDate = functionBase.failResponse("tagLogQuery fail",'realtime_tag'); 
        response.success(responseDate);

    })


})


Parse.Cloud.define('tagitem_user_ranking', function (request, response){

    var array = request.params.tag_array;

    var ArtistPost = Parse.Object.extend("ArtistPost");
    var postQuery = new Parse.Query(ArtistPost);
    postQuery.containedIn("tag_array", array);
    postQuery.descending("createdAt");
    postQuery.limit(1000);
    postQuery.include("user");
    postQuery.find().then(function(postObs){
        
        console.info(postObs.length);
        
        var resultArray = [];
        var uniqueArray = [];

        var endExcution = _.after(postObs.length, function(){

            console.info("데이터 서버에 저장");
            console.info(resultArray);

            resultArray.sort(function(a, b) {
                return  b.count - a.count;
            });

            var responseDate = {

                "status":true,
                "message":"success",
                "result":resultArray

            }

            response.success(responseDate);

        })

        _.each(postObs, function(postOb){
            
            var saveDate = {};
            
            var user = postOb.get("user");
            
            var image = user.get("image_cdn");
            
            if(image == null){
                
                image = user.get("pic_url");
                
            }
            
            var name = user.get("name");
            
            if(uniqueArray.length == 0){
                //처음이므로 일단 넣고 본다.
                saveDate["id"] = user.id;
                saveDate["image"] = image;
                saveDate["name"] = name;
                saveDate["count"] = 1;
                saveDate["post"] = postOb.id;
                
                resultArray.push(saveDate);
                uniqueArray.push(user.id);
                
                endExcution();
                
            } else {
                
                if(uniqueArray.indexOf(user.id) == -1){
                    //데이터가 없으므로 추가
                    saveDate["id"] = user.id;
                    saveDate["image"] = image;
                    saveDate["name"] = name;
                    saveDate["count"] = 1;
                    saveDate["post"] = postOb.id;

                    resultArray.push(saveDate);
                    uniqueArray.push(user.id);
                    
                    endExcution();
                    
                    
                } else {
                    //데이터가 있으므로 카운트 올리기.
                    
                    for(var i=0;resultArray.length>i;i++){
                        
                        var savedUserId = resultArray[i].id;
                        
                        if(savedUserId == user.id){
                            
                            var count = resultArray[i].count;
                            count += 1;
                            resultArray[i].count = count;
                            
                        }
                        
                    }
                    
                    endExcution();
                    
                }
                
            }

        })
        
    }, function(error){

        var responseDate = functionBase.failResponse("post Query fail",'tagitem_user_ranking'); 
        response.success(responseDate);
        
    })

})


Parse.Cloud.define('tag_recommend', function (request, response){
    
    console.info("location: tag_recommend");

    var key = request.params.key;
    
    Parse.User.become(key).then(function (userOb) {
        
        console.info(0);
        
        var Users = Parse.Object.extend("_User");
        var userQuery = new Parse.Query(Users);
        userQuery.limit(1000);
        userQuery.notEqualTo("tags", null);
        userQuery.find({
            
            success:function(userObs){
            
                var allTags = [];
                
                for(var i=0;userObs.length>i;i++){
                    
                    var tags = userObs[i].get("tags");
                    
                    for(var j=0;tags.length>j;j++){
                         
                        allTags.push(tags[j]);
                        
                    }
                    
                }
                
                var compareArray = [];
                var result = [];
                
                for(var k=0;allTags.length>k;k++){
                    
                    var exist = false;
                    var indexNum = 0;
                    
                    for(var t=0;result.length>t;t++){
                        
                        if(result[t]["tag"] == allTags[k]){
                            
                            exist = true;
                            indexNum = t;
                            
                        }
                        
                    }
                    
                    if(exist == false){
                        
                        var newData = {
                            "tag":allTags[k],
                            "count":0
                        }
                        
                        result.push(newData)
                        
                    } else {
                        
                        result[indexNum]["count"] += 1
                        
                    }
                    
                }
                
                var responseDate = {
                    "status":true,
                    "result":result
                }
                
                response.success(responseDate);
                
            },
            error:function(error){

                var responseDate = functionBase.failResponse("user data query fail",'tag_recommend'); 
                response.success(responseDate);
                
            }
            
        })
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'tag_recommend'); 
        response.success(responseDate);
    
    });

});


Parse.Cloud.define('mytag_reset', function (request, response){
    
    console.info("location: mytag_reset");

    var key = request.params.key;
    
    Parse.User.become(key).then(function (userOb) {

        console.info(1);
        
        var MyTag = Parse.Object.extend("TagLog");
        var tagLogQuery = new Parse.Query(MyTag);
        tagLogQuery.limit(1000);
        tagLogQuery.equalTo("user", userOb);
        tagLogQuery.equalTo("add", true);
        tagLogQuery.find().then(function(tagLogObs){

            console.info(2);

            var myTag = functionBase.favorTagMaker(tagLogObs);

            console.info(3);

            var myTagArray = [];

            for(var i=0;myTag.length>i;i++){

                var tagString = myTag[i].tag;
                myTagArray.push(tagString);

            }

            userOb.set("tags", myTagArray);
            userOb.save(null, {useMasterKey:true});

            var responseDate = {
                "status":true,
                "message":myTag
            }

            response.success(responseDate);

        }, function(error){

            var responseDate = functionBase.failResponse("tagLogQuery fail",'mytag_reset'); 
            response.success(responseDate);

        })
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'mytag_reset'); 
        response.success(responseDate);
    
    });

});

Parse.Cloud.define('like', function (request, response){

    console.info("location: like");
    
    var key = request.params.key;
    var target = request.params.target; //target post
    var action = request.params.action;//like or cancel
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Target = Parse.Object.extend("ArtistPost");
            var targetQuery = new Parse.Query(Target);
            targetQuery.get(target, {
                
                success:function(targetPostOb){
                    
                    if(action == "like"){
                        //follow action
                        
                        console.info(0);
                        
                        targetPostOb.addUnique("like_array", userOb.id );
                        var relationUser = targetPostOb.relation("like_user")
                        relationUser.add(userOb);
                        targetPostOb.increment("like_count");
                        
                        console.info(1);

                        targetPostOb.set("lastAction", "like");
                        targetPostOb.save(null, { useMasterKey: true }).then(function( savedTargetOb ){

                            console.info(2);

                            var tagArray = targetPostOb.get("tag_array");

                            if(tagArray == null){

                                tagArray = [];

                            } 

                            var TagMaker = Parse.Object.extend("TagMaker");
                            var tagMakerOb = new TagMaker();
                            tagMakerOb.set("postOb", targetPostOb);
                            tagMakerOb.set("tag_array", tagArray);
                            tagMakerOb.set("user", userOb);
                            tagMakerOb.set("action", action);
                            tagMakerOb.save(null, {useMasterKey:true}).then(function(savedTagMakerOb){

                                var Score = Parse.Object.extend("Score");
                                var scoreOb = new Score();
                                scoreOb.set("from", userOb);
                                scoreOb.set("to", targetPostOb.get("user"));
                                scoreOb.set("type", "like_post");
                                scoreOb.set("post", targetPostOb );
                                scoreOb.set("done", false);
                                scoreOb.save(null, {useMasterKey:true});

                                var responseDate = {
                                    "targetId":savedTargetOb.id,
                                    "like_count":savedTargetOb.get("like_count"),
                                    "status": true
                                }

                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("TagMaker save fail",'like'); 
                                response.success(responseDate);

                            })
                            
                        }, function(error){

                            var responseDate = functionBase.failResponse("targetUserOb save fail",'like'); 
                            response.success(responseDate);

                        })
                        
                    } else {
                        //cancel action
                        
                        console.info(4);
                        targetPostOb.remove("like_array", userOb.id );
                        var relationUser = targetPostOb.relation("like_user")
                        relationUser.remove(userOb);
                        targetPostOb.increment("like_count", -1);
                        
                        console.info(5);
                        targetPostOb.set("lastAction", "like_cancel");
                        targetPostOb.save(null, { useMasterKey: true }).then(function( savedTargetOb ){
                            
                            console.info(500);

                            var tagArray = targetPostOb.get("tag_array");

                            if(tagArray == null){

                                tagArray = [];

                            } 

                            var TagMaker = Parse.Object.extend("TagMaker");
                            var tagMakerOb = new TagMaker();
                            tagMakerOb.set("postOb", targetPostOb);
                            tagMakerOb.set("tag_array", tagArray);
                            tagMakerOb.set("user", userOb);
                            tagMakerOb.set("action", action);
                            tagMakerOb.save(null, {useMasterKey:true}).then(function(savedTagMakerOb){

                                var Score = Parse.Object.extend("Score");
                                var scoreOb = new Score();
                                scoreOb.set("from", userOb);
                                scoreOb.set("to", targetPostOb.get("user"));
                                scoreOb.set("type", "like_post_cancel");
                                scoreOb.set("post", targetPostOb );
                                scoreOb.set("done", false);
                                scoreOb.save(null, {useMasterKey:true});

                                var responseDate = {
                                    "targetId":savedTargetOb.id,
                                    "like_count":savedTargetOb.get("like_count"),
                                    "status":true
                                }

                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("tagMakerOb save fail2",'like'); 
                                response.success(responseDate);

                            })
                            
                        }, function(error){

                            var responseDate = functionBase.failResponse("targetUserOb save fail2",'like'); 
                            response.success(responseDate);
                            
                        })
                        
                    }
                    
                },
                
                error:function(error){

                    var responseDate = functionBase.failResponse("targetUser retrieve fail2",'like'); 
                    response.success(responseDate);
                    
                }
                
            })

        } else {

            var responseDate = functionBase.failResponse("duplication request",'like'); 
            response.success(responseDate);

        }
        
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'like'); 
        response.success(responseDate);
    
    });

});

Parse.Cloud.define('comment_social_maker', function (request, response){
    
    console.info("location: comment_social_maker");

    var key = request.params.key;
    var target = request.params.target; //target post
    var comment = request.params.comment;//like or cancel

    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Target = Parse.Object.extend("SocialMessage");
            var targetQuery = new Parse.Query(Target);
            targetQuery.get(target, {
                
                success:function(targetPostOb){
                    
                    var Comment = Parse.Object.extend("Comment");
                    var commentQuery = new Parse.Query(Comment);
                    commentQuery.get(comment, {
                        
                        success:function(commentOb){
                            
                            var commentRelation = targetPostOb.relation("comment");
                            commentRelation.add(commentOb);
                            targetPostOb.increment("comment_count");
                            targetPostOb.save(null, { useMasterKey: true }).then(function( savedTargetOb ){

                                var Score = Parse.Object.extend("Score");
                                var scoreOb = new Score();
                                scoreOb.set("from", userOb);
                                scoreOb.set("to", targetPostOb.get("user"));
                                scoreOb.set("social", targetPostOb);
                                scoreOb.set("type", "social_comment");
                                scoreOb.set("done", false);
                                scoreOb.save(null, {useMasterKey:true});

                                var responseDate = {
                                    "targetId":savedTargetOb.id,
                                    "comment_count":savedTargetOb.get("comment_count"),
                                    "status": true
                                }

                                response.success(responseDate);

                            }, function(error){

                                var responseDate = functionBase.failResponse("targetUserOb save fail",'comment_social_maker'); 
                                response.success(responseDate);

                            })
                            
                        },
                        error:function(error){

                            var responseDate = functionBase.failResponse("targetUserOb save fail",'comment_social_maker'); 
                            response.success(responseDate);
                                                        
                        }
                        
                    })
                    
                },
                
                error:function(error){

                    var responseDate = functionBase.failResponse("targetUser retrieve fail",'comment_social_maker'); 
                    response.success(responseDate);
                    
                }
                
            })


        } else {

            var responseDate = functionBase.failResponse("duplication request",'comment_social_maker'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'comment_social_maker'); 
        response.success(responseDate);
    
    });

});


Parse.Cloud.define('comment_count_adjust', function (request, response){
    
    console.info("location: comment_count_adjust");

    var key = request.params.key;
    var target = request.params.target; //target post
    var action = request.params.action;//like or cancel
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            if(action == "delete"){

                var Target = Parse.Object.extend("ArtistPost");
                var targetQuery = new Parse.Query(Target);
                targetQuery.get(target, {
                    
                    success:function(targetPostOb){
                        
                        targetPostOb.increment("comment_count", -1);
                        console.info(5);
                        targetPostOb.save(null, { useMasterKey: true }).then(function( savedTargetOb ){

                            console.info(6);

                            var Score = Parse.Object.extend("Score");
                            var scoreOb = new Score();
                            scoreOb.set("from", userOb);
                            scoreOb.set("to", targetPostOb.get("user"));
                            scoreOb.set("post", targetPostOb);
                            scoreOb.set("type", "post_comment_cancel");
                            scoreOb.set("done", false);
                            scoreOb.save(null, {useMasterKey:true});

                            var responseDate = {
                                "targetId":savedTargetOb.id,
                                "like_count":savedTargetOb.get("comment_count"),
                                "status":true
                            }

                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("targetUserOb save fail",'comment_count_adjust'); 
                            response.success(responseDate);

                        })
                        
                    },
                    
                    error:function(error){

                        var responseDate = functionBase.failResponse("targetUser retrieve fail",'comment_count_adjust'); 
                        response.success(responseDate);
                        
                    }
                    
                })

            } else if ( action == "social_delete"){

                var Target = Parse.Object.extend("SocialMessage");
                var targetQuery = new Parse.Query(Target);
                targetQuery.get(target, {
                    
                    success:function(targetPostOb){
                        
                        targetPostOb.increment("comment_count", -1);
                        console.info(5);
                        targetPostOb.save(null, { useMasterKey: true }).then(function( savedTargetOb ){

                            console.info(6);

                            var Score = Parse.Object.extend("Score");
                            var scoreOb = new Score();
                            scoreOb.set("from", userOb);
                            scoreOb.set("to", targetPostOb.get("user"));
                            scoreOb.set("social", targetPostOb);
                            scoreOb.set("type", "social_comment_cancel");
                            scoreOb.set("done", false);
                            scoreOb.save(null, {useMasterKey:true});

                            var responseDate = {
                                "targetId":savedTargetOb.id,
                                "like_count":savedTargetOb.get("comment_count"),
                                "status":true
                            }

                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("targetUserOb save fail2",'comment_count_adjust'); 
                            response.success(responseDate);

                        })
                        
                    },
                    
                    error:function(error){

                        var responseDate = functionBase.failResponse("targetUser retrieve fail2",'comment_count_adjust'); 
                        response.success(responseDate);
                         
                    }
                    
                })

            }

        } else {

            var responseDate = functionBase.failResponse("duplication request",'comment_count_adjust'); 
            response.success(responseDate);

        }

    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'comment_count_adjust'); 
        response.success(responseDate);
    
    });
    
});

Parse.Cloud.define('follow', function (request, response){

    console.info("location: follow");
    
    var key = request.params.key;
    var target = request.params.target;
    var action = request.params.action;
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Target = Parse.Object.extend("_User");
            var targetQuery = new Parse.Query(Target);
            targetQuery.get(target, {
                
                success:function(targetUserOb){
                    
                    if(action == "follow"){
                        //follow action
                        targetUserOb.addUnique("follower_array", userOb.id );
                        var relationUser = targetUserOb.relation("follower")
                        relationUser.add(userOb);
                        targetUserOb.increment("follower_count");
                        targetUserOb.save(null, { useMasterKey: true }).then(function( savedTargetOb ){

                            var MyAlert = Parse.Object.extend("MyAlert");
                            var myAlertOb = new MyAlert();

                            myAlertOb.set("from", userOb);
                            myAlertOb.set("to", targetUserOb);
                            myAlertOb.set("type", "follow");
                            myAlertOb.set("status", true);
                            myAlertOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){

                                var Score = Parse.Object.extend("Score");
                                var scoreOb = new Score();
                                scoreOb.set("from", userOb);
                                scoreOb.set("to", targetUserOb);
                                scoreOb.set("type", "follow");
                                scoreOb.set("done", false);
                                scoreOb.save(null, {useMasterKey:true});

                                var responseDate = {
                                    "targetId":savedTargetOb.id,
                                    "status": true
                                }

                                response.success(responseDate);
                                
                            }, function(error){

                                var responseDate = functionBase.failResponse("pointMOb save fail",'follow'); 
                                response.success(responseDate);

                            });   

                        }, function(error){

                            var responseDate = functionBase.failResponse("targetUserOb save fail",'follow'); 
                            response.success(responseDate);

                        })
                        
                    } else {
                        //cancel action
                        targetUserOb.remove("follower_array", userOb.id );
                        var relationUser = targetUserOb.relation("follower")
                        relationUser.remove(userOb);
                        targetUserOb.increment("follower_count", -1);
                        targetUserOb.save(null, { useMasterKey: true }).then(function( savedTargetOb ){

                            var Score = Parse.Object.extend("Score");
                            var scoreOb = new Score();
                            scoreOb.set("from", userOb);
                            scoreOb.set("to", targetUserOb);
                            scoreOb.set("type", "follow_cancel");
                            scoreOb.set("done", false);
                            scoreOb.save(null, {useMasterKey:true});

                            var responseDate = {
                                "targetId":savedTargetOb.id,
                                "status":true
                            }

                            response.success(responseDate);

                        }, function(error){

                            var responseDate = functionBase.failResponse("targetUserOb save fail2",'follow'); 
                            response.success(responseDate);

                        })
                        
                    }
                    
                },
                
                error:function(error){

                    var responseDate = functionBase.failResponse("targetUser retrieve fail2",'follow'); 
                    response.success(responseDate);
                    
                }
                
            })

        } else {

            var responseDate = functionBase.failResponse("duplication request",'follow'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'follow'); 
        response.success(responseDate);
    
    });
    
});

Parse.Cloud.define('poke', function (request, response){
    
    console.info("location: poke response");

    var key = request.params.key;
    var targetUserId = request.params.target; 
    var uid = request.params.uid;

    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var TargetUser = Parse.Object.extend("_User");
            var targetUserQuery = new Parse.Query(TargetUser);
            targetUserQuery.get(targetUserId, {
                
                success:function(targetUserOb){
                    
                    var Score = Parse.Object.extend("Score");
                    var scoreOb = new Score();
                    scoreOb.set("from", userOb);
                    scoreOb.set("to", targetUserOb);
                    scoreOb.set("type", "poke");
                    scoreOb.set("done", false);
                    scoreOb.save(null, {useMasterKey:true});

                    console.info(8);
                    var responseDate = {
                        "targetId":savedUserOb.id,
                        "status":true
                    }

                    response.success(responseDate);
                    
                },
                error:function(error){

                    var responseDate = functionBase.failResponse("targetUserQuery fail",'poke'); 
                    response.success(responseDate);
                    
                }
                
            })

        } else {

            var responseDate = functionBase.failResponse("duplication request",'poke'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'poke'); 
        response.success(responseDate);
    
    });
    
});


Parse.Cloud.define('poke_response', function (request, response){
    
    console.info("location: poke response");

    var key = request.params.key;
    var targetUserId = request.params.target; 
    var uid = request.params.uid;

    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var TargetUser = Parse.Object.extend("_User");
            var targetUserQuery = new Parse.Query(TargetUser);
            targetUserQuery.get(targetUserId, {
                
                success:function(targetUserOb){
                    
                    targetUserOb.remove("poke_list", userOb.id);
                    targetUserOb.save(null, { useMasterKey: true }).then(function(savedUserOb){

                        var Score = Parse.Object.extend("Score");
                        var scoreOb = new Score();
                        scoreOb.set("from", userOb);
                        scoreOb.set("to", targetUserOb);
                        scoreOb.set("type", "poke_response");
                        scoreOb.set("done", false);
                        scoreOb.save(null, {useMasterKey:true});

                        console.info(8);
                        var responseDate = {
                            "targetId":savedUserOb.id,
                            "status":true
                        }

                        response.success(responseDate);

                    }, function(error){

                        var responseDate = functionBase.failResponse("targetUserOb save fail",'poke_response'); 
                        response.success(responseDate);

                    })
                    
                    
                },
                error:function(error){
                    
                    var responseDate = functionBase.failResponse("targetUserQuery fail",'poke_response'); 
                    response.success(responseDate);
                }
                
            })

        } else {

            var responseDate = functionBase.failResponse("duplication request",'poke_response'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'poke_response'); 
        response.success(responseDate);
    
    });

});
//point share function for crontab 
Parse.Cloud.define('point_share', function (request, response){
    
    console.info("location: comment_count_adjust");

   
    var key = request.params.key;
    var cheerPoint = Number(request.params.point);
    var targetUserId = request.params.target; 
    
    Parse.User.become(key).then(function (userOb) {
        
        //포인트 정산
        //구매가 발생하면 해당 후원 ArtistPost에 연결된 Commercial 테이블에 수익 금액을 입력함
        //특정 시간이 되면 수익금액을 배분함.
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied"); 
        response.success(responseDate);
    
    });
    
});

Parse.Cloud.define('cheer_point', function (request, response){
    
    console.info("location: cheer point");

    var key = request.params.key;
    var cheerPoint = Number(request.params.point);
    var targetUserId = request.params.target; 
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var User = Parse.Object.extend("_User");
            var userQuery = new Parse.Query(User);
            userQuery.get(targetUserId).then(function(targetUserOb){

                var CheerPoint = Parse.Object.extend("CheerPoint");
                var cheerPointOb = new CheerPoint();
                cheerPointOb.set("point", cheerPoint);
                cheerPointOb.set("user", userOb);
                cheerPointOb.set("to", targetUserOb);
                cheerPointOb.set("target", targetUserId);
                cheerPointOb.set("status", true);
                cheerPointOb.set("progress", "send");
                cheerPointOb.save(null, { useMasterKey: true }).then(function( savedCheerPointOb ){
                    console.info(1);
                    userOb.get("point").fetch({
                        
                        success:function(pointOb){
                            
                            console.info(2);
                            
                            if(pointOb.get("current_point") >= cheerPoint ){
                                
                                console.info(4);

                                var decreasePointResult = functionBase.pointDecreaseCalculator(pointOb, cheerPoint);
                                var decreasePurchaseAmount = decreasePointResult.decreasePurchaseAmount;
                                var decreaseAdAmount = decreasePointResult.decreaseAdAmount;
                                var decreaseCheerAmount = decreasePointResult.decreaseCheerAmount;
                                var decreasePatronWithdrawAmount = decreasePointResult.decreasePatronWithdrawAmount;
                                var decreaseRevenueAmount = decreasePointResult.decreaseRevenueAmount;
                                var decreaseAdminRewardAmount = decreasePointResult.decreaseAdminRewardAmount;
                                var decreaseRewardAmount = decreasePointResult.decreaseRewardAmount;
                                var decreaseFreeAmount = decreasePointResult.decreaseFreeAmount;

                                var totalDecrease = decreasePurchaseAmount + decreaseAdAmount + decreaseCheerAmount + decreasePatronWithdrawAmount + decreaseRevenueAmount + decreaseAdminRewardAmount + decreaseRewardAmount + decreaseFreeAmount;

                                if(totalDecrease == cheerPoint){

                                    pointOb.increment("current_purchase_point", -decreasePurchaseAmount);
                                    pointOb.increment("current_free_point", -decreaseFreeAmount);
                                    pointOb.increment("current_ad_point", -decreaseAdAmount);
                                    pointOb.increment("current_cheer_point", -decreaseCheerAmount);
                                    pointOb.increment("current_patron_withdraw_point", -decreasePatronWithdrawAmount);
                                    pointOb.increment("current_revenue_point", -decreaseRevenueAmount);
                                    pointOb.increment("current_admin_reward_point", -decreaseAdminRewardAmount);
                                    pointOb.increment("current_reward_point", -decreaseRewardAmount);
                                    pointOb.increment("current_point", -cheerPoint);
                                    
                                    pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                                        console.info(7);

                                        var PointMObject = Parse.Object.extend("PointManager");
                                        var pointMOb = new PointMObject();
                                        pointMOb.set("user", userOb);
                                        pointMOb.set("type", "cheer");
                                        pointMOb.set("from", "cheer_point");
                                        pointMOb.set("cheer_point", cheerPointOb);
                                        pointMOb.set("to", targetUserId);
                                        pointMOb.set("status", true);
                                        pointMOb.set("amount", cheerPoint);
                                        pointMOb.set("free_amount", decreaseFreeAmount);
                                        pointMOb.set("ad_amount", decreaseAdAmount);
                                        pointMOb.set("purchase_amount", decreasePurchaseAmount);
                                        pointMOb.set("cheer_amount", decreaseCheerAmount);
                                        pointMOb.set("patron_withdraw_amount", decreasePatronWithdrawAmount);
                                        pointMOb.set("revenue_amount", decreaseRevenueAmount);
                                        pointMOb.set("admin_reward_amount", decreaseAdminRewardAmount);
                                        pointMOb.set("reward_amount", decreaseRewardAmount);
                                        pointMOb.set("point", pointOb);
                                        pointMOb.save(null, { useMasterKey: true }).then(function(savedPointMOb){

                                            console.info(8);
                                            var responseDate = {
                                                "cheerPoint":savedCheerPointOb.id,
                                                "pointMOb":savedPointMOb,
                                                "point":savedPointOb,
                                                "status":true
                                            }

                                            response.success(responseDate);

                                        }, function(error){

                                            var responseDate = functionBase.failResponse("pointMg save fail",'cheer_point'); 
                                            response.success(responseDate);

                                        })
                                        
                                    }, function(error){

                                        var responseDate = functionBase.failResponse("point save fail",'cheer_point'); 
                                        response.success(responseDate);

                                    });

                                } else {

                                    var responseDate = functionBase.failResponse("decrease calculation fail",'cheer_point'); 
                                    response.success(responseDate);

                                }

                            } else {

                                var responseDate = functionBase.failResponse("not enough point",'cheer_point'); 
                                response.success(responseDate);
                                
                            }
                            
                        },
                        
                        error:function(e){

                            var responseDate = functionBase.failResponse("user fetch fail",'cheer_point'); 
                            response.success(responseDate);
                             
                        }
                        
                    })

                }, function(error){

                    var responseDate = functionBase.failResponse("cheerpointOb save fail",'cheer_point'); 
                    response.success(responseDate);

                })

            }, function(error){

                var responseDate = functionBase.failResponse("targetUserOb query fail",'cheer_point'); 
                response.success(responseDate);

            })


        } else {

            var responseDate = functionBase.failResponse("duplication request",'cheer_point'); 
            response.success(responseDate);

        }
        
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'cheer_point'); 
        response.success(responseDate);
    
    });
    

});

Parse.Cloud.define('cheer_point_accept', function (request, response){

    console.info("location: cheer point accept");
    
    var key = request.params.key;
    var socialMSGId = request.params.target;
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var SocialMessage = Parse.Object.extend("SocialMessage");
            var socialMSGQuery = new Parse.Query(SocialMessage);
            socialMSGQuery.include("cheer_point");
            socialMSGQuery.get(socialMSGId,{
                
                success:function(sociaMsgOb){

                    console.info("cheer2");
                    
                    var cheerPointOb = sociaMsgOb.get("cheer_point");
                    var point = cheerPointOb.get("point");
                    var target = cheerPointOb.get("target");
                    var fromUser = cheerPointOb.get("user");

                    if(target == userOb.id){
                        //auth check complete

                        console.info("cheer3");
                        cheerPointOb.set("progress", "accept");
                        cheerPointOb.save(null, { useMasterKey: true }).then(function( savedCheerPointOb ){
                            
                            console.info("cheer4");
                            userOb.get("point").fetch({

                                success:function(pointOb){

                                    console.info("cheer5");

                                    //pointOb.increment("current_point", point);
                                    pointOb.increment("current_cheer_point", point);
                                    //pointOb.increment("total_point", point);
                                    pointOb.increment("total_cheer_point", point);

                                    
                                    pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                                        console.info("cheer6");

                                        var PointMObject = Parse.Object.extend("PointManager");
                                        var pointMOb = new PointMObject();
                                        pointMOb.set("user", userOb);
                                        pointMOb.set("type", "cheer_accept");
                                        pointMOb.set("from", "cheer_point");
                                        pointMOb.set("cheer_point", cheerPointOb);
                                        pointMOb.set("to", userOb.id);
                                        pointMOb.set("status", true);
                                        pointMOb.set("amount", point);
                                        pointMOb.set("cheer_amount", point);
                                        pointMOb.set("point", pointOb);
                                        
                                        pointMOb.save(null, { useMasterKey: true }).then(function(savedPointMOb){

                                            var Score = Parse.Object.extend("Score");
                                            var scoreOb = new Score();
                                            scoreOb.set("from", fromUser);
                                            scoreOb.set("to", userOb);
                                            scoreOb.set("type", "cheer_point");
                                            scoreOb.set("amount", point);
                                            scoreOb.set("done", false);
                                            scoreOb.save(null, {useMasterKey:true});
                                            
                                            var responseDate = {
                                                "cheerPoint":savedCheerPointOb.id,
                                                "pointMOb":savedPointMOb.id,
                                                "point":savedPointOb.id,
                                                "status":true
                                            }
                                            
                                            response.success(responseDate);

                                        }, function(error){

                                            var responseDate = functionBase.failResponse("pointMOb save fail",'cheer_point_accept'); 
                                            response.success(responseDate);

                                        })


                                    }, function(error){

                                        var responseDate = functionBase.failResponse("pointMg save fail",'cheer_point_accept'); 
                                        response.success(responseDate);

                                    });

                                },

                                error:function(e){

                                    var responseDate = functionBase.failResponse("user fetch fail",'cheer_point_accept'); 
                                    response.success(responseDate);

                                }

                            })

                        }, function(error){

                            var responseDate = functionBase.failResponse("cheerpointOb save fail",'cheer_point_accept'); 
                            response.success(responseDate);

                        })
                        
                    } else {

                        var responseDate = functionBase.failResponse("do not have permission to change point",'cheer_point_accept'); 
                        response.success(responseDate);
                        
                    }
                    
                },
                error:function(e){

                    var responseDate = functionBase.failResponse("no such a socialmessage id",'cheer_point_accept'); 
                    response.success(responseDate);
                    
                }
                
            })

        } else {

            var responseDate = functionBase.failResponse("duplication request",'cheer_point_accept'); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'cheer_point_accept'); 
        response.success(responseDate);
    
    });
    
});


Parse.Cloud.define('admin_send_box', function (request, response){

    console.info(1);
    
    var key = request.params.key;
    var cheerPoint = Number(request.params.point);
    var targetUserId = request.params.target; 
    var info = request.params.info;
    var uid = request.params.uid;
    
    Parse.User.become(key).then(function (userOb) {
        
        console.info(2);

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            if(userOb.get("user_role_type") == "admin"){
                      
                console.info(3);  

                var UserQuery = Parse.Object.extend("_User");
                var query = new Parse.Query(UserQuery);
                query.include("point");
                query.get(targetUserId, {

                    success:function(targetUserOb){

                        var targetPointOb = targetUserOb.get("point");
                        targetPointOb.increment("current_point", cheerPoint);
                        targetPointOb.increment("current_admin_reward_point", cheerPoint);
                        targetPointOb.increment("total_point", cheerPoint);
                        targetPointOb.increment("total_admin_reward_point", cheerPoint);
                        targetPointOb.save(null, { useMasterKey: true }).then(function(savedPointOb){

                            console.info(8);

                            var PointMObject = Parse.Object.extend("PointManager");
                            var pointMOb = new PointMObject();
                            pointMOb.set("user", targetUserOb);
                            pointMOb.set("point", targetPointOb);
                            pointMOb.set("type", "admin_reward");
                            pointMOb.set("from", "admin_reward");
                            pointMOb.set("to", targetUserId);
                            pointMOb.set("status", true);
                            pointMOb.set("amount", cheerPoint);
                            pointMOb.set("admin_reward_amount", cheerPoint);
                            pointMOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){

                                var responseDate = {
                                    "current_point":savedPointOb.get("current_point"),
                                    "pointMOb":savedPointMOb,
                                    "point":savedPointOb,
                                    "status":true
                                }

                                response.success(responseDate);
                                                            
                            }, function(error){

                                var responseDate = functionBase.failResponse("pointMg save fail",'admin_send_box'); 
                                response.success(responseDate);

                            });

                        }, function(error){

                            var responseDate = functionBase.failResponse("point save fail",'admin_send_box'); 
                            response.success(responseDate);

                        })

                    },

                    error:function(error){

                        var responseDate = functionBase.failResponse("user query fail",'admin_send_box'); 
                        response.success(responseDate);

                    }

                }) 
                
            } else {

                var responseDate = functionBase.failResponse("permission is not granted",'admin_send_box'); 
                response.success(responseDate);
                
            }

        } else {

            var responseDate = functionBase.failResponse("duplication request",'admin_send_box'); 
            response.success(responseDate);

        }

    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied",'admin_send_box'); 
        response.success(responseDate);
    
    });
    
});


Parse.Cloud.define("seriese_info_save", function(request, response){
    
    var artworkId = request.params.artworkId;
    var price = Number(request.params.price);
    var type = request.params.type;
    var seriese_status = request.params.seriese_status;
    var key = request.params.key;
    var open_date = request.params.open_date;
    var free_date = request.params.free_date;
    var uid = request.params.uid;

    var chargeStatus = false;
    
    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Artwork = Parse.Object.extend("ArtistPost");
            var artworkQuery = new Parse.Query(Artwork);
            artworkQuery.include("commercial");
            artworkQuery.include("user");
            artworkQuery.get(artworkId,{
                
                success:function(artworkOb){
                    //owner check

                    if(userOb.id == artworkOb.get("user").id){
                        // have auth

                        var parentOb = artworkOb.get("seriese_parent");
                        
                        if(artworkOb.get("commercial") == null){
                            //new commercial object create
                            var Commercial = Parse.Object.extend("Commercial");
                            var commercialOb = new Commercial();
                            commercialOb.set("user", userOb);
                            commercialOb.set("seriese_status", seriese_status);
                            commercialOb.set("open_date", functionBase.stringToDate(open_date));
                            commercialOb.set("artist_post", artworkOb);
                            
                            if(type != null){
                                
                                if(type == "charge"){

                                    chargeStatus = true;
                                    commercialOb.set("type", type);
                                    commercialOb.set("price", price);
                                    
                                } else if(type == "preview_charge"){

                                    chargeStatus = true;
                                    commercialOb.set("type", type);
                                    commercialOb.set("price", price);
                                    commercialOb.set("free_date", functionBase.stringToDate(free_date));
                                    
                                } else {

                                    chargeStatus = false;
                                    commercialOb.set("type", type);
                                    commercialOb.set("price", 0);
                                }
                                
                            } else {
                                
                                chargeStatus = false;
                                commercialOb.set("type", "free");
                                commercialOb.set("price", 0);
                                
                            }
                            
                            commercialOb.save(null, { useMasterKey: true }).then(function( savedCommercialOb ){

                                console.info("step", "eight");

                                var openStatus = false;
                                var openDate = functionBase.stringToDate(open_date);

                                var now = new Date();
                                var compareDate = new Date(now.getFullYear() , now.getMonth() ,  now.getDate()+1, 23, 59, 59, 0);
                                console.info(compareDate);
                                console.info(openDate);

                                if(openDate < compareDate){

                                    openStatus = true;


                                } else {

                                    openStatus = false;

                                }
                                
                                artworkOb.set("commercial", savedCommercialOb);
                                artworkOb.set("open_date", functionBase.stringToDate(open_date))
                                artworkOb.set("open_flag", openStatus);
                                artworkOb.set("charge_flag", chargeStatus);
                                artworkOb.set("lastAction", "serieseSetting");
                                artworkOb.save(null, { useMasterKey: true }).then(function( savedArtworkOb ){

                                    if(openStatus){

                                        parentOb.set("last_update", now);
                                        parentOb.save(null, {useMasterKey:true});

                                    }

                                    var responseDate = {
                                        "artworkOb":savedArtworkOb.id,
                                        "commercialOb":savedCommercialOb.id,
                                        "status":true
                                    }

                                    response.success(responseDate);

                                }, function(error){

                                    var responseDate = functionBase.failResponse("artworkOb save fail","seriese_info_save"); 
                                    response.success(responseDate);

                                })

                            }, function(error){

                                var responseDate = functionBase.failResponse("commercialOb save fail","seriese_info_save"); 
                                response.success(responseDate);

                            })

                        } else {
                            //exist commercial object update
                            var existCommercialOb = artworkOb.get("commercial");
                            
                            existCommercialOb.set("open_date", functionBase.stringToDate(open_date));
                
                            console.info("step", "exist");
                            
                            if(type != null){
                                
                                console.info("step", "type no null");
                                
                                if(type == "charge"){

                                    chargeStatus = true;
                                    
                                    existCommercialOb.set("type", type);
                                    existCommercialOb.set("price", price);
                                    
                                } else if(type == "preview_charge"){

                                    chargeStatus = true;
                                    
                                    existCommercialOb.set("type", type);
                                    existCommercialOb.set("price", price);
                                    existCommercialOb.set("free_date", functionBase.stringToDate(free_date));
                                    
                                } else {

                                    chargeStatus = false;

                                    existCommercialOb.set("type", type);
                                    existCommercialOb.set("price", 0);
                                }
                                
                            } else {

                                chargeStatus = false;
                                
                                existCommercialOb.set("type", "free");
                                existCommercialOb.set("price", 0);
                                
                            }

                            console.info("step", 20);
                            existCommercialOb.save(null, { useMasterKey: true }).then(function( savedCommercialOb ){

                                var openStatus = false;
                                var openDate = functionBase.stringToDate(open_date);
                                var now = new Date();
                                var compareDate = new Date(now.getFullYear() , now.getMonth() ,  now.getDate()+1, 23, 59, 59, 0);

                                console.info(compareDate);
                                console.info(openDate);

                                if(openDate < compareDate){

                                    openStatus = true;

                                } else {

                                    openStatus = false;

                                }

                                artworkOb.set("open_date", functionBase.stringToDate(open_date))
                                artworkOb.set("open_flag", openStatus);
                                artworkOb.set("charge_flag", chargeStatus);
                                artworkOb.set("lastAction", "serieseSettingEdit");
                                artworkOb.save(null, { useMasterKey: true }).then(function( savedArtworkOb ){

                                    if(openStatus){

                                        parentOb.set("last_update", now);
                                        parentOb.save(null, {useMasterKey:true});

                                    }

                                    var responseDate = {
                                        "artworkOb":savedArtworkOb.id,
                                        "commercialOb":savedCommercialOb.id,
                                        "status":true
                                    }

                                    response.success(responseDate);

                                }, function(error){

                                    var responseDate = functionBase.failResponse("serieseOb save fail","seriese_info_save"); 
                                    response.success(responseDate);

                                })

                            }, function(error){

                                var responseDate = functionBase.failResponse("exist commercialOb save fail","seriese_info_save"); 
                                response.success(responseDate);

                            })
                            
                        }
                        
                    } else {
                        // deny
                        var responseDate = functionBase.failResponse("owner_check_fail","seriese_info_save"); 
                        response.success(responseDate);

                    }
                    
                },
                error:function(e){

                    var responseDate = functionBase.failResponse("seriese_retrieve_fail","seriese_info_save"); 
                    response.success(responseDate);
                    
                }
                
            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","seriese_info_save"); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied","seriese_info_save"); 
        response.success(responseDate);
    
    });
    
    
})

Parse.Cloud.define("patron_point_send", function(request, response){

    console.info("location: patron_point_send");
    
    var userId = request.params.userId;
    var key = request.params.key;
    var amount = Number(request.params.amount);
    var type = request.params.type;
    var to = request.params.to;
    var from = request.params.from;
    var uid = request.params.uid;
        
    Parse.User.become(key).then(function (userOb) {

        console.info("step: 1");
        
        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var pointFetch = userOb.get("point");
            pointFetch.fetch({

                success:function(pointOb){

                    console.info("step: 2");
                    
                    if(pointOb.get("current_point") >= amount ){

                        console.info("step: 3");

                        var decreasePointResult = functionBase.pointDecreaseCalculator(pointOb, amount);

                        var decreasePurchaseAmount = decreasePointResult.decreasePurchaseAmount;
                        var decreaseAdAmount = decreasePointResult.decreaseAdAmount;
                        var decreaseCheerAmount = decreasePointResult.decreaseCheerAmount;
                        var decreasePatronWithdrawAmount = decreasePointResult.decreasePatronWithdrawAmount;
                        var decreaseRevenueAmount = decreasePointResult.decreaseRevenueAmount;
                        var decreaseAdminRewardAmount = decreasePointResult.decreaseAdminRewardAmount;
                        var decreaseRewardAmount = decreasePointResult.decreaseRewardAmount;
                        var decreaseFreeAmount = decreasePointResult.decreaseFreeAmount;
                        
                        var totalDecrease = decreasePurchaseAmount + decreaseAdAmount + decreaseCheerAmount + decreasePatronWithdrawAmount + decreaseRevenueAmount + decreaseAdminRewardAmount + decreaseRewardAmount + decreaseFreeAmount;

                        console.info("step: 4");

                        if(amount == totalDecrease){
                                            // pass
                            console.info("step: 5");
                            var ArtistPost = Parse.Object.extend("ArtistPost");
                            var artistPostQuery = new Parse.Query(ArtistPost);
                            artistPostQuery.get(from, {

                                success:function(artistPostOb){

                                    console.info("step: 6");

                                    pointOb.increment("current_purchase_point", -decreasePurchaseAmount);
                                    console.info("step: 6.1");
                                    pointOb.increment("current_free_point", -decreaseFreeAmount);
                                    console.info("step: 6.2");
                                    pointOb.increment("current_ad_point", -decreaseAdAmount);
                                    console.info("step: 6.3");
                                    pointOb.increment("current_cheer_point", -decreaseCheerAmount);
                                    console.info("step: 6.4");
                                    pointOb.increment("current_patron_withdraw_point", -decreasePatronWithdrawAmount);
                                    console.info("step: 6.5");
                                    pointOb.increment("current_revenue_point", -decreaseRevenueAmount);
                                    console.info("step: 6.6");
                                    pointOb.increment("current_admin_reward_point", -decreaseAdminRewardAmount);
                                    console.info("step: 6.7");
                                    pointOb.increment("current_reward_point", -decreaseRewardAmount);
                                    console.info("step: 6.8");
                                    pointOb.increment("current_point", -amount);

                                    console.info("step: 6.9");
                                    
                                    pointOb.save(null,{ useMasterKey: true }).then(function(savedPointOb){

                                        console.info("step: 7");
                                        var PointMObject = Parse.Object.extend("PointManager");
                                        var pointMOb = new PointMObject();
                                        pointMOb.set("user", userOb);
                                        pointMOb.set("type", type);
                                        pointMOb.set("from", from);
                                        pointMOb.set("to", to);
                                        pointMOb.set("status", true);

                                        pointMOb.set("amount", amount);
                                        pointMOb.set("free_amount", decreaseFreeAmount);
                                        pointMOb.set("ad_amount", decreaseAdAmount);
                                        pointMOb.set("purchase_amount", decreasePurchaseAmount);
                                        pointMOb.set("cheer_amount", decreaseCheerAmount);
                                        pointMOb.set("patron_withdraw_amount", decreasePatronWithdrawAmount);
                                        pointMOb.set("revenue_amount", decreaseRevenueAmount);
                                        pointMOb.set("admin_reward_amount", decreaseAdminRewardAmount);
                                        pointMOb.set("reward_amount", decreaseRewardAmount);
                                        
                                        pointMOb.set("point", pointOb);

                                        pointMOb.save(null, { useMasterKey: true }).then(function(savedPointMOb){

                                            console.info("step: 8");

                                            var PatronPointManager = Parse.Object.extend("PatronPointManager");
                                            var patronPMOb = new PatronPointManager();
                                            patronPMOb.set("point", pointOb);
                                            patronPMOb.set("point_manager", pointMOb);
                                            patronPMOb.set("artist_post", artistPostOb);
                                            patronPMOb.set("user", userOb);
                                            patronPMOb.set("status", true);
                                            patronPMOb.set("amount", amount);
                                            patronPMOb.set("free_amount", decreaseFreeAmount);
                                            patronPMOb.set("ad_amount", decreaseAdAmount);
                                            patronPMOb.set("purchase_amount", decreasePurchaseAmount);
                                            patronPMOb.set("cheer_amount", decreaseCheerAmount);
                                            patronPMOb.set("patron_withdraw_amount", decreasePatronWithdrawAmount);
                                            patronPMOb.set("revenue_amount", decreaseRevenueAmount);
                                            patronPMOb.set("admin_reward_amount", decreaseAdminRewardAmount);
                                            patronPMOb.set("reward_amount", decreaseRewardAmount);

                                            patronPMOb.save(null, { useMasterKey: true }).then(function(savedPatronPMOb){

                                                console.info("step", 9);
                                                
                                                var patron_array = artistPostOb.get("patron_array");
                                                
                                                var amIPatron = false;
                                                
                                                console.info("step", 70);
                                                
                                                if(patron_array == null){
                                                    
                                                    var amIPatron = false;
                                                    
                                                } else {
                                                    
                                                    for(var i=0;patron_array.length>i;i++){
                                                    
                                                        if(patron_array[i] == userOb.id){

                                                            amIPatron = true;

                                                        }

                                                    }
                                                    
                                                }
                                                
                                                var patronPMrelation = artistPostOb.relation("patron_point_manager");
                                                patronPMrelation.add(savedPatronPMOb);
                                                artistPostOb.increment("achieve_amount", amount);
                                                
                                                console.info("step", 71);
                                                
                                                if(!amIPatron){
                                                    
                                                    artistPostOb.increment("patron_count");
                                                    artistPostOb.addUnique("patron_array", userOb.id);
                                                    
                                                } 
                                                
                                                console.info("step", 72);
                                                
                                                artistPostOb.save(null, { useMasterKey: true }).then(function(savedartistPostOb){

                                                    console.info("step", "eight2");

                                                    var Score = Parse.Object.extend("Score");
                                                    var scoreOb = new Score();
                                                    scoreOb.set("from", userOb);
                                                    scoreOb.set("to", artistPostOb.get("user") );
                                                    scoreOb.set("post", artistPostOb);
                                                    scoreOb.set("type", "patron_point_send");
                                                    scoreOb.set("amount", amount);
                                                    scoreOb.set("done", false);
                                                    scoreOb.save(null, {useMasterKey:true});

                                                    var MyAlert = Parse.Object.extend("MyAlert");
                                                    var myAlertOb = new MyAlert();

                                                    myAlertOb.set("from", userOb);
                                                    myAlertOb.set("to", artistPostOb.get("user"));
                                                    myAlertOb.set("type", "patron");
                                                    myAlertOb.set("artist_post", artistPostOb);
                                                    myAlertOb.set("status", true);
                                                    myAlertOb.set("price", amount);
                                                    myAlertOb.save(null,{ useMasterKey: true }).then(function(savedPointMOb){

                                                        var responseDate = {
                                                            "point":savedPointOb.id,
                                                            "pointMOb":savedPointMOb.id,
                                                            "artistPost":savedartistPostOb.id,
                                                            "patronPM":savedPatronPMOb.id,
                                                            "status":true
                                                        }

                                                        response.success(responseDate);
                                                        

                                                    }, function(error){

                                                        var responseDate = functionBase.failResponse("pointMOb save fail","patron_point_send"); 
                                                        response.success(responseDate);

                                                    });    

                                                }, function(error){

                                                    var responseDate = functionBase.failResponse("artistpost save fail","patron_point_send"); 
                                                    response.success(responseDate);

                                                })

                                            })


                                        }, function(error){

                                            var responseDate = functionBase.failResponse("pointOb save fail","patron_point_send"); 
                                            response.success(responseDate);

                                        })

                                    }, function(error){

                                        var responseDate = functionBase.failResponse("pointMg save fail","patron_point_send"); 
                                        response.success(responseDate);

                                    });

                                },
                                error:function(error){

                                    var responseDate = functionBase.failResponse("artist query fail","patron_point_send"); 
                                    response.success(responseDate);

                                }

                            })

                        } else {
                            // error
                            var responseDate = functionBase.failResponse("decrease total is not equal to price","patron_point_send"); 
                            response.success(responseDate);

                        }
                                    

                    } else {

                        var responseDate = functionBase.failResponse("not enough point","patron_point_send"); 
                        response.success(responseDate);

                    }
                    
                },
                error:function(error){

                    var responseDate = functionBase.failResponse("point fetch fail","patron_point_send"); 
                    response.success(responseDate);

                }

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","patron_point_send"); 
            response.success(responseDate);

        }
        
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied","patron_point_send"); 
        response.success(responseDate);
    
    });
    
})

Parse.Cloud.define("key_check", function(request, response){
    
    var key = request.params.key;
    
    Parse.User.become(key).then(function (userOb) {
        
        var versionObject = Parse.Object.extend("Version");
        var versionQuery = new Parse.Query(versionObject);
        versionQuery.get("CaVYA1IbCm",{
            success:function(versionOb){

                var keyRequestLog = Parse.Object.extend("KeyRequestLog");
                var keyRequestLogOb = new keyRequestLog();
                keyRequestLogOb.set("user", userOb);
                keyRequestLogOb.save();

                var license_key = versionOb.get("license_key");
                var merchant_key = versionOb.get("merchant_key");
                var responseDate = {
                    "license":license_key,
                    "merchant":merchant_key,
                    "status":true
                }

                response.success(responseDate);

            },

            error:function(error){

                var responseDate = functionBase.failResponse("versionQuery fail","key_check"); 
                response.success(responseDate);

            }

        });
        
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied","key_check"); 
        response.success(responseDate);
    
    });
    
})


Parse.Cloud.define("patron_cancel", function(request, response){
    
    var key = request.params.key;
    var patronId = request.params.patronId;
    var action = request.params.action;
    var uid = request.params.uid;

    console.info(1);
    
    Parse.User.become(key).then(function (userOb) {

        console.info(2);

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var PatronObject = Parse.Object.extend("ArtistPost");
            var patronQuery = new Parse.Query(PatronObject);
            patronQuery.include("user");
            patronQuery.get(patronId, {

                success:function(patronOb){

                    console.info(3);

                    if(patronOb.get("user").id == userOb.id){

                        if(action == "cancel"){

                            console.info(4);

                            var patronUserRelation = patronOb.relation("patron_point_manager");
                            var patronUserQuery = patronUserRelation.query();
                            patronUserQuery.find({

                                success:function(patronUserObs){

                                    console.info(5);
                                    var patronRefundSuccess = _.after(patronUserObs.length, function(){

                                        console.info(7);
                                        var responseDate = functionBase.successResponse("refund success", "patron_cancel");
                                        response.success(responseDate);

                                    })

                                    _.each(patronUserObs, function(patronUserOb){

                                        console.info(6);

                                        if(patronUserOb.get("status") == true){

                                            console.info(10);

                                            var amount = patronUserOb.get("amount");
                                            var userPointOb = patronUserOb.get("point");
                                            var pointMGOb = patronUserOb.get("point_manager");
                                            var patronTargetUserOb = patronUserOb.get("user");

                                            pointMGOb.fetch({

                                                success:function(fetchedPointMGOb){

                                                    console.info(12);

                                                    var freeAmount = fetchedPointMGOb.get("free_amount");

                                                    console.info(121);

                                                    var adAmount = fetchedPointMGOb.get("ad_amount");
                                                    console.info(122);
                                                    var purchaseAmount = fetchedPointMGOb.get("purchase_amount");
                                                    console.info(123);

                                                    var total_amount = freeAmount + adAmount + purchaseAmount;
                                                    console.info(total_amount);
                                                    console.info(124);

                                                    patronUserOb.set("status", false);
                                                    console.info(125);
                                                    patronUserOb.save(null,{ useMasterKey: true }).then(function(savedPatronUserOb){

                                                        userPointOb.increment("current_free_point", freeAmount);
                                                        userPointOb.increment("current_ad_point", adAmount);
                                                        userPointOb.increment("current_purchase_point", purchaseAmount );
                                                        userPointOb.increment("current_point", total_amount);
                                                        userPointOb.save(null,{ useMasterKey: true }).then(function(savedUserPointOb){

                                                            var PointManager = Parse.Object.extend("PointManager");
                                                            var newPointMGOb = new PointManager();

                                                            newPointMGOb.set("type", "patron_refund");
                                                            newPointMGOb.set("amount", total_amount);
                                                            newPointMGOb.set("user", patronTargetUserOb);
                                                            newPointMGOb.set("point", userPointOb);
                                                            newPointMGOb.set("status", true);
                                                            newPointMGOb.set("free_amount", freeAmount);
                                                            newPointMGOb.set("ad_amount", adAmount);
                                                            newPointMGOb.set("purchase_amount", purchaseAmount);
                                                            newPointMGOb.set("patron", patronOb);
                                                            newPointMGOb.set("patron_point_manager", savedPatronUserOb);
                                                            newPointMGOb.set("point_manager", fetchedPointMGOb);
                                                            newPointMGOb.set("point", savedUserPointOb);
                                                            newPointMGOb.save(null,{ useMasterKey: true }).then(function(savedNewPointMGOb){

                                                                patronRefundSuccess();

                                                            }, function(error){

                                                                var responseDate = functionBase.failResponse("userPointOb save fail","patron_cancel"); 
                                                                response.success(responseDate);

                                                            })

                                                        }, function(error){

                                                            var responseDate = functionBase.failResponse("userPointOb save fail","patron_cancel"); 
                                                            response.success(responseDate);

                                                        })



                                                    }, function(error){

                                                        var responseDate = functionBase.failResponse("patronUserOb save fail","patron_cancel"); 
                                                        response.success(responseDate);

                                                    })

                                                },

                                                error:function(error){

                                                    var responseDate = functionBase.failResponse("pointMGOb fetch fail","patron_cancel"); 
                                                    response.success(responseDate);

                                                }

                                            })

                                        } else {

                                            patronRefundSuccess();

                                        }
                                        
                                    })

                                },

                                error:function(error){

                                    var responseDate = functionBase.failResponse("userOb save fail","patron_cancel"); 
                                    response.success(responseDate);

                                }

                            })


                        } else {

                            var responseDate = functionBase.failResponse("wrong action","patron_cancel"); 
                            response.success(responseDate);

                        }

                    } else {

                        var responseDate = functionBase.failResponse("badwritter","patron_cancel"); 
                        response.success(responseDate);

                    }

                },

                error:function(error){

                    var responseDate = functionBase.failResponse("patron find fail","patron_cancel"); 
                    response.success(responseDate);

                }

            })


        } else {

            var responseDate = functionBase.failResponse("duplication request","patron_cancel"); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied","patron_cancel"); 
        response.success(responseDate);
    
    });
    
})


Parse.Cloud.define("patron_withdraw", function(request, response){
    
    var key = request.params.key;
    var patronId = request.params.patronId;
    var action = request.params.action;
    var uid = request.params.uid;

    Parse.User.become(key).then(function (userOb) {

        var duplicationCheck = functionBase.duplicationCheck(userOb, "duplication_array", uid);

        if(duplicationCheck){

            functionBase.duplicationCheckUserDataSave(userOb, uid);

            var Patron = Parse.Object.extend("ArtistPost");
            var patronQuery = new Parse.Query(Patron);
            patronQuery.include("user");
            patronQuery.get(patronId, {

                success:function(patronOb){

                    console.info(2);

                    if(patronOb.get("user").id == userOb.id){

                        console.info(3);

                        if(action == "withdraw"){
                            console.info(4);

                            var amount = patronOb.get("achieve_amount");

                            userOb.get("point").fetch({

                                success:function(fetchedPointOb){

                                    console.info(6);

                                    fetchedPointOb.increment("current_patron_point", amount);
                                    //fetchedPointOb.increment("current_point", amount);
                                    //fetchedPointOb.increment("total_point", amount);
                                    fetchedPointOb.increment("total_patron_point", amount);
                                    fetchedPointOb.save(null,{ useMasterKey: true }).then(function(savedUserPointOb){

                                        var PointManager = Parse.Object.extend("PointManager");
                                        var newPointMGOb = new PointManager();

                                        newPointMGOb.set("type", "patron_withdraw");
                                        newPointMGOb.set("amount", amount);
                                        newPointMGOb.set("user", userOb);
                                        newPointMGOb.set("status", true);
                                        newPointMGOb.set("patron_amount", amount);
                                        newPointMGOb.set("patron", patronOb);
                                        newPointMGOb.set("point", savedUserPointOb);
                                        newPointMGOb.save(null,{ useMasterKey: true }).then(function(savedNewPointMGOb){

                                            var responseDate = {

                                                "status":true,
                                                "message":"withdraw success",
                                                "amount":amount,
                                                "current_point": savedUserPointOb.get("current_point")
                                            }

                                            response.success(responseDate);

                                        }, function(error){

                                            var responseDate = functionBase.failResponse("userPointOb save fail","patron_withdraw"); 
                                            response.success(responseDate);

                                        })

                                    }, function(error){

                                        var responseDate = functionBase.failResponse("userPointOb save fail","patron_withdraw"); 
                                        response.success(responseDate);

                                    })


                                },
                                error:function(error){

                                    var responseDate = functionBase.failResponse("userOb fetch fail","patron_withdraw"); 
                                    response.success(responseDate);

                                }

                            })

                        }

                    } else {

                        var responseDate = functionBase.failResponse("badwritter","patron_withdraw"); 
                        response.success(responseDate);

                    }

                },

                error:function(error){

                    var responseDate = functionBase.failResponse("patron find fail","patron_withdraw"); 
                    response.success(responseDate);

                }

            })

        } else {

            var responseDate = functionBase.failResponse("duplication request","patron_withdraw"); 
            response.success(responseDate);

        }
      
    }, function (error) {
      
        var responseDate = functionBase.failResponse("access denied","patron_withdraw"); 
        response.success(responseDate);
    
    });
        
})


Parse.Cloud.afterSave("MyAlert", function(request) {
  
    
    var fromUserOb = request.object.get("from");

    if(fromUserOb != null){

        fromUserOb.fetch({

            success:function(fromUserOb){

                var userOb = request.object.get("to");

                var fromUserName = fromUserOb.get("name");

                if(fromUserName == null || fromUserName.length == 0){

                    var fromUserName = "입력안됨";

                } 

                var type = request.object.get("type");

                var message = "";


                var pushQuery = new Parse.Query(Parse.Installation);
                pushQuery.equalTo('user', userOb);

                if(type == "follow"){

                    message = fromUserName + "님이 팔로우 했습니다.";

                } else if(type == "like_post") {

                    var postOb = request.object.get("artist_post");

                    postOb.fetch({

                        success:function(fetchedPostOb){

                            var body = fetchedPostOb.get("body");

                            message = fromUserName + "님이 좋아요를 눌렀습니다." + "[" + body + "]"; 

                            
                            Parse.Push.send({
                              where: pushQuery,
                              data: {
                                alert: message
                              }
                            }, { useMasterKey: true }).then(function(){
                                
                                console.info("push success");
                              
                            }, function(error){

                                console.info("push error");
                                
                            });

                        },
                        error:function(error){

                            console.info("postOb fetch fail");

                        }

                    })

                    

                } else if(type == "like_comment") {

                    var commentOb = request.object.get("comment");

                    commentOb.fetch({

                        success:function(fetchedCommentOb){

                            var body = fetchedCommentOb.get("body");

                            message = fromUserName + "님이 좋아요를 눌렀습니다." + "[" + body + "]"; 

                            Parse.Push.send({
                              where: pushQuery,
                              data: {
                                alert: message
                              }
                            }, { useMasterKey: true }).then(function(){
                                
                                console.info("push success");
                              
                            }, function(error){

                                console.info("push error");
                                
                            });

                        },
                        error:function(error){

                            console.info("commentOb fetch fail");
                        }

                    })

                    

                } else if(type == "comment_comment") {

                    var commentOb = request.object.get("comment");
                    var replyOb = request.object.get("reply");

                    replyOb.fetch({

                        success:function(fetchedCommentOb){

                            var body = fetchedCommentOb.get("body");

                            message = fromUserName + "님이 답글을 달았습니다." + "[" + body + "]"; 

                            Parse.Push.send({
                              where: pushQuery,
                              data: {
                                alert: message
                              }
                            }, { useMasterKey: true }).then(function(){
                                
                                console.info("push success");
                              
                            }, function(error){

                                console.info("push error");
                                
                            });

                        },
                        error:function(error){

                            console.info("commentOb fetch fail");

                        }

                    })

                } else if(type == "comment_post") {

                    var postOb = request.object.get("artist_post");

                    postOb.fetch({

                        success:function(fetchedPostOb){

                            var body = fetchedPostOb.get("body");

                            message = fromUserName + "님이 댓글을 달았습니다.." + "[" + body + "]"; 

                            Parse.Push.send({
                              where: pushQuery,
                              data: {
                                alert: message
                              }
                            }, { useMasterKey: true }).then(function(){
                                
                                console.info("push success");
                              
                            }, function(error){

                                console.info("push error");
                                
                            });

                        },
                        error:function(error){

                            console.info("postOb fetch fail");

                        }

                    })

                } else if(type == "social_request") {

                    var postOb = request.object.get("artist_post");

                    postOb.fetch({

                        success:function(fetchedPostOb){

                            var body = fetchedPostOb.get("body");

                            message = fromUserName + "님이 제작 요청을 했습니다." + "[" + body + "]"; 

                            Parse.Push.send({
                              where: pushQuery,
                              data: {
                                alert: message
                              }
                            }, { useMasterKey: true }).then(function(){
                                
                                console.info("push success");
                              
                            }, function(error){

                                console.info("push error");
                                
                            });

                        },
                        error:function(error){

                            console.info("postOb fetch fail");

                        }

                    })

                } else if(type == "social_poke") {

                    var socialOb = request.object.get("social");

                    socialOb.fetch({

                        success:function(fetchedSocialOb){

                            var pokeItemOb = fetchedSocialOb.get("pokeItem");

                            pokeItemOb.fetch({

                                success:function(fetchedPokeItemOb){

                                    var action = fetchedPokeItemOb.get("action");

                                    message = fromUserName + "님이 " + action; 

                                    Parse.Push.send({
                                      where: pushQuery,
                                      data: {
                                        alert: message
                                      }
                                    }, { useMasterKey: true }).then(function(){
                                
                                        console.info("push success");
                                      
                                    }, function(error){

                                        console.info("push error");
                                        
                                    });

                                },
                                error:function(error){

                                    console.info(error);

                                }

                            })

                        },
                        error:function(error){

                            console.info("socialOb fetch fail");

                        }

                    })

                } else if(type == "social_poke_response") {

                    var socialOb = request.object.get("social");

                    socialOb.fetch({

                        success:function(fetchedSocialOb){

                            var pokeItemOb = fetchedSocialOb.get("pokeItem");

                            pokeItemOb.fetch({

                                success:function(fetchedPokeItemOb){

                                    var action = fetchedPokeItemOb.get("action");

                                    message = fromUserName + "님이 " + action; 

                                    Parse.Push.send({
                                      where: pushQuery,
                                      data: {
                                        alert: message
                                      }
                                    }, { useMasterKey: true }).then(function(){
                                
                                        console.info("push success");
                                      
                                    }, function(error){

                                        console.info("push error");
                                        
                                    });

                                },
                                error:function(error){

                                    console.info(error);

                                }

                            })

                        },
                        error:function(error){

                            console.info("socialOb fetch fail");
                        }

                    })

                } else if(type == "purchase") {

                    var postOb = request.object.get("artist_post");

                    
                    postOb.fetch({

                        success:function(fetchedPostOb){

                            var title = fetchedPostOb.get("title");

                            message = fromUserName + "님이 " + "[" + title + "]" + "를(을) 구매 했습니다."; 

                            Parse.Push.send({
                              where: pushQuery,
                              data: {
                                alert: message
                              }
                            }, { useMasterKey: true }).then(function(){
                                
                                console.info("push success");
                              
                            }, function(error){

                                console.info("push error");
                                
                            });
                        
                        },
                        error:function(error){

                            console.info("postOb fetch fail");
                        }

                    })

                } else if(type == "patron") {

                    
                    var postOb = request.object.get("artist_post");

                    postOb.fetch({

                        success:function(fetchedPostOb){

                            var title = fetchedPostOb.get("title");

                            message = fromUserName + "님이 후원 했습니다." + "[" + title + "]"; 

                            Parse.Push.send({
                                
                                where: pushQuery,
                                
                                data: {
                                    alert: message
                                }

                            }, { useMasterKey: true }).then(function(){
                                
                                console.info("push success");
                              
                            }, function(error){

                                console.info("push error");
                                
                            });

                        },
                        error:function(error){
                            console.info("postOb fetch fail");

                        }

                    })

                } else if(type=="share"){

                    var postOb = request.object.get("artist_post");

                    postOb.fetch({

                        success:function(fetchedPostOb){

                            var alertMessage;
                            var title = fetchedPostOb.get("title");
                            if(title == null){

                                alertMessage = "";

                            } else {

                                alertMessage = title;

                            }

                            var body = fetchedPostOb.get("body");

                            if(body == null){

                                alertMessage += "";

                            } else {

                                alertMessage += " " + body;
                            }

                            message = fromUserName + "님이 공유 했습니다." + "[" + alertMessage + "]"; 

                            Parse.Push.send({
                                
                                where: pushQuery,
                                
                                data: {
                                    alert: message
                                }

                            }, { useMasterKey: true }).then(function(){
                                
                                console.info("push success");
                              
                            }, function(error){

                                console.info("push error");
                                
                            });

                        },
                        error:function(error){
                            console.info("postOb fetch fail");

                        }

                    })

                }

            },

            error:function(error){


            }


        })

    } else {

        var type = request.object.get("type");

        if(type=="job"){

            var hour = request.object.get("hours");
            
            var adminQuery = new Parse.Query(Parse.Installation);
            adminQuery.equalTo('userId', "ohIrKUjIYD");

            var message = hour.toString() + "시 Job이 성공적으로 실행됐습니다."; 

            Parse.Push.send({
                
                where: adminQuery,
                
                data: {
                    alert: message
                }

            }, { useMasterKey: true }).then(function(){
                
                console.info("push success");
              
            }, function(error){

                console.info("push error");
                
            });


        }

    }

});


Parse.Cloud.afterSave("BetaTester", function(request) {
  
    var object = request.object;
    var kakaoId = request.object.get("kakao_id");
    var email = request.object.get("email");
    var now = new Date();

    var message = kakaoId + " : " + email + "님이 베타테스트를 신청했습니다." 

    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.containedIn('userId', ["IbovvfkgaZ", "unPRTYnLBS", "uh9S3Lpv9k", "X3B2jrSboN"]);

    Parse.Push.send({
      where: pushQuery,
      data: {
        alert: message
      }
    }, { useMasterKey: true }).then(function(){
        
        console.info("push success");
      
    }, function(error){

        console.info("push error");
        
    });

});

Parse.Cloud.afterSave("Score", function(request){

    console.info("location: Score");

    var object = request.object;
    var from = object.get("from");
    var to = object.get("to");
    var type = object.get("type");
    var status = object.get("done");

    //Post Ranking Index
    var viewScore = 1;
    var likeScore = 10;
    var commentScore = 20;
    var shareScore = 30;

    //Personal Ranking & multiply
    var boxScore = 10;

    //Relation Ranking Index
    var pokeScore = 5;
    var followScore = 5;
    var followRelationScore = 100;

    console.info("type" + type);

    functionBase.relationScoreManager(object);
    
    if(type == "like_post" ){

        var postOb = object.get("post");

        postOb.increment("week_score", likeScore);
        postOb.increment("total_score", likeScore);
        postOb.set("lastAction" ,"score update");
        postOb.save(null, {useMasterKey:true});

        //relation score make

    } else if (type == "like_post_cancel" ){

        var postOb = object.get("post");

        postOb.increment("week_score", -likeScore);
        postOb.increment("total_score", -likeScore);
        postOb.set("lastAction","score update");
        postOb.save(null, {useMasterKey:true});

    } else if(type == "patron_point_send" ){

        var postOb = object.get("post");

        postOb.increment("week_patron", amount);
        postOb.increment("total_patron", amount);
        postOb.set("lastAction" ,"score update");
        postOb.save(null, {useMasterKey:true});

    } else if(type == "revenue"){

        var commercialOb = object.get("commercial");
        var amount = object.get("amount");

        commercialOb.fetch().then(function(fetchedCommercialOb){

            console.info("revenue score after save start");

            var postOb = fetchedCommercialOb.get("artist_post");
        
            postOb.increment("week_revenue", amount);
            postOb.increment("total_revenue", amount);
            postOb.set("lastAction" ,"score update");
            postOb.save(null, {useMasterKey:true});

        }, function(error){

            console.info("revenue score after save error")
            console.info(error);

        })

    } else if(type == "comment"){

        var postOb = object.get("post");

        postOb.increment("week_score", commentScore);
        postOb.increment("total_score", commentScore);
        postOb.set("lastAction" ,"score update");
        postOb.save(null, {useMasterKey:true});

    } else if(type == "share"){

        var postOb = object.get("post");

        postOb.increment("week_score", shareScore);
        postOb.increment("total_score", shareScore);
        postOb.set("lastAction" ,"score update");
        postOb.save(null, {useMasterKey:true});

    } else if(type == "post_comment"){

        var postOb = object.get("post");

        postOb.increment("week_score", shareScore);
        postOb.increment("total_score", shareScore);
        postOb.set("lastAction" ,"score update");
        postOb.save(null, {useMasterKey:true});
    
    }

})

Parse.Cloud.afterSave("DMChat", function(request){

    console.info("location: DMChat afterSave")

    var dmChatOb = request.object;

    var from = dmChatOb.get("from");
    var to = dmChatOb.get("to");
    var dmListOb = dmChatOb.get("dm_list");

    dmListOb.fetch().then(function(fetchedDmListOb){

        from.fetch().then(function(fromUserOb){

            var current_member = fetchedDmListOb.get("current_member");

            if(current_member.indexOf(to.id) == -1){

                console.info("push send");

                var message = fromUserOb.get("name") + ":" + dmChatOb.get("body");

                var pushQuery = new Parse.Query(Parse.Installation);
                pushQuery.equalTo('user', to);

                Parse.Push.send({
                    
                    where: pushQuery,
                    
                    data: {
                        alert: message
                    }

                }, { useMasterKey: true }).then(function(){
                    
                    console.info("push success");
                  
                }, function(error){

                    console.info("push error");
                    
                });

            } else {

                console.info("push not send");
            }

        }, function(error){

            console.info("message: from user fetch fail ");

        })

    },function(error){

        console.info("message: dmListOb fetch fail ");

    })

})

Parse.Cloud.afterSave("AdLog", function(request){

    var adLogOb = request.object;
    var queryDate = adLogOb.createdAt;

    adLogOb.set("queryDate", queryDate);
    adLogOb.save(null, {useMasterKey:true});

})


Parse.Cloud.afterSave("TagMaker", function(request){

    var tagMakerOb = request.object;

    var tags = tagMakerOb.get("tag_array");
    var userOb = tagMakerOb.get("user");
    var postOb = tagMakerOb.get("postOb");
    var action = tagMakerOb.get("action");
                            
    //in case of no tags
    if(action == "like"){

        var tagExist = false;
    
        if(tags != null){
            
            if(tags.length == 0){
                
                tagExist = false;
                
            } else {
                
                tagExist = true;
                
            }
            
        } else {
            
            tagExist = false;
            
        }
        
        if(tagExist){
            
            var userObArray = [];
        
            var userObSave = _.after(tags.length, function(){

                console.info(4);

                for(var i=0;tags.length>i;i++){

                    userOb.addUnique("tags", tags[i]);

                }

                userOb.save(null,{ useMasterKey: true });

            })

            _.each(tags, function(tag){

                console.info(3);

                var TagLog = Parse.Object.extend("TagLog");
                var tagLogOb = new TagLog();    
                tagLogOb.set("tag", tag);
                tagLogOb.set("user", userOb);
                tagLogOb.set("type", "like");
                tagLogOb.set("place", "Like");
                tagLogOb.set("status", true);
                tagLogOb.set("add", true);
                tagLogOb.save(null, { useMasterKey: true });

                userObSave();

            })
            
        } 

    } else {
                    
        var tagExist = false;
        
        if(tags != null){
            
            if(tags.length == 0){
                
                tagExist = false;
                
            } else {
                
                tagExist = true;
                
            }
            
            
        } else {
            
            tagExist = false;
            
        }
        
        if(tagExist){
            
            var userObArray = [];
        
            var userObSave = _.after(tags.length, function(){

                console.info(4);

                for(var i=0;tags.length>i;i++){

                    userOb.remove("tags", tags[i] ); 

                }

                console.info(5);
                
                userOb.save(null,{ useMasterKey: true });

            })

            _.each(tags, function(tag){

                console.info(3);

                var TagLog = Parse.Object.extend("TagLog");
                var tagLogOb = new TagLog();    
                tagLogOb.set("tag", tag);
                tagLogOb.set("user", userOb);
                tagLogOb.set("type", "like");
                tagLogOb.set("place", "LikeCancel");
                tagLogOb.set("status", true);
                tagLogOb.set("add", false);
                tagLogOb.save(null, { useMasterKey: true });

                userObSave();

            })
            
        } 

    }

})



