'use strict';

/* App Images Controllers */

angular.module('myApp.controllers')
.controller('AppImagesController',["$scope","$http","$q","getBaseUrl","$window", function($scope,$http,$q,getBaseUrl,$window) {

	$scope.loadimages = function(){
		$http.get($scope.baseurl+'/appimages').success(
		function(result,header,status,config){
			$scope.appimage = result.data[0];
		})	
	}

	$scope.loadimages();
	$scope.$on('$viewContentLoaded',function()
	{
		$scope.isDisabled = true;	
		$scope.baseurl = getBaseUrl.url();  // Service for access baseurl	

		/**
		* @module : App images 
		* @desc   : Publish animation image file
		* @return : Return animationimage
		* @author : Softweb solutions
		*/
		$scope.saveAppDetails = function()
		{
		 	var deferredAbort = $q.defer();
		 	$scope.appimages = {};
			$http.post($scope.baseurl+'/appimages/publishanimationfiles',$scope.appimages,{  timeout: 300000 })
			.success(function(result,header,status,config){
				Notifier.success('Saved successfully');
				$scope.loadimages();
				$window.location.reload();
			})
			.error(function(result,header,status,config){
				Notifier.success('File Upload failure');
			})
		}

		/**
		* @module : App images 
		* @desc   : Upload files for app animation screen
		* @return : Return upload response
		* @author : Softweb solutions
		*/
		$scope.fileuploads = function($appimages){
			$http.post($scope.baseurl+'/appimages/uploadfiles',$appimages,{  timeout: 300000 })
			.success(function(result,header,status,config){
				Notifier.success('File Upload successfully');
				$window.location.reload(); 
			}).error(function(result,header,status,config){
				Notifier.success('File Upload failure');
			})
		}

		/**
		* @module : App images 
		* @desc   : Image upload validation
		* @return : Return true or false
		* @author : Softweb solutions
		*/
		$scope.selectfile = function(input,filetype,id){
			var files_size = [];
			var fileUpload = '';
			var allowedFiles = [filetype];
			fileUpload = $("#"+id).val();
			if(fileUpload!='')
			{
				var extension      = fileUpload.split('.').pop().toLowerCase();
				var checkextension = jQuery.inArray( extension, allowedFiles );
				if (checkextension < 0) 
				{
					$("#"+id+"_lblError1").html("You are using invalid extension.");
					$scope.$apply(function () {
						$scope.isDisabled = true;
					});
				}
				else
				{
					$("#"+id+"_lblError1").html('');	
					$("#"+id+"_lblError1").html('');
					$scope.$apply(function () {
						$scope.isDisabled = false;
					});
				}
			}
			else
			{
				Notifier.success('Please Select Files.');
				$scope.isDisabled = true;
			}
		}

	});
}]);