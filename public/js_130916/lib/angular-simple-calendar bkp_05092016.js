angular.module('500tech.simple-calendar', []).directive('simpleCalendar', function () {
  return {
    restrict: 'E',
    scope: {
      options: '=?',
      events: '=?'
    },
    template: '<div class="calendar">' +
      '<div class="current-month">' +
      '<div class="move-month prev-month" ng-click="prevMonth()">' +
      '<span ng-show="allowedPrevMonth()">&#x2039;</span>' +
      '</div>' +
      '<span>{{ selectedMonth }}</span>' +
      '&nbsp;' +
      '<span>{{ selectedYear }}</span>' +
      '<div class="move-month next-month" ng-click="nextMonth()">' +
      '<span ng-show="allowedNextMonth()">&#x203a;</span>' +
      '</div>' +
      '</div>' +
      '<div>' +
      '<div ng-repeat="day in weekDays(options.dayNamesLength) track by $index" class="weekday">{{ day }}</div>' +
      '</div>' +
      '<div>' +
      '<div ng-repeat="week in weeks track by $index" class="week">' +
      '<div class="day"' +
      'ng-class="{default: isDefaultDate(date), event: date.event, disabled: date.disabled || !date}"' +
      'ng-repeat="date in week track by $index">' +
      '<div class="day-number">{{ date.day || "&nbsp;" }}<span style="float:right" ng-if="date.day" ng-click="onClick(date)">Add</span></div>' +
      //'<div class="event-title">{{ date.event.title || "&nbsp;" }}</div>' +
      '<div class="event-title" ng-repeat="te in date.testevents track by $index" ng-click="getEvent(te.eventid)">{{ te.title }}</div>' +
      ' </div>' +
      '</div>' +
      '</div>' +
      '</div>',
    controller: ['$scope', '$rootScope', 'ngDialog','$filter', function ($scope, $rootScope, ngDialog, $filter) {
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var calculateSelectedDate, calculateWeeks, allowedDate, bindEvent;

      $scope.options = $scope.options || {};
      $scope.options.dayNamesLength = $scope.options.dayNamesLength || 1;

      $scope.getEvent = function (e) {
        //console.log($rootScope.locationData[0].Outlook)
        $scope.myEventEdit(e);
      };

      $scope.onClick = function (date) {
        if (!date || date.disabled) { return; }
        if (date.event) {
          $scope.myEvent(date);
          //$scope.options.eventClick(date);
        } else {
          $scope.myEvent(date);
          //$scope.options.dateClick(date);
        }
      };

      if ($scope.options.minDate) {
        $scope.options.minDate = new Date($scope.options.minDate);
      }

      if ($scope.options.maxDate) {
        $scope.options.maxDate = new Date($scope.options.maxDate);
      }
      $scope.myEvent = function(date){
       // console.log($rootScope.locationData[0].Outlook[0].purpose)
        $rootScope.date = new Date([date.year, date.month + 1, date.day]);
        $rootScope.room = new Object();
        $rootScope.room.selcaldate = date;
        //alert($rootScope.date)
        //$rootScope.room.purpose = '';
        //$rootScope.room.attendees.length = 0;
        //$rootScope.room.attendees = [];
        $rootScope.counter = 0;
        $rootScope.dataid = 1;
        $rootScope.emailelement = [];
        $rootScope.starttimeh = 'Hour';
        $rootScope.starttimem = 'Minute';
        $rootScope.endtimeh = 'Hour';
        $rootScope.endtimem = 'Minute';
        $rootScope.editeventvalue = 0;
        ngDialog.open({ template: 'partials/event_popup.html',
                                 controller: 'ConferenceController',
                                 scope:$rootScope});
      }
      $scope.myEventEdit = function(eventid){
        //console.log("event id==="+eventid);
        //added by JJ < jeel.joshi@softwebsolutions.com > for local record edit
        $rootScope.editeventvalue = 1;
        if($rootScope.dataid == 1){
          //console.log($rootScope.locationData[0].Localdata);
          var found = $filter('filter')($rootScope.locationData[0].Localdata, {id: eventid}, true);
          
          if (found.length) {
            $rootScope.room = found[0];
            $rootScope.date = new Date(found[0].time);
            //code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for get utc time 
            $rootScope.starttimeh = $rootScope.date.getUTCHours(); 
            $rootScope.starttimem = $rootScope.date.getUTCMinutes();
            $rootScope.enddate = new Date(found[0].endtime);
            $rootScope.endtimeh = $rootScope.enddate.getUTCHours();
            $rootScope.endtimem = $rootScope.enddate.getUTCMinutes();

            //code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for remove json error 
            try {
              found[0].attendies = JSON.parse(found[0].attendies);
              if (found[0].attendies && typeof found[0].attendies === "object") {
                $rootScope.counter = found[0].attendies.length;
              }
            }
            catch (e) { }
            
            var week = [];
            week.push({
              year: $rootScope.date.getFullYear(),
              month: $rootScope.date.getMonth(),
              day: $rootScope.date.getDate()
            });
            $rootScope.room.selcaldate = week;

            //code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for set value
            $rootScope.room.hours = $rootScope.starttimeh;
            $rootScope.room.minutes = $rootScope.starttimem;
            $rootScope.room.endhours = $rootScope.endtimeh;
            $rootScope.room.endminutes = $rootScope.endtimem;
            $rootScope.room.attendees = found[0].attendies.length;

            $rootScope.emailelement = [];
            for(var e=0;e<$rootScope.counter;e++) {
              $rootScope.emailelement.push( {email : found[0].attendies[e].attendees} );
            }
            $rootScope.totalAttendees = $rootScope.counter;
            //console.log($rootScope);
       } else {
          $rootScope.room = new Object();
       }
        } else {
          var found = $filter('filter')($rootScope.locationData[0].Outlook, {eventid: eventid}, true);
          if (found.length) {
            $rootScope.room = found[0];
            //console.log(found[0])
            /*console.log(found[0].attendees.length)
            console.log(found[0].attendees[0].EmailAddress.Address)*/
            $rootScope.date = new Date(found[0].starttime);
            /*alert($rootScope.date.getFullYear())
            alert($rootScope.date.getMonth())
            alert($rootScope.date.getDate())*/
            $rootScope.starttimeh = $rootScope.date.getHours();
            $rootScope.starttimem = $rootScope.date.getMinutes();
            $rootScope.enddate = new Date(found[0].endtime);
            $rootScope.endtimeh = $rootScope.enddate.getHours();
            $rootScope.endtimem = $rootScope.enddate.getMinutes();
            $rootScope.counter = found[0].attendees.length;
            console.log("TEST"+$rootScope.counter);
            var week = [];
            week.push({
              year: $rootScope.date.getFullYear(),
              month: $rootScope.date.getMonth(),
              day: $rootScope.date.getDate()
            });
            $rootScope.room.selcaldate = week;
            console.log("HERE"+$rootScope.room.selcaldate)

            $rootScope.editeventvalue = 1;
            $rootScope.emailelement = [];
            for(var e=0;e<$rootScope.counter;e++) {
              $rootScope.emailelement.push( {email : found[0].attendees[e].EmailAddress.Address} );
            }
            //console.log($rootScope.date.getHours()+":"+$rootScope.date.getMinutes());
       } else {
          $rootScope.room = new Object();
       }
        }
        
       ngDialog.open({ template: 'partials/event_popup.html',
                                 controller: 'ConferenceController',
                                 scope:$rootScope});
      }

      bindEvent = function (date) {
        // Added by Softweb
        date.testevents = [];
        //
        if (!date || !$scope.events) { return; }
        $scope.events.forEach(function(event) {
          event.date = new Date(event.date);
          if (date.year === event.date.getFullYear() && date.month === event.date.getMonth() && date.day === event.date.getDate()) {
            date.event = event;
            // Added by Softweb
            date.testevents.push({title : date.event.title, eventid : date.event.eventid});
            //
          }
        });
      };

      allowedDate = function (date) {
        if (!$scope.options.minDate && !$scope.options.maxDate) {
          return true;
        }
        var currDate = new Date([date.year, date.month + 1, date.day]);
        if ($scope.options.minDate && (currDate < $scope.options.minDate)) { return false; }
        if ($scope.options.maxDate && (currDate > $scope.options.maxDate)) { return false; }
        return true;
      };

      $scope.allowedPrevMonth = function () {
        var prevYear = null;
        var prevMonth = null;
        if (!$scope.options.minDate) { return true; }
        var currMonth = MONTHS.indexOf($scope.selectedMonth);
        if (currMonth === 0) {
          prevYear = ($scope.selectedYear - 1);
        } else {
          prevYear = $scope.selectedYear;
        }
        if (currMonth === 0) {
          prevMonth = 11;
        } else {
          prevMonth = (currMonth - 1);
        }
        if (prevYear < $scope.options.minDate.getFullYear()) { return false; }
        if (prevYear === $scope.options.minDate.getFullYear()) {
          if (prevMonth < $scope.options.minDate.getMonth()) { return false; }
        }
        return true;
      };

      $scope.allowedNextMonth = function () {
        var nextYear = null;
        var nextMonth = null;
        if (!$scope.options.maxDate) { return true; }
        var currMonth = MONTHS.indexOf($scope.selectedMonth);
        if (currMonth === 11) {
          nextYear = ($scope.selectedYear + 1);
        } else {
          nextYear = $scope.selectedYear;
        }
        if (currMonth === 11) {
          nextMonth = 0;
        } else {
          nextMonth = (currMonth + 1);
        }
        if (nextYear > $scope.options.maxDate.getFullYear()) { return false; }
        if (nextYear === $scope.options.maxDate.getFullYear()) {
          if (nextMonth > $scope.options.maxDate.getMonth()) { return false; }
        }
        return true;
      };

      calculateWeeks = function () {
        $scope.weeks = [];
        var week = null;
        var daysInCurrentMonth = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth) + 1, 0).getDate();
        for (var day = 1; day < daysInCurrentMonth + 1; day += 1) {
          var dayNumber = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth), day).getDay();
          week = week || [null, null, null, null, null, null, null];
          week[dayNumber] = {
            year: $scope.selectedYear,
            month: MONTHS.indexOf($scope.selectedMonth),
            day: day
          };

          if (allowedDate(week[dayNumber])) {
            if ($scope.events) { bindEvent(week[dayNumber]); }
          } else {
            week[dayNumber].disabled = true;
          }

          if (dayNumber === 6 || day === daysInCurrentMonth) {
            $scope.weeks.push(week);
            week = undefined;
          }
        }
      };

      calculateSelectedDate = function () {
        if ($scope.options.defaultDate) {
          $scope.options._defaultDate = new Date($scope.options.defaultDate);
        } else {
          $scope.options._defaultDate = new Date();
        }

        $scope.selectedYear  = $scope.options._defaultDate.getFullYear();
        $scope.selectedMonth = MONTHS[$scope.options._defaultDate.getMonth()];
        $scope.selectedDay   = $scope.options._defaultDate.getDate();
        calculateWeeks();
      };

      $scope.weekDays = function (size) {
        return WEEKDAYS.map(function(name) { return name.slice(0, size) });
      };

      $scope.isDefaultDate = function (date) {
        if (!date) { return; }
        return date.year === $scope.options._defaultDate.getFullYear() &&
          date.month === $scope.options._defaultDate.getMonth() &&
          date.day === $scope.options._defaultDate.getDate()
      };

      $scope.prevMonth = function () {
        if (!$scope.allowedPrevMonth()) { return; }
        var currIndex = MONTHS.indexOf($scope.selectedMonth);
        if (currIndex === 0) {
          $scope.selectedYear -= 1;
          $scope.selectedMonth = MONTHS[11];
        } else {
          $scope.selectedMonth = MONTHS[currIndex - 1];
        }
        calculateWeeks();
      };

      $scope.nextMonth = function () {
        if (!$scope.allowedNextMonth()) { return; }
        var currIndex = MONTHS.indexOf($scope.selectedMonth);
        if (currIndex === 11) {
          $scope.selectedYear += 1;
          $scope.selectedMonth = MONTHS[0];
        } else {
          $scope.selectedMonth = MONTHS[currIndex + 1];
        }
        calculateWeeks();
      };

      $scope.$watch('options.defaultDate', function() {
        calculateSelectedDate();
      });

      $scope.$watch('events', function() {
        calculateWeeks();
      });

    }]
  }
});