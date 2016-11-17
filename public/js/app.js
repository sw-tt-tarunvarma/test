'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', [
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'angular-loading-bar',
  'ui.router',
  '500tech.simple-calendar',
  'ngDialog',
  'angular-svg-round-progress',
  'naif.base64',
  'ngSanitize',
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker',
  'ngIdle',
  'mrImage',
  'ngTagsInput',
  'ui.bootstrap'
])

app.factory('xtokenInjector',function() {  
  
    var xtokenInjector = {
        request: function(config) {
  
          config.headers['xtokenaccess'] = 'aHR0cDovL3Jvb21iaXRhcC1zdGFnaW5nLmF6dXJld2Vic2l0ZXMubmV0Lw==';
          
          return config;
        }
    };
    return xtokenInjector;
});
app.config(['$httpProvider', function($httpProvider) {  
    $httpProvider.interceptors.push('xtokenInjector');
}]);


app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  }]);



 app.run(function(Idle, $http, $location,$window){

    $http.get('/googleauth/getSsSession').success(function(response) {
      console.log("RES"+response);
      console.log(response.au_guid);
      console.log(response.au_isadmin);
      if(response.au_guid != undefined && response.au_isadmin != undefined)
      {
        window.localStorage.setItem('uc_guid', response.au_guid);
        window.localStorage.setItem('au_isadmin', response.au_isadmin);
      }     

    }).error(function(err) {
      console.log("Error here");
    });
    //Idle.watch();
});


app.config(function(IdleProvider, KeepaliveProvider) {
    // configure Idle settings
    IdleProvider.idle(300); // in seconds
    IdleProvider.timeout(0); // in seconds
    KeepaliveProvider.interval(2); // in seconds
})
app.run(function(Idle){
    // start watching when the app runs. also starts the Keepalive service by default.
    Idle.watch();
});

app.config(function($stateProvider, $urlRouterProvider,$locationProvider) {

	// $locationProvider.html5Mode(true);

	  // For any unmatched url, redirect to /state1
	  $urlRouterProvider.otherwise("/search");
	  //
	  // Now set up the states
	  $stateProvider
	    .state('dashboard', {
	      url: "/dashboard",
	      templateUrl: "partials/dashboard.html",
	      controller: "DashboardController",
	    })

      .state('report', {
        url: "/report",
        templateUrl: "partials/report.html",
        controller: "ReportController",
      })

      .state('search', {
        url: "/search",
        templateUrl: "partials/search.html",
        controller: "SearchController"
      })

      .state('analytics', {
        url: "/analytics",
        templateUrl: "partials/analytics.html",
        controller: "AnalyticsController",
        resolve:{loggedIn:onlyLoggedIn},
      })

	    .state('people', {
	      url: "/people",
	      templateUrl: "partials/people.html",
	      controller: "PeopleController",
        resolve:{loggedIn:onlyLoggedIn}
	    })

      .state('schedule', {
        url: "/schedule",
        templateUrl: "partials/schedule.html",
        controller: "ScheduleController",
        resolve:{loggedIn:onlyLoggedIn}
      })

      .state('notification', {
        url: "/notification",
        templateUrl: "partials/notification.html",
        controller: "AppController",
        resolve:{loggedIn:onlyLoggedIn}
      })

	    .state('profileSettings', {
	      url: "/profileSettings",
	      templateUrl: "partials/profileSettings.html",
	      controller: "profileSettingsController",
        resolve:{loggedIn:onlyLoggedIn}
	    })

      .state('company', {
        url: "/company",
        templateUrl: "partials/companydetail.html",
        controller: "CompanyController",
        resolve:{loggedIn:onlyLoggedIn}
      })

       .state('office', {
        url: "/office",
        templateUrl: "partials/office.html",
        controller: "OfficeController",
        resolve:{loggedIn:onlyLoggedIn}
      })
       .state('space', {
        url: "/space",
        templateUrl: "partials/space.html",
        controller: "SpaceController",
        resolve:{loggedIn:onlyLoggedIn}
      })
       .state('invite', {
        url: "/invite",
        templateUrl: "partials/invite_member.html",
        controller: "InviteMemberController",
        resolve:{loggedIn:onlyLoggedIn}
      })
       .state('schedulemeeting', {
        url: "/schedulemeeting",
        templateUrl: "partials/schedule_meeting.html",
        controller: "ScheduleMeetingController",
        resolve:{loggedIn:onlyLoggedIn}
      })
       .state('addpeople', {
        url: "/addpeople",
        templateUrl: "partials/addpeople.html",
        controller: "PeopleController",
        resolve:{loggedIn:onlyLoggedIn}
      })

	    .state('conference', {
	      url: "/conference/:id",
	      templateUrl: "partials/conference_room.html",
	      controller: "ConferenceController"
	    })
	    
	    .state('settings', {
        url: "/settings",
        templateUrl: "partials/settings.html",
        controller: "SettingsController",
        resolve:{loggedIn:onlyLoggedIn}
      })

      .state('profile', {
        url: "/profile",
        templateUrl: "partials/profile.html",
        controller: "ProfileController"
      })
      
      
      .state('appimages',{
        url:"/appimages",
        templateUrl:"partials/app_images.html",
        controller:"AppImagesController",
        resolve:{loggedIn:onlyLoggedIn}

      })
      
       .state('logs',{
        url:"/logs",
        templateUrl:"partials/logs.html",
        controller:"AppLogsController"

      })
       
        .state('floormap', {
        url: "/floormap/:id/:floorid",
        templateUrl: "partials/floormap.html",
        controller: "FloorMapController"
      });

      //$locationProvider.html5Mode(true);
        
})


