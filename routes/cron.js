var express 	= require('express');
var request 	= require('request');
var moment  	= require("moment");
var async   	= require("async");
var fs          = require('fs');
var commonConfig= require("../commonConfig");
var sql         = require('mssql');  // Global declaration for database object
var q           = require('q');
var cron 		= require('node-cron');

var dbconfig = commonConfig.dbConfig;

cron.schedule('0 */1 * * * *', function() {
	var currentDateTime = new Date();
	var currentDateString = moment(currentDateTime).format("YYYY-MM-DDTHH:mm:00");
	var currentDateTimestamp = moment(currentDateString).unix();

	console.log("=====Maintaince Cron====="+currentDateTime+"====="+currentDateTimestamp+"=====")  

  	sql.connect(dbconfig, function(err) {
  		var requestsql = new sql.Request();
  		var spaceInactiveQuery = "UPDATE so_location set space_status = 2 WHERE id IN (SELECT DISTINCT SN.roomID FROM so_notification SN INNER JOIN so_location as SL ON SL.id = SN.roomID WHERE SN.startTime <= '"+currentDateTimestamp+"' AND SN.endTime >= '"+currentDateTimestamp+"'  AND SN.type = 1 AND (SN.read_by_system = 0 OR SN.read_by_system = '' OR SN.read_by_system = NULL) AND SL.space_status = 1); UPDATE so_notification set read_by_system = 1 WHERE ID IN (SELECT DISTINCT SN.ID FROM so_notification SN INNER JOIN so_location as SL ON SL.id = SN.roomID WHERE SN.startTime <= '"+currentDateTimestamp+"' AND SN.endTime >= '"+currentDateTimestamp+"'  AND SN.type = 1 AND (SN.read_by_system = 0 OR SN.read_by_system = '' OR SN.read_by_system = NULL) AND (SL.space_status = 1 OR SL.space_status = 2));";
  		console.log("spaceInactiveQuery == " + spaceInactiveQuery);
		requestsql.query(spaceInactiveQuery, function(inactiveError, inactiveresult) {
			if (inactiveError) {
			  console.log("space Inactive Query error = "+ inactiveError);
			}
		});  // space Inactive Query
  		var spaceActiveQuery = "UPDATE so_location set space_status = 1 WHERE id IN (SELECT DISTINCT SN.roomID FROM so_notification SN WHERE SN.endTime <= '"+currentDateTimestamp+"'  AND SN.type = 1 AND SN.read_by_system != 2);UPDATE so_notification set read_by_system = 2 WHERE ID IN (SELECT DISTINCT SN.ID FROM so_notification SN WHERE SN.endTime <= '"+currentDateTimestamp+"'  AND SN.type = 1 AND SN.read_by_system != 2);";
  		console.log("spaceActiveQuery == "+ spaceActiveQuery);
		requestsql.query(spaceActiveQuery, function(mainError, result) {
			if (mainError) {
			  console.log("space Active Query error = "+ mainError);
			}
		});  // space Active Query
  		//console.log(requestsql);
	}); // sql.connect
});

