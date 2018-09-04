


$("document").ready(function(){
    
    var currentIp = ip();
    
    $('.carousel').carousel()
    
    var countUrl = "/event/counter"
    var callDate = {};
    
    $.ajax({
        method: "POST",
        url: countUrl,
        data: callDate,
        success:function(response){

            var count = response.result;
            var vacant = 150 - response.result;
            
            $("#counter_1").html(String(count));
            //$("#counter_2").html(String(vacant));
            
            $("#progress_text").attr("style", "padding-left: "+String(count/150 * 100 - 20)+"%;float:left");
            $("#progressbar").attr("style","width:" + String(count/150 * 100 )+"%" );
            
            $("#button").on("click", function(){
        
                var androidConfirm = confirm("안드로이드폰 사용자만 지원할 수 있습니다. 안드로이드폰 이용자가 맞으신가요?");

                var confirmAlert = confirm("중복신청 방지를 위해 카톡 아이디와 IP수집 동의가 필요합니다. 신청 종료 후 수집 데이터는 완전히 삭제 됩니다. 동의하시겠습니까?");

                if(androidConfirm){


                    if(confirmAlert){
                        
                        if(count < 150){
                
                            var id = $("#id").val();
                            var email = $("#email").val();
                            
                            var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                            
                            
                            if(email.match(regExp) != null){
                                
                                var url = "/kakaosave"

                                var data = {

                                    kakao:id,
                                    ip:currentIp,
                                    email:email

                                }

                                $.ajax({
                                    method: "POST",
                                    url: url,
                                    data: data,
                                    success:function(response){

                                        console.log(response);
                                        if(response.result == 0){

                                            alert("신청이 완료 되었습니다. 전달주신 카톡 아이디로 오픈채팅 초대 드리겠습니다. 감사합니다^^");
                                            window.location.reload();

                                        } else if(response.result == 1){

                                            alert("동일 IP에서 반복적인 요청이 확인 되었습니다. ssamkyu@studiobear.net으로 메일 부탁 드립니다.");
                                            window.location.reload();

                                        } else if(response.result == 2){

                                            alert("문제가 발생했습니다. 다시 시도 부탁 드립니다.")
                                            window.location.reload();

                                        } else if(response.result == 3){

                                            alert("이미 신청이 되어 있습니다. 처음 시도하는 분은 ssamkyu@studiobear.net으로 메일 부탁 드립니다.");
                                            window.location.reload();

                                        } 




                                    },
                                    error:function(error){

                                        console.log(error);

                                    }

                                });
                                
                            } else {
                                
                                alert("이메일 형식이 맞지 않습니다. 다시 확인해주세요.")
                                $("#email").val("");
                                
                            }

                            

                            
                
                
                        } else {

                            alert("지원이 마감되었습니다. 감사합니다^^")

                        }

                    } 


                }





            });
            
            
            

        },
        error:function(error){

            console.log(error);

        }

    });
    
   
	
})