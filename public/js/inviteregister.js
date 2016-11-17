'use strict';
//added by As <alpesh.solanki@softwebsolutions.com>
// Declare app level module which depends on filters, and services
var app = angular.module('inviteregisterapp', ['angular-loading-bar','ui.router','ngCookies'])

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = true;
}]);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/inviteregister");
  $stateProvider
    .state('inviteregister', {
      url: "/inviteregister/:inviteToken",
      templateUrl: "partials/inviteregister.html"
    });  
})

app.controller('InviteregisterController', ["$scope", "$location", "$http", "$timeout", "getBaseUrl", "$window", function($scope, $location, $http, $timeout, getBaseUrl, $window) {

	$scope.$watch('$viewContentLoaded', function () {
		var currentUrl = $window.location.href;
    	var token = currentUrl.substr(currentUrl.lastIndexOf('/') + 1);
		$scope.baseurl = getBaseUrl.url();
		$scope.isClicked = 0;
		$scope.loaderimg = true;
		$scope.accountData = {};
		$scope.confirmPasswordError = "";

		$scope.init = function(){
			$scope.useridUrl = $scope.baseurl+"/inviteregister/getInvitationData";
		    	$http.post($scope.useridUrl,{token : token}).success(function(result, status, headers, config) 
        		{
		    	if(result.data[0] == undefined) {
		    	Notifier.error('Invalid token!');
				  	$timeout(function(){$window.location.href='/';},1000);
		    	}
      }).error(function(result, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });
		}

		$scope.init();

		$scope.createAccountFunction = function(accountData) {
			$scope.loaderimg = false;
   			$scope.isClicked = 1;
			if (accountData.password !== accountData.confirmpassword) {
				$scope.isClicked = 0;
		        $scope.loaderimg = true;
				$scope.confirmPasswordError = "Confirm Password is not match with Password."
			}
			else {
				$scope.confirmPasswordError = ""	
			}

			if (accountData.firstname && accountData.firstname.trim() && accountData.lastname && accountData.lastname.trim() && accountData.password && accountData.password.trim() && accountData.confirmpassword && accountData.confirmpassword.trim() && accountData.password === accountData.confirmpassword) {
		    	$scope.useridUrl = $scope.baseurl+"/inviteregister/getInvitationData";
		    	$http.post($scope.useridUrl,{token : token}).success(function(result, status, headers, config) 
        		{
		    	if(result.data[0] != undefined && result.data[0].userid != '') {
		    		var email = result.data[0].emailaddress;
          			var officeid = result.data[0].officeid;
          			var addUserData = {
		    		'au_firstname': accountData.firstname,
		    		'au_lastname': accountData.lastname,
		    		'au_email':email,
		    		'au_rolename':"Member",
		    		"au_companyguid":null,
		    		"au_isadmin":"0",
		    		"au_statusguid":null,
		    		"au_createdby":null,
		    		"au_createddate":null,
		    		"au_modifiedby":null,
		    		"au_modifieddate":null
		    	};
		    		$http.post($scope.baseurl+"/mobservices/SoftwebHOQAddUser",{data:addUserData})
		    	
			    .success(function(data, status, headers, config) {
			    	if (data.data[0][0].Status == 1 && data.data[1][0].Status != -1) {
			    		var userCredentialsData = {
				    		uc_appuserguid: data["data"][1][0]["au_guid"],
				    		uc_password: accountData.password
				    	};
			    		$http.post($scope.baseurl+"/mobservices/SoftwebHOQAddUserCredentials", userCredentialsData)
				        .success(function(data, status, headers, config) {
				        }).error(function(data, status, headers, config) {
				        });
				        var createUserData = {
				    		firstname: accountData.firstname,
							lastname: accountData.lastname, 
							name: accountData.firstname+" "+accountData.lastname, 
							email: email,
							officeid: officeid, 
							username: accountData.firstname+" "+accountData.lastname, 
							role: "Member",
							userpassword: accountData.password,
							userid:	data.data[1][0]["au_guid"]
				    	};
				   		
				   		$http.post($scope.baseurl+"/inviteregister/createAccount",createUserData)
						.success(function(data, status, headers, config) {
							Notifier.success('You signed up successfully. Please click on login to go to login page');
						  	$window.location.href='/';
					 	})
					 	.error(function(data, status, headers, config) {
					 		$scope.isClicked = 0;
		            		$scope.loaderimg = true;
							Notifier.error('Something went wrong!. Please try again.');
					 	});
            		}		
					else {
						$scope.isClicked = 0;
		            	$scope.loaderimg = true;
	   					Notifier.error('User Email is already exists.');
					}
        		}).error(function(data, status, headers, config) {
           		});
		    	} else {
		    		$scope.isClicked = 0;
		            $scope.loaderimg = true;
		    		Notifier.error('Invalid token!');
		    	}
      }).error(function(result, status, headers, config) {
      		$scope.isClicked = 0;
		    $scope.loaderimg = true;
          	Notifier.error('Something went wrong. Please try again..');
        });
			}			
		}
	});
}]);

app.service('getBaseUrl', function(){
	this.url= function(){
		return "http://smartoffice.softwebopensource.com";
    };    
});