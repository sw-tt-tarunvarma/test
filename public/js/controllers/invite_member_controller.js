'use strict';

// added by JJ <jeel.joshi@softwebsolutions.com>

angular.module('myApp.controllers')
.controller('InviteMemberController', ["$scope", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "ngDialog", "$window", "$state","$filter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, ngDialog, $window, $state, $filter) {

	$scope.$on('$viewContentLoaded', function () 
	{
		$scope.baseurl = getBaseUrl.url();
		$scope.loading = true;
		$scope.inviteemail = '';
		$rootScope.addInviteData = [];
		$rootScope.autoheight();
		$scope.isClicked = 0;

		$rootScope.addEmailIntoDataInvite = function (email) {
			if (!email) { 
		      return; 
		    }
		    var isAddEmail = true; 
		    var  validate = $scope.validateEmail(email);
		    	 if ($rootScope.addInviteData && $rootScope.addInviteData.length) {
		    	 	for(var i = 0; i < $rootScope.addInviteData.length; i++) {
		    	 		if ($rootScope.addInviteData[i].email == email) {
                    		isAddEmail = false;
                  		}
                	}
                }
              	if (isAddEmail  && validate == true) {
              		$rootScope.addInviteData.push({email : email});
			      	$scope.inviteemail = '';
			    }
		    
		};

		$rootScope.addEmailIntoDataWhenEnterInvite = function (event,email) {
		    if (email && event.keyCode == 13) { 
		    	var isAddEmail = true; 
		    	var  validate = $scope.validateEmail(email);
		    	 if ($rootScope.addInviteData && $rootScope.addInviteData.length) {
		    	 	for(var i = 0; i < $rootScope.addInviteData.length; i++) {
		    	 		if ($rootScope.addInviteData[i].email == email) {
                    		isAddEmail = false;
                  		}
                	}
                }
              	if (isAddEmail  && validate == true) {
              		$rootScope.addInviteData.push({email : email});
			      	$scope.inviteemail = '';
			    }					
		    }
		};


		$rootScope.removeEmailIntoDataInvite = function (email) {
		    if (!email) { 
		      return; 
		    }
		    var attendData = [];
		    if ($rootScope.addInviteData && $rootScope.addInviteData.length) {
		      for(var i = 0; i < $rootScope.addInviteData.length; i++) {            
		        if(email != $rootScope.addInviteData[i].email) {
		          attendData.push({email : $rootScope.addInviteData[i].email});
		        }
		      }
		    }

		    $rootScope.addInviteData = attendData;
		    $rootScope.inviteemail = '';
  		}

  		$scope.validateEmail = function(mail) {
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (mail.match(mailformat)) {
            return true;
        }
        return false;  
    }

		/**
		* @module : Office management
		* @desc   : Invite Member
		* @author : Softweb solutions
		*/
		$rootScope.inviteMember = function(addInviteData)
		{
	        var userid = localStorage.getItem("uc_guid");
	        var officeid = $rootScope.officeid;
	        $scope.addUrl = $scope.baseurl+"/invitation/invite";
	        $http.post($scope.addUrl, {addInviteData: addInviteData,userid:userid,officeid:officeid}).success(function(data, status, headers, config) {
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