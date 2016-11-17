'use strict';
/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Search Controller */
angular.module('myApp.controllers')
.controller('AnalyticsController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$stateParams","socket", "$filter","ngDialog","$state", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl,$stateParams,socket, $filter, ngDialog, $state) {

  $scope.$on('$viewContentLoaded', function () 
  {
    /*$rootScope.displaySearchpeople = false;
    $rootScope.displaySearchSpace = true;*/
    $rootScope.autoheight();  
    $scope.baseurl = getBaseUrl.url();
    $rootScope.crUrl = $state.current.url;
    /*$rootScope.searchResults = [];
    $rootScope.reservationData = [];
    $rootScope.timeSlotData = [];
    $rootScope.searchData = {};
    $rootScope.mainLogo = {};
    $rootScope.searchData.duration = '30';
    $rootScope.searchData.officeLocation = 1;
    $rootScope.searchData.amenities = '0';
    $rootScope.searchData.spaceType = '0';
    $rootScope.searchData.people = '0';
    $rootScope.searchData.bookable = 'available';
    $rootScope.searchData.date = new Date();
    $rootScope.searchData.startTime = new Date();
    $rootScope.spaceTypeData = ['Breakout','Call Room','Classroom','Conference Room','Meeting Room','Office','Study Room','Break Room','Cafe','Cafeteria','Fitness Gym','Interview Room','Kitchen','Lab','Lactation Room','Lobby','Lounge','Other','Parking','Restroom','Female Restroom','Male Restroom','Studio','Theater','Utility Room','Work Area'];
    $rootScope.peopleData = [1,2,3,4,5,6,7,8,9,10];
    $rootScope.bookableData = [{value:'available',label:'Only Bookable'},{value:'not_available',label:'Not Bookable'}];
 */

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get All Space Data
      * @return : Space Data
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getAllSpaceData = function() {
      $http.get($scope.baseurl+"/location/getLocations/")
      .success(function(result, status, headers, config) {
        $scope.allSpaceData = result.data;
        $timeout(function(){
          $rootScope.allSpaceData = result.data;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    $scope.getAllSpaceData();

    $rootScope.autoheight();
  })
}])