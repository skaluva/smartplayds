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
		
		$scope.$on("google:authenticated",function(){
			$scope.authenticated=true;
			//~ console.log("11111");
			$scope.$on("googlePlus:loaded", function() {
				//~ console.log("2222");
			  googlePlus.getCurrentUser().then(function(user) {
				$scope.currentUser = user;
				//~ console.log("3333");
				//~ console.log("calling get user info of rva api...");
			  });
			})
		});
		$scope.currentUser = googleLogin.currentUser;

		
		$scope.rvaLogin=function(){
				googleLogin.login();// first do google login...
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
						}
						res+="</pre>";
						
						$('#user-details').html(res);
					 });
				},apiRoot);
		}
		
		$scope.listUsers=function(){
				googleLogin.login();// first do google login...
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
	}]);
