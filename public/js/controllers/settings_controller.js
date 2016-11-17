'use strict';

/*Setting Controllers */

angular.module('myApp.controllers')
.controller('SettingsController', ["$scope", "$state", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "$q", "$stateParams", "ngDialog", "$filter","$window","$log", function($scope, $state, $location, $rootScope, $http, $timeout, getBaseUrl, $q, $stateParams, ngDialog, $filter, base64Converter,$window,$log) {

  $rootScope.activeStateParam = $state.current.name;



  $scope.$on('$viewContentLoaded', function () 
  {
    $rootScope.dataid = 1;
    $rootScope.isClicked = 0; 
    $rootScope.autoheight();
    $scope.baseurl = getBaseUrl.url();
    $scope.getdatainfo;
    $scope.getdata = {};
    $rootScope.au_isadmin = localStorage.getItem("au_isadmin");
    $rootScope.userid = localStorage.getItem("uc_guid");   
    $scope.canShowLocationRecords = 0;        
    $scope.canShowSpaceRecords = 0;       
    $scope.canShowDeviceRecords = 0;        
    $scope.canShowNotificationRecords = 0;        
    $scope.canShowUserRecords = 0;
    $rootScope.devicedata = {};
    $rootScope.massDeviceData = {};
    $scope.allDeviceData = '';
    $rootScope.allDeviceData = '';
    $scope.filteredEvents = '';
    $rootScope.mainLogo = {};
    $rootScope.crUrl=$state.current.url;
    $scope.currentPage = 1;
    $scope.numPerPage = 10;
    $scope.currentPage1 = 1;
    $scope.numPerPage1 = 10;
    $scope.currentPageFloor = 1;       
    $scope.numPerPageFloor = 10;
    $scope.currentPagedevice = 1;
    $scope.numPerPagedevice = 10;
    $scope.currentPagePeople = 1;
    $scope.numPerPagePeople = 10;
    $scope.currentPageNotification = 1;
    $scope.numPerPageNotification = 10;
    $scope.itemsPerPage = $scope.viewby;
    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > set default value for which tab display */
    $scope.displayAmenities = false;
    $scope.displayLocations = true;
    $scope.displaySpaces = false;
    $scope.defaultCancelMeeting = 8;
    $scope.abandonedMeeting = $scope.defaultCancelMeeting;
    $scope.disabledCancelMeetingButton = true;
    //added by JJ<jeel.joshi@softwebsolutions.com>
    $scope.displayDetails = false;
    $scope.displayIntegration=false;
    $scope.displayDevice=false;
    $scope.displayPeople=false;
    $scope.displayUser=false;
    $scope.displayFloor = false;
    $scope.IsVisible = true;
     $scope.toggle = '';
    $scope.displayAdvance=false;
    $rootScope.allRoomData = '';
    $scope.userData = {};
    $scope.userData.officeLocation = '0';
    $rootScope.allSpaces = ''; 
    $scope.allSpaces = {};
    $scope.filteredSpaces = '';
    $scope.filteredAmenities = '';
    $scope.filteredDevice = '';
    $scope.importMemberFile = '';   
    $rootScope.allFloors ='';       
    $scope.allFloors = '';    
    $scope.allFloorList= ''   
    $rootScope.maxFloor='';   
    $scope.sampleImportFile = $scope.baseurl+"/images/membercsv/sample.csv";    
    $rootScope.amenitiesDivHide = false; //SOFTWEB
    /*-----------------Selected tab management //SOFTWEB---------------------*/
    $scope.tabName = $rootScope.tabName;
    $rootScope.tabName = '';
    if($scope.tabName == 'advance')
    {
      $scope.displayAdvance = true;
      $scope.displayLocations = false;
      $scope.tabName = '';
    }
    /*-----------------Selected tab management //SOFTWEB---------------------*/

    $scope.sortType     = 'name'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order

    /*code added by <rohan@softwebsolutions.com > Hide Branding Text */
    /**
      * @module : Setting
      * @desc   : Hide Branding Text
      * @return : Value
      * @author : Softweb solutions
    */
    $scope.ShowHide = function () {
      var officeid = $rootScope.officeid;
      var userid = localStorage.getItem("uc_guid");
        // //If DIV is visible it will be hidden and vice versa.
        // $scope.IsVisible = $scope.IsVisible ? false : true;
        $http.post($scope.baseurl+"/settings/addBrandingText",{toggle:$scope.toggle,officeid:officeid,userid:userid})
      .success(function(result, status, headers, config) {
      
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    $scope.getBrandingText = function() {
      var userid = localStorage.getItem("uc_guid");
      $http.post($scope.baseurl+"/settings/getBrandingText",{userid:userid})
      .success(function(result, status, headers, config) {
        $timeout(function() {
          if(result.data[0] != undefined){
            $scope.toggle = result.data[0].brandingtext;  
          } else{
            $scope.toggle = '';
          }
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    $scope.getBrandingText();

    $scope.getAbandoneMeeting = function() {
      var userid = localStorage.getItem("uc_guid");
      $http.post($scope.baseurl+"/settings/getAbandoneMeeting",{userid:userid})
      .success(function(result, status, headers, config) {
        $scope.toggle_cancelmeeting_switch = true;
        if(result.data[0] != undefined){
          $scope.abandonedMeeting = result.data[0].abandoned_meeting;  
        } 
        else {
          $scope.abandonedMeeting = $scope.defaultCancelMeeting;
        }
        $scope.validateAbandonedMeeting($scope.abandonedMeeting);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }
    $scope.getAbandoneMeeting();

    $scope.validateAbandonedMeeting = function (abandonedMeeting) {
      $scope.abandonedMeeting = abandonedMeeting;
      if (abandonedMeeting == undefined) {
        $scope.disabledCancelMeetingButton = true;        
      }
      else if (parseInt(abandonedMeeting) >= 1 && parseInt(abandonedMeeting) <= 59) {
        $scope.disabledCancelMeetingButton = false;        
      }
    }

    $scope.cancelmeeting = function (abandonedMeeting,toggle_cancelmeeting_switch) {
      var officeid = $rootScope.officeid;
      var userid = localStorage.getItem("uc_guid");
      var minute = abandonedMeeting;
      if(toggle_cancelmeeting_switch== false) {
        minute = $scope.defaultCancelMeeting;
      }
      $http.post($scope.baseurl+"/settings/addAbandonedMeeting",{cancel_meeting:minute,officeid:officeid,userid:userid})
      .success(function(result, status, headers, config) {
        var current = $state.current;
        var params = angular.copy($stateParams);                  
        Notifier.success("Changes saved successfully.");
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });      
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }
    
    $scope.selectedUsers = [];
    
    
    // Add O365 login Date: 10 Oct 2016 by tarunvarma
    
    $scope.OpenPopupWindow = function (url,title) {
		  window.open(url,title, "'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no,width=800,height=500");
	}
   // Add O365 login Date: 10 Oct 2016 by tarunvarma
            

    
    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > set spcae tyape data */
    $scope.spaceTypeData = ['Breakout','Call Room','Classroom','Conference Room','Meeting Room','Office','Study Room','Break Room','Cafe','Cafeteria','Fitness Gym','Interview Room','Kitchen','Lab','Lactation Room','Lobby','Lounge','Other','Parking','Restroom','Female Restroom','Male Restroom','Studio','Theater','Utility Room','Work Area'];

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > set size data */
    $scope.sizeData = [
      { label:'Micro (3 ft / 1 m)',value:'0.5'},
      { label:'Extra Small (7 ft / 2 m)',value:'1'},
      { label:'Small (10 ft / 3 m)',value:'1.5'},
      { label:'Medium (23 ft / 7 m)',value:'3.5'},
      { label:'Large (46 ft / 14 m)',value:'7'},
      { label:'Extra Large (92 ft / 28 m)',value:'14'}
    ];

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > set status data */
     $scope.spaceStatusData = [
      { label:'Inactive',value:0},
      { label:'Active',value:1}
    ];

     $scope.inviteMemberData = [];
    $scope.inviteMemberListing = 1;
    $scope.inviteMemberForm = 0;
    $scope.massPeopleData = {};

    /*code added by JJ <jeel.joshi@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get All Space Data
      * @return : Space Data
      * @author : Softweb solutions
    */
    $scope.getAllSpaceData = function() {
      /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > add User id condition */
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

    $scope.getAllSpaceData();

    /*code added by JJ <jeel.joshi@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : Get All Device Data
      * @return : Device Data
      * @author : Softweb solutions
    */
    $scope.getAllDeviceData = function() {
      

      $scope.saveurl = $scope.baseurl+"/location/getDevices/"+localStorage.getItem("uc_guid");
      //console.log(mainLogo);return false;
      $http.get($scope.saveurl).success(function(result, status, headers, config)
      {
      
    
        
        $timeout(function() {
         $scope.allDeviceData = result.data;
          $rootScope.allDeviceData = $scope.allDeviceData;
          $scope.canShowDeviceRecords = 1;
          
          var begin = (($scope.currentPagedevice -1)  * $scope.numPerPagedevice);
          var end = begin + $scope.numPerPagedevice;
          $scope.filteredDevice = $rootScope.allDeviceData.slice(begin, end);
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    $scope.getAllDeviceData();

    $scope.$watch('currentPagedevice + numPerPagedevice', function() {
      var begin = (($scope.currentPagedevice-1) * $scope.numPerPagedevice);
      var end = begin + $scope.numPerPagedevice;
      $scope.filteredDevice = $rootScope.allDeviceData.slice(begin, end);
      });


    $scope.pageChanged3 = function() {
      
      console.log('Page changed to: ' + $scope.currentPagedevice);
    };

    /**
    * @module : Setting
    * @desc   : Get Setting detail
    * @return : Return data
    * @author : Softweb solutions
    */
    $scope.getSettings = function()
    {
      var deferred = $q.defer();
      $http.get($scope.baseurl+"/settings/get")
      .success(function(result, status, headers, config) {
        deferred.resolve(result)
        $timeout(function(){
          $scope.getdata = result.data;
          $rootScope.autoheight();
        },500);
      })
      .error(function(data, status, headers, config) {
        deferred.reject()
        Notifier.error('Something went wrong. Please try again..');
      });
      return deferred.promise;
    }

    /**
    * @module : Setting
    * @desc   : Open popup window
    * @return : Return data
    * @author : Softweb solutions
    */
    $scope.clickToOpen = function(id) 
    {
      if(id) 
      {
        $scope.mode = 'edit';
        var found = $filter('filter')($scope.getdata, {Id: id}, true);
        if (found.length) {
          $scope.getdatainfo = found[0];
        }
      }
      ngDialog.open({ 
        template: 'partials/setting_popup.html',
        controller: 'SettingsController',
        scope:$scope
      });
    };

    //added by JJ <jeel.joshi@softwebsolutions.com>
    $scope.addLogo = function(mainLogo)
    {
      var userid = localStorage.getItem("uc_guid");
      $scope.saveurl = $scope.baseurl+"/settings/addLogo";
      //console.log(mainLogo);return false;
      $http.post($scope.saveurl, {mainLogo: mainLogo, userid: userid}).success(function(data, status, headers, config)
      {
        console.log(data.data);
        console.log(data.status);
        if(data.status == false)
        {
          $rootScope.companyLogo = '/images/softweb_logo.png';
        }
        $rootScope.companyLogo = data.data;
        var filename  = mainLogo.logoImage.filename;
        var image  = mainLogo.logoImage.base64;
        var ext = filename.split(".");
        var timestamp = Math.floor(new Date() / 1000);
       // var newFileName = 'app/logo_'+ timestamp +"."+ext[ext.length-1];
        var newFileName = 'app/'+ filename;
        $("#logo").html("<img class='hidden-md-down' src='/images/"+newFileName+"'>");
        Notifier.success('Logo uploaded successfully');
        
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

      /*code added by AS <alpesh.solanki@softwebsolutions.com > Generate Dynamic Password For User */
    /**
      * @module : Settings
      * @desc   : Generate Dynamic Password For User -  Import Member
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.generatePassword = function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i = 0; i < 6; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

     /*code added by AS <alpesh.solanki@softwebsolutions.com > Import Member Using CSV */
    /**
      * @module : Settings
      * @desc   : Import Member Using CSV
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.importMember = function(csvFile) {
      var officeId = 0;
      var isImport = true;

      if (csvFile) {
        var allowMimeType = ['text/csv','text/comma-separated-values','application/vnd.ms-excel'];
        var checkMimeType = jQuery.inArray( csvFile.filetype, allowMimeType );
        if (checkMimeType < 0) {
          //$("#import_lblError1").html("Please upload valid csv file.");
          Notifier.error('Please upload valid csv file.');
          isImport = false;
        }          
      }
      else {
        //$("#import_lblError1").html("Please upload csv file.");
        Notifier.error('Please upload csv file.');
        isImport = false;
      }

      if(isImport) {
        var password = $scope.generatePassword();
        $scope.getUserUrl = $scope.baseurl+"/people/getUserUsingGuid/"+localStorage.getItem("uc_guid");
        $http.get($scope.getUserUrl).success(function(result, status, headers, config) {
          if(result.data.length) {
            officeId = result.data[0].officeid;
          }
          $http.post($scope.baseurl+"/mobservices/SoftwebHOQAddUsercsv",{csvFile:csvFile,officeId:officeId,password:password})
          .success(function(data, status, headers, config) {
            if (data && data.type == 'success') {
              $timeout(function(){
                $scope.getAllPeople();
                $scope.showInviteMemberListing();
                Notifier.success(data.message);
                $scope.importMemberFile = '';
              }, 1000);              
            }
            else if (data && data.type == 'error') {
              Notifier.error(data.message);
            }
            else {
              Notifier.error('Something went wrong. Please try again..');  
            }
            console.log(data);
          }).error(function(result, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
        }).error(function(result, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });
          
      }
    };

/**
    * @module : Conference
    * @desc   : Get location
    * @return : Return location list
    * @author : Softweb solutions
    */
    $rootScope.clickToOpenDevice = function () 
    {
       $scope.getAllSpaceData();
      $rootScope.isClicked = 0;
      $rootScope.devicedata = {};
      $rootScope.editvalue = 0;
      
      ngDialog.open({ 
        template: 'partials/device_popup.html',
        controller: 'SettingsController',
        rootScope:$rootScope 
      });
    };

    /**
    * @module : Conference
    * @desc   : Open conference room popup with room detail for edit
    * @return : Return redirect on edit view
    * @author : Softweb solutions
    */
    $rootScope.clickToOpeneditDevice = function (id) {
      var found = $filter('filter')($scope.allDeviceData, {id: id}, true);
      if (found.length) {
        $timeout(function(){
          $rootScope.devicedata = found[0];
        }, 500)
      }
      else
      {
        $rootScope.devicedata = '';
      }
      $rootScope.editvalue = 1; 
      ngDialog.open({ 
        template: 'partials/device_popup.html',
        controller: 'SettingsController'              
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
      $rootScope.isClicked = 1;
      $scope.deviceaddurl = $scope.baseurl+"/device/adddevice";
      $http.post($scope.deviceaddurl, $rootScope.devicedata).success(function(data, status, headers, config) 
      {
        $rootScope.deviceMessage = data.message;
        /*var current = $state.current;
        var params = angular.copy($stateParams);
        ngDialog.close('$escape');*/
        $scope.getAllDeviceData(); //SOFTWEB
        ngDialog.close('$escape'); //SOFTWEB
       if(data.errmessage){
          Notifier.error(data.errmessage);  
        } else {
          Notifier.success(data.message);
        }
        // $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });

      }).error(function(data, status, headers, config) {
        $rootScope.isClicked = 0;
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
      $scope.deviceupdateurl = $scope.baseurl+"/device/updatedevicedata";
      $http.post($scope.deviceupdateurl, $rootScope.devicedata).success(function(data, status, headers, config) 
      {
        $rootScope.deviceMessage = data.message;
       /* var current = $state.current;
        var params = angular.copy($stateParams);
        ngDialog.close('$escape');
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });*/
        $scope.getAllDeviceData(); //SOFTWEB
        ngDialog.close('$escape'); //SOFTWEB
        Notifier.success('Device updated successfully.');

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
              // var current = $state.current;
              // var params = angular.copy($stateParams);
               //ngDialog.close('$escape');
              // $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });

              $scope.getAllDeviceData(); //SOFTWEB
              Notifier.success('Device deleted successfully.');

            }).error(function(data, status, headers, config) {
              return false;
            });
          
        }, function (value) {
           
        });  
    }

    /**
    * @module : Setting
    * @desc   : Update Setting detail
    * @return : Return update setting data
    * @author : Softweb solutions
    */
    $scope.updateSetting = function ()
    {
      $scope.deviceupdateurl = $scope.baseurl+"/settings/updateSetting";
      $http.post($scope.deviceupdateurl, $scope.getdatainfo).success(function(data, status, headers, config)
      {
        Notifier.success('Setting updated successfully');
        ngDialog.close('$escape');
        $scope.getSettings();
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    /**
    * @module : Setting
    * @desc   : Delete Setting detail
    * @return : Return response
    * @author : Softweb solutions
    */
    $scope.delete = function(id)
    {
      if (confirm("Are you sure!") == true) 
      {
        $http.post($scope.baseurl+"/settings/delete", {Id: id})
        .success(function(result, status, headers, config) {
          Notifier.success('Deleted Sucessfully');
          ngDialog.close('$escape');
          $scope.getSettings();
        })
        .error(function(data, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });
      }
    }

    /* code comment by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > unused call */    
    //$scope.getSettings();

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Amenities */
    /**
      * @module : Setting
      * @desc   : Get Amenities
      * @return : Return amenities list
      * @author : Softweb solutions - Alpeshsinh Solnaki
    */
    $scope.getAmenities = function() {
      $http.get($scope.baseurl+"/amenities/allAmenities/")
      .success(function(result1, status1, headers1, config1) {
        $timeout(function(){
          $scope.allAmenities = result1.data;
          $rootScope.allAmenitiesData = $scope.allAmenities;
          $http.get($scope.baseurl+"/location/allSpacesOfUser/"+localStorage.getItem("uc_guid")+"/"+$rootScope.dataid)
          .success(function(result, status, headers, config) {
            $scope.allRoomData = result.data;
            $rootScope.allRoomData = $scope.allRoomData;
            var begin = (($scope.currentPage - 1) * $scope.numPerPage);
            var end = begin + $scope.numPerPage;
            $scope.filteredAmenities = $rootScope.allRoomData.slice(begin, end);

            if ($rootScope.allRoomData.length && $rootScope.allAmenitiesData.length) {
              for (var i = 0;i < $rootScope.allRoomData.length; i++) {
                $rootScope.allRoomData[i].selectedAmenitiesData = [];
                $rootScope.allRoomData[i].selectedAmenities = [];
                if($rootScope.allRoomData[i].amenities) {
                  var amenities = $rootScope.allRoomData[i].amenities.split(',');
                  if (amenities.length) {
                    amenities.forEach(function(item) {
                      var found = $filter('filter')($rootScope.allAmenitiesData, {'am_guid':item}); 
                      if (found.length) {
                        $rootScope.allRoomData[i].selectedAmenities[item] = item;
                        $rootScope.allRoomData[i].selectedAmenitiesData.push({'name':found[0].amenities,'image':found[0].am_image});
                      }
                    });
                  }
                }
              }
            }
          })
          .error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
         },450);
      })
      .error(function(data1, status1, headers1, config1) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Locations */
    /**
      * @module : Setting
      * @desc   : Get Locations
      * @return : Return Locations
      * @author : Softweb solutions - Alpeshsinh Solnaki
    */
    $scope.getOfficeLocations = function() {
        $scope.saveurl = $scope.baseurl+"/location/allOfficeLocations/"+localStorage.getItem("uc_guid");

      $http.get($scope.saveurl).success(function(result, status, headers, config) {
        $timeout(function(){
          $scope.allOfficeLocations = result.data;
          $rootScope.allOfficeLocations = $scope.allOfficeLocations;
          $scope.canShowLocationRecords = 1;
          $rootScope.massLocationData = {};
          if (result.data.length > 0) {
            $scope.userData.officeLocation = parseInt(result.data[0].id);  
          }          
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }

    /**
      * @module : Setting
      * @desc   : Get Floor name
      * @return : Return Floor name
      * @author : Softweb solutions - Mayank Patel
    */
    $scope.getFloorList = function() {
      $scope.saveurl = $scope.baseurl+"/location/getFloorList";
      $http.get($scope.saveurl).success(function(result, status, headers, config) {
        console.log("---Get floor---");
        $scope.getFloorList = result.data;
        console.log($scope.getFloorList);
        console.log("---Get floor---");
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }

    $scope.getSpaces = function() {
      $http.get($scope.baseurl+"/location/allSpacesOfUserForListing/"+localStorage.getItem("uc_guid")+"/"+$rootScope.dataid)
      .success(function(result, status, headers, config) {
        $timeout(function(){
          $scope.allSpaces = result.data;
          $rootScope.allSpaces = $scope.allSpaces;
          $scope.canShowSpaceRecords = 1;
          $rootScope.massSpaceData = {};
          var begin = (($scope.currentPage - 1) * $scope.numPerPage);
          var end = begin + $scope.numPerPage;
          $scope.filteredSpaces = $rootScope.allSpaces.slice(begin,end);
           //console.log("---------->"+$rootScope.allAmenitiesData.length);

           $http.get($scope.baseurl+"/amenities/allAmenities/")
            .success(function(result1, status1, headers1, config1) {
              $timeout(function(){
                $scope.allAmenities = result1.data;
                $rootScope.allAmenitiesData = $scope.allAmenities;

                if ($rootScope.allSpaces.length && $rootScope.allAmenitiesData.length) {
                  for (var i = 0;i < $rootScope.allSpaces.length; i++) {
                    $rootScope.allSpaces[i].selectedAmenitiesData = [];
                    $rootScope.allSpaces[i].selectedAmenities = [];
                    if($rootScope.allSpaces[i].amenities) {
                      var amenities = $rootScope.allSpaces[i].amenities.split(',');
                      if (amenities.length) {
                        amenities.forEach(function(item) {
                          var found = $filter('filter')($rootScope.allAmenitiesData, {'am_guid':item}); 
                          if (found.length) {
                            $rootScope.allSpaces[i].selectedAmenities[item] = item;
                            $rootScope.allSpaces[i].selectedAmenitiesData.push({'name':found[0].amenities,'image':found[0].am_image});
                          }
                        });
                      }
                    }
                  }
                }

               },450);
            })
            .error(function(data1, status1, headers1, config1) {
              Notifier.error('Something went wrong. Please try again..');
            });

           

        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }    
        
   // $scope.getSpaces();

   $scope.getOfficeLocations();
   $scope.getFloorList();
    $timeout(function(){
      $scope.getSpaces();     
    },500);
    $timeout(function(){
      $scope.getAmenities();
    },1000);

      $scope.$watch('currentPage + numPerPage', function() {
       
      var begin = (($scope.currentPage - 1) * $scope.numPerPage);
      var end = begin + $scope.numPerPage;
      
      
      if($rootScope.allSpaces) {
        $scope.filteredSpaces = $rootScope.allSpaces.slice(begin, end);  
      }
      
       });


    $scope.pageChanged = function() {
      
      console.log('Page changed to: ' + $scope.currentPage);
       //return Math.ceil($rootScope.allSpaces.length / $scope.numPerPage);
    };

    $scope.$watch('currentPage1 + numPerPage1', function() {
       
      var begin = (($scope.currentPage1 - 1) * $scope.numPerPage1);
      var end = begin + $scope.numPerPage1;
      if($rootScope.allRoomData) {
        $scope.filteredAmenities = $rootScope.allRoomData.slice(begin, end);
      }

      
       });

      $scope.pageChanged2 = function() {
        
        console.log('Page changed to: ' + $scope.currentPage1);
         //return Math.ceil($rootScope.allSpaces.length / $scope.numPerPage);
      };
    

    
    

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Add New Amenities */
    /**
      * @module : Setting
      * @desc   : Open Popup For Add New Amenities
      * @return : Return redirect on add view
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addAmenitiesPopup = function (id) {
      $rootScope.isClicked=0;
      $rootScope.addAmenitiesData = [];
      $rootScope.editAmenitiesValue = 0;
      ngDialog.open({
        template: 'partials/amenities_popup.html',
        controller: 'SettingsController'              
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open room's amenities popup with detail for edit*/
    /**
      * @module : Setting
      * @desc   : Open room's amenities popup with detail for edit
      * @return : Return redirect on edit view
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.editAmenitiesPopup = function (id) {
      var found = $filter('filter')($scope.allRoomData, {id: id}, true);
      if (found.length) {
        $timeout(function(){
          $rootScope.editAmenitiesData = found[0];
        }, 500)
      }
      else {
        $rootScope.editAmenitiesData = '';
      }
      $rootScope.editAmenitiesValue = 1;
      ngDialog.open({
        template: 'partials/amenities_popup.html',
        controller: 'SettingsController'              
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > add new room's amenities */
    /**
      * @module : Setting
      * @desc   : add new room's amenities
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.addNewAmenities = function() {
      $rootScope.isClicked=1;
      var amenities = $rootScope.addAmenitiesData.amenities;
      
        var found = $filter('filter')($scope.allAmenities, {amenities: amenities}, true);
        if (found.length) {
          $("#fileUpload_lblError2").html("Amenities already exists.");
        }
        else {
          var postData = {};
          postData['amenities'] = amenities.trim();
          postData['image'] = $rootScope.addAmenitiesData.image;
          if($rootScope.addAmenitiesData.image && $rootScope.addAmenitiesData.image.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( $rootScope.addAmenitiesData.image.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#fileUpload_lblError1").html("Please upload valid image file.");
          }          
        } else {
            $("#fileUpload_lblError1").html("Please upload image file.");
        }
      }
        if (amenities && amenities.trim() && checkMimeType >= 0) {
          $scope.addAmenitiesurl = $scope.baseurl+"/amenities/addNewAmenities";
          $http.post($scope.addAmenitiesurl, postData).success(function(data, status, headers, config) {
            ngDialog.close('$escape');
            $scope.getAmenities();
            $scope.displaySpaces = true;
            Notifier.success('Amenities added successfully.');
            /*------//SOFTWEB -------*/
          }).error(function(data, status, headers, config) {
            $rootScope.isClicked=0;
            Notifier.error('Something went wrong. Please try again..');
          });
        }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > update room's amenities */
    /**
      * @module : Setting
      * @desc   : update room's amenities
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.updateRoomAmenities = function(id) {      
      var selectedAmenities = $rootScope.editAmenitiesData.selectedAmenities;
      var amenities = [];
      for (var ame in selectedAmenities) {
        if (selectedAmenities.hasOwnProperty(ame) && selectedAmenities[ame]) {
          amenities.push(selectedAmenities[ame]);
        }
      }

      $rootScope.editAmenitiesData.amenities = amenities.join();
      $scope.saveamenitiesurl = $scope.baseurl+"/amenities/editRoomAmenities";
      $http.post($scope.saveamenitiesurl, $rootScope.editAmenitiesData).success(function(data, status, headers, config) {       
        var current = $state.current;
        var params = angular.copy($stateParams);
        ngDialog.close('$escape');
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
        Notifier.success('Amenities updated successfully.');
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Image upload validation */
    /**
      * @module : Setting
      * @desc   : Image upload validation
      * @return : Return true or false
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.imageValidation = function(filetype,id) {
      var files_size = [];
      var fileUpload = '';
      var allowedFiles = [filetype];
      fileUpload = $("#"+id).val();
      if (fileUpload!='') {
        var extension = fileUpload.split('.').pop().toLowerCase();
        var checkextension = jQuery.inArray( extension, allowedFiles );
        if (checkextension < 0) {
          $("#"+id+"_lblError1").html("You are using invalid extension.");
          $rootScope.isDisabledSavebtn = true;
        }
        else {
          $("#"+id+"_lblError1").html('');  
          $("#"+id+"_lblError1").html('');
          $rootScope.isDisabledSavebtn = false;
        }
      }
      else {
        Notifier.success('Please Select Files.');
        $rootScope.isDisabledSavebtn = true;
      }
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Add New Office Location */
    /**
      * @module : Setting
      * @desc   : Open Popup For Add New Office Location
      * @return : Return redirect on add view
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addLocationPopup = function () {
      $rootScope.isClicked = 0;
      $rootScope.officeLocationData = {};
      $rootScope.officeLocationData.address ='';
      $rootScope.editOfficeLocationValue = 0;
      ngDialog.open({
        template: 'partials/office_location_popup.html',
        controller: 'SettingsController'              
      });
    }
    /*code added by Dhaval Thaker <alpesh.solanki@softwebsolutions.com > Open Popup For Edit Office Location*/    
    /**   
      * @module : Setting   
      * @desc   : Open Popup For Edit Floor   
      * @return : Return redirect on edit view    
      * @author : Softweb solutions - Dhaval Thaker   
    */    
    $scope.editFloorPopup = function (id) {   
    var found = $filter('filter')($rootScope.allFloors, {id: id}, true);    
      if (found.length) {   
        //$timeout(function(){    
          $rootScope.floorData = found[0];  
          $scope.setBuildingFloor(found[0].locationid); 
        //}, 500);    
      }   
      else {    
        $rootScope.floorData = {};    
        $rootScope.allLocationData = $scope.allOfficeLocations;   
      }   
      $rootScope.allLocationData = $scope.allOfficeLocations;   
      console.log('--------');    
      console.log($scope.allLocationData);    
      $rootScope.editfloorValue = 1;    
      ngDialog.open({   
        template: 'partials/floor_popup.html',    
        controller: 'SettingsController'  ,
        scope:$scope                  
      });   
    }
     
    /* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Open Popup For Add New Office Location */    
    /**   
      * @module : Setting   
      * @desc   : Open Popup For Add New Floor    
      * @return : Return redirect on add view   
      * @author : Softweb solutions - Dhaval Thaker   
    */    
    $scope.addFloorPopup = function () {    
      $rootScope.isClicked = 0;   
      $rootScope.floorData = {};    
      $rootScope.editfloorValue = 0;    
      $scope.allLocationData = $scope.allOfficeLocations;   
      $scope.floorData.capacity = 0;    
      ngDialog.open({   
        template: 'partials/floor_popup.html',    
        controller: 'SettingsController',   
        scope:$scope                  
      });   
    }



    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Edit Office Location*/
    /**
      * @module : Setting
      * @desc   : Open Popup For Edit Office Location
      * @return : Return redirect on edit view
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.editLocationPopup = function (id) {
      var found = $filter('filter')($scope.allOfficeLocations, {id: id}, true);
      if (found.length) {
        //$timeout(function(){
          $rootScope.officeLocationData = found[0];
        //}, 500);
      }
      else {
        $rootScope.officeLocationData = {};
        $rootScope.officeLocationData.address='';
      }
      $rootScope.editOfficeLocationValue = 1;
      ngDialog.open({
        template: 'partials/office_location_popup.html',
        controller: 'SettingsController'              
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add New Office Location */
    /**
      * @module : Setting
      * @desc   : Add New Office Location
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.addOfficeLocation = function() {
      $rootScope.isClicked = 1;
      var userid = localStorage.getItem("uc_guid");
      var name = $rootScope.officeLocationData.name;
      var address = $rootScope.officeLocationData.address; 
      var floors = $rootScope.officeLocationData.floors;            
      if (name && name.trim()) {
        var isSaveLocation = true;
        var found = $filter('filter')($scope.allOfficeLocations, {name: name}, true);
        if (found.length) {
          $("#name_span_error").html("Location already exists.");
          isSaveLocation = false;
        }
        if($rootScope.officeLocationData.newimage && $rootScope.officeLocationData.newimage.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( $rootScope.officeLocationData.newimage.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#locationImage_lblError1").html("Please upload valid image file.");
            isSaveLocation = false;
          }          
        }
        if (isSaveLocation) {
          $rootScope.officeLocationData.name = name.trim();
          $rootScope.officeLocationData.address = address;
       if (!$rootScope.officeLocationData.floors) {   
            $rootScope.officeLocationData.floors = '0';   
          }
          if (!$rootScope.officeLocationData.note) {
            $rootScope.officeLocationData.note = '';
          }
          $scope.addOfficeLocationurl = $scope.baseurl+"/location/addOfficeLocation";
          $http.post($scope.addOfficeLocationurl, {officeLocationData:$rootScope.officeLocationData,userid:userid}).success(function(data, status, headers, config) {
            /*var current = $state.current;
            var params = angular.copy($stateParams);
            ngDialog.close('$escape');
            $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });*/
             ngDialog.close('$escape'); //SOFTWEB
            $scope.getOfficeLocations(); //SOFTWEB
            Notifier.success('Location added successfully.');
            $state.reload();
          }).error(function(data, status, headers, config) {
            $rootScope.isClicked = 0;
            Notifier.error('Something went wrong. Please try again..');
          });
        }
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Update Office Location */
    /**
      * @module : Setting
      * @desc   : Update Office Location
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.updateOfficeLocation = function(id) {      
      var name = $rootScope.officeLocationData.name;
      var address = $rootScope.officeLocationData.address;
      var floors = $rootScope.officeLocationData.floors;
      if (name && name.trim()) {
        var isSaveLocation = true;
        var found = $filter('filter')($scope.allOfficeLocations, {name: name}, true);
        if (found.length) {
          found.forEach(function(item) {
            if(isSaveLocation) {
              if($rootScope.officeLocationData.id != item.id) {
                isSaveLocation = false;
                $("#name_span_error").html("Location already exists.");
              }
            }                        
          });          
        }

        if($rootScope.officeLocationData.newimage && $rootScope.officeLocationData.newimage.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( $rootScope.officeLocationData.newimage.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#locationImage_lblError1").html("Please upload valid image file.");
            isSaveLocation = false;
          }          
        }
        if(isSaveLocation) {
          $rootScope.officeLocationData.id = id;
          $rootScope.officeLocationData.name = name.trim();
          $rootScope.officeLocationData.address = address.trim();
          $scope.editOfficeLocationurl = $scope.baseurl+"/location/updateOfficeLocation";
          $http.post($scope.editOfficeLocationurl, $rootScope.officeLocationData).success(function(data, status, headers, config) {
            ngDialog.close('$escape'); //SOFTWEB
            $scope.getOfficeLocations(); //SOFTWEB
            Notifier.success('Location updated successfully.');
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
        }       
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Delete Office Location */
    /**
      * @module : Setting
      * @desc   : Delete Office Location
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
$rootScope.deleteOfficeLocation = function(id) {
      $scope.getOfficeLocations();
      ngDialog.openConfirm({
          template:
            '<div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="myModal" class="modal box-typical fade in" style="display: block;"><div class="modal-dialog box-typical-dashboard" role="document"><div class="modal-content"> <header class="box-typical-header modal-header"><div class="tbl-row"><div class="tbl-cell tbl-cell-title"><h3>Are you sure you want to delete this Building?</h3></div><div class="tbl-cell tbl-cell-actions"><button type="button" ng-click="closeThisDialog(0);" class="action-btn" data-dismiss="modal" aria-label="Close"><i class="font-icon font-icon-close ngdialog-close"></i></button></div></header><div class="modal-body"><div class="modal-footer" style="padding:0px;text-align:left;"><div class="row"><div class="col-md-5"><button type="button" class="btn btn-primary" ng-click="closeThisDialog(0)">No&nbsp;</button><button type="button" class="btn btn-primary" ng-click="confirm('+id+')">Yes</button></div></div></div> </div></div></div></div>' ,
            plain: true,
            closeByDocument: true,
            closeByEscape: true,
          className: 'ngdialog-theme-default'
      }).then(function (id) {
          var postData = {'id':id};
        $scope.deleteOfficeLocationurl = $scope.baseurl+"/location/deleteOfficeLocation";
        $http.post($scope.deleteOfficeLocationurl, postData).success(function(data, status, headers, config) {
          if (data.type == 'success') {
            $scope.getOfficeLocations(); //SOFTWEB
            Notifier.success('Building deleted successfully.');
          }
          else {
            if (data.message) {
              Notifier.error(data.message);
            }
            else {
              Notifier.error('Something went wrong. Please try again.');
            }
            
          }
        }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
        });
      }, function (value) {
         
      });
    }

    /*code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Mass Delete Space  */
    /**
      * @module : Setting
      * @desc   : Mass Delete Space
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.massDeleteLocation = function(massLocationData) {

      var ids = [];
      for (var id in massLocationData) {
        if (massLocationData.hasOwnProperty(id) && massLocationData[id]) {
          ids.push(massLocationData[id]);
        }
      }
        if(ids.length > 0)   
        {
         ngDialog.openConfirm({
                template:
                  '<div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="myModal" class="modal box-typical fade in" style="display: block;"><div class="modal-dialog box-typical-dashboard" role="document"><div class="modal-content"> <header class="box-typical-header modal-header"><div class="tbl-row"><div class="tbl-cell tbl-cell-title"><h3>Are you sure you want to delete this location?</h3></div><div class="tbl-cell tbl-cell-actions"><button type="button" ng-click="closeThisDialog(0);" class="action-btn" data-dismiss="modal" aria-label="Close"><i class="font-icon font-icon-close ngdialog-close"></i></button></div></header><div class="modal-body"><div class="modal-footer" style="padding:0px;text-align:left;"><div class="row"><div class="col-md-5"><button type="button" class="btn btn-primary" ng-click="closeThisDialog(0)">No&nbsp;</button><button type="button" class="btn btn-primary" ng-click="confirm()">Yes</button></div></div></div> </div></div></div></div>' ,
                  plain: true,
                  closeByDocument: true,
                  closeByEscape: true,
                className: 'ngdialog-theme-default'
            }).then(function (value) {
              
                
                if (ids.length) {
                  var postData = {'ids':ids};
                  $scope.massDeleteLocationUrl = $scope.baseurl+"/location/massDeleteLocation";
                  $http.post($scope.massDeleteLocationUrl, postData).success(function(data, status, headers, config) {
                    $scope.getOfficeLocations(); //SOFTWEB
                    Notifier.success('Location(s) deleted successfully.');
                  }).error(function(data, status, headers, config) {
                    Notifier.error('Something went wrong. Please try again..');
                  });
                }
            }, function (value) {
               
            });
        }
        else
        {
          alert("Please Select Location(s)");                
        }   
      
    }

    /*code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Set Floor As per Buildinng  */
    /**
      * @module : Setting
      * @desc   : Set Floor
      * @return : -
      * @author : Softweb solutions - Dhaval Thaker
    */

    $scope.setMaxFloor = function() {
      $scope.saveurl = $scope.baseurl+"/location/setMaxFloor";
      $http.get($scope.saveurl).success(function(result, status, headers, config) {
        $scope.setMaxFloor = result.data;
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }
    $scope.setMaxFloor();

    $scope.setBuildingFloor = function (id) {
      if (!parseInt(id) || !$scope.setMaxFloor || !$scope.setMaxFloor.length) {
        return;
      }

      var found = $filter('filter')($scope.setMaxFloor, {'id':parseInt(id)},true);
      
      if (found.length) {
        if (found[0].id == id) {

          $rootScope.maxFloor = parseInt(found[0].floors);
          
        }
      }
    }    
    $scope.setBuildingFloor();

    
   $scope.setFloor = function (id) {     
      if (!parseInt(id) || !$scope.allFloors || !$scope.allFloors.length) {
        return;
      }      
      var found = $filter('filter')($scope.allFloors, {'locationid':parseInt(id)},true);
      if(found.length > 0)
      {
        $scope.allFloorList = found;
      }
      else
      {
        $scope.allFloorList = '';
        $scope.spaceData.floorid='';
      }
   }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Add New Spaces */
    /**
      * @module : Setting
      * @desc   : Open Popup For Add New Spaces
      * @return : Return redirect on add view
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addSpacePopup = function () {
      $rootScope.isClicked=0;
      $scope.spaceData = {};
      $scope.spaceData.space_status = 1;
      $scope.spaceData.size = '0.5';
      $scope.spaceData.location_id = '';
      $scope.spaceData.capacity = 1;
      $scope.spaceData.space_type = '';
      $scope.spaceData.notes = '';
      $scope.editSpaceValue = 0;
      $scope.allLocationData = $scope.allOfficeLocations;
       $scope.allFloorList = $scope.allFloorList;
      $scope.amenitiesDivHide = false;
      ngDialog.open({
        template: 'partials/space_popup.html',
        controller: 'SettingsController',
        scope:$scope
      });
    }

    $scope.amenitiesToggle = function () {
      console.log($scope.amenitiesDivHide);
      
      if($scope.amenitiesDivHide == true)
      {
        $scope.amenitiesDivHide = false;
      }
      else
      {
        $scope.amenitiesDivHide = true;
      }
      //$("#amenitiesToggleID").toggle();
    }


    /**
      * @module : Setting
      * @desc   : Update User Role
      * @return : -
      * @author : Softweb solutions - Jeel Joshi<jeel.joshi@softwebsolutions.com>
    */
    $scope.saveUserRole = function (role,peopleid) {
      var role_id = '';
      if(role == 'Admin') {
        role_id = 1;
      }
      else {
        role_id = 0;
      }
      $scope.addRoleUrl = $scope.baseurl+"/people/addUserRole";
          $http.post($scope.addRoleUrl, {role:role,peopleid:peopleid}).success(function(data, status, headers, config) { 
            $http.post($scope.baseurl+"/mobservices/SoftwebHOQUpdateUser", {au_isadmin:role_id,au_guid:peopleid, uc_password: null, au_rolename: role}).success(function(result, status, headers, config) {
               Notifier.success('User Role updated successfully.');
            }).error(function(result, status, headers, config) {
          
             });           
           
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
    }

     /**
      * @module : Setting
      * @desc   : Update User Location
      * @return : -
      * @author : Softweb solutions - Jeel Joshi<jeel.joshi@softwebsolutions.com>
    */
    $scope.saveUserLocation = function (locationid,peopleid) {
      if(locationid){
        $scope.addRoleUrl = $scope.baseurl+"/people/addUserLocation";
          $http.post($scope.addRoleUrl, {locationid:locationid,peopleid:peopleid}).success(function(data, status, headers, config) {           
           Notifier.success('User Location updated successfully.');
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
      }
    }

   
    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Edit Space*/
    /**
      * @module : Setting
      * @desc   : Open Popup For Edit Space
      * @return : Return redirect on edit view
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
$scope.editSpacePopup = function (id) {
      var found = $filter('filter')($scope.allSpaces, {id: id}, true);
      $scope.allFloorList = $scope.allFloorList;
      if (found.length) {
          $scope.spaceData = found[0];
    $scope.setFloor(found[0].location_id);
          $scope.allFloorList = $scope.allFloorList;
      }
      else {
        $scope.spaceData = {};
        $scope.spaceData.space_status = 1;
        $scope.spaceData.size = '0.5';
        $scope.spaceData.location_id = '';
        $scope.spaceData.floorid = '';
        $scope.spaceData.capacity = 1;
        $scope.spaceData.space_type = '';
        $scope.spaceData.notes = '';
        $scope.editSpaceValue = 0;
        $scope.allLocationData = $scope.allOfficeLocations;
        $scope.allFloorList = $scope.allFloorList;
        $scope.amenitiesDivHide = false;
      }
      $scope.allLocationData = $scope.allOfficeLocations;
      $scope.allFloorList = $scope.allFloorList;
      $scope.editSpaceValue = 1;
      ngDialog.open({
        template: 'partials/space_popup.html',
        controller: 'SettingsController',
        scope:$scope
      });
    }

    $scope.getOfficeName = function() {
      $http.post($scope.baseurl+"/office/getOfficeName", 
      {
       userid: localStorage.getItem("uc_guid"),
        au_isadmin: localStorage.getItem("au_isadmin")
      })
      .success(function(result, status, headers, config) {
        if(result.length > 0){
          $rootScope.officename = result[0].OfficeName;
          $rootScope.officeid = result[0].id;
          $rootScope.officeAdminemail = result[0].email;
          $rootScope.UserName = result[0].name;
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

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add New Space */
    /**
      * @module : Setting
      * @desc   : Add New Space
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addSpace = function(spaceData) {
      $rootScope.isClicked=1;
      var userid = localStorage.getItem("uc_guid");
      var name = spaceData.name;
      var locationid = spaceData.location_id;

      if (name && name.trim()) {
        var isSaveSpace = true;
        /*code added by Dhaval Thaker <dhaval.thake@softwebsolutions.com > Check Space*/
        $scope.checkRoomAvailabilityUrl = $scope.baseurl+"/location/checkSpaceAvailability";
          $http.post($scope.checkRoomAvailabilityUrl, {name:name,locationid:locationid})
          .success(function(availabilityResult, status, headers, config) {
            console.log("No Of Length"+availabilityResult.data.length);
            if (availabilityResult.data.length > 0) {
              Notifier.error('Space already booked for this Location.');
              //alert('Space already booked for this Location.');
              $("#name_span_error").html("Location already exists.");
              isSaveSpace = false;
          }
          /*End Code*/
          if(spaceData.newimage && spaceData.newimage.filename) {
            var allowMimeType = ['image/jpeg','image/png'];
            var checkMimeType = jQuery.inArray( spaceData.newimage.filetype, allowMimeType );
            if (checkMimeType < 0) {
              $("#spaceImage_lblError1").html("Please upload valid image file.");
              isSaveSpace = false;
            }          
          }
          if (isSaveSpace) {
            spaceData.name = name.trim();
            if (!spaceData.image) {
              spaceData.image = '';
            }

            // Update amenities
            var selectedAmenities = spaceData.selectedAmenities;
            var amenities = [];
            for (var ame in selectedAmenities) {
              if (selectedAmenities.hasOwnProperty(ame) && selectedAmenities[ame]) {
                amenities.push(selectedAmenities[ame]);
              }
            }

            spaceData.amenities = amenities.join();

            $scope.addSpaceUrl = $scope.baseurl+"/location/addSpace";
            $http.post($scope.addSpaceUrl, {spaceData:spaceData,userid:userid}).success(function(data, status, headers, config) {
              ngDialog.close('$escape'); //SOFTWEB
              $scope.getSpaces(); //SOFTWEB
              Notifier.success('Space added successfully.');
            }).error(function(data, status, headers, config) {
              $rootScope.isClicked=0;
              Notifier.error('Something went wrong. Please try again..');
            });
          }
          });
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Update Space */
    /**
      * @module : Setting
      * @desc   : Update Space
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    
   $scope.updateSpace = function(id,spaceData) {
      var name = spaceData.name;
      var locationid = spaceData.location_id;
      var id = spaceData.id;
      if (name && name.trim()) {
        var isSaveSpace = true;
        /*code added by Dhaval Thaker <dhaval.thake@softwebsolutions.com > Check Space*/
         $scope.checkRoomAvailabilityUrl = $scope.baseurl+"/location/checkSpaceAvailability";
          $http.post($scope.checkRoomAvailabilityUrl, {name:name,locationid:locationid,id:id})
          .success(function(availabilityResult, status, headers, config) {
            console.log("No Of Length"+availabilityResult.data.length);
            if (availabilityResult.data.length > 0) {
              Notifier.error('Space already booked for this Location.');
              //alert('Space already booked for this Location.');
              $("#name_span_error").html("Space already exists.");
              isSaveSpace = false;
          }
          /*End code*/
        if(spaceData.newimage && spaceData.newimage.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( spaceData.newimage.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#spaceImage_lblError1").html("Please upload valid image file.");
            isSaveSpace = false;
          }
        }
        if(isSaveSpace) {
          spaceData.id = id;
          spaceData.name = name.trim();

          // Update amenities
          var selectedAmenities = spaceData.selectedAmenities;
          var amenities = [];
          for (var ame in selectedAmenities) {
            if (selectedAmenities.hasOwnProperty(ame) && selectedAmenities[ame]) {
              amenities.push(selectedAmenities[ame]);
            }
          }

          spaceData.amenities = amenities.join();
          $scope.editSpaceUrl = $scope.baseurl+"/location/updateSpace";
          $http.post($scope.editSpaceUrl, spaceData).success(function(data, status, headers, config) {
            //var current = $state.current;
            //var params = angular.copy($stateParams);
            ngDialog.close('$escape'); //SOFTWEB
            $scope.getSpaces(); //SOFTWEB
            //$state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
            Notifier.success('Space updated successfully.');
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
         }
        });
      }      
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Delete Space */
    /**
      * @module : Setting
      * @desc   : Delete Space
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.deleteSpace = function(id) {
      ngDialog.openConfirm({
          template:
            '<div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="myModal" class="modal box-typical fade in" style="display: block;"><div class="modal-dialog box-typical-dashboard" role="document"><div class="modal-content"> <header class="box-typical-header modal-header"><div class="tbl-row"><div class="tbl-cell tbl-cell-title"><h3>Are you sure you want to delete this space?</h3></div><div class="tbl-cell tbl-cell-actions"><button type="button" ng-click="closeThisDialog(0);" class="action-btn" data-dismiss="modal" aria-label="Close"><i class="font-icon font-icon-close ngdialog-close"></i></button></div></header><div class="modal-body"><div class="modal-footer" style="padding:0px;text-align:left;"><div class="row"><div class="col-md-5"><button type="button" class="btn btn-primary" ng-click="closeThisDialog(0)">No&nbsp;</button><button type="button" class="btn btn-primary" ng-click="confirm('+id+')">Yes</button></div></div></div> </div></div></div></div>' ,
            plain: true,
            closeByDocument: true,
            closeByEscape: true,
          className: 'ngdialog-theme-default'
      }).then(function (id) {
        var postData = {'id':id};
        $scope.deleteSpaceUrl = $scope.baseurl+"/location/deleteSpace";
        $http.post($scope.deleteSpaceUrl, postData).success(function(data, status, headers, config) {
          if (data.type == 'success') {
            $scope.getSpaces(); //SOFTWEB
            Notifier.success('Space deleted successfully.');
          }
          else {
            if (data.message) {
              Notifier.error(data.message);
            }
            else {
              Notifier.error('Something went wrong. Please try again.');
            }            
          } 
        }).error(function(data, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });    
      }, function (value) {
         
      });      
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Mass Delete Space  */
    /**
      * @module : Setting
      * @desc   : Mass Delete Space
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.massDeleteSpace = function(massSpaceData) {
      var ids = [];
      for (var id in massSpaceData) {
        if (massSpaceData.hasOwnProperty(id) && massSpaceData[id]) {
          ids.push(massSpaceData[id]);
        }
      }

      if(ids.length > 0)
      {
       ngDialog.openConfirm({
          template:
            '<div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="myModal" class="modal box-typical fade in" style="display: block;"><div class="modal-dialog box-typical-dashboard" role="document"><div class="modal-content"> <header class="box-typical-header modal-header"><div class="tbl-row"><div class="tbl-cell tbl-cell-title"><h3>Are you sure you want to delete this space?</h3></div><div class="tbl-cell tbl-cell-actions"><button type="button" ng-click="closeThisDialog(0);" class="action-btn" data-dismiss="modal" aria-label="Close"><i class="font-icon font-icon-close ngdialog-close"></i></button></div></header><div class="modal-body"><div class="modal-footer" style="padding:0px;text-align:left;"><div class="row"><div class="col-md-5"><button type="button" class="btn btn-primary" ng-click="closeThisDialog(0)">No&nbsp;</button><button type="button" class="btn btn-primary" ng-click="confirm()">Yes</button></div></div></div> </div></div></div></div>' ,
            plain: true,
            closeByDocument: true,
            closeByEscape: true,
          className: 'ngdialog-theme-default'
          }).then(function (value) {
           
           if (ids.length) {
              var postData = {'ids':ids};
              $scope.massDeleteSpaceUrl = $scope.baseurl+"/location/massDeleteSpace";
              $http.post($scope.massDeleteSpaceUrl, postData).success(function(data, status, headers, config) {
                $scope.getSpaces(); //SOFTWEB
                Notifier.success('Space(s) deleted successfully.');
              }).error(function(data, status, headers, config) {
                Notifier.error('Something went wrong. Please try again..');
              });
            }
          }, function (value) {
             
          });
        }
        else
        {
          alert("Please Select Space(s)");
        }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Select Unselect All Checkbox */
    /**
      * @module : Setting
      * @desc   : Select Unselect All Checkbox
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
     $rootScope.selectUnselectCheckboxAll = function(isChecked) {
      
       var isChecked = $(".isAllselectSpace").prop('checked');
       var allCheckboxs = $('.space-checkbox');
        for (var i = 0; i < allCheckboxs.length; i++) {
          if(isChecked == true){
            if(!$(allCheckboxs[i]).prop('checked')){
              allCheckboxs[i].click();
            }
          }else{
            if($(allCheckboxs[i]).prop('checked')){
              allCheckboxs[i].click();
            }
          }
        }

        $('.isAllselectSpace').on('click',function(){
          if(this.checked){
              $('.space-checkbox').each(function(){
                  this.checked = true;
              });
          }else{
               $('.space-checkbox-device').each(function(){
                  this.checked = false;
              });
          }
      });
      
      $('.space-checkbox').on('click',function(){
          if($('.space-checkbox:checked').length == $('.space-checkbox').length){
              $('.isAllselectSpace').prop('checked',true);
          }else{
              $('.isAllselectSpace').prop('checked',false);
          }
      });
    
    }

     /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Show Invite New Members Form */
    /**
      * @module : Setting
      * @desc   : Show Invite New Members Form
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.showInviteMemberForm = function () {
      $scope.inviteMemberListing = 0;
      $scope.inviteMemberForm = 1;
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Show Members Listing */
    /**
      * @module : Setting
      * @desc   : Show Members Listing
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.showInviteMemberListing = function () {
      $scope.inviteMemberListing = 1;
      $scope.inviteMemberForm = 0;
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add Email into Invite Member Data */
    /**
      * @module : Setting
      * @desc   : Add Email into Invite Member Data
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addEmailIntoInviteMemberData = function (email) {
      if (!email) {
        return; 
      }

      var isAddEmail = true;
      var  validate = $scope.validateEmail(email);
      if ($scope.inviteMemberData && $scope.inviteMemberData.length) {
        for(var i = 0; i < $scope.inviteMemberData.length; i++) {
          if ($scope.inviteMemberData[i].email == email) {
            isAddEmail = false;
          }
        }
      }
      if (isAddEmail && validate == true) {
        $scope.inviteMemberData.push({email : email});
        $scope.inviteMemberEmail = '';
      }
    };

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add Email into Invite Member Data When Press Enter */
    /**
      * @module : Setting
      * @desc   : Add Email into Invite Member Data When Press Enter
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addEmailIntoInviteMemberDataWhenEnter = function (event,email) {
      if (email && event.keyCode == 13) { 
        var isAddEmail = true; 
        var  validate = $scope.validateEmail(email);
        if ($scope.inviteMemberData && $scope.inviteMemberData.length) {
          for(var i = 0; i < $scope.inviteMemberData.length; i++) {
            if ($scope.inviteMemberData[i].email == email) {
              isAddEmail = false;
            }
          }
        }

        if (isAddEmail && validate == true) {
          $scope.inviteMemberData.push({email : email});
          $scope.inviteMemberEmail = '';
        }
      }
    };

    $scope.validateEmail = function(mail) {
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (mail.match(mailformat)) {
            return true;
        }
        return false;  
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Remove Email From Invite Member Data */
    /**
      * @module : Setting
      * @desc   : Remove Email From Invite Member Data
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.removeEmailFromInviteMemberData = function (email) {
      if (!email) {
        return;
      }
      var attendData = [];
      if ($scope.inviteMemberData && $scope.inviteMemberData.length) {
        for(var i = 0; i < $scope.inviteMemberData.length; i++) {
          if(email != $scope.inviteMemberData[i].email) {
            attendData.push({email : $scope.inviteMemberData[i].email});
          }
        }
      }
      $scope.inviteMemberData = attendData;
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Invite New Member */
    /**
      * @module : Setting
      * @desc   : Invite New Member
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.inviteNewMember = function(inviteMemberData) {
      var userid = localStorage.getItem("uc_guid");
      $http.get($scope.baseurl+"/people/getUserUsingGuid/"+userid)
      .success(function(data, status, headers, config) {
        if(data.data.length) {
          var officeid = data.data[0].officeid;
          if (parseInt(officeid) > 0) {
            $scope.addUrl = $scope.baseurl+"/invitation/invite";
            $http.post($scope.addUrl, {addInviteData: inviteMemberData,userid:userid,officeid:officeid})
            .success(function(data1, status1, headers1, config1) {
              
              $scope.inviteMemberData = [];
              $scope.displayUser = true;
              $scope.showInviteMemberListing();
              Notifier.success('Email sent successfully.');
              
            }).error(function(data1, status1, headers1, config1) {
              Notifier.error('Something went wrong. Please try again..');
            });
          }
          else {
            Notifier.error('Something went wrong. Please try again..');
          }
                    }
        else {
          Notifier.error('Something went wrong. Please try again..');
        }
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });          
    };

    /*code added by Jeel Joshi <jeel.joshi@softwebsolutions.com >  */
    /**
      * @module : Setting
      * @desc   : Mass Delete Device
      * @return : -
      * @author : Softweb solutions
    */
    $rootScope.massDeleteDevice = function(massDeviceData) {
      var ids = [];
      for (var id in massDeviceData) {
        if (massDeviceData.hasOwnProperty(id) && massDeviceData[id]) {
          ids.push(massDeviceData[id]);
        }
      }
      if (ids.length > 0) {
        ngDialog.openConfirm({
              template:
                '<div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="myModal" class="modal box-typical fade in" style="display: block;"><div class="modal-dialog box-typical-dashboard" role="document"><div class="modal-content"> <header class="box-typical-header modal-header"><div class="tbl-row"><div class="tbl-cell tbl-cell-title"><h3>Are you sure you want to delete this device?</h3></div><div class="tbl-cell tbl-cell-actions"><button type="button" ng-click="closeThisDialog(0);" class="action-btn" data-dismiss="modal" aria-label="Close"><i class="font-icon font-icon-close ngdialog-close"></i></button></div></header><div class="modal-body"><div class="modal-footer" style="padding:0px;text-align:left;"><div class="row"><div class="col-md-5"><button type="button" class="btn btn-primary" ng-click="closeThisDialog(0)">No&nbsp;</button><button type="button" class="btn btn-primary" ng-click="confirm()">Yes</button></div></div></div> </div></div></div></div>' ,
                plain: true,
                closeByDocument: true,
                closeByEscape: true,
              className: 'ngdialog-theme-default'
          }).then(function (value) {
              if (ids.length) {
                  var postData = {'ids':ids};
                  $scope.massDeleteDeviceUrl = $scope.baseurl+"/location/massDeleteDevice";
                  $http.post($scope.massDeleteDeviceUrl, postData).success(function(data, status, headers, config) {                    
                    $scope.getAllDeviceData(); //SOFTWEB
                    Notifier.success('Device(s) deleted successfully.');
                  }).error(function(data, status, headers, config) {
                    Notifier.error('Something went wrong. Please try again..');
                  });
                }
              }, function (value) {
                 
              });
      }
      else
      {
        alert("Please Select Device(s)");              
      }
    }

    /*code added by Jeel Joshi <jeel.joshi@softwebsolutions.com > Select Unselect All Checkbox */
    /**
      * @module : Setting
      * @desc   : Select Unselect All Checkbox
      * @return : -
      * @author : Softweb solutions
    */
   $rootScope.selectUnselectCheckboxAllDevice = function(isChecked) {


      var isChecked = $(".isAllselect").prop('checked');
      var allCheckboxs = $('.space-checkbox-device');
      for (var i = 0; i < allCheckboxs.length; i++) {
        //allCheckboxs[i].click();
        if(isChecked == true){
          if(!$(allCheckboxs[i]).prop('checked')){
            allCheckboxs[i].click();
          }
        }else{
          if($(allCheckboxs[i]).prop('checked')){
            allCheckboxs[i].click();
          }
        }
      }

      $('.isAllselect').on('click',function(){
        if(this.checked){
            $('.space-checkbox-device').each(function(){
                this.checked = true;
            });
        }else{
             $('.space-checkbox-device').each(function(){
                this.checked = false;
            });
        }
    });
    
    $('.space-checkbox-device').on('click',function(){
        if($('.space-checkbox-device:checked').length == $('.space-checkbox-device').length){
            $('.isAllselect').prop('checked',true);
        }else{
            $('.isAllselect').prop('checked',false);
        }
    });
          
    }

     $rootScope.selectUnselectCheckboxAllLocation = function(isChecked) {

        var isChecked = $(".isAllselectLocation").prop('checked');
        var allCheckboxs = $('.space-checkbox-location');
        for (var i = 0; i < allCheckboxs.length; i++) {
          //allCheckboxs[i].click();
          if(isChecked == true){
            if(!$(allCheckboxs[i]).prop('checked')){
              allCheckboxs[i].click();
            }
          }else{
            if($(allCheckboxs[i]).prop('checked')){
              allCheckboxs[i].click();
            }
          }
        }

        $('.isAllselectLocation').on('click',function(){
          if(this.checked){
              $('.space-checkbox-location').each(function(){
                  this.checked = true;
              });
          }else{
               $('.space-checkbox-location').each(function(){
                  this.checked = false;
              });
          }
      });
      
      $('.space-checkbox-location').on('click',function(){
          if($('.space-checkbox-location:checked').length == $('.space-checkbox-location').length){
              $('.isAllselectLocation').prop('checked',true);
          }else{
              $('.isAllselectLocation').prop('checked',false);
          }
      });

  }


    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Close Dialog Box */
    /**
      * @module : Setting
      * @desc   : Close Dialog Box
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.closeDialog = function() {
      ngDialog.close('$escape');
      return false;
    }

      /**
  * @module : Office management
  * @desc   : Save office
  * @return : Return notification
  * @author : Softweb solutions
  */
  $rootScope.scheduleMeetingConnect = function() {
    
          var userid = localStorage.getItem("uc_guid");
          $scope.addMeetingUrl = $scope.baseurl+"/settings/scheduleMeetingConnect";
          $http.post($scope.addMeetingUrl, {userid: userid}).success(function(data, status, headers, config) {
            Notifier.success('Schedule meeting added successfully.');
            $timeout(function(){$window.location.href='/index#/dashboard';},1000);
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
       // }
      //}
    };

      /**
    * @module : People management
    * @desc   : Get list of all people
    * @return : Return people list
    * @author : Softweb solutions
    */
    $scope.getAllPeople = function()
    {
      var deferred = $q.defer();
      $scope.saveurl = $scope.baseurl+"/people/getAllUsers/"+localStorage.getItem("uc_guid");
      $http.get($scope.saveurl)
      .success(function(result, status, headers, config) {
        deferred.resolve(result)
        $scope.data = result.data;
        $timeout(function(){
          $scope.allPeople = $scope.data;
          if (result.data.length > 0) {
            $scope.userData.officeLocation = result.data[0].defaultlocationid;  
          }
          var begin = parseInt(($scope.currentPagePeople - 1) * $scope.numPerPagePeople);
          var end = parseInt(begin + $scope.numPerPagePeople);
            if($scope.allPeople) {
              $scope.filteredPeople = $scope.allPeople.slice(begin,end);  
            }

          var begin1 = parseInt(($scope.currentPageNotification - 1) * $scope.numPerPageNotification);
          var end1 = parseInt(begin1 + $scope.numPerPageNotification);
          if($scope.allPeople) {
          $scope.filteredNotification = $scope.allPeople.slice(begin1,end1);  
          }  

        },500);
      })
      .error(function(data, status, headers, config) {
       deferred.reject()
       Notifier.error('Something went wrong. Please try again..');
     });
      return deferred.promise;
    }

     $scope.$watch('currentPagePeople + numPerPagePeople', function() {
       
      var begin = parseInt(($scope.currentPagePeople - 1) * $scope.numPerPagePeople);
      var end = parseInt(begin + $scope.numPerPagePeople);

      if($scope.allPeople) {
        $scope.filteredPeople = $scope.allPeople.slice(begin, end);
      }

      
       });

      $scope.pageChangedPeople = function() {        
        console.log('Page changed to: ' + $scope.pageChangedPeople);
      };

      $scope.$watch('currentPageNotification + numPerPageNotification', function() {
       
      var begin = parseInt(($scope.currentPageNotification - 1) * $scope.numPerPageNotification);
      var end = parseInt(begin + $scope.numPerPageNotification);

      if($scope.allPeople) {
        $scope.filteredNotification = $scope.allPeople.slice(begin, end);
      }      
    });


    $scope.ChangedNofification = function() {        
        console.log('Page changed to: ' + $scope.currentPageNotification);
      };

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Select Unselect People All Checkbox */
    /**
      * @module : Setting
      * @desc   : Select Unselect People All Checkbox
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.selectUnselectPeopleCheckbox = function() {
      var isChecked = $(".check_all_people_checkbox").prop('checked');
      var allCheckboxs = $('.people_checkbox');
      for (var i = 0; i < allCheckboxs.length; i++) {
        //allCheckboxs[i].click();
        if (isChecked == true) {
          if (!$(allCheckboxs[i]).prop('checked')) {
            allCheckboxs[i].click();
          }
        }
        else {
          if ($(allCheckboxs[i]).prop('checked')) {
            allCheckboxs[i].click();
          }
        }
      }

      $('.check_all_people_checkbox').on('click',function() {
        if (this.checked) {
          $('.people_checkbox').each(function() {
            this.checked = true;
          });
        }
        else {
          $('.space-checkbox-device').each(function() {
            this.checked = false;
          });
        }
      });

      $('.people_checkbox').on('click',function() {
        if ($('.people_checkbox:checked').length == $('.people_checkbox').length) {
          $('.check_all_people_checkbox').prop('checked',true);
        }
        else {
          $('.check_all_people_checkbox').prop('checked',false);
        }
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Mass Send Message To People */
    /**
      * @module : Setting
      * @desc   : Mass Send Message To People
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.massSendMessage = function(massPeopleData) {
      $scope.peopledata = {};
      $scope.peopledata.userIds = "";
      $scope.peopledata.userEmails = "";
      var userIds = [];
      var userEmails = [];
      for (var id in massPeopleData) {
        if (massPeopleData.hasOwnProperty(id) && massPeopleData[id]) {
          $scope.peopledata[massPeopleData[id]] = {};
          var found = $filter('filter')($scope.allPeople, {id: massPeopleData[id]}, true);
          if (found.length) {
            $scope.peopledata[massPeopleData[id]] = found[0];
            userIds.push(parseInt(found[0].id));
            userEmails.push(found[0].email);
          }
        }
      }

      if (userIds.length > 0) {
        $scope.peopledata.userIds = userIds.join();
      }

      if (userEmails.length > 0) {
        $scope.peopledata.userEmails = userEmails.join();
      }

      if ($scope.peopledata && $scope.peopledata.userIds && $scope.peopledata.userEmails) {
        ngDialog.open({ 
          template: 'partials/people_popup.html',
          controller: 'SettingsController',
          scope:$scope
        });
      }
    }

        /* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Get Locations */   
    /**   
      * @module : Setting   
      * @desc   : Get Floors    
      * @return : Return Floors   
      * @author : Softweb solutions - Dhaval Thaker   
    */    
    $scope.getFloors = function() {   
        $scope.saveurl = $scope.baseurl+"/location/getFloors/"+localStorage.getItem("uc_guid");   
      $http.get($scope.saveurl).success(function(result, status, headers, config) {   
        $timeout(function(){    
          $scope.allFloors = result.data;   
          $rootScope.allFloors = $scope.allFloors;    
                  
          //$rootScope.massLocationData = {};   
         /* if (result.data.length > 0) {   
            $scope.userData.officeLocation = parseInt(result.data[0].id);     
          }       
          */    
          var begin = (($scope.currentPageFloor -1)  * $scope.numPerPageFloor);   
          var end = begin + $scope.numPerPageFloor;   
          $scope.filteredFloor = $rootScope.allFloors.slice(begin, end);    
        },500);   
      })    
      .error(function(data, status, headers, config) {    
        Notifier.error('Something went wrong. Please try again..');   
      });         
    }   
    $scope.getFloors();   
    $scope.$watch('currentPageFloor + numPerPageFloor', function() {    
      var begin = (($scope.currentPageFloor-1) * $scope.numPerPageFloor);   
      var end = begin + $scope.numPerPageFloor;   
      $scope.filteredFloor = $rootScope.allFloors.slice(begin, end);    
      });   
    $scope.pageChangedFloor = function() {    
          
      console.log('Page changed to: ' + $scope.currentPageFloor);   
    };

    
    /*code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Add New Office Location */
    /**
      * @module : Setting
      * @desc   : Add New Office Location
      * @return : -
      * @author : Softweb solutions - Dhaval Thaker
    */
    $rootScope.addFloor = function(floorData) {
      $rootScope.isClicked=1;
      var userid = localStorage.getItem("uc_guid");
      var name = floorData.floorname;
      var locationid = floorData.locationid;
      var capacity = floorData.floors;

      if (name && name.trim()) {
        var isSaveFloor = true;
        /*code added by Dhaval Thaker <dhaval.thake@softwebsolutions.com > Check Space*/
        $scope.checkFloorAvailabilityUrl = $scope.baseurl+"/location/checkFloorAvailability";
          $http.post($scope.checkFloorAvailabilityUrl, {locationid:locationid,capacity:capacity,id:userid})
          .success(function(availabilityResult, status, headers, config) {
            console.log(availabilityResult);
            if (availabilityResult.data.length > 0) {
              Notifier.error('Floor already booked for this Buildinng.');
              $rootScope.isClicked = 0;
              $("#name_span_error").html("Floor already exists.");
              isSaveFloor = false;
          }
          /*End Code*/
          if(floorData.newimage && floorData.newimage.filename) {
            var allowMimeType = ['image/jpeg','image/png'];
            var checkMimeType = jQuery.inArray( floorData.newimage.filetype, allowMimeType );
            if (checkMimeType < 0) {
              $("#spaceImage_lblError1").html("Please upload valid image file.");
                 isSaveFloor = false;
              }          
            }
           if (isSaveFloor) {
          $rootScope.floorData.name = name.trim();

          $http.get($scope.baseurl+"/people/getUserUsingGuid/"+userid)
          .success(function(data, status, headers, config) {
            if(data.data.length) {
              var officeid = data.data[0].officeid;
              if (parseInt(officeid) > 0) {
               $scope.addOfficeLocationurl = $scope.baseurl+"/location/addfloor";
              $http.post($scope.addOfficeLocationurl, {floorData:$rootScope.floorData,userid:userid,officeid:officeid}).success(function(data, status, headers, config) {
                 ngDialog.close('$escape'); //SOFTWEB
                 $scope.getFloors(); //SOFTWEB
                 Notifier.success('Floor added successfully.');
              }).error(function(data, status, headers, config) {
                $rootScope.isClicked = 0;
                Notifier.error('Something went wrong. Please try again..');
              });
              }
              else {
                Notifier.error('Something went wrong. Please try again..');
              }
                        }
            else {
              Notifier.error('Something went wrong. Please try again..');
            }
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          }); 
       
        }
            
          });
      }
    }

    /*code added by Dhaval Thaker <alpesh.solanki@softwebsolutions.com > Update Office Location */
    /**
      * @module : Setting
      * @desc   : Update Floor
      * @return : -
      * @author : Softweb solutions - Dhaval Thaker
    */
    $rootScope.updateFloor = function(id,floorData) {  
    console.log(floorData);    
    console.log('------Update Floor-----');
     var name = floorData.floorname;
      var locationid = floorData.locationid;
      var id = floorData.id;
      var capacity = floorData.floors;
      if (name && name.trim()) {
        var isSaveFloor = true;
        /*code added by Dhaval Thaker <dhaval.thake@softwebsolutions.com > Check floors*/
         $scope.checkRoomAvailabilityUrl = $scope.baseurl+"/location/checkFloorAvailability";
          $http.post($scope.checkRoomAvailabilityUrl, {name:name,locationid:locationid,id:id,capacity:capacity,id:id})
          .success(function(availabilityResult, status, headers, config) {
            console.log("No Of Length"+availabilityResult.data.length);
            if (availabilityResult.data.length > 0) {
              Notifier.error('Floor already booked for this Location.');
              //alert('Space already booked for this Location.');
              $("#name_span_error").html("Floor already exists.");
              isSaveFloor = false;
          }
          /*End code*/
        if(floorData.newimage && floorData.newimage.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( floorData.newimage.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#spaceImage_lblError1").html("Please upload valid image file.");
            isSaveFloor = false;
          }
        }
        if(isSaveFloor) {
          floorData.id = id;
          floorData.name = name.trim();
          $scope.editSpaceUrl = $scope.baseurl+"/location/updateFloor";
          $http.post($scope.editSpaceUrl, floorData).success(function(data, status, headers, config) {
            //var current = $state.current;
            //var params = angular.copy($stateParams);
             $scope.getFloors(); //SOFTWEB
            ngDialog.close('$escape'); //SOFTWEB            
            //$state.transitionTo(current, params, { reload: true, inherit: true, notify: true });

            Notifier.success('Floor updated successfully.');
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
        }
      });
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Delete Space */
    /**
      * @module : Setting
      * @desc   : Delete Space
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.deletefloor = function(id) {
      $scope.getFloors();
      ngDialog.openConfirm({
          template:
            '<div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="myModal" class="modal box-typical fade in" style="display: block;"><div class="modal-dialog box-typical-dashboard" role="document"><div class="modal-content"> <header class="box-typical-header modal-header"><div class="tbl-row"><div class="tbl-cell tbl-cell-title"><h3>Are you sure you want to delete this floor?</h3></div><div class="tbl-cell tbl-cell-actions"><button type="button" ng-click="closeThisDialog(0);" class="action-btn" data-dismiss="modal" aria-label="Close"><i class="font-icon font-icon-close ngdialog-close"></i></button></div></header><div class="modal-body"><div class="modal-footer" style="padding:0px;text-align:left;"><div class="row"><div class="col-md-5"><button type="button" class="btn btn-primary" ng-click="closeThisDialog(0)">No&nbsp;</button><button type="button" class="btn btn-primary" ng-click="confirm('+id+')">Yes</button></div></div></div> </div></div></div></div>' ,
            plain: true,
            closeByDocument: true,
            closeByEscape: true,
          className: 'ngdialog-theme-default'
      }).then(function (id) {
        var postData = {'id':id};
        $scope.deletefloorUrl = $scope.baseurl+"/location/deletefloor";
        $http.post($scope.deletefloorUrl, postData).success(function(data, status, headers, config) {
          
          if (data.type == 'success') {
            $scope.getFloors(); //SOFTWEB
            Notifier.success('Floor deleted successfully.');
          }
          else {
            if (data.message) {
              Notifier.error(data.message);
            }
            else {
              Notifier.error('Something went wrong. Please try again.');
            }
            
          }

        }).error(function(data, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });    
      }, function (value) {
         
      });      
    }

    /**
    * @module : People management
    * @desc   : Open a people semd notification box
    * @return : Return popup view
    * @author : Softweb solutions
    */
    $scope.clickToOpenPeople = function(userid) 
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
        controller: 'SettingsController',
        scope:$scope
      });
    };
    $scope.getAllPeople();
  });
$rootScope.autoheight();
}])
