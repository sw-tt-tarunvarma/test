'use strict';

angular.module('myApp.controllers')
.controller('ScheduleController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","socket", "$filter","ngDialog","$state","$log", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, socket, $filter, ngDialog, $state,$log) {

  $rootScope.activeStateParam = $state.current.name;

  $scope.$on('$viewContentLoaded', function () 
  {
    $rootScope.autoheight(); 
   // $rootScope.getScheduleEvents(); 
    $scope.baseurl = getBaseUrl.url();
    $rootScope.crUrl = $state.current.url;
    $rootScope.allOfficeEvents = '';
    $scope.filteredEvents = '';
    $scope.totalAvailableStatus=[];
    $rootScope.officeData= '';
    $scope.data="";
    $scope.date=''
    $rootScope.location={};
    $scope.currentPage = 1;
    $scope.numPerPage = 10;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5;
    $scope.sortType     = 'time'; // set the default sort type
    $scope.sortReverse  = true;  // set the default sort order
    //$scope.searchFish   = '';     // set the default search/filter term
    $scope.canShowRecords = 0;
 
    /* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Get Locations */
    /**
      * @module : schedual event
      * @desc   : schedual event
      * @return : Return Locations
      * @author : Softweb solutions - Dhaval Thaker
    */
   $scope.getScheduleEvents = function() {
     
      $http.post($scope.baseurl + "/schedule/getScheduleEvents", {userid: localStorage.getItem("uc_guid")})
      .success(function(result, status, headers, config) {
        $timeout(function() {
          $scope.allOfficeEvents = result.data;
          $rootScope.allOfficeEvents = $scope.allOfficeEvents;
          var begin = parseInt(($scope.currentPage - 1) * $scope.numPerPage);
          var end = parseInt(begin + $scope.numPerPage);
          $scope.filteredEvents = $rootScope.allOfficeEvents.slice(begin, end);   
          $scope.canShowRecords = 1;       
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    $scope.getScheduleEvents();

    $scope.$watch('currentPage + numPerPage', function() {
      var begin = parseInt(($scope.currentPage - 1) * $scope.numPerPage);
      var end = parseInt(begin + $scope.numPerPage);
      $scope.filteredEvents = $rootScope.allOfficeEvents.slice(begin, end);      
      });

    $scope.pageChanged = function() {
      
      console.log('Page changed to: ' + $scope.currentPage);
    };

    
  });

  $rootScope.autoheight();
}])
