'use strict';
//added by JJ <jeel.joshi@softwebsolutions.com>
// Declare app level module which depends on filters, and services
var app = angular.module('registerapp', ['angular-loading-bar','ui.router'])

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  }]);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/register");
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


app.controller('RegisterController', ["$scope", "$state", "$rootScope", "$http","$timeout", "getBaseUrl", "$window", function($scope, $state, $rootScope, $http, $timeout, getBaseUrl, $window) {

  $scope.$watch('$viewContentLoaded', function () 
  {
	  	$scope.isClicked = 0;
	  	$scope.loaderimg = true;
    	$scope.baseurl = getBaseUrl.url();
	    $scope.loginData = {};
	    $rootScope.signupData = {};
	    $rootScope.officeOptions = '';
	  
	    $rootScope.calendarsystem = [
  		{id: '1', name: 'Google Calendar'},
  		{id: '2', name: 'Office 365'},
  		{id: '3', name: 'Custom Calendar'},
	  ];
	  $rootScope.roomno = [
  		{id: '10', room: '10'},
  		{id: '30', room: '30'},
  		{id: '100', room: '>30'},
	  ];
	    $rootScope.companyid = 4;
	   
	    	$scope.signupFunction = function()
	   		{
	   			$scope.isClicked = 1;
	   			$scope.loaderimg = false;
		   		$scope.signupUrl = $scope.baseurl+"/register/register";
		   		if($rootScope.signupData.roomno != 100) 
	   			{
					if($rootScope.signupData.password == $rootScope.signupData.confirmpassword)
					{
							//added by JJ < jeel.joshi@softwebsolutions.com >
			    	var d1 = {'au_firstname': $rootScope.signupData.firstname,'au_lastname': $rootScope.signupData.lastname,'au_email':$rootScope.signupData.email,'au_rolename':"Admin","au_companyguid":null,"au_isadmin":"1","au_statusguid":null,"au_createdby":null,"au_createddate":null,"au_modifiedby":null,"au_modifieddate":null};

			    	$http.post($scope.baseurl+"/mobservices/SoftwebHOQAddUser",{
			        data:d1
			        }).success(function(data, status, headers, config) {
					if(data.data[0][0].Status == 1 && data.data[1][0].Status != -1) {
			        $http.post($scope.baseurl+"/mobservices/SoftwebHOQAddUserCredentials", {uc_appuserguid: data["data"][1][0]["au_guid"], uc_password: $rootScope.signupData.password}).success(function(data, status, headers, config) {

			        }).error(function(data, status, headers, config) {
			           
			        });
			   		$http.post($scope.signupUrl, 
						{firstname: $rootScope.signupData.firstname,
							lastname: $rootScope.signupData.lastname, 
							email: $rootScope.signupData.email, 
							phonenumber: $rootScope.signupData.phonenumber,
							company: $rootScope.signupData.company, 
							calendarsystem: $rootScope.signupData.calendarsystem, 
							roomno:  $rootScope.signupData.roomno,
							username: $rootScope.signupData.username, 
							password: $rootScope.signupData.password,
							userid:	data.data[1][0]["au_guid"]})
					.success(function(data, status, headers, config) {
					  	Notifier.success('You signed up successfully. Please click on login to go to login page');
					  	$timeout(function(){$window.location.href='/';},1000);
				 	})
				  	.error(function(data, status, headers, config) {
				  		$scope.isClicked = 0;
					  	$scope.loaderimg = true;
					  	Notifier.error('Something went wrong!. Please try again..');
				 	});
	                }
					else
					{
					   Notifier.error("User already exists");                    
					}

			        }).error(function(data, status, headers, config) {
			           
			        });
				 
					}
					else
					{
						$scope.isClicked = 0;
					  	$scope.loaderimg = true;
						Notifier.error('Password and confirm password should be same');
					}
			}
			else 
			{
	   			localStorage.setItem("first_name",$rootScope.signupData.firstname);
				localStorage.setItem("last_name",$rootScope.signupData.lastname);
				localStorage.setItem("email",$rootScope.signupData.email);
				localStorage.setItem("phone_number",$rootScope.signupData.phonenumber);
				localStorage.setItem("company",$rootScope.signupData.company);
				localStorage.setItem("room_no",$rootScope.signupData.roomno);
	   			$timeout(function(){$window.location.href='/contactus';},1000);
	   		}
	   	}
  });

}]);

app.service('getBaseUrl', function(){
    this.url= function(){
        return "http://smartoffice.softwebopensource.com";        
    };        
    
});




