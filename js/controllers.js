angular.module('smartplayds', ["googleApi"])
    .config(function(googleLoginProvider) {
        googleLoginProvider.configure({
            clientId: '444838946066-s4p6e92h5pvnifbt4q1itahv0c65fjeu.apps.googleusercontent.com',
            apiKey:'AIzaSyDng7IudEAYAhFwxwKyv7eVjqjJo07Z16g',
            scopes: ["https://www.googleapis.com/auth/userinfo.email"/*, "https://www.googleapis.com/auth/calendar"*/, "https://www.googleapis.com/auth/plus.login"]
         });
	 }) 
	 
	.controller('MainCtrl', ['$scope', 'googleLogin', 'googlePlus', function ($scope, googleLogin,googlePlus) {

		$scope.authenticated = false;
		$scope.login = function () {
			//~ console.log("5555");
			googleLogin.login();
		};
		
		$scope.$on("google:authenticated",function(res){
			$scope.authenticated=true;
			
			//console.log("11111:"+JSON.stringify(res));
			$scope.$on("googlePlus:loaded", function() {
				//~ console.log("2222");
			  googlePlus.getCurrentUser().then(function(user) {
				$scope.currentUser = user;
				$('#loginUser').show();
				//~ console.log("3333");
				//~ console.log("calling get user info of rva api...");
			  });
			})
		});
		$scope.currentUser = googleLogin.currentUser;
/*
	{
  "item": {
    "id": "a39fef2c-1030-4dd0-ab9e-aa24685fb0db",
    "companyId": "2d89b40e-8e16-4116-b60b-0cbaf8446d39",
    "username": "sreenivasulu.kaluva@gmail.com",
    "creationDate": "2014-09-02T18:42:43.200Z",
    "email": "sreenivasulu.kaluva@gmail.com",
    "lastLogin": "2014-09-16T09:51:56.629Z",
    "status": 1,
    "roles": [
      "ce",
      "cp",
      "da",
      "ua"
    ],
    "termsAcceptanceDate": "2014-09-03T06:26:29.000Z",
    "showTutorial": false,
    "mailSyncEnabled": false,
    "changedBy": "gigaep@gmail.com",
    "changeDate": "2014-09-03T07:41:16.860Z"
  },
  "kind": "core#userItem",
  "etag": "\"ILARndlgR_krPGplr1hl3jBUckw/sYiKGxukF8hhd8OznoTP1GuCn5A\""
}
*/
		
		$scope.rvaLogin=function(){
				
				postLogin=function(){
						//~ console.log("6666");
					var apiRoot='https://rvacore-test.appspot.com/_ah/api';
					gapi.client.load('core', 'v0', function() {
					var request = gapi.client.core.user.get({
						//'username': 'sreenivasulu.kaluva@gmail.com'
						  });
						  
						 request.execute(function(resp) {
							var res="<b>----RiseVision User Details----</b><br><pre>";
							if(resp.error!=null){
								res+=JSON.stringify(resp.error,null,2);
							}else{
								res+=JSON.stringify(resp.result,null,2);
								$scope.currentUser.id=resp.result.item.id;
								$scope.currentUser.companyId=resp.result.item.companyId;
								//alert($scope.currentUser);
							}
							res+="</pre>";
							
							$('#user-details').html(res);
						 });
					},apiRoot);
				}
				
				googleLogin.loginWithCallback(postLogin);//validate login and invoke rva api..
		}
		
		$scope.listUsers=function(){
				invoke=function(){
					var apiRoot='https://rvacore-test.appspot.com/_ah/api';
					gapi.client.load('core', 'v0', function() {
					  var request = gapi.client.core.user.list({
							//'username': 'sreenivasulu.kaluva@gmail.com'
						  });
						  
						 request.execute(function(resp) {
								var res="<b>----Users List for this user----</b><br><pre>";
								if(resp.error!=null){
									res+=JSON.stringify(resp.error,null,2);
								}else{
									res+=JSON.stringify(resp.result,null,2);
								}
								res+="</pre>";
								
								//heading.appendChild(document.createTextNode(res));
								$('#user-list').html(res);
						 });
					  },apiRoot);
				}
				
				googleLogin.loginWithCallback(invoke);//validate login and invoke rva api..
		}
		
		$scope.listTemplates=function(){
			alert('list templates clicked..'+$scope.currentUser.companyId);
			var apiRoot='https://rvacore-test.appspot.com/v1/company/'+$scope.currentUser.companyId+'/templates';
			/*function writeResponse(resp) {
			  var responseText;
			  
			  if (resp.error && resp.error.errors[0].debugInfo == 'QuotaState: BLOCKED') {
				responseText = 'Invalid API key provided. Please replace the "apiKey" value with your own.';
			  } else {
				//responseText = 'Short URL ' + shortUrl + ' expands to ' + resp.longUrl;
			  }
			  $('#template-list').html(resp);
			}

			//var shortUrl = document.getElementById('shortUrl').value;
			var restRequest = gapi.client.request({
			   'path': apiRoot
			   'params' : {'shortUrl' : shortUrl}
			});

			restRequest.execute(writeResponse);*/
			/*
			
			$.get(
			apiRoot,{},
			//{paramOne : 1, paramX : 'abc'},
			function(data) {
			   alert('page content: ' + data);
			});*/
			
			var xmlhttp = new XMLHttpRequest();
		var oauthToken = gapi.auth.getToken();
		xmlhttp.open('GET',apiRoot);
		xmlhttp.onreadystatechange=function()
		  {
		  if (xmlhttp.readyState==4 && xmlhttp.status==200)
			{
			//document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
			 $('#template-list').html(xmlhttp.responseText);
			}
		  } 
		xmlhttp.setRequestHeader('Access-Control-Allow-Origin','http://localhost:9000');
		xmlhttp.setRequestHeader('Authorization','Bearer ' + oauthToken.access_token);
		
		xmlhttp.send();

			
			
		}	
	}]);
