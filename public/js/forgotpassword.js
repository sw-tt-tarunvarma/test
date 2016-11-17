'use strict';
//added by JJ <jeel.joshi@softwebsolutions.com>
// Declare app level module which depends on filters, and services
var app = angular.module('forgotpasswordapp', ['angular-loading-bar','ui.router'])

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  }]);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/forgotpassword");
  $stateProvider
    .state('forgotpassword', {
      url: "/forgotpassword",
      templateUrl: "partials/forgotpassword.html"
    });  
})

app.controller('ForgotpasswordController', ["$scope", "$state", "$rootScope", "$http","$timeout", "getBaseUrl", "$window", function($scope, $state, $rootScope, $http, $timeout, getBaseUrl, $window) {

$scope.$watch('$viewContentLoaded', function () 
  {
    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > For Disable Button After Click */
    $scope.isClicked = 0; 
    $scope.baseurl = getBaseUrl.url();
    $rootScope.data = {};
    $scope.forgotpassFunction = function()
    {
      $scope.isClicked = 1;
      $scope.forgotUrl = $scope.baseurl+"/forgotpassword/forgotpassword";
      $scope.url = $scope.baseurl+"/forgotpassword/getUserName";
      $http.post($scope.baseurl+"/mobservices/SoftwebHOQForgotUser",{'email' : $rootScope.data.email})
      .success(function(result, status, headers, config) {
        if(result.Status == true) {
          $http.post($scope.url,{'email' : $rootScope.data.email })
          .success(function(res, status, headers, config) {
            var name = res.data[0].name;
            $http.post($scope.forgotUrl,{email: $rootScope.data.email, name: name})
            .success(function(result1, status, headers, config) {
              Notifier.success('Reset password request submitted successfully');
              $timeout(function(){$window.location.href='/';},1000);
            })
            .error(function(result1, status, headers, config) {
              $scope.isClicked = 0;
              Notifier.error('Something went wrong!. Please try again..');
            });
          })
          .error(function(res, status, headers, config) {
            $scope.isClicked = 0;
            Notifier.error('Something went wrong!. Please try again..');
          });
        }
        else {
          Notifier.error('email does not exist');
          $scope.isClicked = 0;
        }
      })
      .error(function(result, status, headers, config) {
        $scope.isClicked = 0;
        Notifier.error('Something went wrong!. Please try again..');
      });
    }
  });

}]);

app.service('getBaseUrl', function(){
    this.url= function(){
        return "http://smartoffice.softwebopensource.com";     
    };        
    
});




