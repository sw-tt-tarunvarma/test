'use strict';
/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Search Controller */
angular.module('myApp.controllers')
.controller('SearchController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$stateParams","socket", "$filter","ngDialog","$state", "generalService", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl,$stateParams,socket, $filter, ngDialog, $state, generalService) {

  $rootScope.activeStateParam = $state.current.name;

  /**
  * @module : Search
  * @desc   : Redirect on setting page with needed tab
  * @return : Redirtect on setting page with selected tab
  * @author : Softweb solutions - Mayank Patel
  */
  $scope.openSettingAdvance = function() {
    $rootScope.tabName = 'advance';
    $rootScope.displayAdvance = true;
    $location.path("/settings");
  }

  $scope.$on('$viewContentLoaded', function () 
  {
    $rootScope.isClicked=1;
    $scope.dataid = 1;
    $scope.displaySearchpeople = false;
    $scope.displaySearchSpace = true;
    $scope.autoheight();  
    $scope.baseurl = getBaseUrl.url();
    $scope.crUrl = $state.current.url;
    $scope.searchResults = [];
    $scope.reservationData = [];
    $scope.timeSlotData = [];
    $scope.searchData = {};
    $rootScope.mainLogo = {};
    $scope.isvisible = '';
    $scope.canShowRecords = 0;
    $scope.searchData.duration = '15';
    $scope.searchData.officeLocation = '0';
    $scope.searchData.floor = '0';
    $scope.searchData.defaultOfficeLocation = '0';
    $scope.searchData.amenities = {};
    $scope.searchData.spaceType = '0';
    $scope.searchData.people = '0';
    $scope.searchData.bookable = '';
    $scope.searchData.date = new Date();
    var coeff = 1000 * 60 * 5;
    $scope.rounded = new Date(Math.round($scope.searchData.date.setMinutes( $scope.searchData.date.getMinutes() + 2.5 ) / coeff) * coeff);
    $scope.searchData.startTime = $scope.rounded;
    $scope.spaceTypeData = ['Breakout','Call Room','Classroom','Conference Room','Meeting Room','Office','Study Room','Break Room','Cafe','Cafeteria','Fitness Gym','Interview Room','Kitchen','Lab','Lactation Room','Lobby','Lounge','Other','Parking','Restroom','Female Restroom','Male Restroom','Studio','Theater','Utility Room','Work Area'];
    $scope.peopleData = [1,2,3,4,5,6,7,8,9,10];
    $scope.bookableData = [{value:'available',label:'Only Bookable'},{value:'not_available',label:'Not Bookable'}];

    $scope.searchData.hour = '';
    $scope.searchData.minute = '';
    $scope.searchData.defaultMinute = parseInt(15);
    $scope.searchData.hoursData = [];
    $scope.searchData.minuteData = [parseInt(0),parseInt(15),parseInt(30),parseInt(45)];
    for (var i = 0; i < 10; i++) {
      $scope.searchData.hoursData.push({label:parseInt(i),value:parseInt(60*i)});
    }
    $scope.floors = [];
    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for calender*/
    $scope.open = {
      date: false,
      startTime: false,
      endTime  : false,
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for calender*/
    $scope.openCalendar = function(e, date) {
      $scope.open[date] = true;
    };
         
    $scope.addLogo = function(mainLogo)
    {
      var userid = localStorage.getItem("uc_guid");
      $scope.saveurl = $scope.baseurl+"/settings/addLogo";
      $http.post($scope.saveurl, {mainLogo: mainLogo, userid: userid}).success(function(data, status, headers, config)
      {
        Notifier.success('Logo uploaded successfully');
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All OfficeLocations */
    /**
    * @module : Search
    * @desc   : Get All OfficeLocations
    * @return : return OfficeLocations
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getAllOfficeLocations = function() {
      $http.get($scope.baseurl+"/location/getUserOfficeLocations/"+localStorage.getItem("uc_guid"))
      .success(function(result, status, headers, config) {
        $timeout(function() {
          $scope.allOfficeLocations = result.data;
          $scope.getSearchResult($scope.searchData);
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

     /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All Floors of Users */
    /**
    * @module : Search
    * @desc   : Get All Floors of Users 
    * @return : return floors
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getAllFloors = function() {
      $http.get($scope.baseurl+"/location/getFloors/"+localStorage.getItem("uc_guid"))
      .success(function(result, status, headers, config) {
        $timeout(function() {
          $scope.allfloors = result.data;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Floor of Building */
    /**
    * @module : Search
    * @desc   : Get Floor of Building 
    * @return : return floors
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getFloorsOfBuilding = function(buildingId) {
      $scope.searchData.floor = '0';
      if (parseInt(buildingId) > 0 && $scope.allfloors) {
        var found = $filter('filter')($scope.allfloors, {'locationid':parseInt(buildingId)},true); 
        if (found.length) {
          $scope.floors = found;
        }
        else {
          $scope.floors = [];  
        }        
      }
      else {
        $scope.floors = [];
      }
    }

    /*code added by Jeel Joshi /* Hide Branding Text */
    /**
    * @module : Search
    * @desc   : Hide Branding Text
    * @return : return value
    * @author : Softweb solutions - Jeel Joshi
    */
    $scope.getBrandingText = function() {
      var userid = localStorage.getItem("uc_guid");
      $http.post($scope.baseurl+"/settings/getBrandingText",{userid:userid})
      .success(function(result, status, headers, config) {
        $timeout(function() {
          if(result.data[0] != undefined) {
            $scope.isvisible = result.data[0].brandingtext;  
          } else {
            $scope.isvisible = '';
          } 
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }
    $scope.getBrandingText();

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Amenities */
    /**
    * @module : Search
    * @desc   : Get Amenities
    * @return : Return Amenities
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getAllAmenities = function() {
      $http.get($scope.baseurl+"/amenities/allAmenities/")
      .success(function(result, status, headers, config) {
        $timeout(function() {
          $scope.allAmenities = result.data;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }
    
    $scope.getAllOfficeLocations();
    $scope.getAllFloors();
    $scope.getAllAmenities();

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Search Result */
    /**
    * @module : Search
    * @desc   : Get Search Result
    * @return : Return Search Result
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getSearchResult = function(searchData) {
      var postData = {};
      var duration = parseInt(0);

      if (parseInt(searchData.hour)) {
        duration  = parseInt(parseInt(searchData.hour) + parseInt(duration));
      }

      if (parseInt(searchData.minute)) {
        duration  = parseInt(parseInt(searchData.minute) + parseInt(duration));
      }

      if (duration == 'NaN' || !duration) {
        duration = parseInt(searchData.defaultMinute);
      }
      postData.startTime = new Date(searchData.date.getFullYear(),searchData.date.getMonth(),searchData.date.getDate(),searchData.startTime.getHours(),searchData.startTime.getMinutes());
      postData.endTime = new Date(postData.startTime.getTime() + parseInt(duration * 60000));
      var month = postData.startTime.getMonth() + 1;
      if (month.toString().length == 1) {
        month = "0"+month;
      }

      var day = postData.startTime.getDate();
      if (day.toString().length == 1) {
        day = "0"+day;
      }

      postData.date = postData.startTime.getFullYear()+'-'+month+'-'+day;
      postData.startTime = postData.startTime.toISOString().replace('.000Z', '');
      postData.endTime = postData.endTime.toISOString().replace('.000Z', '');
      postData.officeId = parseInt(0);
      postData.floorId = parseInt(0);
      postData.people = parseInt(0);
      postData.spaceType = '';
      postData.amenities = [];
      postData.bookable = '';
      postData.userUcGuid = localStorage.getItem("uc_guid");

      if (searchData.officeLocation && parseInt(searchData.officeLocation)) {
        postData.officeId = parseInt(searchData.officeLocation);
      }

      if (searchData.floor && parseInt(searchData.floor)) {
        postData.floorId = parseInt(searchData.floor);
      }

      if (searchData.people && parseInt(searchData.people)) {
        postData.people = parseInt(searchData.people);
      }

      if (searchData.spaceType && searchData.spaceType.trim() && searchData.spaceType != 0) {
        postData.spaceType = searchData.spaceType.trim();
      }

      if (searchData.amenities) {
        for (var am_id in searchData.amenities) {
          if (searchData.amenities.hasOwnProperty(am_id) && searchData.amenities[am_id] == true) {
            postData.amenities.push(am_id);
          }
        }
      }

      if (searchData.bookable == 'available') {
        postData.bookable = searchData.bookable.trim();
      }

      $scope.getSearchResultUrl = $scope.baseurl+"/search/getSearchResults";
      $http.post($scope.getSearchResultUrl, postData)
      .success(function(result, status, headers, config) {        
        $timeout(function() {
          $scope.searchResults = result.data;
          $scope.reservationData = result.reservationData;

          if ($scope.searchResults && $scope.searchResults.length > 0) {
            for (var i = 0; i < $scope.searchResults.length; i++) {
              if ($scope.searchResults[i].image) {
                $scope.searchResults[i].image = $scope.baseurl+"/images/"+$scope.searchResults[i].image;
              }
              else {
                $scope.searchResults[i].image = $scope.baseurl+"/images/room-detail-image.jpg";
              }

              $scope.searchResults[i].amenitiesData = [];
              if (result.amenitiesData.length && $scope.searchResults[i].amenities) {
                var amenities = $scope.searchResults[i].amenities.split(",");
                if (amenities.length) {
                  for (var a = 0; a < amenities.length; a++) {
                    for (var b = 0; b < result.amenitiesData.length; b++) {
                      if (amenities[a] == result.amenitiesData[b].am_guid) {
                        var ameni = {};
                        ameni.name = result.amenitiesData[b].amenities ? result.amenitiesData[b].amenities : '';
                        ameni.image = result.amenitiesData[b].am_image ? result.amenitiesData[b].am_image : '';
                        if (ameni.image) {
                          ameni.image = $scope.baseurl+'/images/'+ameni.image;
                        }
                        $scope.searchResults[i].amenitiesData.push(ameni);
                      }
                    }
                  }
                }
              }

              $scope.searchResults[i].timeSlotData = [];
              var currentDate = new Date();
              var date = new Date($scope.searchData.date.getFullYear(),$scope.searchData.date.getMonth(),$scope.searchData.date.getDate(),$scope.searchData.startTime.getHours(),$scope.searchData.startTime.getMinutes());

              for (var j =0; j < 3; j++) {
                
                var startTime = date;
                var startTime = generalService.getRoundedTime(startTime);
                var endTime = new Date(startTime.getTime() + parseInt(duration)*60000);
                var startHours = startTime.getHours();
                var startMinutes = startTime.getMinutes();
                /*var startAmPm = startHours >= 12 ? 'PM' : 'AM';
                startHours = startHours % 12;
                startHours = startHours ? startHours : 12;
                startMinutes = startMinutes < 10 ? '0'+startMinutes : startMinutes;*/
                
                if (startHours.toString().length == 1) {
                  startHours = "0"+startHours;
                }

                if (startMinutes.toString().length == 1) {
                  startMinutes = "0"+startMinutes;
                }

                var endHours = endTime.getHours();
                var endMinutes = endTime.getMinutes();
                /*var endAmPm = endHours >= 12 ? 'PM' : 'AM';
                endHours = endHours % 12;
                endHours = endHours ? endHours : 12;
                endMinutes = endMinutes < 10 ? '0'+endMinutes : endMinutes;*/
                
                if (endHours.toString().length == 1) {
                  endHours = "0"+endHours;
                }

                if (endMinutes.toString().length == 1) {
                  endMinutes = "0"+endMinutes;
                }

                var bookedSlotData = [];
                var booked = '';
                var style = '';
                if($scope.reservationData.length) {
                  var found = $filter('filter')($scope.reservationData, {'locationid':$scope.searchResults[i].id},true); 
                    if (found.length) { 
                      for (var k = 0; k < found.length; k++) {
                        if (found[k].locationid == $scope.searchResults[i].id) {
                          var dataStartDate = new Date(found[k].time);
                          var dataEndDate = new Date(found[k].endtime);
                          if(dataStartDate <= startTime && dataEndDate > startTime) {
                            bookedSlotData.push($scope.reservationData[k]);
                            booked = 'booked';
                            style = "background: #929faa;color: #ffffff;";
                          }
                          else if(dataStartDate < endTime && dataEndDate > endTime) {
                            bookedSlotData.push(found[k]);
                            booked = 'booked';
                            style = "background: #929faa;color: #ffffff;";
                          }
                          else if(startTime <= dataStartDate && endTime > dataStartDate) {
                            bookedSlotData.push($scope.reservationData[k]);
                            booked = 'booked';
                            style = "background: #929faa;color: #ffffff;";
                          }
                          else if(startTime < dataEndDate && endTime > dataEndDate) {
                            bookedSlotData.push($scope.reservationData[k]);
                            booked = 'booked';
                            style = "background: #929faa;color: #ffffff;";
                          }
                        }                      
                      }
                    }
                      
                }

                $scope.searchResults[i].bookable = $scope.searchData.bookable;
                $scope.searchResults[i].timeSlotData.push({stattime: startHours +':'+startMinutes,endtime: endHours +':'+endMinutes,startDate:startTime,endDate:endTime,bookedSlotData:bookedSlotData,booked:booked,style:style});
                date = endTime;
              }              
            }
          }
          $scope.searchResults = $scope.searchResults;
          $scope.reservationData = $scope.reservationData;
          $scope.canShowRecords = 1;
        },500);
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Clear Search Filter */
    /**
      * @module : Search
      * @desc   : Clear Search Filter
      * @return : Return Default Search Result
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.clearSearchFilter = function () {
      $scope.searchData.hour = '';
      $scope.searchData.minute = '';
      $scope.searchData.startTime = $scope.rounded;
      $scope.searchData.date = new Date();
      $scope.searchData.officeLocation = $scope.searchData.defaultOfficeLocation;
      $scope.searchData.floor = '0';
      $scope.searchData.amenities = {};
      $scope.searchData.spaceType = '0';
      $scope.searchData.people = '0';
      $scope.searchData.bookable = '';
      $scope.getSearchResult($scope.searchData);
    }    

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Check to Open Event Popup  */
    /**
      * @module : Search
      * @desc   : Open Popup For Add Event
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.isOpenEventPopup = function (result,searchData,timeSlot) {
      var currentDate = new Date();
      if (timeSlot.booked != 'booked' && timeSlot.endDate >= currentDate) {
        $rootScope.addEventPopup(searchData.date,result,timeSlot.startDate,timeSlot.endDate,1,1,1,1);
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Close Dialog Box*/
    /**
    * @module : Conference
    * @desc   : Close Dialog Box
    * @return : 
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.closeDialog = function() {
      ngDialog.close('$escape');
      return false;
    }

    $rootScope.autoheight();
  })
}])