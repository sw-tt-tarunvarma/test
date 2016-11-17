'use strict';

/*App Controllers */

angular.module('myApp.controllers', ['ngCookies'])
.controller('AppController', ["$scope", "$state", "$cookies", "$rootScope", "$http","$timeout","getBaseUrl","$window","$filter","httpcall","$cacheFactory","Idle","ngDialog","socket","$stateParams", function($scope, $state, $cookies, $rootScope, $http, $timeout, getBaseUrl, $window, $filter,httpcall, $cacheFactory, Idle,ngDialog,socket,$stateParams) {
	
	$scope.$on('$viewContentLoaded', function () 
	{
		$scope.baseurl = getBaseUrl.url();
    $rootScope.isClicked=0;
		//$scope.getNotification();
		$rootScope.crUrl=$state.current.url;
		$rootScope.logo = '';
		$rootScope.au_isadmin = localStorage.getItem("au_isadmin");
		$scope.au_email = localStorage.getItem("au_email");
		 $scope.sortType     = 'message'; // set the default sort type
   		 $scope.sortReverse  = false;  // set the default sort order
   		 $rootScope.profileAvtar= '';
		$rootScope.eventpopupdate = new Date();
		if(angular.isDefined($rootScope.officeid))
		{

		}
		else
		{
			$rootScope.officeid = 1;
		}

		/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Define Event Popup Data And Function */
    $rootScope.eventPopupData = {};
    $rootScope.eventPopupData.startDate = '';
    $rootScope.eventPopupData.endDate = '';
    
    $rootScope.$watch('eventPopupData.startDate', function(newVal, oldVal) {
      var date1 = new Date($rootScope.eventPopupData.startDate).getTime();
      var date2 = new Date($rootScope.eventPopupData.endDate).getTime();
      var msInHour = 1000*60*60;
      var timeSpan = Math.abs(date2-date1);
      $rootScope.totaladdhours = timeSpan/msInHour;
      $rootScope.totaladdhours = $scope.convertOfHoursTotal($rootScope.totaladdhours)
    });

    $rootScope.$watch('eventPopupData.endDate', function(newVal, oldVal) {
      var date1 = new Date($rootScope.eventPopupData.startDate).getTime();
      var date2 = new Date($rootScope.eventPopupData.endDate).getTime();
      var msInHour = 1000*60*60;
      var timeSpan = Math.abs(date2-date1);
      $rootScope.totaladdhours = timeSpan/msInHour;
      $rootScope.totaladdhours = $scope.convertOfHoursTotal($rootScope.totaladdhours)
    });

    $rootScope.convertOfHoursTotal = function(total) {
      var total = parseFloat(total).toFixed(2);
      var hrs = parseInt(Number(total));
      var min = Math.round((Number(total)-hrs) * 60);
      hrs = (hrs < 10 ? '' : '') + hrs;
      min = (min < 10 ? '0' : '') + min;
      if (hrs != 0) {
        var timHrs =  'Hour';
        var timMint = 'Minutes';
      }
      else {
        var timHrs =  'Hour';
        var timMint = 'Minutes';
      }
      
      total = hrs+' '+timHrs+' . '+min+' '+timMint;
      return total;
    }



	    /*code added by JJ <jeel.joshi@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get Logo
      * @return : Logo Data
      * @author : Softweb solutions
    */
     $scope.getLogo = function() {
    	/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > get Office Logo */
    	$http.post($scope.baseurl+"/settings/getLogo/",{userid: localStorage.getItem("uc_guid")})
    	.success(function(result, status, headers, config) {
    		if (result.data.length > 0) {
    			if (result.data[0].logo) {
    				$rootScope.officeLogo = $scope.baseurl + "/images/app/" +result.data[0].logo;
            $rootScope.companyid = result.data[0].companyid;
    			}
    			else {
    				$rootScope.officeLogo = '';	
            $rootScope.companyid = '';
    			}    			
    		}
      		else {
      			$rootScope.officeLogo = '';
            $rootScope.companyid = '';
      		}
      	})
      	.error(function(data, status, headers, config) {
        	Notifier.error('Something went wrong. Please try again..');
      	});
    };

    $scope.getLogo();

     /*code added by JJ <jeel.joshi@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get Logo
      * @return : Logo Data
      * @author : Softweb solutions
    */
    $scope.getOfficeName = function() {
    	$http.post($scope.baseurl+"/office/getOfficeName", 
			{
				userid: localStorage.getItem("uc_guid"),
        au_isadmin: localStorage.getItem("au_isadmin"),
        companyid : $rootScope.companyid
			})
      .success(function(result, status, headers, config) {
      	if(result.length > 0){
      		$rootScope.officename = result[0].OfficeName;
      		$rootScope.officeid = result[0].id;
          $rootScope.officeAdminemail = result[0].email;
          $rootScope.UserName = localStorage.getItem("au_email");
      	} else {
      		$rootScope.officename = '';
      		$rootScope.officeid = '';
          $rootScope.officeAdminemail = '';
          $rootScope.UserName = '';
      	}
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    $scope.getOfficeName();

    /*code added by DT <dhaval.thaker@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get Logo
      * @return : Logo Data
      * @author : Softweb solutions
    */

$scope.getprofileLogo = function() {

      $http.post($scope.baseurl+"/profile/getprofileLogo/", 
      {
        userid: localStorage.getItem("uc_guid")
      })
      .success(function(result, status, headers, config) {
      	/*code added by AS <alpesh.solanki@softwebsolutions.com > Add condition if result is available or not */
      	if (result.data.length > 0) {
      		if (result.data[0].image) {
            	$rootScope.profileLogo = result.data[0].image;
            	$rootScope.profileAvtar = result.data[0].image;
          	}	
          	else {
          		$rootScope.profileLogo = 'no-user.png';
            	$rootScope.profileAvtar = 'no-user.png';
          	}
      	}
      	else {
	  		$rootScope.profileLogo = 'no-user.png';
	        $rootScope.profileAvtar = 'no-user.png';
      	}
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    $scope.getprofileLogo();

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get All Space Data
      * @return : Space Data
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.getAllSpaceData = function() {
      $http.get($scope.baseurl+"/location/allSpacesOfUser/"+localStorage.getItem("uc_guid")+"/1")
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

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for calender*/
    $rootScope.open = {
      date: false,
      startTime: false,
      endTime  : false,
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for calender*/
    $rootScope.openCalendar = function(e, date) {
      $scope.open[date] = true;
    };


    socket.on('locationStatusChange', function (data) {
      $timeout(function(){
        var found = $filter('filter')($scope.allSpaceData, {id: parseInt(data.id)}, true);
        if (found.length) {
          var foundIndex = $rootScope.allSpaceData.indexOf(found[0]);
          if(data.status == 1)
          {
            $scope.allSpaceData[foundIndex].status = data.status;
          }
          else
          {
            $scope.allSpaceData[foundIndex].status = data.status;
          }
        }
      },500);
    });

		$rootScope.addEventPopup = function (date,spaceData,startDate,endDate,disableSpace,disableDate,disableStarttime,disableEndtime) {
      $rootScope.isClicked=0;
      if (!date) {
        return; 
      }
      
      var coeff = 1000 * 60 * 5;
      var rounded = new Date(Math.round(date.setMinutes( date.getMinutes() + 2.5 ) / coeff) * coeff);

      $rootScope.date = rounded;
      
      $rootScope.date = date;
      $rootScope.dataid = 1;
      $rootScope.eventPopupData = new Object();
      $rootScope.eventPopupData.selectedDate = $rootScope.date;
      $rootScope.eventPopupData.startDate = startDate ? startDate :rounded;
      $rootScope.eventPopupData.endDate = endDate ? endDate :rounded;
      $rootScope.eventPopupData.disabledPastTime = 1;
      $rootScope.eventPopupData.id = 0;
      $rootScope.eventPopupData.attendData = [];
      $rootScope.eventPopupData.editEventValue = 0;
      $rootScope.eventPopupData.locationid = '';
      $rootScope.eventPopupData.disableSpace = 0;
      $rootScope.eventPopupData.disableDate = 0;
      $rootScope.eventPopupData.disableStarttime = 0;
      $rootScope.eventPopupData.disableEndtime = 0;
      $rootScope.eventPopupData.spaceName = '';
      $rootScope.eventPopupData.locationName = '';

      if (disableSpace && disableSpace == 1) {
        $rootScope.eventPopupData.disableSpace = 1;
      }
      if (disableDate && disableDate == 1) {
        $rootScope.eventPopupData.disableDate = 1;
      }
      if (disableStarttime && disableStarttime == 1) {
        $rootScope.eventPopupData.disableStarttime = 1;
      }
      if (disableEndtime && disableEndtime == 1) {
        // enable end time 
        $rootScope.eventPopupData.disableEndtime = 0;
      }

      if (spaceData && spaceData.id) {
        $rootScope.eventPopupData.spaceCapacity = parseInt(spaceData.capacity);
        $rootScope.eventPopupData.locationid = spaceData.id;
        $rootScope.eventPopupData.spaceName = spaceData.name;
        $rootScope.eventPopupData.locationName = spaceData.officeLocationName;
      }
        
      ngDialog.open({ 
        template: 'partials/event_popup.html',
        controller: 'AppController',
        scope:$rootScope
      });
    };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Set TimePicker Min Time  */
    /**
      * @module : AppController
      * @desc   : Set TimePicker Min Time
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.setMinTimeOfTimePicker = function (selectedDate) {
      if (!selectedDate) {
        return;
      }
      var currentDate = new Date();
      var currentDay = currentDate.getFullYear()+"-"+currentDate.getMonth()+"-"+currentDate.getDate();
      var selectedDay = selectedDate.getFullYear()+"-"+selectedDate.getMonth()+"-"+selectedDate.getDate();
      if (currentDay < selectedDay) {
        $rootScope.eventPopupData.disabledPastTime = 0;
      }
      else if (currentDay >= selectedDay) {
        $rootScope.eventPopupData.disabledPastTime = 1;
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Set Space Capacity  */
    /**
      * @module : Search
      * @desc   : Set Space Capacity
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.setSpaceCapacity = function (spaceId) {
      if (!parseInt(spaceId) || !$rootScope.allSpaceData || !$rootScope.allSpaceData.length) {
        return;
      }

      var found = $filter('filter')($rootScope.allSpaceData, {'id':parseInt(spaceId)},true);
      if (found.length) {
        if (found[0].id == spaceId) {
          $rootScope.eventPopupData.spaceCapacity = parseInt(found[0].capacity);
          $rootScope.eventPopupData.spaceName = found[0].name;
          $rootScope.eventPopupData.locationName = found[0].officeLocationName;
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
     $rootScope.saveRoomEvent = function(eventPopupData) {
      $rootScope.isClicked=1;
      var purpose = eventPopupData.purpose;
      var amenities = eventPopupData.amenities;
      var chkaminites = eventPopupData.ShowAmenities;
      var catering = eventPopupData.catering;
      var chkcaterings = eventPopupData.ShowCatering;
      if (purpose && purpose.trim()) {
        var startDateTime = new Date(eventPopupData.selectedDate.getFullYear(),eventPopupData.selectedDate.getMonth(),eventPopupData.selectedDate.getDate(),eventPopupData.startDate.getHours(),eventPopupData.startDate.getMinutes());
        var endDateTime = new Date(eventPopupData.selectedDate.getFullYear(),eventPopupData.selectedDate.getMonth(),eventPopupData.selectedDate.getDate(),eventPopupData.endDate.getHours(),eventPopupData.endDate.getMinutes());
        var month = eventPopupData.selectedDate.getMonth() + 1;
        if (month.toString().length == 1) {
          month = "0"+month;
        }

        var day = eventPopupData.selectedDate.getDate();
        if (day.toString().length == 1) {
          day = "0"+day;
        }

        var searchDate = eventPopupData.selectedDate.getFullYear()+'-'+month+'-'+day;        
        if (!eventPopupData.locationid || !parseInt(eventPopupData.locationid) || parseInt(eventPopupData.locationid) <= 0) {
          Notifier.error('Please select Space.');
          $rootScope.isClicked=0;
          alert('Please select Space.');
        }
        else if (startDateTime >= endDateTime) {
          Notifier.error('Please select valid End time.');
          $rootScope.isClicked=0;
          alert('Please select valid End time.');
        }
        else if (eventPopupData.attendData.length > eventPopupData.spaceCapacity) {
          Notifier.error('Space Capacity is '+eventPopupData.spaceCapacity+'. So Please invite '+eventPopupData.spaceCapacity+' member.');
          $rootScope.isClicked=0;
          alert('Space Capacity is '+eventPopupData.spaceCapacity+'. So Please invite '+eventPopupData.spaceCapacity+' member.');
        }
        else if(eventPopupData.attendData.length == 0)
        {
          Notifier.error('Please choose atleast 1 attendies.');
          $rootScope.isClicked=0;
          alert('Please choose atleast 1 attendies'); 
        }
        else {
          var roomData = {};
          roomData.locationid = eventPopupData.locationid;
          roomData.startTime = startDateTime.toISOString().replace('.000Z', '');
          roomData.endTime = endDateTime.toISOString().replace('.000Z', '');

          $scope.checkRoomAvailabilityUrl = $scope.baseurl+"/location/checkRoomAvailability";
          $http.post($scope.checkRoomAvailabilityUrl, roomData)
          .success(function(availabilityResult, status, headers, config) {
            if (availabilityResult.data.length > 0) {
              Notifier.error('Room already booked for this timeslot.');
              $rootScope.isClicked=0;
              alert('Room already booked for this timeslot.');
            }
            else {
              var postData = {};
              postData['UserEmail'] = localStorage.getItem("au_email");
              postData['officeAdminemail'] = $rootScope.officeAdminemail;
              postData['UserName'] = $rootScope.UserName;
              postData['attendies'] = [];
              postData['amenities'] = [];
              postData['ShowAmenities'] = false;
              postData['catering'] = [];
              postData['ShowCatering'] = false;
              postData['datastorevalue'] = 1;
              postData['detail'] = '';
              postData['id'] = eventPopupData.id;
              postData['locationid'] = eventPopupData.locationid;
              postData['mark_as_private'] = 0;
              postData['purpose'] = purpose.trim();
              postData['time'] =  new Date(eventPopupData.selectedDate.getFullYear(),eventPopupData.selectedDate.getMonth(),eventPopupData.selectedDate.getDate(),eventPopupData.startDate.getHours(),eventPopupData.startDate.getMinutes());
              postData['endtime'] = new Date(eventPopupData.selectedDate.getFullYear(),eventPopupData.selectedDate.getMonth(),eventPopupData.selectedDate.getDate(),eventPopupData.endDate.getHours(),eventPopupData.endDate.getMinutes());
              postData['timestamp'] =  Date.UTC(postData['time'].getUTCFullYear(),postData['time'].getUTCMonth(), postData['time'].getUTCDate(),postData['time'].getUTCHours(),postData['time'].getUTCMinutes(),postData['time'].getUTCSeconds(),postData['time'].getUTCMilliseconds());
              
              var diff = Math.abs(postData['time'] - postData['endtime']);
              postData['duration'] = parseInt(Math.floor((diff/1000)/60));
              postData['event_id'] = '';
              postData['time'] = postData['time'].toISOString();
              postData['endtime'] = postData['endtime'].toISOString();
              
              if (postData['duration'] > 480) {
                Notifier.error('Maxium duration is 8 hour so please change the time.');
                $rootScope.isClicked=0;
                alert('Maxium duration is 8 hour so please change the time.');
              }
              else {
                if(eventPopupData.detail) {
                  postData['detail'] = eventPopupData.detail;
                }

                if(eventPopupData.ShowAmenities || eventPopupData.ShowAmenities == 0) {
                  postData['ShowAmenities'] = eventPopupData.ShowAmenities;
                }
                if(eventPopupData.amenities) {
                  postData['amenities'] = eventPopupData.amenities;
                }

                 if(eventPopupData.ShowCatering || eventPopupData.ShowCatering == 0) {
                  postData['ShowCatering'] = eventPopupData.ShowCatering;
                }
                if(eventPopupData.catering) {
                  postData['catering'] = eventPopupData.catering;
                }

                if(eventPopupData.mark_as_private || eventPopupData.mark_as_private == 0) {
                  postData['mark_as_private'] = eventPopupData.mark_as_private;
                }

                if (eventPopupData.attendData && eventPopupData.attendData.length) {
                  for(var i = 0; i < eventPopupData.attendData.length; i++) {
                    if (eventPopupData.attendData[i].email != localStorage.getItem("au_email")) {
                      postData.attendies.push({"attendees" : eventPopupData.attendData[i].email});
                    }
                  }
                }

                if (eventPopupData.includeMe && eventPopupData.includeMe == 1) {
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
                    $rootScope.deviceMessage = data.message;
                    ngDialog.close('$escape');
                    var current = $state.current;
                    var params = angular.copy($stateParams);                  
                    Notifier.success("Room booked successfully.");
                    $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
                    
                  }).error(function(data, status, headers, config) {
                    Notifier.error('Something went wrong. Please try again..');
                    $rootScope.isClicked=0;
                  });
                }).error(function(data, status, headers, config) {
                  Notifier.error('Something went wrong. Please try again..');
                  $rootScope.isClicked=0;
                });
              }   

              
            }
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
            $rootScope.isClicked=0;
          });
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

      var isAddEmail = true; 
      if ($rootScope.eventPopupData.attendData && $rootScope.eventPopupData.attendData.length) {
        for (var i = 0; i < $rootScope.eventPopupData.attendData.length; i++) {
          if ($rootScope.eventPopupData.attendData[i].email == email) {
            isAddEmail = false;
          }
        }
      }

      if (isAddEmail) {
        $rootScope.eventPopupData.attendData.push({email : email});
        $rootScope.eventPopupData.attend = '';
      }
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

        var isAddEmail = true; 
        if ($rootScope.eventPopupData.attendData && $rootScope.eventPopupData.attendData.length) {
          for (var i = 0; i < $rootScope.eventPopupData.attendData.length; i++) {
            if ($rootScope.eventPopupData.attendData[i].email == email) {
              isAddEmail = false;
            }
          }
        }

        if (isAddEmail) {
          $rootScope.eventPopupData.attendData.push({email : email});
          $rootScope.eventPopupData.attend = '';
        }
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

      	

      	$scope.preloadData = function(page)
      	{
	      	$http.post($scope.baseurl + "/schedule/getNotification", {userid: localStorage.getItem("uc_guid")})			
			.success(function(result, status, headers, config) {
				$timeout(function() {
				$scope.getNotification = result.data;
				  $rootScope.getNotification = $scope.getNotification;
				},500);
			})
			.error(function(data, status, headers, config) {
				Notifier.error('Something went wrong. Please try again..');
			});
      	};
      	$scope.preloadData();

      	

     
		/**
		  * @module : General app controller
		  * @desc   : Get a list of all location
		  * @return : Return all location array
		  * @author : Softweb solutions
		*/
		$rootScope.getLocations = function()
		{
			$rootScope.allLocation='';
			var url = getBaseUrl.url()+"/location/getLocations/";
			httpcall.call(url, "get", false, "").then(function(result){
				$timeout(function(){
					$rootScope.allLocation = result.data;
	  		  	},500);
			});
		}


		/**
		  * @module : General app controller
		  * @desc   : Set office id and redirect to dashboard
		  * @return : Redirect on dashboard
		  * @author : Softweb solutions
		*/
		$scope.switchOffice = function(officeid)
		{
			$timeout(function(){
				$rootScope.officeid = officeid;
				$state.transitionTo("dashboard", '', { reload:true });
			},500);
		}
		
		
		
		

		/**
		  * @module : General app controller
		  * @desc   : Get all office list
		  * @return : Return office list
		  * @author : Softweb solutions
		*/
		$rootScope.getAllOffices = function()
		{
			$http.get($scope.baseurl + '/office/getalloffices/'+$rootScope.officeData[0].companyid)
			.success(function(data, status, headers, config) {
		        $scope.officedata = data;
		        $rootScope.autoheight();
		    }).error(function(data, status, headers, config) {
				Notifier.error('Something went wrong!. Please try again..');
			});
		}

		/**
		  * @module : General app controller
		  * @desc   : Get all company list
		  * @return : Return company list
		  * @author : Softweb solutions
		*/
		$rootScope.getAllCompany = function()
		{
			$http.get($scope.baseurl + '/company')
			.success(function(data, status, headers, config) {
				$rootScope.companydata = data;
			})
			.error(function(data, status, headers, config) {
				Notifier.error('Something went wrong!. Please try again..');
			});
		}

		/**
		  * @module : General app controller
		  * @desc   : Show right sidebar with location room
		  * @return : Return call to get location function
		  * @author : Softweb solutions
		*/
		$scope.showSideBarLocation= function()
		{
			if($rootScope.allLocation) {
			}
			else
			{
				$rootScope.getLocations();
			}
		}		

		/**
		  * @module : General app controller
		  * @desc   : Get user session detail
		  * @return : Return user information
		  * @author : Softweb solutions
		*/
		$scope.getUserSession = function()
		{
			$http.get($scope.baseurl+"/getUserSession")
			.success(function(data, status, headers, config) {
				//console.log(data)
				$timeout(function(){
					$rootScope.loggedInUser = data.username;
					$rootScope.loggedInUserRole = data.userdata.role;
					$rootScope.userImage = data.userdata.imagename;
					$rootScope.userEmail = data.userdata.email;
			  		//$rootScope.officeid = data.userdata.officeid;
			  	},500);
			})
			.error(function(data, status, headers, config) {
				Notifier.error('Something went wrong!. Please try again..');
			});
		}

		/**
		  * @module : General app controller
		  * @desc   : 
		  * @return : 
		  * @author : Softweb solutions
		*/
		$rootScope.autoheight = function()
		{
			var w = $(window).innerHeight();
			if($(".wrapper").height()<(w))
			{
				//	$(".wrapper").height(w);
			}
			else
			{
				//	$(".wrapper").css("height","inherit");
			}
		};

		/**
		  * @module : General app controller
		  * @desc   : Redirection path
		  * @return : Return redirect to specified path
		  * @author : Softweb solutions
		*/
		$rootScope.redirectTo = function(path)
		{
			$state.go(path);
		}

		/**
		  * @module : General app controller
		  * @desc   : Send to logout url of window
		  * @return : send to logout process
		  * @author : Softweb solutions
		*/
		$scope.logout = function()
		{

         	window.localStorage.setItem('token', '');
			window.localStorage.setItem('uc_guid', '');
			window.localStorage.setItem('au_isadmin','');
			window.localStorage.setItem('au_email','');
			

			$cookies.remove("token");
			window.location=$scope.baseurl;        

	   	}

	   	$(window).resize(function(e) {
	   		$rootScope.autoheight();
	   	});

	   	$rootScope.autoheight();
	   	$rootScope.setLockPattern = false;
	   	$rootScope.registerPatternVaraible = false;
	   	$timeout(function(){
	   		if(localStorage.getItem("isLockEnabled") == 1)
	   		{
	   			$scope.lock();
	   		}
	   		else
	   		{
	   			$("#patterndiv").hide();
	   			$rootScope.autoheight();
	   		}
	   	}, 1000);

	   	$scope.lock = function()
	   	{

	   	};

	   	$scope.$on('IdleStart', function() {
	   		$scope.lock();
	   	});

	   	var lock1;
	   	/**
		  * @module : General app controller
		  * @desc   : Set locak pattern value
		  * @return : Return set lock pattern value
		  * @author : Softweb solutions
		*/
	   	$scope.registerPatternValue = function(value)
	   	{
	   		if(value == 1)
	   		{
	   			localStorage.setItem("patternValue", lock1.getPattern());
	   			lock1.setPattern(lock1.getPattern());
	   			$rootScope.setLockPattern = true;
	   			Notifier.success('Lock pattern added successfully. Use this pattern to unlock your webpage');
	   			$("#patterndiv").hide("slow");
	   		}
	   		else
	   		{
	   			$("#patterndiv").hide("slow");
	   		}
	   	};

	   	/**
		  * @module : General app controller
		  * @desc   : Set locak pattern value
		  * @return : Return set lock pattern value
		  * @author : Softweb solutions
		*/
	   	$scope.registerPattern = function()
	   	{
	   		$timeout(function(){
	   			$rootScope.registerPatternVaraible = true;
	   			$("#patterndiv").show("slow");
	   			lock1 = new PatternLock('#patternContainer',{enableSetPattern : true});
	   		},500);
	   	};





	});
}]);