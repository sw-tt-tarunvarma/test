'use strict';

/*Space Controller added by JJ <jeel.joshi@softwebsolutions.com> */

angular.module('myApp.controllers')
.controller('SpaceController', ["$scope", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "ngDialog", "$window", "$state","$filter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, ngDialog, $window, $state, $filter) {

  $scope.$on('$viewContentLoaded', function () 
  {
    $scope.baseurl = getBaseUrl.url();
    $scope.loading = true;
    $scope.mode = 'add';
    $rootScope.spaceData = {};
    $scope.allSpaces = new Object();
    $rootScope.autoheight();
    $scope.inputCounter = 2;

  /**
  * @module : Office management
  * @desc   : Save office
  * @return : Return notification
  * @author : Softweb solutions
  */
  $rootScope.addSpace = function(spaceData) {

          $scope.addSpaceUrl = $scope.baseurl+"/space/addSpace";
          $http.post($scope.addSpaceUrl, spaceData).success(function(data, status, headers, config) {
            Notifier.success('Space added successfully.');
            $timeout(function(){$window.location.href='/index#/schedulemeeting';},1000);
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
    };
  });
}]);


app.directive('addInput', ['$compile', function ($compile) { // inject $compile service as dependency
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          // click on the button to add new input field
            element.find('a').bind('click', function () {
                //var input = angular.element('<div class="row"> <div class="col-md-4"> <label>Image</label> <input type="file" class="input-text" ng-model="spaceData['+ scope.inputCounter +'].newimage" base-sixty-four-input  > </div> <div class="col-md-5"> <label>Space Name</label> <input type="text" name="spacename" ng-model="spaceData['+ scope.inputCounter +'].name" class="input-text" required> </div> </div>');
                var input = angular.element('<div class="form-group"><div class="uploadpart"><input type="file" name="spaceimage" placeholder="Space image" id="Space image" class="upload-image input-text"  ng-model="spaceData['+ scope.inputCounter +'].newimage" base-sixty-four-input><label for="Space image"></label><small class="text-muted">Upload Image</small></div><div class="spancename"><label for="Space name" class="form-label semibold">Space name</label><input type="text"  name="spacename" ng-model="spaceData['+ scope.inputCounter +'].name" class="input-text form-control" required placeholder="Space name" id="Space name"><div id="name_span_error"></div></div></div>');

                // Compile the HTML and assign to scope
                var compile = $compile(input)(scope);
                if(scope.inputCounter <= 10 )
                {
                  $('#facilities-area-append').append(input);
                  scope.inputCounter++;
              }
              else
              {
                alert("You cannot add more then ten spaces.")
                return false;
              }
            });
        }
    }
}]);