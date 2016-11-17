'use strict';
/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Search Controller */
angular.module('myApp.controllers')
.controller('SearchController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$stateParams","socket", "$filter","ngDialog","$state", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl,$stateParams,socket, $filter, ngDialog, $state) {

  $scope.$on('$viewContentLoaded', function () 
  {
    $rootScope.displaySearchpeople = false;
    $rootScope.displaySearchSpace = true;
    $rootScope.autoheight();  
    $scope.baseurl = getBaseUrl.url();
    $rootScope.crUrl = $state.current.url;
    $rootScope.searchResults = [];
    $rootScope.reservationData = [];
    $rootScope.timeSlotData = [];
    $rootScope.searchData = {};
    $rootScope.mainLogo = {};
    $rootScope.searchData.duration = '30';
    $rootScope.searchData.officeLocation = 1;
    $rootScope.searchData.amenities = '0';
    $rootScope.searchData.spaceType = '0';
    $rootScope.searchData.people = '0';
    $rootScope.searchData.bookable = 'available';
    $rootScope.searchData.date = new Date();
    $rootScope.searchData.startTime = new Date();
    $rootScope.spaceTypeData = ['Breakout','Call Room','Classroom','Conference Room','Meeting Room','Office','Study Room','Break Room','Cafe','Cafeteria','Fitness Gym','Interview Room','Kitchen','Lab','Lactation Room','Lobby','Lounge','Other','Parking','Restroom','Female Restroom','Male Restroom','Studio','Theater','Utility Room','Work Area'];
    $rootScope.peopleData = [1,2,3,4,5,6,7,8,9,10];
    $rootScope.bookableData = [{value:'available',label:'Only Bookable'},{value:'not_available',label:'Not Bookable'}];

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for calender*/
    $rootScope.open = {
      date: false,
      startTime: false,
      endTime  : false,
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for calender*/
    $rootScope.openCalendar = function(e, date) {
      $rootScope.open[date] = true;
    };
    
     //added by JJ <jeel.joshi@softwebsolutions.com>
    $scope.addLogo = function(mainLogo)
    {
      var userid = localStorage.getItem("uc_guid");
      $scope.saveurl = $scope.baseurl+"/settings/addLogo";
      //console.log(mainLogo);return false;
      $http.post($scope.saveurl, {mainLogo: mainLogo, userid: userid}).success(function(data, status, headers, config)
      {
        Notifier.success('Logo uploaded successfully');
        //ngDialog.close('$escape');
        //$scope.getSettings();
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
          $rootScope.allOfficeLocations = $scope.allOfficeLocations;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

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
          $rootScope.allAmenities = $scope.allAmenities;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }
    
    $scope.getAllOfficeLocations();
    $scope.getAllAmenities();

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Search Result */
    /**
    * @module : Search
    * @desc   : Get Search Result
    * @return : Return Search Result
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getSearchResult = function(searchData) {
      console.log(searchData);
      var postData = {};
      postData.startTime = new Date(searchData.date.getFullYear(),searchData.date.getMonth(),searchData.date.getDate(),searchData.startTime.getHours(),searchData.startTime.getMinutes());
      postData.endTime = new Date(postData.startTime.getTime() + parseInt(searchData.duration)*60000);
      
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
      postData.people = parseInt(0);
      postData.spaceType = '';
      postData.amenities = '';
      postData.bookable = 'available';

      if (searchData.officeLocation && parseInt(searchData.officeLocation)) {
        postData.officeId = parseInt(searchData.officeLocation);
      }

      if (searchData.people && parseInt(searchData.people)) {
        postData.people = parseInt(searchData.people);
      }

      if (searchData.spaceType && searchData.spaceType.trim() && searchData.spaceType != 0) {
        postData.spaceType = searchData.spaceType.trim();
      }

      if (searchData.amenities && searchData.amenities.trim() && searchData.amenities != 0) {
        postData.amenities = searchData.amenities.trim();
      }

      if (searchData.bookable && searchData.bookable.trim()) {
        postData.bookable = searchData.bookable.trim();
      }

      console.log(postData);
      $scope.getSearchResultUrl = $scope.baseurl+"/search/getSearchResults";
      $http.post($scope.getSearchResultUrl, postData)
      .success(function(result, status, headers, config) {
        console.log(result);
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

              $scope.searchResults[i].timeSlotData = [];
              var currentDate = new Date();
              var date = new Date($rootScope.searchData.date.getFullYear(),$rootScope.searchData.date.getMonth(),$rootScope.searchData.date.getDate(),$rootScope.searchData.startTime.getHours(),$rootScope.searchData.startTime.getMinutes());

              for (var j =0; j < 3; j++) {
                var startTime = date;
                var endTime = new Date(startTime.getTime() + parseInt($rootScope.searchData.duration)*60000);
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
                          console.log(found[k].locationid + 'startTime ' + startTime);
                          console.log(found[k].locationid + 'dataStartDate' + dataStartDate);
                          console.log(found[k].locationid + 'dataEndDate' + dataEndDate);
                          console.log(found[k].locationid + 'endTime' + endTime);
                          console.log('-------');
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
                        }                      
                      }
                    }
                      
                }

                $scope.searchResults[i].bookable = $rootScope.searchData.bookable;
                $scope.searchResults[i].timeSlotData.push({stattime: startHours +':'+startMinutes,endtime: endHours +':'+endMinutes,startDate:startTime,endDate:endTime,bookedSlotData:bookedSlotData,booked:booked,style:style});
                date = endTime;
              }

              /*if ($scope.searchResults[i].timeSlotData.length) {
                for (var j = 0; j < $scope.searchResults[i].timeSlotData.length; j++) {
                  if ($scope.searchResults[i].timeSlotData[j].bookedSlotData.length) {
                    var found = $filter('filter')($scope.searchResults[i].timeSlotData[j].bookedSlotData, {'locationid':$scope.searchResults[i].id},true); 
                    if (found.length) {
                      //console.log('found');
                      //console.log(found);
                      $scope.searchResults[i].timeSlotData[j].class = 'booked';
                      $scope.searchResults[i].timeSlotData[j].style = "background: #929faa;color: #ffffff;";
                    }
                  }                  
                }
              }*/
            }
          }
          console.log($scope.searchResults);
          $rootScope.searchResults = $scope.searchResults;
          $rootScope.reservationData = $scope.reservationData;
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
    $rootScope.clearSearchFilter = function () {
      $rootScope.searchData.duration = '30';
      $rootScope.searchData.officeLocation = 1;
      $rootScope.searchData.amenities = '0';
      $rootScope.searchData.spaceType = '0';
      $rootScope.searchData.people = '0';
      $rootScope.searchData.bookable = 'available';
      $scope.getSearchResult($rootScope.searchData);
    }    

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get All Space Data
      * @return : Space Data
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getAllSpaceData = function() {
      $http.get($scope.baseurl+"/location/getLocations/")
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

    $scope.getAllSpaceData();

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Check to Open Event Popup  */
    /**
      * @module : Search
      * @desc   : Open Popup For Add Event
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.isOpenEventPopup = function (result,searchData,timeSlot) {
      if (timeSlot.booked != 'booked') {
        $scope.addEventPopup(result.id,searchData.date,timeSlot.startDate,timeSlot.endDate);
      }      
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Add Event */
    /**
      * @module : Search
      * @desc   : Open Popup For Add Event
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addEventPopup = function (locationid,date,startDate,endDate) {
      if (!locationid || !date) { 
        return; 
      }
      $rootScope.date = date;
      $rootScope.dataid = 1;
      $rootScope.eventPopupData = new Object();
      $rootScope.eventPopupData.selectedDate = $rootScope.date;
      $rootScope.eventPopupData.startDate = startDate ? startDate :new Date();
      $rootScope.eventPopupData.endDate = endDate ? endDate : new Date();
      $rootScope.eventPopupData.id = 0;
      $rootScope.eventPopupData.attendData = [];
      $rootScope.eventPopupData.editEventValue = 0;
      $rootScope.eventPopupData.locationid = locationid;
      $rootScope.eventPopupData.spaceCapacity = parseInt(0);

      var found = $filter('filter')($scope.allSpaceData, {'id':locationid});
      if (found.length) {
        if (found[0].id == locationid) {
          $rootScope.eventPopupData.spaceCapacity = parseInt(found[0].capacity);
        }
      }

      ngDialog.open({ 
        template: 'partials/event_popup.html',
        controller: 'ConferenceController',
        scope:$rootScope
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Set Space Capacity  */
    /**
      * @module : Search
      * @desc   : Set Space Capacity
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.setSpaceCapacity = function (spaceId) {
      if (!parseInt(spaceId) || !$scope.allSpaceData || !$scope.allSpaceData.length) {
        return;
      }

      var found = $filter('filter')($scope.allSpaceData, {'id':spaceId});
      if (found.length) {
        if (found[0].id == spaceId) {
          $rootScope.eventPopupData.spaceCapacity = parseInt(found[0].capacity);
        }
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add Admin into attendies */
    /**
      * @module : Search
      * @desc   : Add Admin into attendies
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.addAdminToAttendies = function (includeMe) {
      var attendies = [];
      if ($rootScope.eventPopupData.attendData && $rootScope.eventPopupData.attendData.length) {
        for(var i = 0; i < $rootScope.eventPopupData.attendData.length; i++) {
          if ($rootScope.eventPopupData.attendData[i].email != localStorage.getItem("au_email")) {
            attendies.push({"email" : $rootScope.eventPopupData.attendData[i].email});
          }              
        }
      }

      if (includeMe == 1) {
        attendies.push({"email" : localStorage.getItem("au_email")});
      }
      $rootScope.eventPopupData.attendData = attendies;
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Save Room Event */
    /**
    * @module : Search
    * @desc   : Save Room Event
    * @return : -
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.saveRoomEvent = function() {
      var purpose = $rootScope.eventPopupData.purpose;
      if (purpose && purpose.trim()) {
        var startDateTime = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),$rootScope.eventPopupData.startDate.getHours(),$rootScope.eventPopupData.startDate.getMinutes());
        var endDateTime = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),$rootScope.eventPopupData.endDate.getHours(),$rootScope.eventPopupData.endDate.getMinutes());
        
        var month = $rootScope.eventPopupData.selectedDate.getMonth() + 1;
        if (month.toString().length == 1) {
          month = "0"+month;
        }

        var day = $rootScope.eventPopupData.selectedDate.getDate();
        if (day.toString().length == 1) {
          day = "0"+day;
        }
        var searchDate = $rootScope.eventPopupData.selectedDate.getFullYear()+'-'+month+'-'+day;
        var saveEventInDb = true;
        
        if (startDateTime >= endDateTime) {
          Notifier.error('Please select valid End date.');
          alert('Please select valid End date.');
        }
        else if ($rootScope.eventPopupData.attendData.length > $rootScope.eventPopupData.spaceCapacity) {
          Notifier.error('Space Capacity is '+$rootScope.eventPopupData.spaceCapacity+'. So Please invite '+$rootScope.eventPopupData.spaceCapacity+' member.');
          alert('Space Capacity is '+$rootScope.eventPopupData.spaceCapacity+'. So Please invite '+$rootScope.eventPopupData.spaceCapacity+' member.');
        }
        else {
          var found = $filter('filter')($rootScope.reservationData, {'time':searchDate,'locationid':$rootScope.eventPopupData.locationid}); 
          if (found.length) {
            console.log(found);
            found.forEach(function(item) {
              if($rootScope.eventPopupData.id != item.id) {
                if(saveEventInDb) {
                  var dataStartDate = new Date(item.time);
                  var dataEndDate = new Date(item.endtime);
                  dataStartDate = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),dataStartDate.getHours(),dataStartDate.getMinutes(),dataStartDate.getSeconds());
                  dataEndDate = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),dataEndDate.getHours(),dataEndDate.getMinutes(),dataEndDate.getSeconds());
                  if(dataStartDate <= startDateTime && dataEndDate >= startDateTime) {
                    saveEventInDb = false;
                  }
                  else if(dataStartDate >= startDateTime && dataStartDate <= endDateTime) {
                    saveEventInDb = false;
                  }
                }
              }                          
            });
          }

          if(!saveEventInDb) {
            Notifier.error('Room already booked for this timeslot.');
            alert('Room already booked for this timeslot.');
          }
          else {
            var postData = {};
            postData['attendies'] = [];
            postData['datastorevalue'] = 1;
            postData['detail'] = '';          
            postData['id'] = $rootScope.eventPopupData.id;
            postData['locationid'] = $rootScope.eventPopupData.locationid;
            postData['mark_as_private'] = 0;          
            postData['purpose'] = purpose.trim();
            postData['time'] =  new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),$rootScope.eventPopupData.startDate.getHours(),$rootScope.eventPopupData.startDate.getMinutes()).toISOString();
            postData['endtime'] = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),$rootScope.eventPopupData.endDate.getHours(),$rootScope.eventPopupData.endDate.getMinutes()).toISOString();

            if($rootScope.eventPopupData.detail) {
              postData['detail'] = $rootScope.eventPopupData.detail;
            }

            if($rootScope.eventPopupData.mark_as_private || $rootScope.eventPopupData.mark_as_private == 0) {
              postData['mark_as_private'] = $rootScope.eventPopupData.mark_as_private;
            }

            if ($rootScope.eventPopupData.attendData && $rootScope.eventPopupData.attendData.length) {
              for(var i = 0; i < $rootScope.eventPopupData.attendData.length; i++) {
                if ($rootScope.eventPopupData.attendData[i].email != localStorage.getItem("au_email")) {
                  postData.attendies.push({"attendees" : $rootScope.eventPopupData.attendData[i].email});
                }              
              }
            }

            if ($rootScope.eventPopupData.includeMe && $rootScope.eventPopupData.includeMe == 1) {
              postData.attendies.push({"attendees" : localStorage.getItem("au_email")});
            }

            $scope.getUserUrl = $scope.baseurl+"/people/getUserUsingGuid/"+localStorage.getItem("uc_guid");
            $http.get($scope.getUserUrl).success(function(result, status, headers, config) {
              if(result.data.length) {
                postData['peopleid'] = result.data[0].id;//localStorage.getItem("uc_guid");
              }
              else {
                postData['peopleid'] = 0;//localStorage.getItem("uc_guid");
              }            

              $scope.saveEventUrl = $scope.baseurl+"/location/saveEvent/"+1;
              $http.post($scope.saveEventUrl, postData).success(function(data, status, headers, config) {
                $rootScope.deviceMessage = 'Room booked successfully.';
                var current = $state.current;
                var params = angular.copy($stateParams);
                ngDialog.close('$escape');
                $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
              }).error(function(data, status, headers, config) {
                Notifier.error('Something went wrong. Please try again..');
              });
            }).error(function(data, status, headers, config) {
              Notifier.error('Something went wrong. Please try again..');
            });            
          }
        }
      }    
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > add New Email into attend data */
    /**
      * @module : Search
      * @desc   : add New Email into attend data
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.addEmailIntoData = function (email) {
      if (!email) { 
        return; 
      }

      $rootScope.eventPopupData.attendData.push({email : email});
      $rootScope.eventPopupData.attend = '';
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > add New Email into attend data When Press Enter */
    /**
      * @module : Search
      * @desc   : add New Email into attend data When Press Enter
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.addEmailIntoDataWhenEnter = function (event,email) {
      if (email && event.keyCode == 13) { 
        $rootScope.eventPopupData.attendData.push({email : email});
        $rootScope.eventPopupData.attend = '';
      }
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Remove Email From attend data */
    /**
      * @module : Search
      * @desc   : Remove Email From attend data
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.removeEmailIntoData = function (email) {
      if (!email) { 
        return; 
      }
      var attendData = [];
      if ($rootScope.eventPopupData.attendData && $rootScope.eventPopupData.attendData.length) {
        for(var i = 0; i < $rootScope.eventPopupData.attendData.length; i++) {            
          if(email != $rootScope.eventPopupData.attendData[i].email) {
            attendData.push({email : $rootScope.eventPopupData.attendData[i].email});
          }
        }
      }

      $rootScope.eventPopupData.attendData = attendData;
      $rootScope.eventPopupData.attend = '';
    }

    $rootScope.autoheight();
  })
}])