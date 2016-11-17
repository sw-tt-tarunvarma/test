'use strict';

/*Profile Controllers */
/* code added by Dahval Thaker <dhaval.thaker@softwebsolutions.com > set default value for which tab display */

angular.module('myApp.controllers')
.controller('ProfileController', ["$scope", "$state", "$location", "$rootScope", "$http", "$timeout", "getBaseUrl", "$q", "$stateParams", "ngDialog", "$window", "$filter", function($scope, $state, $location, $rootScope, $http, $timeout, getBaseUrl, $q, $stateParams, ngDialog, $window, $filter, base64Converter) {

  $scope.$on('$viewContentLoaded', function () 
  {
    $scope.baseurl = getBaseUrl.url();
    $rootScope.autoheight();
    $rootScope.crUrl=$state.current.url;
    $scope.displayEvents = false;
    $scope.displaySecurity = false;
    $scope.displayNotification = false;
    $scope.displayDetails = true;
    $scope.profileinfo = {};
    $rootScope.profileLogo = '';
    $rootScope.profileAvtar = '';
    $scope.isremoveProfileLogo = '';
    
    /**
      * @module : User profile
      * @desc   : Get User detail by session variable
      * @return : Return user detail
      * @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
      */
      $scope.getUserUrl = $scope.baseurl+"/people/getUserUsingGuid/"+localStorage.getItem("uc_guid");
    $http.get($scope.getUserUrl)
    .success(function(data, status, headers, config) {
      $scope.getprofileLogo();
      console.log(data.data[0]);
      $scope.profileinfo = data.data[0];
      })
    .error(function(data, status, headers, config) {
      Notifier.error('Something went wrong!. Please try again..');
    });
  });

  /**
    * @module : User profile
    * @desc   : Save user profile
    * @return : Return response message
    * @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
    */
  $scope.SaveProfile = function(){
    var id = $scope.profileinfo.id;
    var name = $scope.profileinfo.name;
    var username = $scope.profileinfo.username;
    var image = $scope.profileinfo.image;
    $scope.profileinfo.isremoveProfileLogo = $scope.isremoveProfileLogo;
    if (name && name.trim()){
      var isSaveProfile = true;
        if(image.filename) {
          var allowMimeType = ['image/jpeg','image/png'];
          var checkMimeType = jQuery.inArray( $scope.profileinfo.image.filetype, allowMimeType );
          if (checkMimeType < 0) {
            $("#profileImage_lblError1").html("Please upload valid image file.");
            isSaveProfile = false;
          }          
        }
        if(isSaveProfile) {
    $scope.peopleupdateurl = $scope.baseurl+"/profile/UpdateProfile";
    $http.post($scope.peopleupdateurl,$scope.profileinfo).success(function(data, status, headers, config) 
    {
     

      $scope.getprofileLogo();
          

      Notifier.success('Profile updated successfully');
    }).error(function(data, status, headers, config) {
      Notifier.error('Something went wrong. Please try again..');
    });
  }
}
}

/*code added by DT <dhaval.thaker@softwebsolutions.com > Get All Space Data */
    /**
      * @module : Search
      * @desc   : remove Profile Logo
      * @author : Softweb solutions
    */
$scope.removeProfile = function(){

  $scope.isremoveProfileLogo = true;

}
   
   

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
            $scope.profileinfo.image= '';
          }
        }
        else {
          $rootScope.profileLogo = 'no-user.png';
          $rootScope.profileAvtar = 'no-user.png';
          $scope.profileinfo.image= '';
        }
        $scope.isremoveProfileLogo=false;
           

      })
      .error(function(data, status, headers, config) {
        Notifier.error('Something went wrong. Please try again..');
      });
    }
//$scope.getprofileLogo();
    

/**
    * @module : User profile
    * @desc   : Save user profile
    * @return : Return response message
    * @author : Softweb solutions- JJ <jeel.joshi@softwebsolutions.com>
    */
  $scope.SavePassword = function(securityData){
    var userid = localStorage.getItem("uc_guid");
    
    var oldpassword = securityData.oldpassword;
    var newpassword = securityData.newpassword;
    var confirmpassword = securityData.confirmpassword;
    var isSavePassword = true;
    if (newpassword != confirmpassword){
        isSavePassword = false;
        $("#password_lblError1").html("Password doesn't match");         
    }
    if(isSavePassword) {
        $scope.passwordupdateurl = $scope.baseurl+"/profile/UpdatePassword";
        $http.post($scope.passwordupdateurl,{oldpassword:securityData.oldpassword,newpassword:securityData.newpassword,userid:userid}).success(function(data, status, headers, config) 
        {
          console.log('success');
           console.log(data);
          $http.post($scope.baseurl+"/mobservices/SoftwebHOQUpdateUser", {au_guid: userid, uc_password: newpassword}).success(function(result, status, headers, config) {

              Notifier.success('Password reset successfully');
            $timeout(function(){$window.location.href='/logout';},1000);
            

        }).error(function(result, status, headers, config) {
          
        });
          
        }).error(function(data, status, headers, config) {
          if(status == 404)
          Notifier.error('Old Password Does Not Match');
        });

  }
}

}])