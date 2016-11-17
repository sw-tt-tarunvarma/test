'use strict';
//added by JJ <jeel.joshi@softwebsolutions.com>
// Declare app level module which depends on filters, and services
var app = angular.module('contactusapp', ['angular-loading-bar','ui.router'])

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  }]);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/contactus");
  $stateProvider
    .state('contactus', {
      url: "/contactus",
      templateUrl: "partials/contactus.html"
    });  
});

app.controller('ContactUsController', ["$scope", "$state", "$rootScope", "$http","$timeout", "getBaseUrl", "$window", function($scope, $state, $rootScope, $http, $timeout, getBaseUrl, $window) {

$scope.$watch('$viewContentLoaded', function () 
  {
    	$scope.baseurl = getBaseUrl.url();
	    $rootScope.contactData = {};
	    $scope.isClicked = 0;

	    $rootScope.role = [
  		{id: '1', name: 'Executive'},
  		{id: '2', name: 'IT'},
  		{id: '3', name: 'Office Admin'},
  		{id: '4', name: 'Other'},
	  ];
	  $rootScope.roomno = [
      {id: '10', room: '10'},
      {id: '30', room: '30'},
      {id: '100', room: '>30'},
    ];

    var fname = localStorage.getItem("first_name");
    var lname = localStorage.getItem("last_name");
    var email = localStorage.getItem("email");
    var company = localStorage.getItem("company");
    var phno = localStorage.getItem("phone_number");
    var roomno = localStorage.getItem("room_no");
	   $rootScope.contactData.firstname = fname;
     $rootScope.contactData.lastname = lname;
     $rootScope.contactData.email = email;
     $rootScope.contactData.company = company;
     $rootScope.contactData.phonenumber = phno;
     $rootScope.contactData.roomno = roomno;
		$scope.contactusFunction = function()
		{
      $scope.isClicked = 1;
			$scope.contactusUrl = $scope.baseurl+"/contactus/contactus";
			$http.post($scope.contactusUrl, {contactData:$rootScope.contactData})
				.success(function(data, status, headers, config) {
				  	Notifier.success('Email sent. We will give you reply shortly.');
            localStorage.setItem("first_name","");
        localStorage.setItem("last_name","");
        localStorage.setItem("email","");
        localStorage.setItem("phone_number","");
        localStorage.setItem("company","");
        localStorage.setItem("room_no","");
            $timeout(function(){$window.location.href='/';},1000);
			 	})
			  	.error(function(data, status, headers, config) {
            $scope.isClicked = 0;
				  	Notifier.error('Something went wrong!. Please try again..');
			 	});	
		};
  });

}]);

app.service('getBaseUrl', function(){
    this.url= function(){
        return "http://smartoffice.softwebopensource.com";        
    };        
    
});




