'use strict';
/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Search Controller */
angular.module('myApp.controllers')
.controller('ReportController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$stateParams", "$filter","ngDialog","$state", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl,$stateParams,$filter, ngDialog, $state) {

  $rootScope.activeStateParam = $state.current.name;

  $scope.$on('$viewContentLoaded', function () 
  {
    $rootScope.autoheight();  
    $scope.baseurl = getBaseUrl.url();
    $rootScope.crUrl = $state.current.url;
    
      
      var report;
      var embedConfiguration = {
        type: 'report',
        accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3aWQiOiI5ZTUxYzRkMC00ZGM1LTRhODktYmExZC1hODY5NDU2ZGZiNzMiLCJyaWQiOiJkMmNhYzIxNC03MmNkLTQ1ZGUtOTcwZi0zZDYyYjkwYWEzOWUiLCJ3Y24iOiJTbWFydE9mZmljZURlbW8iLCJpc3MiOiJQb3dlckJJU0RLIiwidmVyIjoiMC4yLjAiLCJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwibmJmIjoxNDc2MTA4NDg5LCJleHAiOjE1MTIxMDg0ODl9.DgHJf5104m0S0Q1eTM0CgZLt0MgyP2be-uwGmlB7-X8',
        id: 'd2cac214-72cd-45de-970f-3d62b90aa39e',
        embedUrl: 'https://embedded.powerbi.com/appTokenReportEmbed'
      };
      var $reportContainer = $('#reportContainer');
      report = powerbi.embed($reportContainer.get(0), embedConfiguration);
        
      /**/
      $scope.fullscreen = function(){
        report.fullscreen();
      }
    

    //$scope.callreport();

  })
}])
