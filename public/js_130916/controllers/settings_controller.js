'use strict';

/*Setting Controllers */

angular.module('myApp.controllers')
.controller('SettingsController', ["$scope", "$state", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "$q", "$stateParams", "ngDialog", "$filter", function($scope, $state, $location, $rootScope, $http, $timeout, getBaseUrl, $q, $stateParams, ngDialog, $filter, base64Converter) {

  $scope.$on('$viewContentLoaded', function () 
  {
    $scope.baseurl = getBaseUrl.url();
    $scope.getdatainfo;
    $scope.getdata = {};
    $rootScope.mainLogo = {};
    $rootScope.crUrl=$state.current.url;
    
    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > set default value for which tab display */
    $scope.displayAmenities = false;
    $scope.displayLocations = false;
    $scope.displaySpaces = false;
    //added by JJ<jeel.joshi@softwebsolutions.com>
    $scope.displayDetails = true;
    $scope.displayIntegration=false;
    $scope.displayDevice=false;
    $scope.displayPeople=false;
    $scope.displayUser=false;
    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > set spcae tyape data */
    $rootScope.spaceTypeData = ['Breakout','Call Room','Classroom','Conference Room','Meeting Room','Office','Study Room','Break Room','Cafe','Cafeteria','Fitness Gym','Interview Room','Kitchen','Lab','Lactation Room','Lobby','Lounge','Other','Parking','Restroom','Female Restroom','Male Restroom','Studio','Theater','Utility Room','Work Area'];

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > set size data */
    $rootScope.sizeData = [
      { label:'Micro (3 ft / 1 m)',value:'0.5'},
      { label:'Extra Small (7 ft / 2 m)',value:'1'},
      { label:'Small (10 ft / 3 m)',value:'1.5'},
      { label:'Medium (23 ft / 7 m)',value:'3.5'},
      { label:'Large (46 ft / 14 m)',value:'7'},
      { label:'Extra Large (92 ft / 28 m)',value:'14'}
    ];

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > set status data */
    $rootScope.statusData = [
      { label:'Active',value:0},
      { label:'Disable',value:1}
    ];

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
        Notifier.success('Logo uploaded successfully');
        //ngDialog.close('$escape');
        //$scope.getSettings();
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    };

    //added by JJ <jeel.joshi@softwebsolutions.com>
    $rootScope.SaveDevice = function(){
      $scope.deviceaddurl = $rootScope.baseurl+"/device/adddevice";
      $http.post($scope.deviceaddurl, $rootScope.devicedata).success(function(data, status, headers, config) 
      {
        $rootScope.deviceMessage = data.message;
        var current = $state.current;
        var params = angular.copy($stateParams);
        Notifier.error('Device saved');

      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
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
        },450);
      })
      .error(function(data1, status1, headers1, config1) {
        Notifier.error('Something went wrong. Please try again..');
      });
      $http.get($scope.baseurl+"/amenities/allRoom/")
      .success(function(result, status, headers, config) {
        $timeout(function(){
          $scope.allRoomData = result.data;
          $rootScope.allRoomData = $scope.allRoomData;
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
          $rootScope.autoheight();
        },600);          
      })
      .error(function(data, status, headers, config) {
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
      $http.get($scope.baseurl+"/location/allOfficeLocations/")
      .success(function(result, status, headers, config) {
        $timeout(function(){
          $scope.allOfficeLocations = result.data;
          $rootScope.allOfficeLocations = $scope.allOfficeLocations;
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Spaces */
    /**
      * @module : Setting
      * @desc   : Get Spaces
      * @return : Return Spaces
      * @author : Softweb solutions - Alpeshsinh Solnaki
    */
    $scope.getSpaces = function() {
      $http.get($scope.baseurl+"/location/getLocations/")
      .success(function(result, status, headers, config) {
        $timeout(function(){
          $scope.allSpaces = result.data;
          $rootScope.allSpaces = $scope.allSpaces;
          $rootScope.massSpaceData = {};
        },500);
      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }    
        
    $scope.getOfficeLocations();
    $timeout(function(){
      $scope.getSpaces();
    },500);
    $timeout(function(){
      $scope.getAmenities();
    },1000);
    
    

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Add New Amenities */
    /**
      * @module : Setting
      * @desc   : Open Popup For Add New Amenities
      * @return : Return redirect on add view
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addAmenitiesPopup = function (id) {
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
      var amenities = $rootScope.addAmenitiesData.amenities;
      if (amenities && amenities.trim()) {
        var found = $filter('filter')($scope.allAmenities, {amenities: amenities}, true);
        if (found.length) {
          $("#fileUpload_lblError2").html("Amenities already exits.");
        }
        else {
          var postData = {};
          postData['amenities'] = amenities.trim();
          postData['image'] = $rootScope.addAmenitiesData.image;
          if($rootScope.addAmenitiesData.image && $rootScope.addAmenitiesData.image.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( $rootScope.spaceData.newimage.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#fileUpload_lblError1").html("Please upload valid image file.");
          }          
        } else {
            $("#fileUpload_lblError1").html("Please upload image file.");
        }
          $scope.addAmenitiesurl = $scope.baseurl+"/amenities/addNewAmenities";
          $http.post($scope.addAmenitiesurl, postData).success(function(data, status, headers, config) {
            var current = $state.current;
            var params = angular.copy($stateParams);
            ngDialog.close('$escape');
            $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
            Notifier.success('Amenities added successfully.');
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
        }
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
      $rootScope.officeLocationData = {};
      $rootScope.editOfficeLocationValue = 0;
      ngDialog.open({
        template: 'partials/office_location_popup.html',
        controller: 'SettingsController'              
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
      var name = $rootScope.officeLocationData.name;
      var address = $rootScope.officeLocationData.address;          
      if (name && name.trim() && address && address.trim()) {
        var isSaveLocation = true;
        var found = $filter('filter')($scope.allOfficeLocations, {name: name}, true);
        if (found.length) {
          $("#name_span_error").html("Location already exits.");
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
          $rootScope.officeLocationData.address = address.trim();
          if (!$rootScope.officeLocationData.note) {
            $rootScope.officeLocationData.note = '';
          }
          $scope.addOfficeLocationurl = $scope.baseurl+"/location/addOfficeLocation";
          $http.post($scope.addOfficeLocationurl, $rootScope.officeLocationData).success(function(data, status, headers, config) {
            var current = $state.current;
            var params = angular.copy($stateParams);
            ngDialog.close('$escape');
            $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
            Notifier.success('Location added successfully.');
          }).error(function(data, status, headers, config) {
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
      if (name && name.trim() && address && address.trim()) {
        var isSaveLocation = true;
        var found = $filter('filter')($scope.allOfficeLocations, {name: name}, true);
        if (found.length) {
          found.forEach(function(item) {
            if(isSaveLocation) {
              if($rootScope.officeLocationData.id != item.id) {
                isSaveLocation = false;
                $("#name_span_error").html("Location already exits.");
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
            var current = $state.current;
            var params = angular.copy($stateParams);
            ngDialog.close('$escape');
            $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
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
      var postData = {'id':id};
      $scope.deleteOfficeLocationurl = $scope.baseurl+"/location/deleteOfficeLocation";
      $http.post($scope.deleteOfficeLocationurl, postData).success(function(data, status, headers, config) {
        var current = $state.current;
        var params = angular.copy($stateParams);
        ngDialog.close('$escape');
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
        Notifier.success('Location deleted successfully.');
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });      
    }

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Open Popup For Add New Spaces */
    /**
      * @module : Setting
      * @desc   : Open Popup For Add New Spaces
      * @return : Return redirect on add view
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $scope.addSpacePopup = function () {
      $rootScope.spaceData = {};
      $rootScope.spaceData.status = 0;
      $rootScope.spaceData.size = 0.5;
      $rootScope.spaceData.location_id = 0;
      $rootScope.spaceData.capacity = 0;
      $rootScope.spaceData.space_type = '';
      $rootScope.spaceData.notes = '';

      $rootScope.editSpaceValue = 0;
      $rootScope.allLocationData = $scope.allOfficeLocations;
      ngDialog.open({
        template: 'partials/space_popup.html',
        controller: 'SettingsController'              
      });
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
      if (found.length) {
          $rootScope.spaceData = found[0];
      }
      else {
        $rootScope.spaceData = {};
      }
      $rootScope.allLocationData = $scope.allOfficeLocations;
      $rootScope.editSpaceValue = 1;
      ngDialog.open({
        template: 'partials/space_popup.html',
        controller: 'SettingsController'              
      });
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add New Space */
    /**
      * @module : Setting
      * @desc   : Add New Space
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.addSpace = function() {
      var name = $rootScope.spaceData.name;
      if (name && name.trim()) {
        var isSaveSpace = true;
        var found = $filter('filter')($scope.allSpaces, {name: name}, true);
        if (found.length) {
          $("#name_span_error").html("Location already exits.");
          isSaveSpace = false;
        }
        if($rootScope.spaceData.newimage && $rootScope.spaceData.newimage.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( $rootScope.spaceData.newimage.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#spaceImage_lblError1").html("Please upload valid image file.");
            isSaveSpace = false;
          }          
        }
        if (isSaveSpace) {
          $rootScope.spaceData.name = name.trim();
          if (!$rootScope.spaceData.image) {
            $rootScope.spaceData.image = '';
          }

          $scope.addSpaceUrl = $scope.baseurl+"/location/addSpace";
          $http.post($scope.addSpaceUrl, $rootScope.spaceData).success(function(data, status, headers, config) {
            var current = $state.current;
            var params = angular.copy($stateParams);
            ngDialog.close('$escape');
            $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
            Notifier.success('Space added successfully.');
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
        }
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Update Space */
    /**
      * @module : Setting
      * @desc   : Update Space
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.updateSpace = function(id) {      
      var name = $rootScope.spaceData.name;
      if (name && name.trim()) {
        var isSaveSpace = true;
        var found = $filter('filter')($scope.allSpaces, {name: name}, true);
        if (found.length) {
          found.forEach(function(item) {
            if(isSaveSpace) {
              if($rootScope.spaceData.id != item.id) {
                isSaveSpace = false;
                $("#name_span_error").html("Space already exits.");
              }
            }                        
          });          
        }

        if($rootScope.spaceData.newimage && $rootScope.spaceData.newimage.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( $rootScope.spaceData.newimage.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#spaceImage_lblError1").html("Please upload valid image file.");
            isSaveSpace = false;
          }          
        }
        if(isSaveSpace) {
          $rootScope.spaceData.id = id;
          $rootScope.spaceData.name = name.trim();
          $scope.editSpaceUrl = $scope.baseurl+"/location/updateSpace";
          $http.post($scope.editSpaceUrl, $rootScope.spaceData).success(function(data, status, headers, config) {
            var current = $state.current;
            var params = angular.copy($stateParams);
            ngDialog.close('$escape');
            $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
            Notifier.success('Space updated successfully.');
          }).error(function(data, status, headers, config) {
            Notifier.error('Something went wrong. Please try again..');
          });
        }       
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
      var postData = {'id':id};
      $scope.deleteSpaceUrl = $scope.baseurl+"/location/deleteSpace";
      $http.post($scope.deleteSpaceUrl, postData).success(function(data, status, headers, config) {
        var current = $state.current;
        var params = angular.copy($stateParams);
        ngDialog.close('$escape');
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
        Notifier.success('Space deleted successfully.');
      }).error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
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
      if (ids.length) {
        var postData = {'ids':ids};
        $scope.massDeleteSpaceUrl = $scope.baseurl+"/location/massDeleteSpace";
        $http.post($scope.massDeleteSpaceUrl, postData).success(function(data, status, headers, config) {
          var current = $state.current;
          var params = angular.copy($stateParams);
          $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
          Notifier.success('Space(s) deleted successfully.');
        }).error(function(data, status, headers, config) {
          Notifier.error('Something went wrong. Please try again..');
        });
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Select Unselect All Checkbox */
    /**
      * @module : Setting
      * @desc   : Select Unselect All Checkbox
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.selectUnselectCheckboxAll = function() {
      var allCheckboxs = $('.space-checkbox');
      for (var i = 0; i < allCheckboxs.length; i++) {
        allCheckboxs[i].click();
      }
    }

    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Close Dialog Box */
    /**
      * @module : Setting
      * @desc   : Close Dialog Box
      * @return : -
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    $rootScope.closeDialog = function() {
      ngDialog.close('$escape');
      return false;
    }

  });
}])