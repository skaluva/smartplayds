angular.module('smartplayds', ["googleApi","ngResource","ngSanitize"])
    .config(function(googleLoginProvider) {
        googleLoginProvider.configure({
            clientId: '444838946066-s4p6e92h5pvnifbt4q1itahv0c65fjeu.apps.googleusercontent.com',
            apiKey:'AIzaSyDng7IudEAYAhFwxwKyv7eVjqjJo07Z16g',
            scopes: ["https://www.googleapis.com/auth/userinfo.email"/*, "https://www.googleapis.com/auth/calendar"*/, "https://www.googleapis.com/auth/plus.login"]
         });
	 })
	 .filter("unsafe",function($sce){
		 return function(val){
			 return $sce.trustAsHtml(val);
		 }
	 }) 
	 
	.controller('MainCtrl', ['$scope', 'googleLogin', 'googlePlus', '$sce', function ($scope, googleLogin,googlePlus,$sce) {

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
				$scope.rvaLogin();	
			  });
			})
		});
		$scope.currentUser = googleLogin.currentUser;
		$scope.renderHtml = function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };

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
					var apiRoot='https://rvacore-test.appspot.com/_ah/api';
					gapi.client.load('core', 'v0', function() {
					var request = gapi.client.core.user.get({
						//'username': 'sreenivasulu.kaluva@gmail.com'
						  });
						  
						 request.execute(function(resp) {

							$scope.userDetails="<pre>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
							$scope.$apply();
						 });
					},apiRoot);
				//}
				
				//postLogin();//validate login and invoke rva api..
		}
		
		$scope.listUsers=function(){
			var apiRoot='https://rvacore-test.appspot.com/_ah/api';
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.user.list({
					//'username': 'sreenivasulu.kaluva@gmail.com'
				  });
				  
				 request.execute(function(resp) {
					$scope.userList="<pre>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					$scope.$apply();
				 });
			  },apiRoot);
		}
		
		$scope.getPresentation=function(presentationId){
			var apiRoot='https://rvacore-test.appspot.com/_ah/api';
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.get({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:presentationId
				  });
				  
				 request.execute(function(resp) {
					//$scope.presentationInfo="<pre>"+(resp.error!=null?JSON.stringify(resp.error,null,2):resp.item.layout)+"</pre>";
					
					$scope.presentationInfo=(resp.error!=null?"<pre>"+JSON.stringify(resp.error,null,2)+"</pre>":resp.item.layout);
					$scope.$apply();
				 });
			  },apiRoot);				
		}
		
		$scope.listPresentations=function(presentationId){
			var apiRoot='https://rvacore-test.appspot.com/_ah/api';
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.list({
					//'username': 'sreenivasulu.kaluva@gmail.com'
				  });
				  
				 request.execute(function(resp) {
					//$scope.presentationList="<pre>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					$scope.presentationList=resp.error!=null?"<pre>"+JSON.stringify(resp.error,null,2)+"</pre>":resp.result;
					$scope.$apply();
				 });
			  },apiRoot);				
				
		}	
		
		$scope.publishPresentation=function(presentationId){
			var apiRoot='https://rvacore-test.appspot.com/_ah/api';
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.publish({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:presentationId
				  });
				  
				 request.execute(function(resp) {
					//$scope.presentationInfo="<pre>"+(resp.error!=null?JSON.stringify(resp.error,null,2):resp.item.layout)+"</pre>";
					
					
					//$scope.presentationInfo=(resp.error!=null?"<pre>"+JSON.stringify(resp.error,null,2)+"</pre>":resp.result);
					
					
					$scope.resp="<pre>***PUBLISH "+presentationId+" RESPONSE***<br>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					$scope.$apply();
				 });
			  },apiRoot);				
		}
		
		$scope.deletePresentation=function(presentationId){
			var apiRoot='https://rvacore-test.appspot.com/_ah/api';
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.delete({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:presentationId
				  });
				  
				 request.execute(function(resp) {
					//$scope.presentationInfo="<pre>"+(resp.error!=null?JSON.stringify(resp.error,null,2):resp.item.layout)+"</pre>";
					
					$scope.resp="<pre>***DELETE "+presentationId+" RESPONSE***<br>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					
					//$scope.presentationInfo=(resp.error!=null?"<pre>"+JSON.stringify(resp.error,null,2)+"</pre>":resp.result);
					$scope.$apply();
					
					$scope.listPresentations();
				 });
			  },apiRoot);				
		}
	}]);
