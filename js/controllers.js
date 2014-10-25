angular.module('smartplayds')
	.constant("API_ROOT","https://rvacore-test.appspot.com/_ah/api")
    
    .config(function(googleLoginProvider) {
        googleLoginProvider.configure({
            clientId: '444838946066-s4p6e92h5pvnifbt4q1itahv0c65fjeu.apps.googleusercontent.com',
            apiKey:'AIzaSyDng7IudEAYAhFwxwKyv7eVjqjJo07Z16g',
            scopes: ["https://www.googleapis.com/auth/userinfo.email"/*, "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/plus.login"*/]
         });
	 })
	 
	 .filter("unsafe",function($sce){
		 return function(val){
			 return $sce.trustAsHtml(val);
		 }
	 }) 
	 
	.controller('MainCtrl', ['$scope', 'googleLogin', 'googlePlus','API_ROOT',  function ($scope, googleLogin,googlePlus,apiRoot) {

		$scope.authenticated = false;
		$scope.login = function () {
			googleLogin.login();
		};
		
		$scope.$on("google:authenticated",function(res){
			$scope.authenticated=true;
			$scope.currentUser = googleLogin.currentUser;	
			$scope.$on("googlePlus:loaded", function() {
			  googlePlus.getCurrentUser().then(function(user) {
				$scope.currentUser = user;
				$scope.rvaLogin();	
			  });
			})
		});
		
		
		
		$scope.logout = function() {
			if(confirm("Are you sure you want to logout?")){
				googleLogin.logout();
				$scope.authenticated=false;
				$scope.currentUser=null;
				alert("You are logged out successfully!");	
			};
		}
		
		$scope.rvaLogin=function(){
			gapi.client.load('core', 'v0', function() {
			var request = gapi.client.core.user.get({
				//'username': 'sreenivasulu.kaluva@gmail.com'
				  });
				  
				 request.execute(function(resp) {

					$scope.userDetails="<pre>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					$scope.currentUser.companyId=resp.result.item.companyId;
					$scope.$apply();
				 });
			},apiRoot);
		}
		
		$scope.listUsers=function(){
			if(!$scope.authenticated){
				alert("Please login!");
				return;
			}
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

		//GET PRESENTATION		
		$scope.getPresentation=function(presentationId){
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.get({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:presentationId
				  });
				  
				 request.execute(function(resp) {
					 
					if(resp.error==null){
						$scope.presentationInfo=resp.item.layout;
						$scope.myPres=resp.item;
					 }else{
						 $scope.presentationInfo="<pre>"+JSON.stringify(resp.error,null,2)+"</pre>";
						 $scope.myPres={};
					 }
					
					$scope.$apply();
				 });
			  },apiRoot);				
		}
		//LIST PRESENTATIONS
		$scope.listPresentations=function(presentationId){
			if(!$scope.authenticated){
				alert("Please login!");
				return;
			}
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.list({
					//'username': 'sreenivasulu.kaluva@gmail.com'
				  });
				  
				 request.execute(function(resp) {
					if(resp.error!=null){
						$scope.presentationListRespError="<pre>"+JSON.stringify(resp.error,null,2)+"</pre>";
					}else{
						$scope.presentationListRespError=null;
						$scope.presentationList=resp.result;	
					}
					$scope.$apply();
				 });
			  },apiRoot);				
				
		}	
		
		//PUBLISH PRESENTATION
		$scope.publishPresentation=function(presentationId){
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.publish({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:presentationId
				  });
				  
				 request.execute(function(resp) {
					$scope.resp="<pre>***PUBLISH "+presentationId+" RESPONSE***<br>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					if(resp.error!=null){
						alert("Error occurred. Please try again! <br>"+JSON.stringify(resp.error,null,2));
					}else{
						alert(presentationId+" published successfully!");
					}
					$scope.$apply();
				 });
			  },apiRoot);				
		}
		
		//DELETE PRESENTATION
		$scope.deletePresentation=function(presentationId){
			if(!confirm("Are you sure you want to delete?")){
				return;
			}
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.delete({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:presentationId
				  });
				  
				 request.execute(function(resp) {
					if(resp.error!=null){
						alert("Error occurred. Please try again! <br>"+JSON.stringify(resp.error,null,2));
						//$scope.resp="<pre>***DELETE "+presentationId+" RESPONSE***<br>"+JSON.stringify(resp.error,null,2)+"</pre>";	
						//$scope.$apply();
					}else{
						/*$scope.resp="<pre>***DELETE "+presentationId+" RESPONSE***<br>"+JSON.stringify(resp.result,null,2)+"</pre>";
						$scope.$apply(function(){
							alert("Presentation "+presentationId+" deleted successfully!");	
							$scope.listPresentations();		
						});*/
						alert("Presentation "+presentationId+" deleted successfully!");	
						$scope.showPresTabs=false;
						$scope.listPresentations();		
					}
					
					
				 });
			  },apiRoot);				
		}
		
		
		$scope.showNewPresentationForm=function(){
			if(!$scope.authenticated){
				alert("Please login!");
				return;
			}
			$scope.myPres={"publish":0,"isTemplate":false};//default values...
			$scope.showNewPresForm=true;
			$scope.showPresTabs=false;
			$scope.showTemplateTabs=false;	
		}
		
		//CREATE PRESENTATION
		$scope.createPresentation=function(pres,presForm){
			
			
			$scope.submitted=true;
			if (presForm.$invalid) {
				return;
			}
			
			
			var data={
				"name": pres.name,
				"publish": pres.publish,
				"layout":pres.layout,
				"isTemplate":pres.isTemplate
			}
			
			
			//alert("companyId: "+$scope.currentUser.companyId);
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.add({
					companyId:$scope.currentUser.companyId,
					data: JSON.stringify(data)
				  });
				  
				 request.execute(function(resp) {
					if(resp.error!=null){
						alert("Error occurred. Please try again! <br>"+JSON.stringify(resp.error,null,2));
						//$scope.createResp="<pre>***CREATE "+pres.name+" RESPONSE***<br>"+JSON.stringify(resp.error,null,2)+"</pre>";	
						//$scope.$apply();
					}else{
						//$scope.createResp="<pre>***CREATE "+pres.name+" RESPONSE***<br>"+JSON.stringify(resp.result,null,2)+"</pre>";
						/*$scope.$apply(function(){
							alert("Presentation "+pres.name+" added successfully!");	
						});*/
						
						alert("Presentation "+pres.name+" created successfully!");	
					}
					
				 });
			  },apiRoot);				
		}
		
		// UPDATE PRESENTATION
		$scope.updatePresentation=function(pres,presForm){
			
			
			$scope.submitted=true;
			if (presForm.$invalid) {
				return;
			}
			
			
			var data={
				"name": pres.name,
				"publish": pres.publish,
				"layout":pres.layout,
				"isTemplate":pres.isTemplate
			}
			
			
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.presentation.update({
					id:pres.id,
					data: JSON.stringify(data)
				  });
				  
				 request.execute(function(resp) {
					
					if(resp.error!=null){
						alert("Error occurred. Please try again! <br>"+JSON.stringify(resp.error,null,2));
						//$scope.updateResp="<pre>***UPDATE "+pres.name+" RESPONSE***<br>"+JSON.stringify(resp.error,null,2)+"</pre>";	
						//$scope.$apply();
					}else{
						/*$scope.updateResp="<pre>***UPDATE "+pres.name+" RESPONSE***<br>"+JSON.stringify(resp.result,null,2)+"</pre>";
						$scope.$apply(function(){
							alert("Presentation "+pres.name+" updated successfully!");
							$scope.showPresTabs=false;	
							$scope.listPresentations();
						});
						*/
						alert("Presentation "+pres.name+" updated successfully!");
						$scope.showPresTabs=false;	
						$scope.listPresentations();
					}
					
				 });
			  },apiRoot);				
		}
		
		
		$scope.isThisTemplate = function(isTemplate) {
			$scope.fromTemplate=isTemplate;
			$scope.showNewPresForm=false;
			if(isTemplate){
				$scope.showTemplateTabs=true;
				$scope.showPresTabs=false;	
			}else{
				$scope.showPresTabs=true;
				$scope.showTemplateTabs=false;		
			}
			$scope.myPres = {};
		}
		
		$scope.listTemplates=function(presentationId){
			if(!$scope.authenticated){
				alert("Please login!");
				return;
			}
			gapi.client.load('core', 'v0', function() {
			  var request = gapi.client.core.template.list({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					//companyId:$scope.currentUser.companyId
					'search':'companyId:'+ $scope.currentUser.companyId
				  });
				  
				 request.execute(function(resp) {
					if(resp.error!=null){
						$scope.templateListRespError="<pre>"+JSON.stringify(resp.error,null,2)+"</pre>";
					}else{
						$scope.templateListRespError=null;
						$scope.templateList=resp.result;	
					}
					$scope.$apply();
				 });
			  },apiRoot);				
		}		
	}]);
