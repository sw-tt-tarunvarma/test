'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('loginapp', ['angular-loading-bar','ui.router','ngCookies'])

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  }]);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/login");
  $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "partials/login.html"
    })

    .state('register', {
      url: "/register",
      templateUrl: "partials/signup.html"
    });  
})


app.controller('LoginController', ["$scope", "$state", "$rootScope", "$cookies", "$http","$timeout", "getBaseUrl", "$window", function($scope, $state, $rootScope, $cookies, $http,$timeout, getBaseUrl, $window) {

//added by JJ <jeel.joshi@softwebsolutions.com>
	$scope.loginFunction = function()
	   	{
	   		$http.post(getBaseUrl.url()+"/mobservices/SoftwebHOQCheckUser", {username: $scope.loginData.username, password: $scope.loginData.password})
			.success(function(data, status, headers, config) {
				if(data.Status == false)
				{
					Notifier.error('Something went wrong. Please try again..');
				}
				else
				{
					var isfirsttime = data["data"][0][0]["au_isfirsttime"];
					var isadmin = data["data"][0][0]["au_isadmin"];					
					window.localStorage.setItem('token', data["token"]);
					window.localStorage.setItem('au_email', data["data"][0][0]["au_email"]);
					window.localStorage.setItem('uc_guid', data["data"][0][0]["uc_guid"]);
					window.localStorage.setItem('au_isadmin', data["data"][0][0]["au_isadmin"]);
					$cookies.put('token', data["token"]);
					//document.cookie = "token="+data["token"];
					//Cookies.set('token', data["token"]);
					Notifier.success('Logged In successfully');
			  		if(isfirsttime == true && isadmin == true) {			  			
			  			$timeout(function(){$window.location.href='/index';},1000);
			  		} else if(isfirsttime == false && isadmin == true) {			  			
			  			$timeout(function(){$window.location.href='/index#/search';},1000);
			  		} else if(isfirsttime == false && isadmin == false) {			  			
			  			$timeout(function(){$window.location.href='/index#/search';},1000);
			  		}

				}			

		 	})
		  	.error(function(data, status, headers, config) {
		  		
		  		if(status == 404)
		  		{
		  			Notifier.error('Invalid username or password');
		  		}
		  		else if(status == 403)
		  		{
		  			Notifier.error('You dont have permission to access the Smartoffice');
		  		}
		  		else
		  		{
		  			Notifier.error('Something went wrong. Please try again..');
		  		}
		 	});  			
	   	}

  $scope.$on('$viewContentLoaded', function () 
  {
	  
    	$scope.baseurl = getBaseUrl.url();
	    $scope.loginData = {};
	    $rootScope.signupData = {};
	    $rootScope.officeOptions = '';
	    $rootScope.companyid = 4;
	    $scope.redirectTo = function(state)
	    {
	    	if(state == "register")
	    	{
	    		$http.get($scope.baseurl+"/office/getalloffices/"+$rootScope.companyid)
				.success(function(data, status, headers, config) {
					//console.log(data);
				  	$timeout(function(){$rootScope.officeOptions = data;},500);
			 	})
			  	.error(function(data, status, headers, config) {
			  		Notifier.error('Something went wrong. Please try again..');
			 	});
	    	}
	    	$state.go(state);
	    }
  });

}]);

app.service('getBaseUrl', function(){
    this.url= function(){
        return "http://smartoffice.softwebopensource.com";
        //return "http://roombit.azurewebsites.net";
    };        
    
});