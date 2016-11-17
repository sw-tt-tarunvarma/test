'use strict';

/*Login Controllers */

angular.module('myApp.controllers')
.controller('FloorMapController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$q","ngDialog","$filter", "$state","$stateParams", 
						  function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, $q, ngDialog, $filter, $state,$stateParams) {



                            
  $scope.$on('$viewContentLoaded', function () 
  {
    

    
$scope.baseurl = getBaseUrl.url();
    
            $scope.image = {
                src: 'images/floorMap.png',
            };


            
            $scope.selector = {};

            $scope.drawer = [];

            $scope.rect = {
                color: '#337ab7',
                stroke: 3
            };

            $scope.addRect = function () {

                $scope.drawer.push({
                    x1: $scope.selector.x1,
                    y1: $scope.selector.y1,
                    x2: $scope.selector.x2,
                    y2: $scope.selector.y2,
                    color: $scope.rect.color,
                    stroke: $scope.rect.stroke
                });
                $scope.selector.clear();
            };

            $scope.clearRect = function ()
            {
              $scope.selector.clear();  
            }

            $scope.removeRect = function (index) {
                $scope.drawer.splice(index, 1);
            };

            $scope.cropRect = function () {
                $scope.result = $scope.selector.crop();
            };

            $scope.colors = {
                '#337ab7': 'active',
                '#3c763d': 'success',
                '#31708f': 'info',
                '#8a6d3b': 'warning',
                '#a94442': 'danger'
            };


  }); 
   
   

  }])