var onlyLoggedIn = function ($location,$q) {
    var deferred = $q.defer();
    //siteAuth.isLoggedInAsync(function(loggedIn) {
    var isadmin = window.localStorage.getItem('au_isadmin');
    if (isadmin == 'true') {
          deferred.resolve();
      } else {
          deferred.reject();
          $location.url('/search');
      }
  //});
    return deferred.promise;
};


app.run(function(Idle, $http, $location,$window){
     /*$rootScope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {
       $timeout(function(){
          var oldUrl = absOldUrl.split("#/");
          var newUrl = absNewUrl.split("#/");
          $rootScope.previousUrl = oldUrl[1];
          $rootScope.currentUrl = newUrl[1];
        });
      });*/
});

app.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
    	if(!angular.isDefined(iElement.attr('src')) || iElement.attr('src') == ""){
			iElement.attr('src', iAttrs.fallbackSrc);
		} 
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
   }
   return fallbackSrc;
});

app.directive('ngConfirmClick', [
  function(){
    return {
        link: function (scope, element, attr) {
          var msg = attr.ngConfirmClick || "Are you sure?";
          var clickAction = attr.confirmedClick;
          element.bind('click',function (event) {
              if ( window.confirm(msg) ) {
                  scope.$eval(clickAction)
              }
          });
        }
    };
}]);
  
app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});


app.factory('httpcall', function($http, $q) {
   return {
     call: function(url, type, cache, data) {
     	if(type=="get")
     	{
     		var deferred = $q.defer();
     		return  $http.get(url, {cache: cache})
     		.then(function(result) {
     			deferred.resolve(result.data)
	           return deferred.promise;
	       })
     		.catch(function (error) {
			    // Catch and handle exceptions from success/error/finally functions
			    deferred.reject()
			});
     	}
     	else if(type=="post")
     	{
     		var deferred = $q.defer();
     		return  $http.post(url, data)
     		.then(function(result) {
     			deferred.resolve(result.data)
	           return deferred.promise;
	       })
     		.catch(function (error) {
     			Notifier.error(error);
			    // Catch and handle exceptions from success/error/finally functions
			    deferred.reject()
			});
     	}
       
     }
   }
});

app.service('getBaseUrl', function(){
	this.url= function(){
        return "http://smartoffice.softwebopensource.com";
    };        
    
});

app.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);



app.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

// add date suffix for add events calendar - RP - 29072016
app.filter('dateSuffix', function($filter) {
  var suffixes = ["th", "st", "nd", "rd"];
  return function(input) {
    var dtfilter = $filter('date')(input, 'MMMM dd');
    var dtfiltermonth = $filter('date')(input, 'MMMM');
    var day = parseInt(dtfilter.slice(-2));
    var relevantDigits = (day < 30) ? day % 20 : day % 30;
    var suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
    //return dtfilter+suffix;
    return dtfiltermonth+' '+day+suffix;
  };
});