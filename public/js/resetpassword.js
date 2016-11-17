'use strict';
//added by JJ <jeel.joshi@softwebsolutions.com>
// Declare app level module which depends on filters, and services
var app = angular.module('resetpasswordapp', ['angular-loading-bar','ui.router'])

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  }]);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/resetpassword");
  $stateProvider
    .state('resetpassword', {
      url: "/resetpassword/:token",
      templateUrl: "partials/resetpassword.html"
    });  
})

app.controller('ResetpasswordController', ["$scope", "$state", "$rootScope", "$http","$timeout", "getBaseUrl", "$window","$stateParams", function($scope, $state, $rootScope, $http, $timeout, getBaseUrl, $window,$stateParams) {

  $scope.$watch('$viewContentLoaded', function () 
  {
    var currentUrl = $window.location.href;
    var token = currentUrl.substr(currentUrl.lastIndexOf('/') + 1);
      $scope.baseurl = getBaseUrl.url();

      $scope.resetpassFunction = function(securityData)
      {
          var newpassword = securityData.newpassword;
          var confirmpassword = securityData.confirmpassword;
          var isSavePassword = true;
    if (newpassword != confirmpassword){
        isSavePassword = false;
        $("#password_lblError1").html("Password doesn't match");         
    }
    if(isSavePassword) {
        $scope.passwordupdateurl = $scope.baseurl+"/resetpassword/resetpassword";
        $scope.useridUrl = $scope.baseurl+"/resetpassword/getUserId";

        $http.post($scope.useridUrl,{token : token}).success(function(result, status, headers, config) 
        {
          if(result.data[0] != undefined && result.data[0].userid != ''){
            var userid = result.data[0].userid;
            $http.post($scope.passwordupdateurl,{newpassword:securityData.newpassword,token:token,userid:userid}).success(function(data, status, headers, config) 
        {
          $http.post($scope.baseurl+"/mobservices/SoftwebHOQUpdateUser", {au_guid: userid, uc_password: newpassword}).success(function(data, status, headers, config) {

            Notifier.success('Password reset successfully');
            $timeout(function(){$window.location.href='/logout';},1000);

          }).error(function(data, status, headers, config) {
             Notifier.error('Something went wrong. Please try again..');
          });

        }).error(function(data, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });
        
          } else {
            Notifier.error('Invalid Token!');
          }
        }).error(function(result, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });
      }
      }
  });

}]);

app.service('getBaseUrl', function(){
    this.url= function(){
        return "http://smartoffice.softwebopensource.com";
        
    };        
    
});