cron.schedule('1 */1 * * * *', function() {
	var date              = new Date();
	var datestring        = moment(date).format("YYYY-MM-DDTHH:mm:00");
	var hour              = date.getHours();
	var minutes           = date.getMinutes();
	var starttimebooking  = '';
	var loginid           = '';
	var eventid           = '';
	var beaconid          = '';
	var currenttime       = moment(datestring).unix(); 

	var eight_hours_back_from_currenttime = moment(datestring).subtract(8,'hours').format('YYYY-MM-DDTHH:mm:00');
	eight_hours_back_from_currenttime     = moment(eight_hours_back_from_currenttime).unix();

	console.log("===================Hold & Release For EVENTS==========================");  
	sql.connect(dbconfig, function(err) {
  		var requestsql = new sql.Request();
  		var mainQuery = "SELECT SRR.id as ID, max(cast(SOS.abandoned_meeting as varchar(max))) as releaseMinutes, max(cast(SRR.id as varchar(max))) as eventid, max(cast(SRR.peopleid as varchar(max))) as userid, max(cast(SRR.locationid as varchar(max))) as locationid, max(cast(SD.id as varchar(max))) as id, max(cast(SL.name as varchar(max))) as location_name, max(cast(SRR.timestamp as varchar(max))) as timestamp, max(cast(SRR.duration as varchar(max))) as duration FROM so_room_reservation as SRR left join so_device as SD on SD.locationid = SRR.locationid left join so_location as SL on SL.id = SRR.locationid left join so_officesettings SOS on SOS.companyid = SL.officeid  WHERE SRR.timestamp >='"+eight_hours_back_from_currenttime+"'  AND SRR.timestamp <'"+currenttime+"'  AND ( SRR.action='BOOKLATER' OR SRR.action='BOOKNOW') AND SRR.notification_action != 'R' group by SRR.id";
  		console.log(mainQuery);
		requestsql.query(mainQuery, function(mainError, mainResult) {
			if (mainError) {
			  console.log("main query error = "+ mainError);
			}
			else {   // else no error in booknow/booklater query
				if (mainResult.length > 0) { // if booknow/book later result.length					
					var defaultRealseMinute = 8;
					var loop=0;
					var duplicat_event_reduce = [];
					var release_loop=0;

					for (var i = 0; i < mainResult.length; i++) {
						var result = mainResult[i];
						console.log(result);
						if (result.releaseMinutes && result.releaseMinutes != '' && result.releaseMinutes != null) {
							defaultRealseMinute = parseInt(result.releaseMinutes);
						}
						event_time = result.timestamp;
						var event_date = new Date(event_time*1000);
						var diff = Math.abs(event_date - date);
                        remaintime = parseInt(Math.floor((diff/1000)/60));
						console.log("=====EVENTS Diff =="+remaintime+"=====Realse Minute=="+defaultRealseMinute+"=====");  
						if (remaintime == defaultRealseMinute) { // whenever remaining time is setting value then it will check from database which is event avail or not
							console.log("In If");
							location_name = result.location_name;
							loginid = result.userid;
							eventid = result.eventid;
							locationid = result.locationid;
							beaconid = result.id;
							event_duration = result.duration;
							var startTime = moment(event_date).format("YYYY-MM-DDTHH:mm:00");
							var end_event_time = moment(startTime).add(event_duration,'minutes').format('YYYY-MM-DDTHH:mm:00');
							var end_event_timestamp = moment(end_event_time).unix();
							var chekin_user_time = moment(startTime).subtract(8,'minutes').format('YYYY-MM-DDTHH:mm:00');
							var chekin_user_time_timestamp = moment(chekin_user_time).unix();
							var hold_user_time = moment(datestring).subtract(1,'minutes').format('YYYY-MM-DDTHH:mm:00');
							var hold_user_time_timestamp = moment(hold_user_time).unix();
							console.log("beaconlist");
							requestsql.query("SELECT * FROM so_device_locator as SDL WHERE SDL.status = 'in' AND SDL.beaconid IN (SELECT SD.id FROM so_device SD WHERE SD.locationid="+locationid+")  AND SDL.loginid = '"+loginid+"' AND SDL.timestamp >= '"+chekin_user_time_timestamp+"' AND SDL.timestamp < '"+currenttime+"'", function(checkin_error, checkin_result) {
								if (checkin_error) {
									res.json({"status":false,"message":checkin_error ,"code":400});
								}
								else { // no query error check in else
									console.log("checkin_result");
									console.log(checkin_result);
									if (checkin_result[0] == undefined) { // Nobody check in undefined
										if (eventid != null) {  // check event id 
											console.log("SELECT TOP(1) * FROM so_prompt as SP WHERE SP.status='Yes' AND SP.eventid='"+eventid+"' AND SP.userid='"+loginid+"' AND SP.timestamp >= '"+hold_user_time_timestamp+"' AND SP.timestamp <= '"+end_event_timestamp+"' ORDER BY ID DESC");
											requestsql.query("SELECT TOP(1) * FROM so_prompt as SP WHERE SP.status = 'Yes' AND SP.eventid = '"+eventid+"' AND SP.userid = '"+loginid+"' AND SP.timestamp >= '"+hold_user_time_timestamp+"' AND SP.timestamp <= '"+end_event_timestamp+"' ORDER BY ID DESC", function(hold_error,hold_result) { // hold_result query
												if (hold_error) {
                      								res.json({"status":false,"message":hold_error ,"code":400});
                      							}
                      							else { // no query error check in else
                      								if (hold_result[0] == undefined) { // Find no hold action 
                  										
    									  				// send mail with defined transport object
    									  				//smtpTransport.sendMail(mailOptions, function(mailError, response){});
    									  				console.log("====================");
    									  				console.log("UPDATE so_room_reservation set notification_action = 'R' WHERE id = "+eventid);
    									  				console.log("====================");
    									  				requestsql.query("UPDATE so_room_reservation set notification_action = 'R' WHERE id = "+eventid, function(update_event_error, update_event_result) {
    									  					if (update_event_error) {
    									  						console.log("update event error = "+update_event_error);
    									  					}
    									  				});
    									  				release_loop++;
        									  		} // Find no hold action
        									  		else {
        									  			var hold_time = new Date(hold_result[0].timestamp*1000);
        									  			var hold_time_plus_min =  moment(hold_time).add(3,'minutes').format('YYYY-MM-DDTHH:mm:00');
        									  			var hold_notify_timestamp =  moment(hold_time_plus_min).unix();
        									  			console.log(hold_notify_timestamp+" == "+currenttime)
        									  			if ((hold_notify_timestamp == currenttime)) { // whenever remaining time is 3 then it will check from database which is event avail or not
        									  				
															// send mail with defined transport object
        									  				//smtpTransport.sendMail(mailOptions, function(error, response) {});
    									  					console.log("====================");
        									  				console.log("UPDATE so_room_reservation set notification_action = 'R' WHERE id = "+eventid);
        									  				console.log("====================");
							              					requestsql.query("UPDATE so_room_reservation set notification_action = 'R' WHERE id = "+eventid, function(update_event_error, update_event_result) {
							              						if (update_event_error) {
							              							console.log("update event error = "+update_event_error);
							              						}
    									  					});
								    						release_loop++;
								    					}
								    				}
								    			}
								    		}); // hold_result query
								    	} // echeck event id
                    				} // No body check in undefined
                    			}   // No query error check in else
                    		}); // main check in query
						}  // End if // whenever remaining time is 8 OR 15 OR setting value then it will check from database which is event avail or not
					}										
				}  // End if booknow/book later result.length						
			}  // End else no error in booknow/booklater query
		});  // Main booknow/booklater query
  		//console.log(requestsql);
	}); // sql.connect
});

function gebeaconlist(requestque,locationid) {
	var beaconlist = [];
    var deferred = q.defer(); 
    requestque.query("SELECT id FROM so_device WHERE locationid="+locationid, function(beaconlistError, beaconlistResult) {
    	if (beaconlistError) {
    		console.log("beacon list Error = " + beaconlistError);
		}
		else {
			if (beaconlistResult.length > 0) {
				beaconlistResult.forEach(function(result1) {
					beaconlist.push(result1.id);
				});
				deferred.resolve(beaconlist);
			}
		}
	});
	return deferred.promise;
}