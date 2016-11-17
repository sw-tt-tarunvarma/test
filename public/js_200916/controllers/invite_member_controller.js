'use strict';

// added by JJ <jeel.joshi@softwebsolutions.com>

angular.module('myApp.controllers')
.controller('InviteMemberController', ["$scope", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "ngDialog", "$window", "$state","$filter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, ngDialog, $window, $state, $filter) {

	$scope.$on('$viewContentLoaded', function () 
	{
		$scope.baseurl = getBaseUrl.url();
		$scope.loading = true;
		$rootScope.autoheight();

	/**
	* @module : Office management
	* @desc   : Invite Member
	* @author : Softweb solutions
	*/
	$rootScope.inviteMember = function(tags) {
        var data = JSON.stringify(tags);
        console.log(tags.length);
        console.log(data);
        //var emails = data.text.join(',');
        //console.log(emails);
          $scope.addUrl = $scope.baseurl+"/invitation/invite";
          $http.post($scope.addUrl, {tags: tags}).success(function(data, status, headers, config) {
            Notifier.success('Email sent successfully.');
            //$timeout(function(){$window.location.href='/index#/schedulemeeting';},1000);
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
		};
	});
}]);

// app.service('getBaseUrl', function(){
//    this.url= function(){
// 				//return "http://roombit.azurewebsites.net";
// 				//return "http://192.168.4.190:3000"
// 			};        

// 		});