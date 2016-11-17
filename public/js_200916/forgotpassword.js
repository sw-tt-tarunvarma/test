'use strict';
//added by JJ <jeel.joshi@softwebsolutions.com>
// Declare app level module which depends on filters, and services
var app = angular.module('forgotpasswordapp', ['angular-loading-bar','ui.router'])

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  }]);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/forgotpassword");
  $stateProvider
    .state('forgotpassword', {
      url: "/forgotpassword",
      templateUrl: "partials/forgotpassword.html"
    });  
})

app.controller('ForgotpasswordController', ["$scope", "$state", "$rootScope", "$http","$timeout", "getBaseUrl", "$window", function($scope, $state, $rootScope, $http, $timeout, getBaseUrl, $window) {

  $scope.$watch('$viewContentLoaded', function () 
  {
	  
    	$scope.baseurl = getBaseUrl.url();
	    $rootScope.data = {};
	    $scope.forgotpassFunction = function()
	   	{
	   		//$scope.baseurl="http://192.168.4.190:3000";
	   		//$scope.baseurl="http://localhost:3000";
			//$scope.forgotUrl = $scope.baseurl+"/forgotpassword/forgotpassword";
			//var d1 = {'email': $rootScope.data.email};

    	$http.post($scope.baseurl+"/mobservices/SoftwebHOQForgotUser",{
        
        	'email' : $rootScope.data.email
        
        }).success(function(data, status, headers, config) {
		console.log(data);
		
		if(data.Status == true) {
                  // alert("Reset password request submitted successfully");
                   Notifier.success('Reset password request submitted successfully');
			  	$timeout(function(){$window.location.href='/';},1000);
		    
                }
		else
		{
		   //alert("email does not exist");                    
		   Notifier.error('email does not exist');
		}


        }).error(function(data, status, headers, config) {

        });
		
			}
  });

}]);

app.service('getBaseUrl', function(){
    this.url= function(){
        //return "http://roombit.azurewebsites.net";
        //return "http://192.168.4.190:3000"
        return "http://smartoffice.softwebopensource.com";
        
    };        
    
});




