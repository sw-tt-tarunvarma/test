'use strict';

/*Login Controllers */

angular.module('myApp.controllers')
.controller('PeopleController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$q","ngDialog","$filter","base64Converter", "$state","$stateParams",function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, $q, ngDialog, $filter, base64Converter, $state,$stateParams) {

  $scope.$on('$viewContentLoaded', function () 
  {
    $scope.baseurl = getBaseUrl.url();
    $scope.allPeople;
    $scope.peopledata = {};
    $scope.showEveryone = true;
    $scope.showBrowseButton = false;
    $rootScope.autoheight();
    $scope.selectedUsers = [];

    /**
    * @module : People management
    * @desc   : Get list of all people
    * @return : Return people list
    * @author : Softweb solutions
    */
    $scope.getAllPeople = function()
    {
      var deferred = $q.defer();
      $http.get($scope.baseurl+"/people/getAllUsers")
      .success(function(result, status, headers, config) {
        deferred.resolve(result)
        $scope.data = result.data;
        $timeout(function(){
          $scope.allPeople = $scope.data; 
          console.log($scope.allPeople)
        },500);
      })
      .error(function(data, status, headers, config) {
       deferred.reject()
       Notifier.error('Something went wrong. Please try again..');
     });
      return deferred.promise;
    }

    /**
    * @module : People management
    * @desc   : Open a people semd notification box
    * @return : Return popup view
    * @author : Softweb solutions
    */
    $scope.clickToOpen = function(userid) 
    {
      $scope.peopledata ={};
      if(userid) 
      {
        var found = $filter('filter')($scope.allPeople, {userid: userid}, true);
        if (found.length) {
          $scope.peopledata = found[0];
        }
      }
      else
      {
        $scope.peopledata ={};
      }

      ngDialog.open({ 
        template: 'partials/people_popup.html',
        controller: 'PeopleController',
        scope:$scope
      });
    };
    $scope.getAllPeople();
  });

  /**
  * @module : People management
  * @desc   : Close dialog
  * @return : Close dialog
  * @author : Softweb solutions
  */
  $scope.closeDialog = function() {
    ngDialog.close('$escape');
    $scope.resetForm();
    return false;
  };

  /**
  * @module : People management
  * @desc   : Select user
  * @return : Return selected user
  * @author : Softweb solutions
  */
  $scope.selectUser = function(deviceid,status)
  {
    if($scope.selectedUsers.indexOf(deviceid) >= 0)
    {
      $scope.selectedUsers.splice($scope.selectedUsers.indexOf(deviceid),1);
    }
    $scope.selectedUsers.push({"deviceid":deviceid,"status":status});
  }

  /**
  * @module : People management
  * @desc   : Get check all people
  * @return : Return selected user list
  * @author : Softweb solutions
  */
  $scope.checkAll = function () {
    if ($scope.selectedAll==undefined || $scope.selectedAll==false) {
      $scope.selectedAll = true;
    }
    else
    {
      $scope.selectedAll = false;
    }
    angular.forEach($scope.allPeople, function (item) 
    {
      item.Selected = $scope.selectedAll;
      $scope.selectUser(item.deviceid,$scope.selectedAll);
    });
  };


  /**
  * @module : People management
  * @desc   : Send Notification to the all user
  * @return : Return notification
  * @author : Softweb solutions
  */
  $scope.SendAllNotification = function(){
    if($scope.peopledata.type == 0)
    {
      $scope.allPeople.push({
        "title"   :   $scope.peopledata.title,
        "message" :   $scope.peopledata.message,
        "type"    :   $scope.peopledata.type
      });
    }
    else
    {
      /* var dtStart = new Date($scope.peopledata.startTime);
      dtStart.setMinutes(dtStart.getMinutes() - dtStart.getTimezoneOffset());
      $scope.peopledata.startTime = dtStart;

      var dtEnd = new Date($scope.peopledata.endTime);
      dtEnd.setMinutes(dtEnd.getMinutes() - dtEnd.getTimezoneOffset());
      $scope.peopledata.endTime = dtEnd;  */
      $scope.allPeople.push({
        "title"     :   $scope.peopledata.title,
        "message"   :   $scope.peopledata.message,
        "type"      :   $scope.peopledata.type,
        "roomListID":   $scope.peopledata.roomListID,
        "startTime" :   $scope.peopledata.startTime,
        "endTime"   :   $scope.peopledata.endTime
      }); 
    } 
    
    

    $http.post($scope.baseurl+"/people/sendmessage",$scope.allPeople)
    .success(function(result, status, headers, config) {
      $scope.resetForm();
      Notifier.success('Message send successfully');
       var current = $state.current;
      var params = angular.copy($stateParams);
      ngDialog.close('$escape'); //SOFTWEB
      $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
    });
  }

  /**
  * @module : People management
  * @desc   : Send Notification to the specific user
  * @return : Return notification
  * @author : Softweb solutions
  */
  $scope.SendNotification = function(){

    if($scope.peopledata.type == 0)
    {
      $scope.allPeople.push({
        "title"   :   $scope.peopledata.title,
        "message" :   $scope.peopledata.message,
        "type"    :   $scope.peopledata.type
      });
    }
    else
    {
      /* var dtStart = new Date($scope.peopledata.startTime);
      dtStart.setMinutes(dtStart.getMinutes() - dtStart.getTimezoneOffset());
      $scope.peopledata.startTime = dtStart;

      var dtEnd = new Date($scope.peopledata.endTime);
      dtEnd.setMinutes(dtEnd.getMinutes() - dtEnd.getTimezoneOffset());
      $scope.peopledata.endTime = dtEnd;  */
      $scope.allPeople.push({
        "title"     :   $scope.peopledata.title,
        "message"   :   $scope.peopledata.message,
        "type"      :   $scope.peopledata.type,
        "roomListID":   $scope.peopledata.roomListID,
        "startTime" :   $scope.peopledata.startTime,
        "endTime"   :   $scope.peopledata.endTime
      }); 
    } 

    /* var dtStart = new Date($scope.peopledata.startTime);
    dtStart.setMinutes(dtStart.getMinutes() - dtStart.getTimezoneOffset());
    $scope.peopledata.startTime = dtStart;

    var dtEnd = new Date($scope.peopledata.endTime);
    dtEnd.setMinutes(dtEnd.getMinutes() - dtEnd.getTimezoneOffset());
    $scope.peopledata.endTime = dtEnd; */

    console.log($scope.peopledata);

    $http.post($scope.baseurl+"/people/sendmessage",$scope.peopledata)
    .success(function(result, status, headers, config) {
      $scope.resetForm();
      Notifier.success('Message send successfully');
       var current = $state.current;
      var params = angular.copy($stateParams);
      ngDialog.close('$escape'); //SOFTWEB
      $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
    });
  }

  /**
  * @module : People management
  * @desc   : Reset form values after submit or cancel or close the popup box.
  * @return : 
  * @author : Softweb solutions
  */
  $scope.resetForm = function(){
    $scope.peopledata.endTime     = "";
    $scope.peopledata.startTime   = "";
    $scope.peopledata.roomListID  = "";
    $scope.peopledata.type        = "";
    $scope.peopledata.title       = "";
    $scope.peopledata.message     = "";
  }

  /**
  * @module : People management
  * @desc   : Get all room list for eoom maintenance
  * @return : Return room list
  * @author : Softweb solutions
  */
  $scope.getRoomList = function(notificationType, userID){

    if(notificationType == 1)
    {
      $http.get($scope.baseurl+"/location/allSpacesOfUser/"+localStorage.getItem("uc_guid")+"/"+$rootScope.dataid)
      .success(function(result, status, headers, config) {
        $scope.roomList = result;
      });
    }
    else
    {
      $scope.roomList = [];
      return false;
    } 
  }


  /**
  * @module : People management
  * @desc   : Get datepicker
  * @return : Return datepicker
  * @author : Softweb solutions
  */
  var that = this;

  var in10Days = new Date();
  in10Days.setDate(in10Days.getDate() + 10);

  this.dates = {
    start: new Date(),
    end: new Date()
  };

  this.open = {
    start: false,
    end  : false,
  };

  // Disable today selection
  this.disabled = function(date, mode) {
    return (mode === 'day' && (new Date().toDateString() == date.toDateString()));
  };

  this.dateOptions = {
    showWeeks: false,
    startingDay: 1
  };

  this.timeOptions = {
    readonlyInput: false,
    showMeridian: false
  };

  this.dateModeOptions = {
    minMode: 'year',
    maxMode: 'year'
  };

  this.openCalendar = function(e, date) {
    that.open[date] = true;
    console.log(date);
  };

  // watch date4 and date5 to calculate difference
  var unwatch = $scope.$watch(function() {
    return that.dates;
  }, function() {
    if (that.dates.date4 && that.dates.date5) {
      var diff = that.dates.date4.getTime() - that.dates.date5.getTime();
      that.dayRange = Math.round(Math.abs(diff/(1000*60*60*24)))
    } else {
      that.dayRange = 'n/a';
    }
  }, true);

  $scope.$on('$destroy', function() {
    unwatch();
  });

  /* Code for date picker management [4-5-2016] : Softweb*/
}])