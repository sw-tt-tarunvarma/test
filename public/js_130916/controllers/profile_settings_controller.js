'use strict';

/*Login Controllers */

angular.module('myApp.controllers')
.controller('profileSettingsController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","base64Converter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl,base64Converter) {

	$scope.$on('$viewContentLoaded', function () 
	{
		$scope.baseurl = getBaseUrl.url();
		$rootScope.autoheight();
		$scope.profileinfo = {}

		/**
	    * @module : User profile
	    * @desc   : Get User detail by session variable
	    * @return : Return user detail
	    * @author : Softweb solutions
	    */
		$http.get($scope.baseurl+"/getUserSession")
		.success(function(data, status, headers, config) {
			$scope.loggedInUser = data.username;
			$rootScope.loggedInUserRole = data.userdata.role;
			$rootScope.profileid = data.userdata.id;
			$scope.peopleprofileurl = $scope.baseurl+"/profile/"+$rootScope.profileid;
			$http.get($scope.peopleprofileurl).success(function(data, status, headers, config) 
			{
				$scope.profileinfo = data['data'][0];
				$rootScope.autoheight();
			}).error(function(data, status, headers, config) {
		      	Notifier.error('Something went wrong. Please try again..');
	      	});
	  	})
		.error(function(data, status, headers, config) {
			Notifier.error('Something went wrong!. Please try again..');
		});
	});

	/**
    * @module : User profile
    * @desc   : Save user profile
    * @return : Return response message
    * @author : Softweb solutions
    */
	$scope.SaveProfile = function(){

		if($scope.profileimage !== null)
		{
			$scope.profileinfo.filename      = $scope.profileimage.filename;
			$scope.profileinfo.base64        = $scope.profileimage.base64;
		}
		$scope.profileinfo.timestamp     = Math.floor(new Date() / 1000);
		$scope.peopleupdateurl = $scope.baseurl+"/profile/UpdateProfile";
		$http.post($scope.peopleupdateurl,$scope.profileinfo).success(function(data, status, headers, config) 
		{
			Notifier.success('Profile updated successfully');
			$timeout(function(){
				window.location.reload(true);
			},500);
		}).error(function(data, status, headers, config) {
			Notifier.error('Something went wrong. Please try again..');
		});
	}
}])