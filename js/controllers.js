angular.module('smartplayds')
	.constant("API_ROOT","https://rvacore-test.appspot.com/_ah/api")
    .constant("API_NAME","core")
    .constant("API_VER","v1")
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
	 .filter("trustedURL",function($sce){
		 return function(val){
			 return $sce.trustAsResourceUrl(val);
		 }
	 })
	 .filter('encodeUri', function ($window) {
			return $window.encodeURIComponent;
	  })
	  .filter('decodeUri', function ($window) {
			return function(val){
				return $window.decodeURIComponent(val);
			}
			//return 
	  })
	 
	.controller('MainCtrl', ['$scope', 'googleLogin', 'googlePlus','API_ROOT','API_NAME','API_VER',  function ($scope, googleLogin,googlePlus,API_ROOT,API_NAME,API_VER) {

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
			gapi.client.load(API_NAME, API_VER, function() {
			var request = gapi.client.core.user.get({
				//'username': 'sreenivasulu.kaluva@gmail.com'
				  });
				  
				 request.execute(function(resp) {

					$scope.userDetails="<pre>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					$scope.currentUser.companyId=resp.result.item.companyId;
					$scope.$apply();
				 });
			},API_ROOT);
		}
		
		$scope.listUsers=function(){
			if(!$scope.authenticated){
				alert("Please login!");
				return;
			}
			gapi.client.load(API_NAME, API_VER, function() {
			  var request = gapi.client.core.user.list({
					//'username': 'sreenivasulu.kaluva@gmail.com'
				  });
				  
				 request.execute(function(resp) {
					$scope.userList="<pre>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					$scope.$apply();
				 });
			  },API_ROOT);
		}

		//GET PRESENTATION		
		$scope.getPresentation=function(presentationId){
			gapi.client.load(API_NAME, API_VER, function() {
			  var request = gapi.client.core.presentation.get({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:presentationId
				  });
				  
				 request.execute(function(resp) {
					 
					if(resp.error==null){
						$scope.myPres=resp.item;
						$scope.myPresPreviewURL="https://viewer-test.appspot.com/Viewer.html?type=presentation&id="+presentationId+"&time="+new Date().getTime();
						
						
						$scope.presentationInfo=resp.item.layout;
						//console.log("layout: "+JSON.parse(resp.item.layout));
						var parser= new DOMParser();
						var doc=parser.parseFromString(resp.item.layout,"text/html");
						
						$scope.presentationDoc=doc;
						
						if(doc.scripts.length>=1){
							var content=doc.scripts[0].text;
							var pJsonStr=content.substring(content.indexOf("= ")+2,content.lastIndexOf("};")+1);
							//console.log("***script tag content:: "+content);	
							//console.log("***script tag content: "+pJsonStr);
							var pJsonObj=JSON.parse(pJsonStr);
							var placeholdersArr=pJsonObj.presentationData.placeholders;
							var textItems=[];
							var imageItems=[];
							/*
							"<font face="Open Sans">

<span id="BoxText1_text1">Cura del Viso</span></font><div><font face="Open Sans"><span><br></span></font></div><div><font face="Open Sans" color="#0b5394"><span style="background-color: rgb(0, 255, 255);"><b><span id="BoxText1_text2">Helloooooooo i'm here to develop!</span></b></span></font></div>"
							 */
							
							
							for(var i=0;i<placeholdersArr.length;i++){
								var ph=placeholdersArr[i];
								var items=ph.items;
								textItems.push(ph.id,{});
								for(var j=0;j<items.length;j++){
									var item=items[j];
									if(item.type=="text"){
											//textItems.push(ph.id+"<--->"+item.objectData);
											
											var dataDoc=parser.parseFromString(item.objectData,"text/html");;
											var spansArr=dataDoc.getElementsByTagName("span");
											for(var k=0;k<spansArr.length;k++){
												var currentSpan=spansArr[k];
												if(currentSpan!=null && currentSpan.id.indexOf(ph.id)==0){
														var myTexItem={};
														myTexItem["phId"]=ph.id;
														myTexItem["itemIndex"]=j;
														myTexItem["txtItemId"]=currentSpan.id;
														myTexItem["data"]=currentSpan.innerHTML;		
														textItems.push(myTexItem);
												}
											}	
											
										}else if(item.type=="image"){
											var myImageItem={};	
											myImageItem["phId"]=ph.id;
											myImageItem["itemIndex"]=j;
											myImageItem["data"]=decodeURIComponent(item.objectData.substring(item.objectData.indexOf("=")+1,item.objectData.indexOf("&")));
											
											imageItems.push(myImageItem);
											//http://commondatastorage.googleapis.com/risemedialibrary-6c41247e-04bc-4b41-81de-7a065e4d970c/icon-home-off.png
											//http://commondatastorage.googleapis.com/risemedialibrary-6c41247e-04bc-4b41-81de-7a065e4d970c/icon-news-off.png
										}
									}
							}	
							
							console.log("***text items:: "+textItems);
							console.log("***image items:: "+imageItems);
							
							$scope.myPres.textItems=textItems;
							$scope.myPres.imageItems=imageItems;
							
						}else{
							content=doc.body.innerHTML;
							//console.log("***script tag content:: "+content);	
							$scope.presentationInfo=content;
						}
						
						
					 }else{
						 $scope.presentationInfo="<pre>"+JSON.stringify(resp.error,null,2)+"</pre>";
						 $scope.myPres={};
					 }
					
					$scope.$apply();
				 });
			  },API_ROOT);				
		}
		//LIST PRESENTATIONS
		$scope.listPresentations=function(presentationId){
			if(!$scope.authenticated){
				alert("Please login!");
				return;
			}
			gapi.client.load(API_NAME, API_VER, function() {
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
			  },API_ROOT);				
				
		}	
		
		//PUBLISH PRESENTATION
		$scope.publishPresentation=function(myPres){
			gapi.client.load(API_NAME, API_VER, function() {
			  var request = gapi.client.core.presentation.publish({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:myPres.id
				  });
				  
				 request.execute(function(resp) {
					$scope.resp="<pre>***PUBLISH "+presentationId+" RESPONSE***<br>"+JSON.stringify(resp.error!=null?resp.error:resp.result,null,2)+"</pre>";
					if(resp.error!=null){
						alert("Error occurred. Please try again! <br>"+JSON.stringify(resp.error,null,2));
					}else{
						alert("Presentation "+myPres.name+" published successfully!");
					}
					$scope.$apply();
				 });
			  },API_ROOT);				
		}
		
		//DELETE PRESENTATION
		$scope.deletePresentation=function(myPres){
			if(!confirm("Are you sure you want to delete?")){
				return;
			}
			gapi.client.load(API_NAME, API_VER, function() {
			  var request = gapi.client.core.presentation.delete({
					//'username': 'sreenivasulu.kaluva@gmail.com'
					id:myPres.id
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
						alert("Presentation "+myPres.name+" deleted successfully!");	
						$scope.showPresTabs=false;
						$scope.listPresentations();		

					}
					
					
				 });
			  },API_ROOT);				
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
			gapi.client.load(API_NAME, API_VER, function() {
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
			  },API_ROOT);				
		}
		
		// UPDATE PRESENTATION
		$scope.updatePresentation=function(pres,presForm){
			
			
			$scope.submitted=true;
			if (presForm.$invalid) {
				return;
			}
			
			var doc=$scope.presentationDoc;
						
			if(doc.scripts.length>=1){
				var content=doc.scripts[0].text;
				var pJsonStr=content.substring(content.indexOf("= ")+2,content.lastIndexOf("};")+1);
				//console.log("***script tag content:: "+content);	
				//console.log("***script tag content: "+pJsonStr);
				var pJsonObj=JSON.parse(pJsonStr);
				var placeholdersArr=pJsonObj.presentationData.placeholders;
				
				for(var i=0;i<pres.imageItems.length;i++){
					var formImageItem=pres.imageItems[i];
					
					for(var j=0;j<placeholdersArr.length;j++){
						var ph=placeholdersArr[j];
						if(ph.id==formImageItem.phId){
							var upImageItem=ph.items[formImageItem.itemIndex];

							var encGivenURL=encodeURIComponent(formImageItem.data);

							var encHttpURL=upImageItem.objectData.substring(upImageItem.objectData.indexOf("=")+1,upImageItem.objectData.indexOf("&"));

							upImageItem.objectData=upImageItem.objectData.replace(encHttpURL,encGivenURL);

							console.log(upImageItem);
							break;	
						}
					}
				}
				
				console.log(pJsonObj);
				
				content=content.replace(pJsonStr,JSON.stringify(pJsonObj,null,2));
				doc.scripts[0].text=content;
			}
			
			var layout="<!DOCTYPE HTML><html>"+doc.documentElement.innerHTML+"</html>";
			
			
			var _data={
				//"name": pres.name,
				//"publish": pres.publish,
				"layout":layout//pres.layout,
				//"isTemplate":pres.isTemplate
			}

			var params={};

			// if (_data) {
        		params['data'] = _data;//JSON.parse(_data);
		    // }
		    // if (_id) {
		        params['id'] = pres.id;
		    // }
		    /*if (_fields) {
		        parameters['fields'] = _fields;
		    }*/
			
//http://commondatastorage.googleapis.com/risemedialibrary-6c41247e-04bc-4b41-81de-7a065e4d970c/icon-event-off.png
//http://commondatastorage.googleapis.com/risemedialibrary-6c41247e-04bc-4b41-81de-7a065e4d970c/icon-service-off.png

			gapi.client.load(API_NAME, API_VER, function() {
			  var request = gapi.client.core.presentation.patch(params);
				  
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
			  },API_ROOT);				
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
			gapi.client.load(API_NAME, API_VER, function() {
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
			  },API_ROOT);				
		}		
	}]);
