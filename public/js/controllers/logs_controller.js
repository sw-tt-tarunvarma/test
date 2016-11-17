'use strict';

angular.module('myApp.controllers')
.controller('AppLogsController', ["$scope", "$http","getBaseUrl","$interval",function($scope, $http, getBaseUrl,$interval) {

  /**
  * @module : Log management
  * @desc   : Get log
  * @return : Return response notification
  * @author : Softweb solutions
  */
  var loadlog = function (){
    $scope.revlogsdetails={};
    $scope.baseurl = getBaseUrl.url();   
    $http.get($scope.baseurl + '/index/getlog')
    .success(function(data, status, headers, config) {
      $scope.logsdetails = data.split("||");
      $scope.revlogsdetails = $scope.logsdetails.reverse();
    }).error(function(data, status, headers, config) {
      Notifier.error('Something went wrong!. Please try again..');
    });
  }

  loadlog();
  $scope.$on('$viewContentLoaded', function () 
  {
    setInterval(loadlog,100000);
  });
}])