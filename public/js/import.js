var IMP = window.IMP; // 생략가능
IMP.init('imp43818844'); // 'iamport' 대신 부여받은 "가맹점 식별코드"를 사용

/* 중략 */

//onclick, onload 등 원하는 이벤트에 호출합니다

function getParam(paramArray, query){
    
    for(var i=0;paramArray.length>i;i++){
        
        var arrayItem = paramArray[i];
        console.log(arrayItem);
        
        if(arrayItem.indexOf(query) != -1){
            
            var value = arrayItem.split("=")[1];
        
            return value;
            
        } 
        
        
    }
    
    
}


$(document).ready(function(){
    
    var url = window.location.href;
    var parameters = url.split("?");
    console.log(parameters);
    var paramArray = parameters[1].split("&");
    console.log(paramArray);
    
    var amount = getParam(paramArray, "amount");
    var type = getParam(paramArray, "type");
    var email = getParam(paramArray, "email");
    var name = getParam(paramArray, "name");
    
    console.log(amount);
    console.log(type);
    console.log(email);
    console.log(name);
    

	IMP.request_pay({
        pg : 'html5_inicis', // version 1.1.0부터 지원.
        pay_method : 'card',
        merchant_uid : 'merchant_' + new Date().getTime(),
        name : '주문명:포인트 결제',
        amount : Number(amount),
        buyer_email : email,
        buyer_name : name,
        //buyer_tel : '010-1234-5678',
        //buyer_addr : '서울특별시 강남구 삼성동',
        //buyer_postcode : '123-456',
        m_redirect_url : 'https://pg-app-q0nz5d8azjwlxxrweewghhzuexr7rc.scalabl.cloud/payments/complete?amount=' + amount,
        app_scheme : 'anicast'
    }, function(rsp) {
        if ( rsp.success ) {
            var msg = '결제가 완료되었습니다.';
            msg += '고유ID : ' + rsp.imp_uid;
            msg += '상점 거래ID : ' + rsp.merchant_uid;
            msg += '결제 금액 : ' + rsp.paid_amount;
            msg += '카드 승인번호 : ' + rsp.apply_num;
        } else {
            var msg = '결제에 실패하였습니다.';
            msg += '에러내용 : ' + rsp.error_msg;
        }

        alert(msg);
    });


})