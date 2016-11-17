'use strict';

/*Login Controllers */

angular.module('myApp.controllers')
.controller('OfficeController', ["$scope", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "ngDialog", "$window", "$state","$filter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, ngDialog, $window, $state, $filter) {


  $scope.$on('$viewContentLoaded', function () 
  {
    $scope.baseurl = getBaseUrl.url();
    $scope.loading = true;
    $scope.mode = 'add';
    $scope.office = new Object();
    $rootScope.autoheight();
    $scope.showcreateoffice = false;
    $scope.showcreateofficeother = true;

    /**
    * @module : Office management
    * @desc   : Show office Div
    * @author : Softweb solutions
    */
    $scope.showCreateOffice = function()
    {
      $scope.showcreateoffice = true;
      $scope.showcreateofficeother = false;
    }    

    /**
    * @module : Office management
    * @desc   : Get office list
    * @return : Return list of offices
    * @author : Softweb solutions
    */
    $scope.getAllOffices = function()
    {
      $http.get($scope.baseurl + '/office')
      .success(function(data, status, headers, config) {
        $scope.officedata = data;
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    }
    
    //$scope.getAllOffices();

    /**
    * @module : Office management
    * @desc   : Get companies list
    * @return : Return list of companies
    * @author : Softweb solutions
    */
    $scope.getCompanies = function()
    {
      $http.get($scope.baseurl + '/company')
      .success(function(data, status, headers, config) {
        $scope.office.companydata = data;
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    }

    /**
    * @module : Office management
    * @desc   : Open window for add new office
    * @return : Return view add window for office
    * @author : Softweb solutions
    */
    $scope.clickToOpen = function(id) 
    {
      if(id) 
      {
        $scope.officeid = id;
        $scope.mode = 'edit';
        var found = $filter('filter')($scope.officedata, {id: id}, true);
        if (found.length) 
        {
          $timeout(function(){
            $scope.office = found[0];
            $scope.getCompanies();
          }, 500)
        }
      }
      else 
      {
        $scope.office = new Object();
        $scope.mode = 'add';
        $scope.getCompanies();
      }
      //console.log($scope.mode);
      ngDialog.open({ template: 'partials/officeadd_popup.html',scope:$scope });
    };
  });

  /**
  * @module : Office management
  * @desc   : Save office
  * @return : Return notification
  * @author : Softweb solutions
  */
  $scope.saveOffice = function() {
    
    var userid = localStorage.getItem("uc_guid");
    
    $http.post($scope.baseurl + '/office/insertOffice', {office: $scope.office, userid: userid})
    .success(function(data, status, headers, config) {
      Notifier.success('Office Added successfully');
      $timeout(function(){$window.location.href='/index#/space';},1000);
      //ngDialog.close('$escape');
      //$state.transitionTo("office", '', { reload:true });
    })
    .error(function(data, status, headers, config) {
      Notifier.error('Something went wrong!. Please try again..');
    });
  };

  /**
  * @module : Office management
  * @desc   : Edit office
  * @return : Return notification
  * @author : Softweb solutions
  */
  $scope.editOffice = function() {
    alert($scope.baseurl + '/office/editOffice')
    $http.post($scope.baseurl + '/office/editOffice', $scope.office)
    .success(function(data, status, headers, config) {
      Notifier.success('Office Edited successfully');
      ngDialog.close('$escape');
    })
    .error(function(data, status, headers, config) {
      Notifier.error('Something went wrong!. Please try again..');
    });
  };

  /**
  * @module : Office management
  * @desc   : Delete office
  * @return : Return notification
  * @author : Softweb solutions
  */
  $scope.deleteOffice = function() {
    var found = $filter('filter')($scope.officedata, {id: $scope.office.id}, true);
    var index = $scope.officedata.indexOf(found);
    $http.delete($scope.baseurl + '/office/deleteOffice/'+$scope.office.id)
    .success(function(data, status, headers, config) {
      $scope.officedata.splice(index,1);
      Notifier.success('Office deleted successfully');
      ngDialog.close('$escape');
    })
    .error(function(data, status, headers, config) {
      Notifier.error('Something went wrong!. Please try again..');
    });
  };
}])