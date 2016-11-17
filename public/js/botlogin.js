'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('botloginapp', ['angular-loading-bar','ui.router','ngCookies'])

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = true;
}]);

app.controller('BotloginController', ["$scope", "$location", "$http", "$timeout", "getBaseUrl", function($scope, $location, $http, $timeout, getBaseUrl) {

	$scope.$watch('$viewContentLoaded', function () {
		$scope.baseurl = getBaseUrl.url();
		$scope.loginData = {};

		$scope.botloginFunction = function() {
		   	$http.post(getBaseUrl.url()+"/mobservices/SoftwebHOQCheckUser", {username: $scope.loginData.username, password: $scope.loginData.password})
			.success(function(data, status, headers, config) {
				if(data.Status == false) {
					Notifier.error('Something went wrong. Please try again..');
				}
				else {
					$http.post(getBaseUrl.url()+"/people/addTokenIntoUserSession", {email: $scope.loginData.username, token: data["token"]})
					.success(function(data1, status1, headers1, config1) {

						var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
						
						var urlParams = {};
						window.location.href.replace( location.hash, '' ).replace( 
							/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
							function( m, key, value ) { // callback
								urlParams[key] = value !== undefined ? value : '';
							}
						);

						var buff = {
							"userId":(urlParams['userId'])?urlParams['userId']:'1226106424098174',
							"botId":(urlParams['botId'])?urlParams['botId']:'56800324',
							"serviceUrl":(urlParams['serviceUrl'])?decodeURIComponent(urlParams['serviceUrl']):"http://192.168.3.72/SmartOfficeBot/api/SmartOfficeCallback",
							"conversationId":(urlParams['conversationId'])?urlParams['conversationId']:'8a734db5',
							"channelId":(urlParams['channelId'])?urlParams['channelId']:'emulator',
							"locale":(urlParams['locale'])?urlParams['locale']:'',
							"token":data['token'],
							"status":true
						};
						
						console.log(buff);									
						var json = Base64.encode(JSON.stringify(buff));
						
						$http.get("http://192.168.3.72/SmartOfficeBot/api/SmartOfficeCallback?json="+json,{})
					    .success(function(data2, status2, headers2, config2) {
							Notifier.success('Logged In successfully.');
					    }).error(function(data, status, headers, config) {
					    	Notifier.success('Logged In successfully.');
					    });
					})
					.error(function(data1, status1, headers1, config1) {
						 $http.get("http://192.168.3.72/SmartOfficeBot/api/SmartOfficeCallback?status=false",{
						 	
					      })
					      .success(function(data2, status2, headers2, config2) {
								Notifier.success('Logged In successfully.');
					      }).error(function(data, status, headers, config) {
					        	Notifier.success('Logged In successfully.');
					    });
					});
					
				}
			})
			.error(function(data, status, headers, config) {
				if(status == 404) {
			  		Notifier.error('Invalid username or password');
			  	}
			  	else if(status == 403) {
			  		Notifier.error('You dont have permission to access the Smartoffice');
			  	}
			  	else {
			  		Notifier.error('Something went wrong. Please try again..');
			  	}
			});
		}
	});
}]);

app.service('getBaseUrl', function(){
    this.url= function(){
    	return "http://smartoffice.softwebopensource.com";
    };    
});