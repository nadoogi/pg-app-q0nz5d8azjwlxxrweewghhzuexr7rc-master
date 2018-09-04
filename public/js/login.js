



$(document).ready(function(){
    
    
    $( "#main_container" ).load( "/html/login.html", function() {

            
            
            
            $("#login_body_email_login_button").on("click", function(){
                
                var email = $("#login_email").val();
                var password = $("#login_password").val();

                if( email.length == 0 || email == null){


                } else if(password.length == 0 || password == null){


                } else {
                    
                    var url = "/login/excute";

                    $.ajax({
                        method: "POST",
                        url: url,
                        data:{
                            
                            email:email,
                            password:password
                            
                        },
                        
                        
                        success: function(result){

                            if(result.msg == "success"){
                                
                                location.reload();
                                
                            } else {
                                    
                                console.log(result);
                                
                            }
                            
                        },

                        error: function(error){

                            console.log(error);

                        }

                    })
                    
                    

                }
                
                
            })
            
            
        });
    
    
    
        
    
    
})