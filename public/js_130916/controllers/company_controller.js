'use strict';

/*Login Controllers */

angular.module('myApp.controllers')
.controller('CompanyController', ["$scope", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "ngDialog", "$window", "$state", "$filter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, ngDialog, $window, $state, $filter) {


  $scope.$on('$viewContentLoaded', function () 
  {
    $scope.baseurl = getBaseUrl.url();
    $scope.loading = true;
    $scope.mode = 'add';
    $scope.company = new Object();
    $rootScope.companydata;
    $rootScope.getLocations();
    $rootScope.getAllCompany();
    $rootScope.autoheight();
    $scope.mode = 'add';
    $scope.office = new Object();

    /**
    * @module : Company
    * @desc   : toggle class
    * @return : Return toggle class
    * @author : Softweb solutions
    */
    $scope.flip = function(index, type)
    {
      if(type == "company")
      {
        $("#company_detail").toggleClass("flip");
      }
      if(type == "office")
      {
        $("#company_"+index).toggleClass("flip");
      }
    }

    /**
    * @module : App images 
    * @desc   : Open office
    * @return : Return Office indormation
    * @author : Softweb solutions
    */
    $scope.clickToOpenOffice = function(id) 
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
            $scope.office.companyid = $rootScope.officeData[0].companyid;
          }, 500)
        }
      }
      else 
      {
        $scope.office = new Object();
        $scope.mode = 'add';
        $scope.office.companyid = $rootScope.officeData[0].companyid;
      }
      ngDialog.open({ template: 'partials/officeadd_popup.html',scope:$scope });
    };

    /**
    * @module : App images 
    * @desc   : Save office information
    * @return : Return Office list
    * @author : Softweb solutions
    */
    $scope.saveOffice = function() {
      $http.post($scope.baseurl + '/office/insertOffice', $scope.office).success(function(data, status, headers, config) {
        Notifier.success('Office Added successfully');
        ngDialog.close('$escape');
        $scope.getAllOffices();
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    };

    /**
    * @module : App images 
    * @desc   : Edit office information
    * @return : Return edit Offic
    * @author : Softweb solutions
    */
    $scope.editOffice = function() {

      $http.post($scope.baseurl + '/office/editOffice', $scope.office).success(function(data, status, headers, config) {
        Notifier.success('Office Edited successfully');
        ngDialog.close('$escape');
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    };

    /**
    * @module : App images 
    * @desc   : Delete office information
    * @return : Return delete Offic
    * @author : Softweb solutions
    */
    $scope.deleteOffice = function() {
      var found = $filter('filter')($scope.officedata, {id: $scope.office.id}, true);
      var index = $scope.officedata.indexOf(found);
      $http.delete($scope.baseurl + '/office/deleteOffice/'+$scope.office.id).success(function(data, status, headers, config) {
        $scope.officedata.splice(index,1);
        Notifier.success('Office deleted successfully');
        ngDialog.close('$escape');
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    };

    /**
    * @module : App images 
    * @desc   : Edit office information
    * @return : Return edit Offic
    * @author : Softweb solutions
    */
    $scope.clickToOpen = function(id) 
    {
      if(id) 
      {
        $scope.companyid = id;
        var found = $filter('filter')($scope.companydata, {id: id}, true);
        if (found.length) 
        {
          $timeout(function(){
            $scope.company = found[0];
            $scope.mode = 'edit';
          }, 500)
        }
      }
      else 
      {
        $scope.company = new Object();
        $scope.mode = 'add';
      }
      ngDialog.open({ template: 'partials/companyadd_popup.html',scope:$scope });
    };
  });

    /**
    * @module : App images 
    * @desc   : Save company
    * @return : Return save Offic
    * @author : Softweb solutions
    */
    $scope.saveCompany = function() {
      $http.post($scope.baseurl + '/company/insertCompany', $scope.company).success(function(data, status, headers, config) {
        Notifier.success('Company Added successfully');
        ngDialog.close('$escape');
        $state.transitionTo("company", '', { reload:true });
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    };


     /**
    * @module : App images 
    * @desc   : Edit company
    * @return : Return edit Offic
    * @author : Softweb solutions
    */
    $scope.editCompany = function() {
      $http.post($scope.baseurl + '/company/editCompany', $scope.company)
      .success(function(data, status, headers, config) {
          Notifier.success('Company Edited successfully');
          ngDialog.close('$escape');
          $state.transitionTo("company", '', { reload:true });
      })
        .error(function(data, status, headers, config) {
          Notifier.error('Something went wrong!. Please try again..');
      });
    };

    /**
    * @module : App images 
    * @desc   : Delete company
    * @return : Return delete Offic
    * @author : Softweb solutions
    */
    $scope.deleteCompany = function() {
      var found = $filter('filter')($rootScope.companydata, {id: $scope.company.id}, true);
      var index = $rootScope.companydata.indexOf(found);
      $http.delete($scope.baseurl + '/company/deleteCompany/'+$scope.company.id).success(function(data, status, headers, config) {
        $rootScope.companydata.splice(index,1);
        Notifier.success('Company deleted successfully');
        ngDialog.close('$escape');
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong!. Please try again..');
      });
    };

}])