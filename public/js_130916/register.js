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
  		{id: '1', room: '<5'},
  		{id: '2', room: '5-15'},
  		{id: '3', room: '15-30'},
	  ];
	    $rootScope.companyid = 4;
	   //  $scope.redirectTo = function(state)
	   //  {
	   //  	if(state == "login")
	   //  	{
	   //  		$http.get($scope.baseurl+"/office/getalloffices/"+$rootScope.companyid)
				// .success(function(data, status, headers, config) {
				// 	//console.log(data);
				//   	$timeout(function(){$rootScope.officeOptions = data;},500);
			 // 	})
			 //  	.error(function(data, status, headers, config) {
			 //  		Notifier.error('Something went wrong. Please try again..');
			 // 	});
	   //  	}
	   //  	$state.go(state);
	   //  }
	    	$scope.signupFunction = function()
	   		{
	   		//$scope.baseurl="http://192.168.4.190:3000";
	   		//$scope.baseurl="http://localhost:3000";
			$scope.signupUrl = $scope.baseurl+"/register/register";
			//alert(JSON.stringify($rootScope.signupData));
			//console.log($scope.signupUrl);
			if($rootScope.signupData.password == $rootScope.signupData.confirmpassword)
			{
				$http.post($scope.signupUrl, 
					{firstname: $rootScope.signupData.firstname,
						lastname: $rootScope.signupData.lastname, 
						email: $rootScope.signupData.email, 
						phonenumber: $rootScope.signupData.phonenumber,
						company: $rootScope.signupData.company, 
						calendarsystem: $rootScope.signupData.calendarsystem, 
						roomno:  $rootScope.signupData.roomno,
						username: $rootScope.signupData.username, 
						password: $rootScope.signupData.password})
				.success(function(data, status, headers, config) {
				  	Notifier.success('You signed up successfully. Please click on login to go to login page');
			 	})
			  	.error(function(data, status, headers, config) {
				  	Notifier.error('Something went wrong!. Please try again..');
			 	});
			 	//added by JJ < jeel.joshi@softwebsolutions.com >
	    var d1 = {'au_firstname': $rootScope.signupData.firstname,'au_lastname': $rootScope.signupData.lastname,'au_email':$rootScope.signupData.email,'au_rolename':"manager","au_companyguid":null,"au_isadmin":"1","au_statusguid":null,"au_createdby":null,"au_createddate":null,"au_modifiedby":null,"au_modifieddate":null};

    	$http.post($scope.baseurl+"/mobservices/SoftwebHOQAddUser",{
        data:d1
        }).success(function(data, status, headers, config) {
		
		if(data.Status == true) {
            
        $http.post($scope.baseurl+"/mobservices/SoftwebHOQAddUserCredentials", {uc_appuserguid: data["data"][1][0]["au_guid"], uc_password: $rootScope.signupData.password}).success(function(data, status, headers, config) {
        	console.log(data);
		
        }).error(function(data, status, headers, config) {
           
        });
		    alert("User added successfully");
                }
		else
		{
		   alert("User already exits");                    
		}

        }).error(function(data, status, headers, config) {
           
        });
			}
			else
			{
				Notifier.error('Password and confirm password should be same');
			}
			
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




