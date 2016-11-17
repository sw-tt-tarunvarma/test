'use strict';
/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Search Controller */
angular.module('myApp.controllers')
.controller('AnalyticsController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$stateParams","socket", "$filter","ngDialog","$state", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl,$stateParams,socket, $filter, ngDialog, $state) {

  $rootScope.activeStateParam = $state.current.name;

  $scope.$on('$viewContentLoaded', function () 
  {
	 
    /*$rootScope.displaySearchpeople = false;
    $rootScope.displaySearchSpace = true;*/
    $rootScope.autoheight();  
    $scope.baseurl = getBaseUrl.url();
    $rootScope.crUrl = $state.current.url;
    $rootScope.dataid = 1;


    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get All Space Data
      * @return : Space Data
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getAllSpaceData = function() {
      $http.get($scope.baseurl+"/location/allSpacesOfUser/"+localStorage.getItem("uc_guid")+"/"+$rootScope.dataid)
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

  /*  $scope.callreport = function() {
      
      var iframe = document.getElementById('ifrTile');
      iframe.src = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=f128f8b8-fdc4-4a3e-b879-e4a5ef9f9a94&filterPaneEnabled=false';
      iframe.onload = function() {
        var msgJson = {
          action: "loadReport",
          accessToken:"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3aWQiOiJmYmNhYzIyNi0wODRjLTQ4NTUtOTZlMy0wMWI4M2QyOWM0YzciLCJyaWQiOiI0MTcwZjhjZS1iM2YxLTQ0NzMtODI4MC1iZmI2MmViMmI3ZDIiLCJ3Y24iOiJGaW5hbFNtYXJ0T2ZmaWNlRGVtbyIsImlzcyI6IlBvd2VyQklTREsiLCJ2ZXIiOiIwLjIuMCIsImF1ZCI6Imh0dHBzOi8vYW5hbHlzaXMud2luZG93cy5uZXQvcG93ZXJiaS9hcGkiLCJuYmYiOjE0NzU4NDIzNjYsImV4cCI6MTUxMTg0MjM2Nn0.IKSFUeBmIXH1QYWoF0O9abdcS4NpuCER__jj5jwfdpk",          
  oDataFilter: "deviceTelemtry/CompanyName eq '"+$rootScope.officename+"'"
        };
        var msgTxt = JSON.stringify(msgJson);
        iframe.contentWindow.postMessage(msgTxt, "*");
      };
    }; 
    * */
    
    var report;
    
    $scope.callreport = function() {
 	
	 
      var embedConfiguration = {
        type: 'report',
        accessToken:"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3aWQiOiI5ZTUxYzRkMC00ZGM1LTRhODktYmExZC1hODY5NDU2ZGZiNzMiLCJyaWQiOiJmNTlhODQyOC0yMTViLTQ3MzctYTUzMC1lNDFhY2Y1YjZiNTAiLCJ3Y24iOiJTbWFydE9mZmljZURlbW8iLCJpc3MiOiJQb3dlckJJU0RLIiwidmVyIjoiMC4yLjAiLCJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwibmJmIjoxNDc2MTA4NDUzLCJleHAiOjE1MTIxMDg0NTN9.vvhf5IEQ2_gcvkPqMF4YRmHNp24AB1WS46Dii5cr2qo",
        id: 'f59a8428-215b-4737-a530-e41acf5b6b50',
        embedUrl: 'https://embedded.powerbi.com/appTokenReportEmbed'
      };
      var $reportContainer = $('#ifrTile');
      report = powerbi.embed($reportContainer.get(0), embedConfiguration);
	};
      
      $scope.fullscreen = function(){
		  
        report.fullscreen();
      }
    


    $scope.getAllSpaceData();

    $scope.callreport();

    $rootScope.autoheight();
  })
  
  
  
}])
