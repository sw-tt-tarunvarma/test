'use strict';

/*Login Controllers */

angular.module('myApp.controllers')
.controller('FloorMapController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$q","ngDialog","$filter", "$state","$stateParams", 
						  function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, $q, ngDialog, $filter, $state,$stateParams) {


  $rootScope.activeStateParam = $state.current.name;
                            
  $scope.$on('$viewContentLoaded', function () 
  {

    $scope.getFloorImage = function() {
      var floorid = $stateParams.floorid;    
      $scope.saveurl = $scope.baseurl+"/floorplan/getFloorImage/"+floorid;
      $http.get($scope.saveurl).success(function(result, status, headers, config) {
      
        if(result.length)
        {
           $scope.image = {
                src: 'images/'+result[0].floorplan,
            };
        }
        
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }
    $scope.getFloorImage();

    
    /*code added by DT <dhaval.thaker@softwebsolutions.com > Get All Space Data */
        /**
          * @module : FloorMap
          * @desc   : Get floormap details
          * @author : Softweb solutions
    */
    
    $scope.baseurl = getBaseUrl.url();

   /* $scope.image = {
        src: 'images/'+$rootScope.getImage,
    };

    console.log($rootScope.getImage);
    console.log('floorimage');*/

            
            
    $scope.selector = {};
    $scope.selector.spaceid ='';


    $rootScope.dataid = 1;

    $scope.drawer = [];

    $scope.floordata = [];

    $scope.selector = {
        color: "#"+((1<<24)*Math.random()|0).toString(16),
        stroke: 3
    };

    $scope.addRect = function () {
       
        var floorid = $stateParams.floorid;    
        $scope.drawer.push({
            x1: $scope.selector.x1,
            y1: $scope.selector.y1,
            x2: $scope.selector.x2,
            y2: $scope.selector.y2,
            color: $scope.selector.color,
            stroke: $scope.selector.stroke,
            room: $scope.selector.spaceid,
           });
       // $scope.selector.push({floorid:floorid});

       console.log($scope.selector)
      if($scope.selector.spaceid && floorid)
      {
        var isSaveFloorpan = true;

        $scope.checkFloorAvailabilityUrl = $scope.baseurl+"/floorplan/checkFloorAvailability";
          $http.post($scope.checkFloorAvailabilityUrl, {room:$scope.selector.spaceid,floor:floorid})
          .success(function(availabilityResult, status, headers, config) {
           if (availabilityResult.data.length > 0) {
              Notifier.error('You have already added co-ordinates for this space on the floor.');
              isSaveFloorpan = false;
          }

        if (isSaveFloorpan) {    
            $scope.floorMapUrl = $scope.baseurl+"/floorplan/insertfloormap";
            $http.post($scope.floorMapUrl, {floordata:$scope.selector,floorid:floorid}).success(function(data, status, headers, config) {
            Notifier.success('Floor co-ordinates added successfully.');
            $scope.getFloordata();
            $scope.selector.clear();
            $state.reload();
            //$timeout(function(){};
            }).error(function(data, status, headers, config) {
                Notifier.error('Something went wrong. Please try again..');
            });
          }
      });    

        
    }
  }
            

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


    $scope.getBuildingSpaceData = function() {
      console.log($stateParams);
      console.log('consoledata');
    //var locationid = $stateParams.floorid;
    var floorid = $stateParams.floorid;  
     $http.get($scope.baseurl+"/location/getBuildingSpaceData/"+floorid)
      .success(function(result, status, headers, config) {
     $scope.allBuildingSpaceData = result.data;
        $timeout(function(){
          $rootScope.allBuildingSpaceData = result.data;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    $scope.getBuildingSpaceData();    

    $scope.getFloordata = function() {
      var locationid = $stateParams.floorid;
      $http.get($scope.baseurl+"/floorplan/floordata/"+locationid)
      .success(function(result, status, headers, config) {
        //    console.log(result);
      //  $scope.floordata = result;
   
        $timeout(function(){
         $scope.floordata = result;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    $scope.getFloordata();

    $scope.getAllSpaceData();    
   

    $scope.clearRect = function ()
    {
      $scope.selector.clear();  
    }

     $scope.removeRect = function (id) {
     
       ngDialog.openConfirm({
          template:
            '<div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="myModal" class="modal box-typical fade in" style="display: block;"><div class="modal-dialog box-typical-dashboard" role="document"><div class="modal-content"> <header class="box-typical-header modal-header"><div class="tbl-row"><div class="tbl-cell tbl-cell-title"><h3>Are you sure you want to delete this floor co-ordinates??</h3></div><div class="tbl-cell tbl-cell-actions"><button type="button" ng-click="closeThisDialog(0);" class="action-btn" data-dismiss="modal" aria-label="Close"><i class="font-icon font-icon-close ngdialog-close"></i></button></div></header><div class="modal-body"><div class="modal-footer" style="padding:0px;text-align:left;"><div class="row"><div class="col-md-5"><button type="button" class="btn btn-primary" ng-click="closeThisDialog(0)">No&nbsp;</button><button type="button" class="btn btn-primary" ng-click="confirm('+id+')">Yes</button></div></div></div> </div></div></div></div>' ,
            plain: true,
            closeByDocument: true,
            closeByEscape: true,
          className: 'ngdialog-theme-default'
      }).then(function (id) {
          $http.get($scope.baseurl + '/floorplan/deleteFloor/'+id)
          .success(function(data, status, headers, config) {
            $scope.floordata.splice(id, 1);
            Notifier.success('Floor co-ordinates deleted successfully');
            $scope.getFloordata();
         //   ngDialog.close('$escape');
            
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong!. Please try again..');
          });
      }, function (value) {
         
      }); 
    };

    



    $scope.cropRect = function () {
       $scope.cropResult = $scope.selector.crop();
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
