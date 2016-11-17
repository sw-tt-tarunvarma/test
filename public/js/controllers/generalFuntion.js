'use strict';

angular.module('myApp.services').factory('generalService', function generalService($location, $http, $q, $rootScope) {
    
    return {

        getRoundedTime: function(date) {
            
            var startDate = new Date(date);
            var minutes = startDate.getMinutes();

            if(minutes > 0 && minutes <= 5)
            {
                startDate.setMinutes(5);
                startDate.setSeconds(0);
            }
            else if(minutes > 5 && minutes <= 10)
            {
                startDate.setMinutes(10);
                startDate.setSeconds(0);
            }
            else if(minutes > 10 && minutes <= 15)
            {
                startDate.setMinutes(15);
                startDate.setSeconds(0);
            }
            else if(minutes > 15 && minutes <= 20)
            {
                startDate.setMinutes(20);
                startDate.setSeconds(0);
            }
            else if(minutes > 20 && minutes <= 25)
            {
                startDate.setMinutes(25);
                startDate.setSeconds(0);
            }
            else if(minutes > 25 && minutes <= 30)
            {
                startDate.setMinutes(30);
                startDate.setSeconds(0);
            }
            else if(minutes > 30 && minutes <= 35)
            {
                startDate.setMinutes(35); 
                startDate.setSeconds(0);
            }
            else if(minutes > 35 && minutes <= 40)
            {
                startDate.setMinutes(40); 
                startDate.setSeconds(0);
            }
            else if(minutes > 40 && minutes <= 45)
            {
                startDate.setMinutes(45); 
                startDate.setSeconds(0);
            }
            else if(minutes > 45 && minutes <= 50)
            {
                startDate.setMinutes(50); 
                startDate.setSeconds(0);
            }
            else if(minutes > 50 && minutes <= 55)
            {
                startDate.setMinutes(55); 
                startDate.setSeconds(0);
            }
            else if((minutes > 55 && minutes <= 59) || minutes == 0)
            {
                startDate.setHours(startDate.getHours()+Math.round(startDate.getMinutes()/60));
                startDate.setMinutes(0); 
                startDate.setSeconds(0);
            }
            return startDate;
        }
    };
});
