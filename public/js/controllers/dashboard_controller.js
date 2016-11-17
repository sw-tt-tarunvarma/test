'use strict';

angular.module('myApp.controllers')
.controller('DashboardController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","socket", "$filter","ngDialog","$state", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, socket, $filter, ngDialog, $state) {

   $rootScope.activeStateParam = $state.current.name;

  $scope.$on('$viewContentLoaded', function () 
  {
    $rootScope.autoheight();  
    $scope.baseurl = getBaseUrl.url();

    $rootScope.allLocation = '';
    $scope.totalAvailableStatus=[];
    $rootScope.officeData= '';
    $scope.data="";
    $rootScope.location={};

    socket.on('locationStatusChange', function (data) {
      $timeout(function(){
        var found = $filter('filter')($rootScope.allLocation, {id: parseInt(data.id)}, true)[0];
        var foundIndex = $rootScope.allLocation.indexOf(found);
        if(data.status == 1)
        {
          $rootScope.allLocation[foundIndex].status = data.status;
        }
        else
        {
          $rootScope.allLocation[foundIndex].status = data.status;
        }
      },500);
    });

    $scope.flip = function(index)
    {
      $("#room_"+index).toggleClass("flip");
    }

    if($rootScope.allLocation) {
    }
    else
    {
      $timeout(function(){$rootScope.getLocations();},2000);
      $rootScope.autoheight();
    }

    /**
    * @module : Dashboard
    * @desc   : Open location popup
    * @return : View location popup
    * @author : Softweb solutions
    */
    $scope.clickToOpenLocation = function(id) 
    {
      if(id) 
      {
        $scope.mode = 'edit';
        var found = $filter('filter')($rootScope.allLocation, {id: id}, true)[0];
        var foundIndex = $rootScope.allLocation.indexOf(found);
        $timeout(function(){
          $rootScope.location = found;
         }, 500)
      }
      else 
      {
        $rootScope.location = new Object();
        $scope.mode = 'add';
      }
      ngDialog.open({ template: 'partials/locationadd_popup.html',scope:$scope });
    };

    /**
    * @module : Dashboard
    * @desc   : Save location
    * @return : Return response notification
    * @author : Softweb solutions
    */
    $rootScope.saveLocation = function() 
    {
      $http.post($scope.baseurl + '/location/insertLocation', $rootScope.location)
      .success(function(data, status, headers, config) {
        Notifier.success('Location Added successfully');
        ngDialog.close('$escape');
        $state.transitionTo("dashboard", '', { reload:true });
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    };

    /**
    * @module : Dashboard
    * @desc   : Edit location
    * @return : Return response notification
    * @author : Softweb solutions
    */
    $rootScope.editLocation = function(id) {
      $http.post($scope.baseurl + '/location/updateLocation', $rootScope.location)
      .success(function(data, status, headers, config) {
        Notifier.success('Location Updated successfully');
        ngDialog.close('$escape');
        $state.transitionTo("dashboard", '', { reload:true });
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    };

    /**
    * @module : Dashboard
    * @desc   : Delete location
    * @return : Return response notification
    * @author : Softweb solutions
    */
    $rootScope.deleteLocation = function(id) {
      var found = $filter('filter')($rootScope.allLocation, {id: id}, true)[0];
      var index = $rootScope.allLocation.indexOf(found);
      $http.get($scope.baseurl + '/location/deleteLocation/'+id)
      .success(function(data, status, headers, config) {
        $rootScope.allLocation.splice(index,1);
        Notifier.success('Location deleted successfully');
        ngDialog.close('$escape');
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    };

    
    $scope.$watch(function() {
      return $rootScope.allLocation;
    }, function(newValue, oldValue) {
      if(newValue!=undefined)
      {
        if(newValue.length > 0)
        {
          angular.forEach(newValue, function(value, key) {
            if(value.status != 1)
            {
              this.push(value.status);
            }
          }, $scope.totalAvailableStatus);
        }
      }
    });

  });
  $rootScope.autoheight();
}])