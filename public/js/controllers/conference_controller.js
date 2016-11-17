'use strict';

/* Rooms Controllers By Softweb Solutions  2015 - 2016 */
/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Conference Controller */

angular.module('myApp.controllers')
.controller('ConferenceController', ["$scope", "$state", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","$stateParams","ngDialog","$filter","roundProgressService","$interval","socket", "generalService","$compile", function($scope, $state, $location, $rootScope, $http, $timeout, getBaseUrl, $stateParams, ngDialog, $filter, roundProgressService, $interval, socket, generalService,$compile) {

  $rootScope.activeStateParam = $state.current.name;


  $scope.$on('$viewContentLoaded', function () {

    $rootScope.currentDate = new Date();
    $rootScope.displayDetailTab = false;
    $rootScope.displayScheduleTab = true;
    $rootScope.displayAnalyticsTab = false;
    $rootScope.displayPresenceTab = false;
    $rootScope.spaceDetailData = {};
    $rootScope.spaceEventsData = {};
    $rootScope.spaceDeviceData = {};
    $rootScope.spaceSearchData = {};
    $rootScope.spaceSearchData.duration = '15';
    $rootScope.spaceSearchData.date = new Date();
    var coeff = 1000 * 60 * 5;
    var rounded = new Date(Math.round($rootScope.spaceSearchData.date.setMinutes( $rootScope.spaceSearchData.date.getMinutes() + 2.5 ) / coeff) * coeff);
    $rootScope.spaceSearchData.startTime = rounded;
    $rootScope.spaceSearchData.timeSlots = [];
    $rootScope.spaceSearchData.hour = '';
    $rootScope.spaceSearchData.minute = '';
    $rootScope.spaceSearchData.defaultMinute = parseInt(15);
    $rootScope.spaceSearchData.hoursData = [];
    $rootScope.spaceSearchData.minuteData = [parseInt(0),parseInt(15),parseInt(30),parseInt(45)];
    for (var i = 0; i < 10; i++) {
      $rootScope.spaceSearchData.hoursData.push({label:parseInt(i),value:parseInt(60*i)});
    }

    $rootScope.dataid = 1;
    $scope.baseurl = getBaseUrl.url();
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
    $scope.calendarOptions = {
     //minDate: new Date()
     };

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
      console.log($rootScope.spaceDetailData);
      $timeout(function(){$rootScope.spaceDetailData.status = data.status},300);
      $http.get($scope.baseurl+"/location/getLocationUsers/"+$rootScope.spaceDetailData.id)
      .success(function(result, status, headers, config) {
        //$timeout(function(){$rootScope.locationData[0].People = result.data},300);
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


    /*code added by JJ <jeel.joshi@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Conference
      * @desc   : Get All Device Data
      * @return : Device Data
      * @author : Softweb solutions
    */
    $scope.getAllDeviceData = function() {
      $http.get($scope.baseurl+"/device/getDevices/")
      .success(function(result, status, headers, config) {
        $scope.allDeviceData = result.data;        
        $timeout(function(){
          $rootScope.allDeviceData = result.data;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    $scope.getAllDeviceData();

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

          $scope.events = [];
          
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
        },500);
      })
      .error(function(data, status, headers, config) {
       Notifier.error('Something went wrong. Please try again..');
     });
      }
    	
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Space Details */
    /**
    * @module : Conference
    * @desc   : Get Space Details
    * @return : Return Space Details
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getSpaceDetails = function(id) {
      $http.get($rootScope.baseurl+"/location/spaceDetails/"+id+"/"+localStorage.getItem("uc_guid")+"/"+$rootScope.dataid)
      .success(function(result, status, headers, config) {
        if (result.spaceData && result.spaceData.length > 0) {
          $scope.spaceDetailData = result.spaceData[0];
          $scope.spaceEventsData = result.spaceEvents;
          $scope.spaceDeviceData = result.spaceDevices;

          $scope.events = [];
          var colors = ['event-green','event-red','event-orange','event-coral',' '];
          if ($scope.spaceEventsData.length > 0) {
            angular.forEach($scope.spaceEventsData, function(value, key){
              var eventTime = new Date($scope.spaceEventsData[key].time);
              var eventEndTime = new Date($scope.spaceEventsData[key].endtime);
              var hours = eventTime.getHours();
              var minutes = eventTime.getMinutes();

              if (hours.toString().length == 1) {
                hours = "0"+hours;
              }
              
              if (minutes.toString().length == 1) {
                minutes = "0"+minutes;
              }
              var eventTitle = $scope.spaceEventsData[key].purpose;

              var className = colors[Math.floor(Math.random() * (colors.length - 0 + 1)) + 0];
              $scope.events.push({title: eventTitle, date: eventTime, start: eventTime, end: eventEndTime, eventid:$scope.spaceEventsData[key].id, id:$scope.spaceEventsData[key].id,mainEvent:$scope.spaceEventsData[key], className:className});
            });
          }
            

          $timeout(function(){
            $rootScope.spaceDetailData = $scope.spaceDetailData;
            $rootScope.spaceEventsData = $scope.spaceEventsData;
            $rootScope.spaceDeviceData = $scope.spaceDeviceData;
            $rootScope.autoheight();
            $scope.getSearchResult($rootScope.spaceSearchData);
          },500);
        }          
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
     });
    }
        
    $scope.getSpaceDetails($stateParams.id);

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > For Space Detail Search Calender*/
    $rootScope.openSpaceSearchCalendar = {
      date: false,
      startTime: false,
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > For Space Detail Search Calender */
    $rootScope.openSpaceCalendar = function(e, date) {
      $rootScope.openSpaceSearchCalendar[date] = true;
    };
    

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
      var found = $filter('filter')($rootScope.spaceDeviceData, {id: id}, true);
      if (found.length) {
        $timeout(function(){
          $rootScope.devicedata = found[0];
          $rootScope.devicedata.locationid = $rootScope.spaceDetailData.id;
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

    /*code added by JJ <jeel.joshi@softwebsolutions.com > Close Dialog Box */
    /**
      * @module : Setting
      * @desc   : Close Dialog Box
      * @return : -
      * @author : Softweb solutions
    */
    $rootScope.closeDialog = function() {
      ngDialog.close('$escape');
      return false;
    }

    /**
    * @module : Conference
    * @desc   : Save device detail
    * @return : Return save response
    * @author : Softweb solutions
    */
    $rootScope.saveDevice = function(){
      console.log($rootScope.devicedata);
      $scope.deviceaddurl = $rootScope.baseurl+"/device/adddevice";
      $http.post($scope.deviceaddurl, $rootScope.devicedata).success(function(data, status, headers, config) 
      {
        $rootScope.deviceMessage = data.message;
        var current = $state.current;
        var params = angular.copy($stateParams);
        ngDialog.close('$escape');
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
        if(data.errmessage){
          Notifier.error(data.errmessage);  
        } else {
          Notifier.success(data.message);
        }
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
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
     ngDialog.openConfirm({
            template:
              '<div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="myModal" class="modal box-typical fade in" style="display: block;"><div class="modal-dialog box-typical-dashboard" role="document"><div class="modal-content"> <header class="box-typical-header modal-header"><div class="tbl-row"><div class="tbl-cell tbl-cell-title"><h3>Are you sure you want to delete this device?</h3></div><div class="tbl-cell tbl-cell-actions"><button type="button" ng-click="closeThisDialog(0);" class="action-btn" data-dismiss="modal" aria-label="Close"><i class="font-icon font-icon-close ngdialog-close"></i></button></div></header><div class="modal-body"><div class="modal-footer" style="padding:0px;text-align:left;"><div class="row"><div class="col-md-5"><button type="button" class="btn btn-primary" ng-click="closeThisDialog(0)">No&nbsp;</button><button type="button" class="btn btn-primary" ng-click="confirm('+id+')">Yes</button></div></div></div> </div></div></div></div>' ,
              plain: true,
              closeByDocument: true,
              closeByEscape: true,
            className: 'ngdialog-theme-default'
        }).then(function (id) {
         var found = $filter('filter')($scope.allDeviceData, {id: id}, true)[0];
         var index = $scope.allDeviceData.indexOf(found);

       
            $scope.devicedeleteurl = $scope.baseurl+"/device/deletedevicedata/"+id;
            $http.get($scope.devicedeleteurl).success(function(data, status, headers, config) 
            {
              $rootScope.deviceMessage = data.message;
               var current = $state.current;
               var params = angular.copy($stateParams);
               $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
              Notifier.success('Device deleted successfully.');

            }).error(function(data, status, headers, config) {
              return false;
            });
          
        }, function (value) {
           
        });  
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
        Notifier.error('Please select valid End Time.');
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
          $scope.eventurl = $rootScope.baseurl+"/location/addevent/"+$rootScope.dataid;
          $http.post($scope.eventurl, $rootScope.room).success(function(data, status, headers, config) 
          {
            $rootScope.deviceMessage = 'Room booked successfully.';
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
        Notifier.error('Please select valid End Time.');
        alert('Please select valid End Time.');
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
          $scope.eventurl = $rootScope.baseurl+"/location/updateevent/"+$rootScope.dataid;
          $http.post($scope.eventurl, $rootScope.room).success(function(data, status, headers, config) 
          {
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

        $rootScope.locationData[0].amenities = amenities.join();      
        $scope.saveamenitiesurl = $rootScope.baseurl+"/location/addAmenitiesIntoLocation";
        $http.post($scope.saveamenitiesurl, $rootScope.locationData[0]).success(function(data, status, headers, config) {
          $rootScope.deviceMessage = 'Amenities saved successfully.';
          var current = $state.current;
          var params = angular.copy($stateParams);
          $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
        }).error(function(data, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });      
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

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All Event Of Space */
    /**
    * @module : Conference
    * @desc   : Get All Event Of Space
    * @return : Return All Events
    * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getAllEventsOfSpace = function(spaceId,searchData) {
      $http.get($rootScope.baseurl+"/location/getAllEventsOfSpace/"+spaceId+"/"+$rootScope.dataid)
      .success(function(result, status, headers, config) {
        if (result.data.length > 0) {
          $scope.spaceEventsData = result.data;
          $rootScope.spaceEventsData = $scope.spaceEventsData;
          $scope.events = [];
          var colors = ['event-green','event-red','event-orange','event-coral',' '];
          angular.forEach($scope.spaceEventsData, function(value, key){
            var eventTime = new Date($scope.spaceEventsData[key].time);
            var eventEndTime = new Date($scope.spaceEventsData[key].endtime);
            var hours = eventTime.getHours();
            var minutes = eventTime.getMinutes();

            if (hours.toString().length == 1) {
              hours = "0"+hours;
            }
            
            if (minutes.toString().length == 1) {
              minutes = "0"+minutes;
            }
            var eventTitle = hours+":"+minutes+" "+$scope.spaceEventsData[key].purpose;

            var className = colors[Math.floor(Math.random() * (colors.length - 0 + 1)) + 0];
            $scope.events.push({title: eventTitle, date: eventTime, start: eventTime, end: eventEndTime, eventid:$scope.spaceEventsData[key].id, id:$scope.spaceEventsData[key].id,mainEvent:$scope.spaceEventsData[key], className:className});
          });
        }
        $scope.getSearchResult(searchData);
      })
      .error(function(result, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });

    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Search Result */
    /**
    * @module : Conference
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
      postData.endTime = new Date(postData.startTime.getTime() + parseInt(searchData.duration)*60000);
      postData.lastTime = new Date(searchData.date.getFullYear(),searchData.date.getMonth(),searchData.date.getDate(),23,59,59);

      var startMonth = postData.startTime.getUTCMonth() + 1;
      if (startMonth.toString().length == 1) {
        startMonth = "0"+startMonth;
      }

      var startDay = postData.startTime.getUTCDate();
      if (startDay.toString().length == 1) {
        startDay = "0"+startDay;
      }    

      var endMonth = postData.endTime.getUTCMonth() + 1;
      if (endMonth.toString().length == 1) {
        endMonth = "0"+endMonth;
      }

      var endDay = postData.endTime.getUTCDate();
      if (endDay.toString().length == 1) {
        endDay = "0"+endDay;
      }

      postData.startDate = postData.startTime.getUTCFullYear()+'-'+startMonth+'-'+startDay;
      postData.endDate = postData.startTime.getUTCFullYear()+'-'+endMonth+'-'+endDay;

      var searchDayResults = [];
      if ($scope.spaceEventsData.length) {
        var found = $filter('filter')($scope.spaceEventsData, {'time':postData.startDate});
        if (found.length > 0) {
          if (postData.startDate == postData.endDate) {
            searchDayResults= found;
          }
          else {
            for (var i = 0; i < found.length; i++) {
              searchDayResults.push(found[i]);
            }
          }
            
        }

        if (postData.startDate != postData.endDate) {
          var foundEnd = $filter('filter')($scope.spaceEventsData, {'endtime':postData.endDate});
          if (foundEnd.length > 0) {
            for (var i = 0; i < foundEnd.length; i++) {
              searchDayResults.push(foundEnd[i]);
            }
          }
        }
      }
      
      $rootScope.spaceSearchData.timeSlots = [];
      while (postData.startTime < postData.lastTime) {
        var startTime = postData.startTime;
        var startTime = generalService.getRoundedTime(startTime);
        var endTime = new Date(startTime.getTime() + parseInt(duration)*60000);

        if (endTime <= postData.lastTime) {
          var startHours = startTime.getHours();
          var startMinutes = startTime.getMinutes();
          var startAmPm = startHours >= 12 ? 'PM' : 'AM';
          
          if (startHours.toString().length == 1) {
            startHours = "0"+startHours;
          }

          if (startMinutes.toString().length == 1) {
            startMinutes = "0"+startMinutes;
          }

          var endHours = endTime.getHours();
          var endMinutes = endTime.getMinutes();
          var endAmPm = endHours >= 12 ? 'PM' : 'AM';
          
          if (endHours.toString().length == 1) {
            endHours = "0"+endHours;
          }

          if (endMinutes.toString().length == 1) {
            endMinutes = "0"+endMinutes;
          }

          var bookedSlotData = [];
          var booked = '';
          var style = '';
          if (searchDayResults.length > 0) {
            for (var k = 0; k < searchDayResults.length; k++) {
              var dataStartDate = new Date(searchDayResults[k].time);
              var dataEndDate = new Date(searchDayResults[k].endtime);
              
              if(dataStartDate <= startTime && dataEndDate > startTime) {
                bookedSlotData.push(searchDayResults[k]);
                booked = 'booked';
                style = "background: #929faa;color: #ffffff;";
              }
              else if(dataStartDate < endTime && dataEndDate > endTime) {
                bookedSlotData.push(searchDayResults[k]);
                booked = 'booked';
                style = "background: #929faa;color: #ffffff;";
              }
              else if(startTime <= dataStartDate && endTime > dataStartDate) {
                bookedSlotData.push(searchDayResults[k]);
                booked = 'booked';
                style = "background: #929faa;color: #ffffff;";
              }
              else if(startTime < dataEndDate && endTime > dataEndDate) {
                bookedSlotData.push(searchDayResults[k]);
                booked = 'booked';
                style = "background: #929faa;color: #ffffff;";                
              }              
            }
          }

          $rootScope.spaceSearchData.timeSlots.push({stattime: startHours +':'+startMinutes,endtime: endHours +':'+endMinutes,startDate:startTime,endDate:endTime,bookedSlotData:bookedSlotData,booked:booked,style:style});
          postData.startTime = endTime;
        }
        else {
          postData.startTime = postData.lastTime;
        }
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Check to Open Event Popup  */
    /**
      * @module : Conference
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

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Edit Event */
    /**
      * @module : Conference
      * @desc   : Open Popup For Edit Event
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.editEventPopup = function (eventid) {
      if (!parseInt(eventid)) { 
        return; 
      }

      var found = $filter('filter')($rootScope.spaceEventsData, {id: eventid}, true);
      if (found.length) {
        $rootScope.eventPopupData = found[0];
        $rootScope.eventPopupData.selectedDate = new Date(found[0].time);
        $rootScope.eventPopupData.attendData = [];
        $rootScope.eventPopupData.editEventValue = 1;
        $rootScope.eventPopupData.locationid = found[0].locationid;
        $rootScope.eventPopupData.spaceCapacity = parseInt($rootScope.spaceDetailData.capacity);
        $rootScope.eventPopupData.currentDate = new Date();
        $rootScope.eventPopupData.calDate = new Date($rootScope.date);
        $rootScope.eventPopupData.btndisabled = 'true';
        $rootScope.eventPopupData.disableSpace = 1;
        $rootScope.eventPopupData.disableDate = 1;
        $rootScope.eventPopupData.disableStarttime = 1;
        $rootScope.eventPopupData.disableEndtime = 1;
        $rootScope.eventPopupData.disabledPastTime = 1;
        $rootScope.eventPopupData.spaceName = $rootScope.spaceDetailData.name;
        $rootScope.eventPopupData.locationName = $rootScope.spaceDetailData.officeLocationName;

        var startDate = new Date(found[0].time);
        var endDate = new Date(found[0].endtime);
        $rootScope.eventPopupData.startDate = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate(),startDate.getHours(),startDate.getMinutes());
        $rootScope.eventPopupData.endDate = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate(),endDate.getHours(),endDate.getMinutes());
        try {
          found[0].attendies = JSON.parse(found[0].attendies);
          if (found[0].attendies && found[0].attendies.length) {
            for(var i = 0; i < found[0].attendies.length; i++) {
              $rootScope.eventPopupData.attendData.push({email : found[0].attendies[i].attendees});
              if(localStorage.getItem("au_email") == found[0].attendies[i].attendees) {
                $rootScope.eventPopupData.includeMe = 1;
              }
            }
          }
        }
        catch (e) { }

        ngDialog.open({ 
          template: 'partials/event_popup.html',
          controller: 'AppController',
          scope:$rootScope
        });
      }
      else {
        Notifier.error('Something went wrong. Please try again..');
      }        
    };
  });  

  $scope.openJqueryCalendar = function(e) {
    $('#calendar').fullCalendar({
      header: {
        left: '',
        center: 'prev, title, next',
        right: 'agendaDay,agendaTwoDay,agendaWeek,month'
      },      
      buttonIcons: {
        prev: 'font-icon font-icon-arrow-left',
        next: 'font-icon font-icon-arrow-right',
        prevYear: 'font-icon font-icon-arrow-left',
        nextYear: 'font-icon font-icon-arrow-right'
      },
      buttonText: {
        month: 'Month',
        day: 'Day',
        week: 'Week'
      },
      dayClick: function(date, jsEvent, view) {        
        if (($(this).hasClass('fc-today') || $(this).hasClass('fc-future')) && !$(this).hasClass('fc-other-month')) {
          $rootScope.addEventPopup(date._d,$rootScope.spaceDetailData,new Date(),new Date(),1);
        }        
      },
      defaultDate: new Date(),
      editable: true,
      selectable: true,
      eventLimit: true, // allow "more" link when too many events
      events : $scope.events,
      timeFormat: 'H(:mm)',
      viewRender: function(view, element) {
        if (!("ontouchstart" in document.documentElement)) {
          $('.fc-scroller').jScrollPane({
            autoReinitialise: true,
            autoReinitialiseDelay: 100
          });
        }
        $('.fc-popover.click').remove();
        
      },
      eventClick: function(calEvent, jsEvent, view) {
        var eventEl = $(this);

        // Add and remove event border class
        if (!$(this).hasClass('event-clicked')) {
          $('.fc-event').removeClass('event-clicked');
          $(this).addClass('event-clicked');
        }
        // Add popover
        var popHtml = $compile('<div class="fc-popover click">' +
              '<div class="fc-header">' +
                  moment(calEvent.start).format('dddd • D') +
                  '<button type="button" class="cl"><i class="font-icon-close-2"></i></button>' +
              '</div>' +

              '<div class="fc-body main-screen">' +
                  '<p>' +
                      moment(calEvent.start).format('dddd, D YYYY, hh:mma') +
                  '</p>' +
                  '<p class="color-blue-grey">'+calEvent.title+'</p>' +
                  '<ul class="actions">' +
                      '<li><a ng-click="editEventPopup('+calEvent.id+')" class="remove-popover" >More details</a></li>' +
                  '</ul>' +
              '</div>' +
          '</div>')($scope);
        $('body').append(popHtml);

        // Position popover
        function posPopover(){
          $('.fc-popover.click').css({
            left: eventEl.offset().left + eventEl.outerWidth()/2,
            top: eventEl.offset().top + eventEl.outerHeight()
          });
        }

        posPopover();

        $('.fc-scroller, .calendar-page-content, body').scroll(function(){
          posPopover();
        });

        $(window).resize(function(){
          posPopover();
        });


        // Remove old popover
        if ($('.fc-popover.click').length > 1) {
          for (var i = 0; i < ($('.fc-popover.click').length - 1); i++) {
            $('.fc-popover.click').eq(i).remove();
          }
        }

        // Close buttons
        $('.fc-popover.click .cl, .fc-popover.click .remove-popover').click(function(){
          $('.fc-popover.click').remove();
          $('.fc-event').removeClass('event-clicked');
        });
      },      
    });
    

      
    (function($, viewport){
      $(document).ready(function() {
        if(viewport.is('>=lg')) {
          $('.calendar-page-content, .calendar-page-side').matchHeight();
        }

        // Execute code each time window size changes
        $(window).resize(
          viewport.changed(function() {
            if(viewport.is('<lg')) {
              $('.calendar-page-content, .calendar-page-side').matchHeight({ remove: true });
            }
          })
        );
      });
    })(jQuery, ResponsiveBootstrapToolkit);
  };
}])