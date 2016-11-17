'use strict';
/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Search Controller */
angular.module('myApp.controllers')
.controller('AnalyticsController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$stateParams","socket", "$filter","ngDialog","$state", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl,$stateParams,socket, $filter, ngDialog, $state) {

  $rootScope.activeStateParam = $state.current.name;

  $scope.$on('$viewContentLoaded', function () 
  {
    $rootScope.displaySearchpeople = false;
    $rootScope.displaySearchSpace = true;
    $rootScope.autoheight();
    $rootScope.dataid = 1;
    $scope.baseurl = getBaseUrl.url();
    $rootScope.crUrl = $state.current.url;
    $rootScope.mainLogo = {};
    
     //added by JJ <jeel.joshi@softwebsolutions.com>
    $scope.addLogo = function(mainLogo)
    {
      var userid = localStorage.getItem("uc_guid");
      $scope.saveurl = $scope.baseurl+"/settings/addLogo";
      //console.log(mainLogo);return false;
      $http.post($scope.saveurl, {mainLogo: mainLogo, userid: userid}).success(function(data, status, headers, config)
      {
        Notifier.success('Logo uploaded successfully');
        //ngDialog.close('$escape');
        //$scope.getSettings();
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Close Dialog Box*/
    /**
    * @module : Conference
    * @desc   : Close Dialog Box
    * @return : 
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.closeDialog = function() {
      ngDialog.close('$escape');
      return false;
    }

    $rootScope.autoheight();
  })
}])