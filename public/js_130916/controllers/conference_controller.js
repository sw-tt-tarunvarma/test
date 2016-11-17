'use strict';

/* Rooms Controllers By Softweb Solutions  2015 - 2016 */

angular.module('myApp.controllers')
.controller('ConferenceController', ["$scope", "$state", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$stateParams","ngDialog","$filter","roundProgressService","$interval","socket", function($scope, $state, $location, $rootScope, $http, $timeout, getBaseUrl, $stateParams, ngDialog, $filter, roundProgressService, $interval, socket) {


  $scope.$on('$viewContentLoaded', function () {
    $scope.displaySchedule = false;
    $scope.displaySensors = false;
    $scope.displayDetail = true;
    $scope.displayAnalytics = false;
    $scope.displaySettings = false;
    $scope.displayAmenities = false;
    $scope.displayPresence = false;
    $rootScope.dataid = 1;
    $rootScope.baseurl = getBaseUrl.url();
    $rootScope.crUrl=$state.current.url;
    $rootScope.locationData = "";
    $rootScope.devicedata = {};
    $rootScope.getdevicedata=[];
    $scope.curdate = new Date();
    $scope.current = (5*60);
    $scope.max = (5*60);
    $scope.uploadCurrent = 0;
    $scope.stroke = 15;
    $scope.radius = 100;
    $scope.isSemi = false;
    $scope.rounded = true;
    $scope.clockwise = false;
    $scope.currentColor ='#45ccce';
    $scope.bgColor = '#eaeaea';
    $scope.iterations = 5;
    $scope.currentAnimation = 'easeOutCubic';
    $scope.countDown = 0; 
    $rootScope.autoheight();

    /**
    * @module : Conference
    * @desc   : Define add events variables, functions 
    * @return : -
    * @author : Softweb solutions - RP
    */
    $rootScope.room = {};
    var attendeerange = [];
    var hour = [];
    var minute = [];

    $rootScope.counter = 0;
    $rootScope.emailelement = [];
      $rootScope.change = function(item) {
        $rootScope.emailelement = [];
        $rootScope.counter = item;
        for(var e=0;e<$rootScope.counter;e++) {
          $rootScope.emailelement.push( {email : ''} );
        }
      };

    for(var i=1;i<=10;i++) {
      attendeerange.push(i);
    }
    $rootScope.attendees = attendeerange;

    for(var i=0;i<=23;i++) {
      hour.push(i);
    }
    $rootScope.hours = hour;
    
    //code edit by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for get int value
    $rootScope.minutes = [
      {
          val: parseInt("00"),
      },
      {
          val: parseInt("15"),
      },
      {
          val: parseInt("30"),
      },
      {
          val: parseInt("45"),
      },
    ];

    socket.on('locationStatusChange', function (data) {
      console.log(data);
      $timeout(function(){$rootScope.locationData[0].status = data.status},300);
      $http.get($scope.baseurl+"/location/getLocationUsers/"+$rootScope.locationData[0].id)
      .success(function(result, status, headers, config) {
        $timeout(function(){$rootScope.locationData[0].People = result.data},300);
      });
    });
    var stop;

    /**
    * @module : Conference
    * @desc   : Update location status
    * @return : send update location
    * @author : Softweb solutions
    */
    $scope.stopInterval = function()
    {
      $http.post($rootScope.baseurl+"/location/updatelocationstatus", {id: $scope.locationData[0].id, status: 0})
      .success(function(result, status, headers, config) {
        $scope.counterinit(300);
      });

      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
        $timeout(function(){$scope.locationData[0].status = 0},500);
      }
    }

    /**
    * @module : Conference
    * @desc   : Count 
    * @return : Return count
    * @author : Softweb solutions
    */
    $scope.countDownFunction = function(){
      $scope.current = $scope.max;
      stop = $interval(function(){
        if($scope.countDown == $scope.current)
        {
          $scope.stopInterval();
        }
        else
        {
          $scope.current--;
        }
      },1000,0);
    }

    /**
    * @module : Conference
    * @desc   :  
    * @return : 
    * @author : Softweb solutions
    */
    $scope.counterinit = function(currentvalue){
      $scope.current =  currentvalue;
      $scope.animations = [];
      angular.forEach(roundProgressService.animations, function(value, key){
        $scope.animations.push(key);
      });
    };

    /**
    * @module : Conference
    * @desc   : Get font size 
    * @return : Return font size
    * @author : Softweb solutions
    */
    $scope.getFontSize = function(){
      return $scope.radius/($scope.isSemi ? 3.5 : 3) + 'px';
    };

    /**
    * @module : Conference
    * @desc   : Update location status 
    * @return : Return location status
    * @author : Softweb solutions
    */
    $scope.calldips = function(){
      $http.post($rootScope.baseurl+"/location/updatelocationstatus", {id: $scope.locationData[0].id, status: 1})
      .success(function(result, status, headers, config) {
        $scope.counterinit(0);
        $scope.countDownFunction();
      }).error(function(data, status, headers, config) {
        
      });
    }
    
    /**
    * @module : Conference
    * @desc   : Get location
    * @return : Return location list
    * @author : Softweb solutions
    */
    $scope.getLocation = function(id)
    {
      //added by JJ < jeel.joshi@softwebsolutions.com > for local database location details
      //console.log($rootScope.dataid);
      if($rootScope.dataid == 1) {
        $http.get($rootScope.baseurl+"/location/locationDetail/"+id+"/"+$rootScope.dataid)
      .success(function(result, status, headers, config) {
        $scope.data = result.data;
        $timeout(function(){
          $rootScope.locationData = $scope.data;
          $scope.attribute = [];
          $scope.foundattr = [];

          //code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for set attendeerange same as room capacity
          if($rootScope.locationData[0].capacity) {
            var attendeerange = [];
            for(var i=1;i<=$rootScope.locationData[0].capacity;i++) {
              attendeerange.push(i);
            }
            $rootScope.attendees = attendeerange;
          }
            
         // $scope.attribute = $scope.data[0].amenities;

          //console.log("DATA"+$rootScope.locationData)

          $scope.events = [];
          angular.forEach($rootScope.locationData[0].Localdata, function(value, key){              
            var msec = Date.parse($rootScope.locationData[0].Localdata[key].time);
            var d = new Date(msec);
            var mytime = new Date($rootScope.locationData[0].Localdata[key].time);
            var newtime = mytime.toString();
             var _minutes = mytime.getMinutes();
             var _hours = mytime.getHours();
            // var displaytime = _minutes+":"+_hours;              
            var dateevent = _hours+":"+_minutes+" "+$rootScope.locationData[0].Localdata[key].purpose;
            var filterdateVar = mytime.getFullYear()+":"+mytime.getMonth()+":"+mytime.getDate()+":"+mytime.getHours()+":"+mytime.getMinutes();
            $scope.events.push({title: dateevent, date: new Date(mytime.getFullYear(), mytime.getMonth(), mytime.getDate(),mytime.getHours(),mytime.getMinutes(),mytime.getSeconds()), eventid:$rootScope.locationData[0].Localdata[key].id, attendees:$rootScope.locationData[0].Localdata[key].attendies, filterdate:filterdateVar});
            //console.log(hrs);
            
          });

          $rootScope.getdevicedata = $scope.locationData[0].Device;
          $rootScope.autoheight();
            //console.log($scope.data);
        },500);
      })
      .error(function(data, status, headers, config) {
       Notifier.error('Something went wrong. Please try again..');
     });
      } else {
        $http.get($rootScope.baseurl+"/location/locationDetail/"+id+"/"+$rootScope.dataid)
      .success(function(result, status, headers, config) {
        $scope.data = result.data;
        $timeout(function(){
          $rootScope.locationData = $scope.data;
          $scope.attribute = [];
          $scope.foundattr = [];
          $scope.attribute = $scope.data[0].amenities;

          console.log("DATA"+$rootScope.locationData);

          $scope.events = [];
          //console.log("HERE"+$rootScope.locationData[0].Outlook)
          angular.forEach($rootScope.locationData[0].Outlook, function(value, key){              
              var msec = Date.parse($rootScope.locationData[0].Outlook[key].starttime);
              var d = new Date(msec);
              var mytime = new Date($rootScope.locationData[0].Outlook[key].starttime);
              var dateevent = mytime.getHours()+":"+mytime.getMinutes()+" "+$rootScope.locationData[0].Outlook[key].purpose;
              var filterdateVar = mytime.getFullYear()+":"+mytime.getMonth()+":"+mytime.getDate()+":"+mytime.getHours()+":"+mytime.getMinutes();
              $scope.events.push({title: dateevent, date: new Date(mytime.getFullYear(), mytime.getMonth(), mytime.getDate(),mytime.getHours(),mytime.getMinutes(),mytime.getSeconds()), eventid:$rootScope.locationData[0].Outlook[key].eventid, attendees:$rootScope.locationData[0].Outlook[key].attendees, filterdate:filterdateVar});
            });

          var total_amenities = ["phone","tv","whiteboard","projector","polycom"];
          var totalattr = total_amenities.length;
          for(var i=0;i<totalattr;i++)
          {
            var foundval = $scope.attribute.toLowerCase().indexOf(total_amenities[i])
            if(foundval >= 0)
            {
              var imagename = "";
              if((total_amenities[i]=="phone") || (total_amenities[i]=="polycom"))
                imagename = "Phone.png";
              if(total_amenities[i]=="tv")
                imagename = "TV.png"
              if(total_amenities[i]=="whiteboard")
                imagename = "whiteBoard.png"
              if(total_amenities[i]=="projector")
                imagename = "projector.png"
              $scope.foundattr.push({"type":total_amenities[i],"imagename":imagename})  
            }
          }
          $rootScope.getdevicedata = $scope.locationData[0].Device;
          $rootScope.autoheight();
            //console.log($scope.locationData)
        },500);
      })
      .error(function(data, status, headers, config) {
       Notifier.error('Something went wrong. Please try again..');
     });
      }
    	
    }
        
    $scope.getLocation($stateParams.id);
    

    /**
    * @module : Conference
    * @desc   : Get location
    * @return : Return location list
    * @author : Softweb solutions
    */
    $rootScope.clickToOpen = function () 
    {
      $rootScope.devicedata = {};
      $rootScope.devicedata.locationid = $stateParams.id;
      $rootScope.editvalue = 0;
      
      ngDialog.open({ 
        template: 'partials/conference_room_tab4_popup.html',
        controller: 'ConferenceController',
        rootScope:$rootScope 
      });
    };

    /**
    * @module : Conference
    * @desc   : Open conference room popup with room detail for edit
    * @return : Return redirect on edit view
    * @author : Softweb solutions
    */
    $rootScope.clickToOpenedit = function (id) {
      var found = $filter('filter')($scope.locationData[0].Device, {id: id}, true);
      if (found.length) {
        $timeout(function(){
          $rootScope.devicedata = found[0];
          $rootScope.devicedata.locationid = $scope.locationData[0].id;
        }, 500)
      }
      else
      {
        $rootScope.devicedata = '';
      }
      $rootScope.editvalue = 1; 
      ngDialog.open({ 
        template: 'partials/conference_room_tab4_popup.html',
        controller: 'ConferenceController'              
      });
    };


    /**
    * @module : Conference
    * @desc   : Save device detail
    * @return : Return save response
    * @author : Softweb solutions
    */
    $rootScope.SaveDevice = function(){
      $scope.deviceaddurl = $rootScope.baseurl+"/device/adddevice";
      $http.post($scope.deviceaddurl, $rootScope.devicedata).success(function(data, status, headers, config) 
      {
        $rootScope.deviceMessage = data.message;
        var current = $state.current;
        var params = angular.copy($stateParams);
        ngDialog.close('$escape');
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });

      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }


    if($rootScope.deviceMessage != undefined)
    {
      Notifier.success($rootScope.deviceMessage);
      $rootScope.deviceMessage = undefined;
    }
    else
    {
      $rootScope.deviceMessage = undefined;
    }


    /**
    * @module : Conference
    * @desc   : Update device detail
    * @return : Return update response
    * @author : Softweb solutions
    */
    $rootScope.UpdateDevice = function (id)
    {
      $scope.deviceupdateurl = $rootScope.baseurl+"/device/updatedevicedata";
      $http.post($scope.deviceupdateurl, $rootScope.devicedata).success(function(data, status, headers, config) 
      {
        $rootScope.deviceMessage = data.message;
        var current = $state.current;
        var params = angular.copy($stateParams);
        ngDialog.close('$escape');
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });

      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    /**
    * @module : Conference
    * @desc   : Delete device detail
    * @return : Return delete response
    * @author : Softweb solutions
    */
    $rootScope.deletedevice = function (id)
    {
      var found = $filter('filter')($scope.locationData[0].Device, {id: id}, true)[0];
      var index = $scope.locationData[0].Device.indexOf(found);

      if (confirm("Are you sure!") == true) {
        $scope.devicedeleteurl = $rootScope.baseurl+"/device/deletedevicedata/"+id;
        $http.get($scope.devicedeleteurl).success(function(data, status, headers, config) 
        {
          $rootScope.deviceMessage = data.message;
          var current = $state.current;
          var params = angular.copy($stateParams);
          ngDialog.close('$escape');
          $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });

        }).error(function(data, status, headers, config) {
          return false;
        });
      } 
    }

    /**
    * @module : Conference
    * @desc   : Save events
    * @return : -
    * @author : Softweb solutions - RP
    */
    $rootScope.saveEvent = function() {
      $rootScope.room.locationid = $rootScope.locationData[0].id;
      $rootScope.room.locationname = $rootScope.locationData[0].name;
      $rootScope.room.peopleid = $rootScope.loggedInID;
      $rootScope.room.email = $scope.emailelement;

      //code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for already book validation
      var year = $rootScope.room.selcaldate.year;
      var month = $rootScope.room.selcaldate.month;
      var searchMonth = $rootScope.room.selcaldate.month + 1;
      var day = $rootScope.room.selcaldate.day;
      if (month.toString().length == 1) {
        month = "0"+month;
      }
      if (searchMonth.toString().length == 1) {
        searchMonth = "0"+searchMonth;
      }
      if (day.toString().length == 1) {
        day = "0"+day;
      }

      var searchDate = year+'-'+searchMonth+'-'+day;      
      var startDate = new Date(year,month,day,$rootScope.room.hours,$rootScope.room.minutes);
      var endDate = new Date(year,month,day,$rootScope.room.endhours,$rootScope.room.endminutes);
      var saveEventInDb = true;
      if (startDate >= endDate) {
        Notifier.error('Please select valid End date.');
        alert('Room already booked for this timeslot.');
      }
      else {
        var found = $filter('filter')($scope.locationData[0].Localdata, {'time':searchDate}); 
        if (found.length) {
          found.forEach(function(item) {
            if(saveEventInDb) {
              var dataStartDate = new Date(item.time);
              var dataEndDate = new Date(item.endtime);
              dataStartDate = new Date(year,month,day,dataStartDate.getUTCHours(),dataStartDate.getUTCMinutes(),dataStartDate.getUTCSeconds());
              dataEndDate = new Date(year,month,day,dataEndDate.getUTCHours(),dataEndDate.getUTCMinutes(),dataEndDate.getUTCSeconds());
              if(dataStartDate <= startDate && dataEndDate >= startDate) {
                saveEventInDb = false;
              }
              else if(dataStartDate >= startDate && dataStartDate <= endDate) {
                saveEventInDb = false;
              }
            }              
          });
        }

        if(!saveEventInDb) {
          Notifier.error('Room already booked for this timeslot.');
          alert('Room already booked for this timeslot.');
        }
        else {          
          //added by JJ < jeel.joshi@softwebsolutions.com > for local db
          $scope.eventurl = $rootScope.baseurl+"/location/addevent/"+$rootScope.dataid;
          $http.post($scope.eventurl, $rootScope.room).success(function(data, status, headers, config) 
          {
            //added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > reload current page
            $rootScope.deviceMessage = 'Room booked successfully.';
            var current = $state.current;
            var params = angular.copy($stateParams);
            ngDialog.close('$escape');
            $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
            /*Notifier.success('Room booked successfully');
            $timeout(function(){
              window.location.reload(true);
            },1000)  */
             console.log('add data------'+data);
          }).error(function(data, status, headers, config) {
                Notifier.error('Something went wrong. Please try again..');
          });
        }                  
      }      
    }

   /**
    * @module : Conference
    * @desc   : Update events
    * @return : -
    * @author : Softweb solutions - RP
    */

    $rootScope.updateEvent = function() {
      $rootScope.room.locationid = $rootScope.locationData[0].id;
      $rootScope.room.locationname = $rootScope.locationData[0].name;
      $rootScope.room.peopleid = $rootScope.loggedInID;
      $rootScope.room.email = $scope.emailelement;

      //code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for get selected value and already book validation
      $rootScope.room.selhours = parseInt($rootScope.room.hours);
      $rootScope.room.selminutes = parseInt($rootScope.room.minutes);
      $rootScope.room.selendhours = parseInt($rootScope.room.endhours);
      $rootScope.room.selendminutes = parseInt($rootScope.room.endminutes);

      var year = $rootScope.room.selcaldate[0].year;
      var month = $rootScope.room.selcaldate[0].month;
      var searchMonth = $rootScope.room.selcaldate[0].month + 1;
      var day = $rootScope.room.selcaldate[0].day;
      if (month.toString().length == 1) {
        month = "0"+month;
      }
      if (searchMonth.toString().length == 1) {
        searchMonth = "0"+searchMonth;
      }
      if (day.toString().length == 1) {
        day = "0"+day;
      }

      var searchDate = year+'-'+searchMonth+'-'+day;      
      var startDate = new Date(year,month,day,$rootScope.room.selhours,$rootScope.room.selminutes);
      var endDate = new Date(year,month,day,$rootScope.room.selendhours,$rootScope.room.selendminutes);
      var saveEventInDb = true;

      if (startDate >= endDate) {
        Notifier.error('Please select valid End date.');
        alert('Please select valid End date.');
      }
      else {
        var found = $filter('filter')($scope.locationData[0].Localdata, {'time':searchDate}); 
        if (found.length) {
          found.forEach(function(item) {
            if(saveEventInDb) {
              if($rootScope.room.id != item.id) {
                var dataStartDate = new Date(item.time);
                var dataEndDate = new Date(item.endtime);
                dataStartDate = new Date(year,month,day,dataStartDate.getUTCHours(),dataStartDate.getUTCMinutes(),dataStartDate.getUTCSeconds());
                dataEndDate = new Date(year,month,day,dataEndDate.getUTCHours(),dataEndDate.getUTCMinutes(),dataEndDate.getUTCSeconds());
                if(dataStartDate <= startDate && dataEndDate >= startDate) {
                  saveEventInDb = false;
                }
                else if(dataStartDate >= startDate && dataStartDate <= endDate) {
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
          //added by JJ < jeel.joshi@softwebsolutions.com > for local db
          $scope.eventurl = $rootScope.baseurl+"/location/updateevent/"+$rootScope.dataid;
          $http.post($scope.eventurl, $rootScope.room).success(function(data, status, headers, config) 
          {
            //added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > reload current page
            $rootScope.deviceMessage = 'Event edited successfully.';
            var current = $state.current;
            var params = angular.copy($stateParams);
            ngDialog.close('$escape');
            $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
          }).error(function(data, status, headers, config) {
                Notifier.error('Something went wrong. Please try again..');
          });
        }
      }
    }

  /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > save amenities*/
  /**
  * @module : Conference
  * @desc   : Save Amenities
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
  */
  $rootScope.saveAmenities = function() {      
    var selectedAmenities = $rootScope.locationData[0].selectedAmenities;
    var amenities = [];
    for (var ame in selectedAmenities) {
      if (selectedAmenities.hasOwnProperty(ame) && selectedAmenities[ame]) {
        amenities.push(selectedAmenities[ame]);
      }
    }

    //if (amenities.length) {
      $rootScope.locationData[0].amenities = amenities.join();      
      $scope.saveamenitiesurl = $rootScope.baseurl+"/location/addAmenitiesIntoLocation";
      $http.post($scope.saveamenitiesurl, $rootScope.locationData[0]).success(function(data, status, headers, config) {
        //Notifier.success('Amenities saved successfully.');
        $rootScope.deviceMessage = 'Amenities saved successfully.';
        var current = $state.current;
        var params = angular.copy($stateParams);
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    //}
  }

  /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for calender*/
  $rootScope.open = {
    start: false,
    starttime: false,
    endtime  : false,
  };

  /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for calender*/
  $rootScope.openCalendar = function(e, date) {
    $rootScope.open[date] = true;
  };

  /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Save Room Event*/
  /**
  * @module : Conference
  * @desc   : Save Room Event
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
  */
  $rootScope.saveRoomEvent = function() {
    var purpose = $rootScope.eventPopupData.purpose;
    if (purpose && purpose.trim()) {
      console.log($rootScope);      
      var startDateTime = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),$rootScope.eventPopupData.startDate.getHours(),$rootScope.eventPopupData.startDate.getMinutes());
      var endDateTime = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),$rootScope.eventPopupData.endDate.getHours(),$rootScope.eventPopupData.endDate.getMinutes());
      
      var month = $rootScope.eventPopupData.selectedDate.getMonth() + 1;
      if (month.toString().length == 1) {
        month = "0"+month;
      }
      var searchDate = $rootScope.eventPopupData.selectedDate.getFullYear()+'-'+month+'-'+$rootScope.eventPopupData.selectedDate.getDate();
      var saveEventInDb = true;
      
      if (startDateTime >= endDateTime) {
        Notifier.error('Please select valid End date.');
        alert('Please select valid End date.');
      }
      else {
        console.log('search');
        var found = $filter('filter')($scope.locationData[0].Localdata, {'time':searchDate}); 
        if (found.length) {
          found.forEach(function(item) {
            if($rootScope.eventPopupData.id != item.id) {              
              if(saveEventInDb) {
                var dataStartDate = new Date(item.time);
                var dataEndDate = new Date(item.endtime);
                dataStartDate = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),dataStartDate.getUTCHours(),dataStartDate.getUTCMinutes(),dataStartDate.getUTCSeconds());
                dataEndDate = new Date($rootScope.eventPopupData.selectedDate.getFullYear(),$rootScope.eventPopupData.selectedDate.getMonth(),$rootScope.eventPopupData.selectedDate.getDate(),dataEndDate.getUTCHours(),dataEndDate.getUTCMinutes(),dataEndDate.getUTCSeconds());
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
          postData['attendies'] = "[{'attendees':'dhaval@gmail.com'}]";
          postData['datastorevalue'] = 1;
          postData['detail'] = null;          
          postData['expired'] = null;
          postData['id'] = $rootScope.eventPopupData.id;
          postData['locationid'] = 31;
          postData['mark_as_private'] = 0;
          postData['peopleid'] = null;
          postData['purpose'] = null;
          postData['time'] = $rootScope.eventPopupData.selectedDate.getFullYear()+'-'+$rootScope.eventPopupData.selectedDate.getMonth()+'-'+$rootScope.eventPopupData.selectedDate.getDate()+'T'+$rootScope.eventPopupData.startDate.getHours()+':'+$rootScope.eventPopupData.startDate.getMinutes()+':00.000Z';
          postData['endtime'] = $rootScope.eventPopupData.selectedDate.getFullYear()+'-'+$rootScope.eventPopupData.selectedDate.getMonth()+'-'+$rootScope.eventPopupData.selectedDate.getDate()+'T'+$rootScope.eventPopupData.endDate.getHours()+':'+$rootScope.eventPopupData.endDate.getMinutes()+':00.000Z';
          postData['timestamp'] = null;
          if($rootScope.eventPopupData.detail) {
            postData['detail'] = $rootScope.eventPopupData.detail;
          }
          if($rootScope.eventPopupData.mark_as_private || $rootScope.eventPopupData.mark_as_private == 0) {
            postData['mark_as_private'] = $rootScope.eventPopupData.mark_as_private;
          }          
        }
      }
    }
    /*$rootScope.room.locationid = $rootScope.locationData[0].id;
    $rootScope.room.locationname = $rootScope.locationData[0].name;
    $rootScope.room.peopleid = $rootScope.loggedInID;
    $rootScope.room.email = $scope.emailelement;

    //code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for already book validation
    var year = $rootScope.room.selcaldate.year;
    var month = $rootScope.room.selcaldate.month;
    var searchMonth = $rootScope.room.selcaldate.month + 1;
    var day = $rootScope.room.selcaldate.day;
    if (month.toString().length == 1) {
      month = "0"+month;
    }
    if (searchMonth.toString().length == 1) {
      searchMonth = "0"+searchMonth;
    }
    if (day.toString().length == 1) {
      day = "0"+day;
    }

    var searchDate = year+'-'+searchMonth+'-'+day;      
    var startDate = new Date(year,month,day,$rootScope.room.hours,$rootScope.room.minutes);
    var endDate = new Date(year,month,day,$rootScope.room.endhours,$rootScope.room.endminutes);
    var saveEventInDb = true;
    if (startDate >= endDate) {
      Notifier.error('Please select valid End date.');
      alert('Room already booked for this timeslot.');
    }
    else {
      var found = $filter('filter')($scope.locationData[0].Localdata, {'time':searchDate}); 
      if (found.length) {
        found.forEach(function(item) {
          if(saveEventInDb) {
            var dataStartDate = new Date(item.time);
            var dataEndDate = new Date(item.endtime);
            dataStartDate = new Date(year,month,day,dataStartDate.getUTCHours(),dataStartDate.getUTCMinutes(),dataStartDate.getUTCSeconds());
            dataEndDate = new Date(year,month,day,dataEndDate.getUTCHours(),dataEndDate.getUTCMinutes(),dataEndDate.getUTCSeconds());
            if(dataStartDate <= startDate && dataEndDate >= startDate) {
              saveEventInDb = false;
            }
            else if(dataStartDate >= startDate && dataStartDate <= endDate) {
              saveEventInDb = false;
            }
          }              
        });
      }

      if(!saveEventInDb) {
        Notifier.error('Room already booked for this timeslot.');
        alert('Room already booked for this timeslot.');
      }
      else {          
        //added by JJ < jeel.joshi@softwebsolutions.com > for local db
        $scope.eventurl = $rootScope.baseurl+"/location/addevent/"+$rootScope.dataid;
        $http.post($scope.eventurl, $rootScope.room).success(function(data, status, headers, config) 
        {
          //added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > reload current page
          $rootScope.deviceMessage = 'Room booked successfully.';
          var current = $state.current;
          var params = angular.copy($stateParams);
          ngDialog.close('$escape');
          $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
           console.log('add data------'+data);
        }).error(function(data, status, headers, config) {
              Notifier.error('Something went wrong. Please try again..');
        });
      }                  
    }*/      
  }

  /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Close Dialog Box*/
  /**
  * @module : Conference
  * @desc   : Close Dialog Box
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
        var found = $filter('filter')($scope.locationData[0].Localdata, {'time':searchDate}); 
        if (found.length) {
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
          postData['locationid'] = $rootScope.locationData[0].id;
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

          $scope.getUserUrl = $rootScope.baseurl+"/people/getUserUsingGuid/"+localStorage.getItem("uc_guid");
          $http.get($scope.getUserUrl).success(function(result, status, headers, config) {
            if(result.data.length) {
              postData['peopleid'] = result.data[0].id;//localStorage.getItem("uc_guid");
            }
            else {
              postData['peopleid'] = 0;//localStorage.getItem("uc_guid");
            }            

            $scope.saveEventUrl = $rootScope.baseurl+"/location/saveEvent/"+1;
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

  /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Close Dialog Box*/
  /**
  * @module : Conference
  * @desc   : Close Dialog Box
  * @return : 
  * @author : Softweb solutions - Alpeshsinh Solanki
  */
  $rootScope.coloseDialog = function() {
    ngDialog.close('$escape');
    return false;
  }
});

  /**
  * @module : People management
  * @desc   : Get datepicker
  * @return : Return datepicker
  * @author : Softweb solutions
  */
  var that = this;

  var in10Days = new Date();
  in10Days.setDate(in10Days.getDate() + 10);

  $scope.dates = {
    start: new Date(),
    end: new Date()
  };

  $scope.open = {
    start: false,
    end  : false,
  };

  $scope.model = {
    startDate: new Date(),
    endDate: new Date()
  };

  // Disable today selection
  $scope.disabled = function(date, mode) {
    return (mode === 'day' && (new Date().toDateString() == date.toDateString()));
  };

  $scope.dateOptions = {
    showWeeks: false,
    startingDay: 1
  };

  $scope.timeOptions = {
    readonlyInput: false,
    showMeridian: false
  };

  $scope.dateModeOptions = {
    minMode: 'year',
    maxMode: 'year'
  };

  $scope.openCalendar = function(e, date) {
    this.open[date] = true;
    console.log(date);
  };

  /* Code for date picker management [4-5-2016] : Softweb*/


}])