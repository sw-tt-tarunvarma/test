'use strict';

/*Login Controllers */

angular.module('myApp.controllers')
.controller('ScheduleMeetingController', ["$scope", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "ngDialog", "$window", "$state","$filter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, ngDialog, $window, $state, $filter) {

  $scope.$on('$viewContentLoaded', function () 
  {
    $scope.baseurl = getBaseUrl.url();
    $scope.loading = true;
    $rootScope.meeting = {};
    $rootScope.autoheight();

  /**
  * @module : Office management
  * @desc   : Save office
  * @return : Return notification
  * @author : Softweb solutions JJ<jeel.joshi@softwebsolutions.com>
  */
  $rootScope.scheduleMeeting = function(meeting) {
          var userid = localStorage.getItem("uc_guid");
          $scope.addMeetingUrl = $scope.baseurl+"/schedulemeeting/schedulemeeting";
          $http.post($scope.addMeetingUrl, {meeting: meeting, userid: userid}).success(function(data, status, headers, config) {
            Notifier.success('Schedule meeting added successfully.');
            $timeout(function(){$window.location.href='/index#/invite';},1000);
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
       // }
      //}
    };
  });
}]);
