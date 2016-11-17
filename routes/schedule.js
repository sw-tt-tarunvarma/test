var express 	= require('express');
var md5 	    = require('MD5');
var fs 		    = require('fs');
var router    = express.Router();
var moment 	  = require('moment');
var gcm 		  = require('node-gcm');
var apn 		  = require('apn');
var async 		= require("async");



/* code added by Dhaval thaker <dhaval.thaker@softwebsolutions.com > Get All Office Locations */
/**
  * @module : schedule event
  * @desc   : Get schedule events
  * @return : Return schedule events
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/getScheduleEvents', function (req, res) {
  var userguid = req.body.userid;
  var request = new sql.Request(cp);
  console.log("select so.OfficeName,sl.name,srr.purpose,sp.name as sp_name,srr.time,srr.endtime,sol.name as sol_name from so_room_reservation srr Inner Join so_location sl ON srr.locationid = sl.id INNER JOIN so_officelocations sol ON sl.location_id = sol.id INNER JOIN so_people sp ON srr.peopleid = sp.id INNER JOIN so_office so ON sl.officeid = so.id WHERE so.userid = '"+userguid+"' AND SL.space_status = 1 ");
  request.query("select so.OfficeName,sl.name,srr.purpose,sp.name as sp_name,srr.time,srr.endtime,sol.name as sol_name from so_room_reservation srr Inner Join so_location sl ON srr.locationid = sl.id INNER JOIN so_officelocations sol ON sl.location_id = sol.id INNER JOIN so_people sp ON srr.peopleid = sp.id INNER JOIN so_office so ON sl.officeid = so.id WHERE so.userid = '"+userguid+"' AND SL.space_status = 1  order by srr.time desc", function(error, result) {
    if(error) {
      res.json(error);
    }
    else {
      res.json({data: result, message: "success"});
    }
  });
});

/**
  * @module : Notification
  * @desc   : Get All Notification
  * @return : Return Notification
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/getNotification', function (req, res) {
  var userguid = req.body.userid;
  //var isadmin =req.body.is_admin;
 // console.log(isadmin);
  var request = new sql.Request(cp);
  request.query("select sn.message,sn.timestamp,so_people.email from so_notification as sn INNER JOIN so_people ON sn.peopleid = so_people.id WHERE so_people.userid = '"+userguid+"' ", function(error, result) {
    if(error) {
      res.json(error);
    }
    else {
     // var val = {result:result,admin:isadmin};
      res.json({data: result, message: "success"});
    }
  });
});


module.exports = router;