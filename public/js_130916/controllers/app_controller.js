'use strict';

/*App Controllers */

angular.module('myApp.controllers', ['ngCookies'])
.controller('AppController', ["$scope", "$state", "$cookies", "$rootScope", "$http","$timeout","getBaseUrl","$window","httpcall","$cacheFactory","Idle","ngDialog", function($scope, $state, $cookies, $rootScope, $http, $timeout, getBaseUrl, $window, httpcall, $cacheFactory, Idle,ngDialog) {
	
	$scope.$on('$viewContentLoaded', function () 
	{
		$scope.baseurl = getBaseUrl.url();
		$rootScope.crUrl=$state.current.url;
		$rootScope.eventpopupdate = new Date();
		if(angular.isDefined($rootScope.officeid))
		{

		}
		else
		{
			$rootScope.officeid = 1;
		}

		/**
		  * @module : General app controller
		  * @desc   : Open Book meeting Popup
		  * @author : Softweb solutions
		*/
		$scope.addEventPopup = function (date) {
	    if (!date || date.disabled) { 
          return; 
        }
        $rootScope.date = new Date(date.year, date.month + 1, date.day);
        $rootScope.dataid = 1;
        $rootScope.eventPopupData = new Object();
        $rootScope.eventPopupData.selectedDate = $rootScope.date;
        $rootScope.eventPopupData.startDate = new Date();
        $rootScope.eventPopupData.endDate = new Date();
        $rootScope.eventPopupData.id = 0;
        $rootScope.eventPopupData.attendData = [];
        $rootScope.eventPopupData.editEventValue = 0;
        $rootScope.eventPopupData.locationid = '';
        ngDialog.open({ 
          template: 'partials/event_popup.html',
          controller: 'ConferenceController',
          scope:$rootScope
        });
      };
		/**
		  * @module : General app controller
		  * @desc   : Get a list of all location
		  * @return : Return all location array
		  * @author : Softweb solutions
		*/
		$rootScope.getLocations = function()
		{
			$rootScope.allLocation='';
			var url = getBaseUrl.url()+"/location/getLocations/";
			httpcall.call(url, "get", false, "").then(function(result){
				$timeout(function(){
					$rootScope.allLocation = result.data;
	  		  	},500);
			});
		}


		/**
		  * @module : General app controller
		  * @desc   : Set office id and redirect to dashboard
		  * @return : Redirect on dashboard
		  * @author : Softweb solutions
		*/
		$scope.switchOffice = function(officeid)
		{
			$timeout(function(){
				$rootScope.officeid = officeid;
				$state.transitionTo("dashboard", '', { reload:true });
			},500);
		}

		/**
		  * @module : General app controller
		  * @desc   : Get all office list
		  * @return : Return office list
		  * @author : Softweb solutions
		*/
		$rootScope.getAllOffices = function()
		{
			$http.get($scope.baseurl + '/office/getalloffices/'+$rootScope.officeData[0].companyid)
			.success(function(data, status, headers, config) {
		        $scope.officedata = data;
		        $rootScope.autoheight();
		    }).error(function(data, status, headers, config) {
				Notifier.error('Something went wrong!. Please try again..');
			});
		}

		/**
		  * @module : General app controller
		  * @desc   : Get all company list
		  * @return : Return company list
		  * @author : Softweb solutions
		*/
		$rootScope.getAllCompany = function()
		{
			$http.get($scope.baseurl + '/company')
			.success(function(data, status, headers, config) {
				$rootScope.companydata = data;
			})
			.error(function(data, status, headers, config) {
				Notifier.error('Something went wrong!. Please try again..');
			});
		}

		/**
		  * @module : General app controller
		  * @desc   : Show right sidebar with location room
		  * @return : Return call to get location function
		  * @author : Softweb solutions
		*/
		$scope.showSideBarLocation= function()
		{
			if($rootScope.allLocation) {
			}
			else
			{
				$rootScope.getLocations();
			}
		}		

		/**
		  * @module : General app controller
		  * @desc   : Get user session detail
		  * @return : Return user information
		  * @author : Softweb solutions
		*/
		$scope.getUserSession = function()
		{
			$http.get($scope.baseurl+"/getUserSession")
			.success(function(data, status, headers, config) {
				//console.log(data)
				$timeout(function(){
					$rootScope.loggedInUser = data.username;
					$rootScope.loggedInUserRole = data.userdata.role;
					$rootScope.userImage = data.userdata.imagename;
					$rootScope.userEmail = data.userdata.email;
			  		//$rootScope.officeid = data.userdata.officeid;
			  	},500);
			})
			.error(function(data, status, headers, config) {
				Notifier.error('Something went wrong!. Please try again..');
			});
		}

		/**
		  * @module : General app controller
		  * @desc   : 
		  * @return : 
		  * @author : Softweb solutions
		*/
		$rootScope.autoheight = function()
		{
			var w = $(window).innerHeight();
			if($(".wrapper").height()<(w))
			{
				//	$(".wrapper").height(w);
			}
			else
			{
				//	$(".wrapper").css("height","inherit");
			}
		};

		/**
		  * @module : General app controller
		  * @desc   : Redirection path
		  * @return : Return redirect to specified path
		  * @author : Softweb solutions
		*/
		$rootScope.redirectTo = function(path)
		{
			$state.go(path);
		}

		/**
		  * @module : General app controller
		  * @desc   : Send to logout url of window
		  * @return : send to logout process
		  * @author : Softweb solutions
		*/
		$scope.logout = function()
		{

         //window.location="https://login.windows.net/common/oauth2/logout?post_logout_redirect_uri=http://192.168.4.31:3000/logout";

			//alert(window.localStorage.getItem('token'));
			//return false
			window.localStorage.setItem('token', '');
			window.localStorage.setItem('uc_guid', '');
			window.localStorage.setItem('au_isadmin','');
			window.localStorage.setItem('au_email','');
			$cookies.remove("token");
			//window.location="http://192.168.4.190:3000";
			window.location=$scope.baseurl;
         //window.location="https://login.windows.net/common/oauth2/logout?post_logout_redirect_uri=http://192.168.4.190:3000/logout";

	   	}

	   	$(window).resize(function(e) {
	   		$rootScope.autoheight();
	   	});

	   	$rootScope.autoheight();
	   	$rootScope.setLockPattern = false;
	   	$rootScope.registerPatternVaraible = false;
	   	$timeout(function(){
	   		if(localStorage.getItem("isLockEnabled") == 1)
	   		{
	   			$scope.lock();
	   		}
	   		else
	   		{
	   			$("#patterndiv").hide();
	   			$rootScope.autoheight();
	   		}
	   	}, 1000);

	   	$scope.lock = function()
	   	{

	   	};

	   	$scope.$on('IdleStart', function() {
	   		$scope.lock();
	   	});

	   	var lock1;
	   	/**
		  * @module : General app controller
		  * @desc   : Set locak pattern value
		  * @return : Return set lock pattern value
		  * @author : Softweb solutions
		*/
	   	$scope.registerPatternValue = function(value)
	   	{
	   		if(value == 1)
	   		{
	   			localStorage.setItem("patternValue", lock1.getPattern());
	   			lock1.setPattern(lock1.getPattern());
	   			$rootScope.setLockPattern = true;
	   			Notifier.success('Lock pattern added successfully. Use this pattern to unlock your webpage');
	   			$("#patterndiv").hide("slow");
	   		}
	   		else
	   		{
	   			$("#patterndiv").hide("slow");
	   		}
	   	};

	   	/**
		  * @module : General app controller
		  * @desc   : Set locak pattern value
		  * @return : Return set lock pattern value
		  * @author : Softweb solutions
		*/
	   	$scope.registerPattern = function()
	   	{
	   		$timeout(function(){
	   			$rootScope.registerPatternVaraible = true;
	   			$("#patterndiv").show("slow");
	   			lock1 = new PatternLock('#patternContainer',{enableSetPattern : true});
	   		},500);
	   	};
	});
}]);