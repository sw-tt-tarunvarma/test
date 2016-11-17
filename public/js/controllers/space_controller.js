'use strict';

/*Space Controller added by JJ <jeel.joshi@softwebsolutions.com> */

angular.module('myApp.controllers')
.controller('SpaceController', ["$scope", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "ngDialog", "$window", "$state","$filter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, ngDialog, $window, $state, $filter) {

  $scope.$on('$viewContentLoaded', function () 
  {
    $scope.baseurl = getBaseUrl.url();
    $rootScope.dataid = 1;
    $scope.loading = true;
    $scope.mode = 'add';
    $rootScope.spaceData = {};
    $rootScope.autoheight();
    $scope.inputCounter = 2;
    var isSaveSpace = '';

    $scope.getSpaces = function() {
      $http.get($scope.baseurl+"/location/allSpacesOfUser/"+localStorage.getItem("uc_guid")+"/"+$rootScope.dataid)
      .success(function(result, status, headers, config) {
        $timeout(function(){
          if(result.data != undefined) {
            $scope.allSpaces = result.data;
            $rootScope.allSpaces = $scope.allSpaces;
          } else {
            $scope.allSpaces = '';
          }
          $rootScope.massSpaceData = {};
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }    
        
    $timeout(function(){
      $scope.getSpaces();
    },500);

  /**
  * @module : Office management
  * @desc   : Save office
  * @return : Return notification
  * @author : Softweb solutions
  */
  $rootScope.addSpaces = function(spaceData) {
    var userid = localStorage.getItem("uc_guid");
    var officeid = $rootScope.officeid;
    for(var key in spaceData){
        var name = spaceData[key].name;
        if (name && name.trim()) {
        var isSaveSpace = true;
        var found = $filter('filter')($scope.allSpaces, {name: name}, true);
        if (found.length) {
          $("#name_span_error").html("Location already exists.");
          isSaveSpace = false;
        }
        if(spaceData[key].newimage && spaceData[key].newimage.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray(spaceData[key].newimage.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#spaceImage_lblError1").html("Please upload valid image file.");
            isSaveSpace = false;
          }          
        }
        if (isSaveSpace) {
          spaceData[key].name = name.trim();
          if (!spaceData[key].image) {
            spaceData[key].image = '';
          }
          }
          }   
      key++;
    }
      if (isSaveSpace) {
          $scope.addSpaceUrl = $scope.baseurl+"/space/addSpaces";
          $http.post($scope.addSpaceUrl, {spaceData:spaceData,userid:userid,officeid:officeid}).success(function(data, status, headers, config) {
            Notifier.success('Space added successfully.');
            $timeout(function(){$window.location.href='/index#/schedulemeeting';},1000);
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
        }
    }
    
  });
}]);


angular.module('myApp.controllers').directive('addInput', ['$compile', function ($compile) { // inject $compile service as dependency
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          // click on the button to add new input field
            element.find('a').bind('click', function () {
                
                var input = angular.element('<div class="facilities-area_'+ scope.inputCounter +'"><div class="form-group"><div class="add-div pull-right"><a class="remove-facility" ng-click="removeSpaceSection('+ scope.inputCounter +',0)"><span class="glyphicon glyphicon-remove-circle" aria-hidden="true" style="color:red;font-size:25px;"></span></a></div><div class="uploadpart"><input type="file" name="spaceimage" placeholder="Space image" id="Space image" class="upload-image input-text"  ng-model="spaceData['+ scope.inputCounter +'].newimage" base-sixty-four-input><label for="Space image"></label><small class="text-muted">{{ spaceData['+ scope.inputCounter +'].newimage.filename }}</small></div><div class="spancename"><label for="Space name" class="form-label semibold">Space name</label><input type="text"  name="name" ng-model="spaceData['+ scope.inputCounter +'].name" class="input-text form-control" required placeholder="Space name" id="Spacename_'+ scope.inputCounter +'"><span style="color:red" ng-show="myform.name.$touched && myform.name.$invalid">Name is required.</span><div id="name_span_error"></div></div></div></div>');

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
            
            scope.removeSpaceSection = function(key, param){
                if(key) {
                  delete scope.spaceData[key];
                  $('.facilities-area_'+key).remove();
                  $('#Spacename_'+key).val("");
                  scope.inputCounter--;
                } else {
                  return false;
                }
           };

        }
    }
}]);