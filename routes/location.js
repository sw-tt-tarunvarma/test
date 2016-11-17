var express   = require('express');
var router    = express.Router();
var moment    = require('moment');
var gcm       = require('node-gcm');
var apn       = require('apn');
var fs        = require('fs');
var async     = require("async");
var requestapi= require('request');
var outlook = require("node-outlook");
var request = require('request');
var authHelper = require("../authHelper");
var session     = require('express-session');
var nodemailer = require('nodemailer');
var commonConfig  = require("../commonConfig");


/**
* @module : Location 
* @desc   : Send notification
* @return : Return send notification
* @author : Softweb solutions
*/
function sendNotification(type,result) {
  if(type == "android") {
    var regid = "APA91bHxu83XUKOwYA-mi1lc2XNon0ORewCG83VM6irmeybt-nb2bOufLfTVrf-3diUqaEHzjg85KeHNUM_Q2PXlFB6c9gY6Hil3rjqFbTRs8NIuIyxCTUafI6WfW98f1pmIhoJgLqOEsRqQwroXTTPqrztzdchZg3QKyQg97vbUrdPpYPB8ih0";
    var sender = new gcm.Sender('AIzaSyAtc1fOYnilZmOAJYuwG2DnE7Z54a5qImU');
    var message = new gcm.Message();
    message.addDataWithObject({
      message: result[0].invitor_name+" has invited you to "+result[0].location+" at "+result[0].time+" for "+result[0].purpose,
      title: "Smartoffice Invitation for "+result[0].purpose
    });
    var registrationIds = [];
    registrationIds.push(regid);
    sender.send(message, registrationIds, 4, function (err, result) {});
  }
  if(type == "ios") {
    var options = { 
      cert: 'PushChatCert.pem',
      key: 'PushChatKey.pem',
      "passphrase":'1234',
      production:true,
      debug : true  
    };

    var apnConnection = new apn.Connection(options);
    var myDevice = new apn.Device(regid);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.sound = "ping.aiff";
    note.alert = result[0].invitor_name+" has invited you to "+result[0].location+" at "+result[0].time+" for "+result[0].purpose;
    note.payload = {'messageFrom': 'Smartoffice'};
    apnConnection.pushNotification(note, myDevice);
  }
};

/**
* @module : Location
* @desc   : Load location view
* @return : Return location view
* @author : Softweb solutions
*/
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});


/**
* @module : Location
* @desc   : Get locatioin list
* @return : Return location list
* @author : Softweb solutions
*/
router.get('/getLocationUsers/:locationid', function (req, res) {
  var locationid = req.params.locationid;
  var request = new sql.Request(cp);
  request.query("SELECT p.id,p.name,p.email,p.image,p.officeid,p.role,p.username, dl.status FROM so_people as p INNER JOIN so_device_locator as dl ON p.userid=dl.loginid INNER JOIN so_device as d ON d.id = dl.beaconid INNER JOIN so_location as l ON l.id=d.locationid WHERE  dl.isin=1 AND l.id="+locationid, function(err, result) {
    if(err) {
      res.json(err);
    }
    else {
      if(result[0]!='') {
        for(var i=0;i<result.length; i++) {
          result[i].image = base_url+"images/"+result[i].image;
        }        
      }
      else {
        request.query("UPDATE so_location set status=0 where id="+locationid,function(err2, result2) {
          if(err2) {
            res.json(err2);
          }
        });
      }
      res.json({data: result, message: "success"});
    }
  });
});


  /**
  * @module : Location
  * @desc   : Get list with status as per office selected
  * @return : Return location list with status
  * @author : Softweb solutions
  */
router.get('/locationWithStatus/:officeid', function (req, res) {

 var officeid = req.params.officeid;
 var i=0;
 function doloop(i,mainresult)
 {
  if(i < mainresult.length)
  {
    var request = new sql.Request(cp);
    request.query("SELECT p.id,p.name,p.email,p.image,p.officeid,p.role,p.username, dl.status FROM so_people as p INNER JOIN so_device_locator as dl ON p.id=dl.peopleid INNER JOIN so_device as d ON d.id = dl.beaconid INNER JOIN so_location as l ON l.id=d.locationid WHERE d.id=dl.beaconid AND isin=1 AND l.id="+mainresult[i].id, function(err2, result2) {
      if(err2)
      {
        res.json(err2);
    }
    else
    {
        mainresult[i].image = base_url+"images/"+mainresult[i].image;
        mainresult[i].people = result2.length;
        i++;
        doloop(i,mainresult);
    }
  });
  }
  else
  {
      res.json({"data": mainresult});
  }
  }
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_location WHERE officeid="+officeid, function(err, result) {
      if(err)
      {
        res.json(err);
      }
      else
      {
        if(result.length == 0)
        {
          res.status(404).send('Sorry, we cannot find that!');
      }
      else
      {
          doloop(0,result);
      }
  }
  });
});


/**
  * @module : Location
  * @desc   : Get Location detail
  * @return : Return location detail
  * @author : Softweb solutions
  */
router.get('/locationDetail/:locationid/:dataid', function (req, res) {

  // get location details of local database done by JJ < jeel.joshi@softwebsolutions.com > 
  var locationid = req.params.locationid;
  var dataid = req.params.dataid;
  var request = new sql.Request(cp);
  if(dataid == 1) {
    request.query("SELECT l.id, l.name, l.address, l.image, l.notes,l.status, l.capacity, l.officeid, l.amenities FROM so_location as l WHERE l.id = "+locationid, function(err, result) {
        if(err)
        {
          res.json(err);
      }
      else
      {
          result[0].image = base_url+"images/"+result[0].image;
          if(result.length == 0)
          {
            res.status(404).send('Sorry, we cannot find that!');
        }
        else
        {
            var locationResult = {"data": result};
            request.query("SELECT TOP(1)  CONVERT(VARCHAR(50), dl.timestamp, 121) as timestamp FROM so_location as l LEFT JOIN so_device as d ON l.id=d.locationid LEFT JOIN so_device_locator as dl ON d.id = dl.beaconid WHERE l.id = '"+locationid+"' AND d.id = dl.beaconid GROUP BY  dl.timestamp, l.officeid, d.uuid, d.major, d.minor  ORDER BY dl.timestamp desc ", function(err, response) {
              var locationStatus = result[0].status;
              if(result[0].status == 1 && response.length > 0)
              {
                var intime = moment(response[0].timestamp).format("HH:mm:ss");
                result[0].status = "In use since "+intime;
            }
            else
            {
                result[0].status=0;
            }

            //code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > for get Amenities Data
            request.query("SELECT * FROM so_amenities WHERE am_status = 1",function (err3,result3) {
              if(err3) {
                return console.log('Error:', err3);
              }
              
              locationResult.data[0].AmenitiesData = result3;
              locationResult.data[0].selectedAmenities = {};
              locationResult.data[0].selectedAmenitiesData = [];
              if (locationResult.data[0].amenities) {
                var ame = locationResult.data[0].amenities.split(',');
                var ameArray = [];
                if(ame.length) {
                  ame.forEach(function(item) {
                    ameArray.push("'" + item + "'");
                    locationResult.data[0].selectedAmenities[item] = item;
                  });
                }
                if(ameArray.length) {
                  locationResult.data[0].amenities = ameArray.join();
                }
                request.query("SELECT * FROM so_amenities WHERE am_status = 1 AND am_guid IN(" + locationResult.data[0].amenities + ")",function (err4,result4) {
                  if(err4) {
                    return console.log('Error:', err4);
                  }
                  if(result4.length) {
                    for (var i=0;i<result4.length; i++) {
                      locationResult.data[0].selectedAmenitiesData.push({'name':result4[i].amenities,'image':result4[i].am_image});
                    }
                  }                  
                });
              }
            });

            var localEvent = [];

            request.query("SELECT * FROM so_room_reservation where locationid = "+locationid+" AND datastorevalue = "+dataid,
              function (error, response, body) {
                if(error){
                    return console.log('Error:', error);
                }
             /*console.log("Event:"+ response);
                data = { events: JSON.parse(body)['value'] };

                       

            for (var i in data.events) {
              val = data.events[i];              
                localEvent.push({"purpose":val.Subject,
                    "starttime":val.Start,"endtime":val.End,"eventid":val.Id,"attendees":val.Attendees});             
            }
            console.log("Event:"+localEvent);
           // console.log("RESULT:"+result);              
           locationResult.data[0].Localdata=localEvent;   */       
           locationResult.data[0].Localdata=response;
           request.query("SELECT d.id,d.name,d.uuid,d.major,d.minor,d.locationid,d.devicetype,d.boardid, CONVERT(VARCHAR(50), d.timestamp, 121) as timestamp FROM so_device as d INNER JOIN so_location as l ON l.id=d.locationid WHERE d.locationid="+locationid+" GROUP BY d.id,d.name,d.uuid,d.major,d.minor,d.locationid,d.devicetype,d.boardid,d.timestamp", function(err1, result1) {
            if(err1)
            {
              res.json(err1);
          }
          else
          {
            if(result1.length > 0)
            {
              var deviceResult = result1;
              locationResult.data[0].Device=deviceResult;
              request.query("SELECT p.id,p.name,p.email,p.image,p.officeid,p.role,p.username, dl.status FROM so_people as p INNER JOIN so_device_locator as dl ON p.userid=dl.loginid INNER JOIN so_device as d ON d.id = dl.beaconid INNER JOIN so_location as l ON l.id=d.locationid WHERE d.id=dl.beaconid AND isin=1 AND l.id="+locationid, function(err2, result2) {
                if(err2)
                {
                  res.json(err2);
              }
              else
              {
                  if(result2.length > 0 && locationStatus == 1)
                  {
                    for(var i=0; i<result2.length; i++)
                    {
                      result2[i].image = base_url+"images/"+result2[i].image;
                  }
                  var peopleResult = result2;
                  locationResult.data[0].People=peopleResult
              }
              else
              {
                locationResult.data[0].People=null;
            }
            res.json(locationResult);
        }
    });
          }
          else
          {
              locationResult.data[0].Device=null
              res.json(locationResult);
          }
      }
  });
       });
        });
        }
    }
  });
  } else {
      request.query("SELECT l.id, l.name, l.address, l.image, l.notes,l.status, l.capacity, l.officeid, l.amenities FROM so_location as l WHERE l.id = "+locationid, function(err, result) {
          if(err)
          {
            res.json(err);
        }
        else
        {
            result[0].image = base_url+"images/"+result[0].image;
            if(result.length == 0)
            {
              res.status(404).send('Sorry, we cannot find that!');
          }
          else
          {
              var locationResult = {"data": result};
              request.query("SELECT TOP(1)  CONVERT(VARCHAR(50), dl.timestamp, 121) as timestamp FROM so_location as l LEFT JOIN so_device as d ON l.id=d.locationid LEFT JOIN so_device_locator as dl ON d.id = dl.beaconid WHERE l.id = '"+locationid+"' AND d.id = dl.beaconid GROUP BY  dl.timestamp, l.officeid, d.uuid, d.major, d.minor  ORDER BY dl.timestamp desc ", function(err, response) {
                var locationStatus = result[0].status;
                if(result[0].status == 1 && response.length > 0)
                {
                  var intime = moment(response[0].timestamp).format("HH:mm:ss");
                  result[0].status = "In use since "+intime;
              }
              else
              {
                  result[0].status=0;
              }

              var outlookEvent = [];
              var cookieName = session.outlookCookie;

              console.log("CooKIE"+cookieName)

              requestapi.get('https://outlook.office365.com/api/v1.0/me/events',
                { auth : { 'bearer' : cookieName } },
                function (error, response, body) {
                  if(error){
                      return console.log('Error:', error);
                  }
                  data = { events: JSON.parse(body)['value'] };

                  console.log(data.events)


                  for (var i in data.events) {
                    val = data.events[i];

                    if(val.Location.DisplayName == result[0].name){
                      outlookEvent.push({"purpose":val.Subject,"starttime":val.Start,"endtime":val.End,"eventid":val.Id,"attendees":val.Attendees});
                  }
              }

              console.log("RESULT:"+result);


              locationResult.data[0].Outlook=outlookEvent;             

              request.query("SELECT d.id,d.name,d.uuid,d.major,d.minor,d.locationid,d.devicetype,d.boardid, CONVERT(VARCHAR(50), d.timestamp, 121) as timestamp FROM so_device as d INNER JOIN so_location as l ON l.id=d.locationid WHERE d.locationid="+locationid+" GROUP BY d.id,d.name,d.uuid,d.major,d.minor,d.locationid,d.devicetype,d.boardid,d.timestamp", function(err1, result1) {
                  if(err1)
                  {
                    res.json(err1);
                }
                else
                {
                  if(result1.length > 0)
                  {
                    var deviceResult = result1;
                    locationResult.data[0].Device=deviceResult;
                    request.query("SELECT p.id,p.name,p.email,p.image,p.officeid,p.role,p.username, dl.status FROM so_people as p INNER JOIN so_device_locator as dl ON p.userid=dl.loginid INNER JOIN so_device as d ON d.id = dl.beaconid INNER JOIN so_location as l ON l.id=d.locationid WHERE d.id=dl.beaconid AND isin=1 AND l.id="+locationid, function(err2, result2) {
                      if(err2)
                      {
                        res.json(err2);
                    }
                    else
                    {
                        if(result2.length > 0 && locationStatus == 1)
                        {
                          for(var i=0; i<result2.length; i++)
                          {
                            result2[i].image = base_url+"images/"+result2[i].image;
                        }
                        var peopleResult = result2;
                        locationResult.data[0].People=peopleResult
                    }
                    else
                    {
                      locationResult.data[0].People=null;
                  }
                  res.json(locationResult);
              }
          });
                }
                else
                {
                    locationResult.data[0].Device=null
                    res.json(locationResult);
                }
            }
        });
          });
          //res.json({"data": result});
      });
          }
      }
  });
  }
});


/**
* @module : Location
* @desc   : Get Location detail
* @return : Return location detail
* @author : Softweb solutions
*/
router.get('/getAllLocation', function (req, res) {
    var request = new sql.Request(cp);
    request.query("SELECT l.*,s.major,s.minor FROM so_location as l LEFT JOIN so_device as s ON s.locationid= l.id",
        function(err, result) {
          if(err)
          {
            res.json(err);
        }
        else
        {
           res.json({"data": result});
       }
   });
});  

/**
* @module : Location
* @desc   : Get Location detail
* @return : Return location detail
* @author : Softweb solutions
*/
router.get('/getLocations', function (req, res) {
   var request = new sql.Request(cp);
  request.query("SELECT l.* FROM so_location as l WHERE status = "+0+" order by l.name", function(err, result) {
    if(err)
    {
      res.json(err);
    }
    else
    {
      res.json({"data": result});
    }
  });
});   

/**
* @module : Device
* @desc   : Get Device detail
* @return : Return device detail
* @author : Softweb solutions - DT <dhaval.thaker@softwebsolutions.com>
*/
router.get('/getDevices/:userUcGuid', function (req, res) {
  var userUcGuid = req.params.userUcGuid;
 var request = new sql.Request(cp);
   //request.query("SELECT d.* FROM so_device as d where boardid = "+0+"  order by d.name", function(err, result) {
    request.query("select dev.*,loc.name as spacename from so_device as dev INNER JOIN so_location as loc ON dev.locationid = loc.id  INNER JOIN so_office as ofc ON loc.officeid = ofc.id where ofc.userid = '"+userUcGuid+"'", function(err, result) {

    if(err)
    {
      res.json(err);
    }
    else
    {
      res.json({"data": result});
    }
  });
});    


 // });



  /**
  * @module : Location
  * @desc   : Get Location detail
  * @return : Return location detail
  * @author : Softweb solutions
  */
  router.get('/getLocationsAll', function (req, res) {


      var request = new sql.Request(cp);
      request.query("SELECT l.* FROM so_location as l order by l.name", function(err, result) {
        if(err)
        {
          res.json(err);
      }
      else
      {
          res.json({"data": result});
      }
  });

  });      


/**
  * @module : Location
  * @desc   : Get all location 
  * @return : Return list all location
  * @author : Softweb solutions
  */
router.get('/getAllLocation/:officeid', function (req, res) {

      var officeid = req.params.officeid;
      var request = new sql.Request(cp);
      request.query("SELECT l.id, l.name, l.address,l.image, l.notes,l.status, l.capacity, CONVERT(VARCHAR(50), l.timestamp, 121) as timestamp FROM so_location as l INNER JOIN so_office as o ON l.officeid = o.id where l.officeid = '"+officeid+"'", function(err, result) {
        if(err)
        {
          res.json(err);
      }
      else
      {
          for(var i=0; i<result.length; i++)
          {
            result[i].image = base_url+"images/"+result[i].image;
        }
        var resultData = {"location": result};
        request.query("SELECT o.id, o.officename, o.officeaddress, c.id as companyid, c.companyname, c.companyaddress FROM so_office as o INNER JOIN so_company as c ON c.id=o.companyid where o.id = '"+officeid+"'", function(err1, result1) {
            if(err)
            {
              res.json(err1);
          }
          else
          {
              if(result1.length == 0)
              {
                res.status(404).send('Sorry, we cannot find that!');
            }
            else
            {
                resultData.office = result1;
                res.json({"data": resultData});
            }
        }
    });
    }
  });
});


/**
  * @module : Location
  * @desc   : Update location 
  * @return : Return update location
  * @author : Softweb solutions
  */
  router.post('/updatelocationstatus', function (req, res) {

      var id = req.body.id;
      var status = req.body.status;
      var request = new sql.Request(cp);
      request.query("update so_location set status="+status+" WHERE id="+id, function(err, result) {
        if(err)
        {
          res.json(err);
          res.end();
      }
      else
      {
          io.sockets.emit('locationStatusChange', {
            status: status,
            id: req.body.id
        });
          res.json({"data": req.body.id, "message": "success"});
      }
    });
  });

/**
  * @module : Location
  * @desc   : Add new location 
  * @return : Return location detail response
  * @author : Softweb solutions
  */
  router.post('/insertLocation', function (req, res) {

      var name = req.body.name;
      var filename = req.body.locationimage.filename;
      var image = req.body.locationimage.base64;
      var ext       = filename.split(".");
      var address = req.body.address;
      var capacity = req.body.capacity;
      var notes = req.body.notes;
      var officeid = req.body.officeid;
      var timestamp = Math.floor(new Date() / 1000);
      var request = new sql.Request(cp);
      request.query("INSERT INTO so_location (name, address, image, officeid, notes, timestamp, status, capacity) VALUES ('"+name+"','"+address+"','','"+officeid+"','"+notes+"', CURRENT_TIMESTAMP, 0, "+capacity+")", function(err, result) {
        if(err)
        {
          res.json(err);
      }
      else
      {
          res.json({data: null, message: "success"});
      }
  });
  });


/**
  * @module : Location
  * @desc   : Update new location 
  * @return : Return update location response
  * @author : Softweb solutions
  */
router.post('/updateLocation', function (req, res) {
    var id= req.body.id;
    var name = req.body.name;
    var address = req.body.address
    var capacity = req.body.capacity;
    var oldimage = req.body.image;
    var notes = req.body.notes;
    var officeid = req.body.officeid;
    var timestamp = Math.floor(new Date() / 1000);

    if(req.body.locationimage != null)
    {
      var filename  = req.body.locationimage.filename;
      var newimage     = req.body.locationimage.base64;
      var ext       = filename.split(".");
    }
    else
    {
        var uploadimage = oldimage;
    }

    var timestamp = Math.floor(new Date() / 1000);
    if(req.body.locationimage != null)
    {
        if (fs.existsSync('../public/images/location/'+oldimage)) {
          fs.unlinkSync('../public/images/location/'+oldimage);
      }
      var fd =  fs.openSync('../public/images/location/'+timestamp+"."+ext[ext.length-1], 'w');
      newimage  =  newimage.replace(/^data:image\/\w+;base64,/, "");
      var buff = new Buffer(newimage,'base64');
      fs.write(fd, buff, 0, buff.length, 0, function(err,written){
          fs.closeSync( fd );
      });
      newimage = "location/"+timestamp+"."+ext[ext.length-1];
      var uploadimage = newimage;
  }

  var request = new sql.Request(cp);
  request.query("UPDATE so_location SET name='"+name+"',address='"+address+"', image='',officeid='"+officeid+"',notes='"+notes+"',capacity="+capacity+" WHERE id="+id, function(err, result) {
    if(err)
    {
      res.json(err);
  }
  else
  {
      res.json({data: null, message: "success"});
  }
  });
});


/**
  * @module : Location
  * @desc   : Delete new location 
  * @return : Return delete location response
  * @author : Softweb solutions
  */
  router.get('/deleteLocation/:id', function (req, res) {

      var id = req.params.id;
      var request = new sql.Request(cp);
      request.query("SELECT * FROM so_location WHERE id="+id, function(err, result) {
        if(err)
        {
            res.json(err);
        }
        else
        {
          fs.unlink("public/images/location/"+result[0].image);
          request.query("DELETE FROM so_location WHERE id="+id, function(err1, result1) {
            if(err1)
            {
              res.json(err1);
          }
          else
          {
              res.json({data: null, message: "success"});
          }
      });
      }
  });
  });


/**
  * @module : Location
  * @desc   : Get all rooms
  * @return : Return list rooms
  * @author : Softweb solutions
  */
  router.get('/getallroom', function(req, res) {
      requestapi.get({
        url:'https://jll1384.azurewebsites.net/api/GetAllRooms',
        headers: {'Content-Type': 'application/json'},
    },
    function (error, response, body) {
        var body = JSON.parse(body);
        if(body.length > 0)
        {
          var emailarray = [];
          async.forEachSeries(body, function(bodymsg, callback){

            emailarray.push(bodymsg.RoomAddress);
            var roomname = bodymsg.RoomName;
            var roomaddress = bodymsg.RoomAddress;
            var requestsql = new sql.Request(cp);
            requestsql.query("SELECT * FROM so_location WHERE address = '"+bodymsg.RoomAddress+"'",
                function(err, result) {
                  if(err)
                  {
                    res.json({error: err});
                }
                else
                {
                    if(result.length>0)
                    {
                      requestsql.query("UPDATE so_location SET name='"+bodymsg.RoomName+"',address='"+bodymsg.RoomAddress+"', amenities='"+bodymsg.ResourceCustom+"', capacity='"+bodymsg.ResourceCapacity+"', user_permission='"+JSON.stringify(bodymsg.AccessRights)+"' WHERE address='"+bodymsg.RoomAddress+"'", function(err2, result2) {
                        if(err2)
                        {
                            res.json({error: err2});
                        }
                        else
                        {

                        }
                    });
                  }
                  else
                  {
                      requestsql.query("INSERT INTO so_location (name, address, image, officeid, notes, timestamp, status, capacity, amenities,user_permission) VALUES ('"+bodymsg.RoomName+"','"+bodymsg.RoomAddress+"','','','', CURRENT_TIMESTAMP, 0, '"+bodymsg.ResourceCapacity+"','"+bodymsg.ResourceCustom+"','"+JSON.stringify(bodymsg.AccessRights)+"')",
                          function(err, result) {
                            if(err)
                            {
                              res.json({error: err});
                          }
                          else
                          {
                             res.json({result: result});
                         }
                     });
                  }
              }
          });
            callback();
        },function(err){
          var emailarr = emailarray;
          var requestsql = new sql.Request(cp);
          var locquery = "SELECT * FROM so_location WHERE address NOT IN (";
          for(var j=0;j<emailarray.length;j++){
            if(j+1 != emailarray.length){
              locquery+= "'"+emailarray[j]+"',";
          }else{
              locquery+= "'"+emailarray[j]+"'";
          }
      }
      locquery+= ")";
      requestsql.query(locquery, function(err, result) {
        if(err)
        {
          res.json(err);
      }
      else
      {
          if(result.length > 0){
            for(var k=0;k<result.length;k++){
              var locid = result[k].id;
              requestsql.query("DELETE FROM so_location WHERE id="+result[k].id, function(err1, result1) {
                if(err1)
                {
                  res.json(err1);
              }
              else
              {
                requestsql.query("DELETE FROM so_device WHERE locationid="+locid,
                 function(err1, result1) {
                   if(err1)
                   {
                      res.json(err1);
                  }
                  else
                  {

                  }
              });
            }
        });
          }
      }
  }
});
  });
      }
  });
  });


/**
  * @module : Location
  * @desc   : Add room coordinate 
  * @return : Return add room coordinate response
  * @author : Softweb solutions
  */
  router.post('/addroomcoordinate', function (req, res) {
      var room_email = req.body.email;
      var x_coordinate = req.body.x_coordinate;
      var y_coordinate = req.body.y_coordinate;
      var request = new sql.Request(cp);
      request.query("UPDATE so_location SET x_cordinate = "+x_coordinate+", y_cordinate = "+y_coordinate+" WHERE address ='"+room_email+"'", 
          function(err, result)
          {
            if(err)
            {
              res.json({"message": err});
          }
          else
          {
              request.query("SELECT * FROM so_location WHERE  x_cordinate = '"+x_coordinate+"' and  y_cordinate = '"+y_coordinate+"' and address = '"+room_email+"'", 
                  function(err, result1)
                  {
                    if(err)
                    {
                      res.json({"message": err});
                  }
                  else
                  {
                      if(result1[0]==undefined)
                        res.json({"message": "No location found."});
                    else
                        res.json({"message": "Co-ordinate added successfully."});
                }
            });
          }
      });
  });   


// Add event data in DB
// Add data in local database also done by JJ < jeel.joshi@softwebsolutions.com > 
router.post('/addevent/:dataid', function (req, res) {
  //console.log(req.body);
  //console.log(req.body.email.length);
  //console.log('dataid------'+req.body.dataid);
  var eventEmail = [];
//console.log("Email=== " + req.body.email);
var cookieName = session.outlookCookie;
var outlookClient = new outlook.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
  authHelper.getAccessTokenFn(cookieName));

var dataid = req.params.dataid;
var purpose = req.body.purpose;
var attendees  = req.body.attendees;
var locationid = req.body.locationid;
var locationname = req.body.locationname;
  //var peopleid = req.body.peopleid;
  //var peopleid = session.getuserId;
  var peopleid = 1;
  var year = req.body.selcaldate.year;
  var month = req.body.selcaldate.month + 1;
  var day = req.body.selcaldate.day;
  var hours = req.body.hours;
  if (!hours){
    var hours = req.body.selhours;
}
var minutes = req.body.minutes;
if (!minutes){
    var minutes = req.body.selminutes;
}
var endhours = req.body.endhours;
if (!endhours){
    var endhours = req.body.selendhours;
}
var endminutes = req.body.endminutes;
if (!endminutes){
    var endminutes = req.body.selendminutes;
}
var hours = req.body.hours;
var minutes = req.body.minutes;
var seldate = new Date(year, month, day,hours, minutes, "0");
var timedd = seldate.getDate();
  var timemm = seldate.getMonth(); //January is 0!
  var timeyyyy = seldate.getFullYear();
  var timehour = seldate.getHours();
  var timemonth = seldate.getMinutes(); //January is 0!
  var timesecond = seldate.getSeconds();
  var time = timeyyyy+'-'+timemm+'-'+timedd+' '+timehour+':'+timemonth+':'+timesecond;
  var endtime = timeyyyy+'-'+timemm+'-'+timedd+' '+endhours+':'+endminutes+':'+timesecond;
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var timestamp = yyyy+'-'+mm+'-'+dd;
  console.log(year+"=>"+req.body.selcaldate.month+"=>"+day+"=>"+hours+"=>"+minutes+"=>"+"0");
  console.log(year+"=>"+req.body.selcaldate.month+"=>"+day+"=>"+endhours+"=>"+endminutes+"=>"+"0");
  var eventstartdate = new Date(year, req.body.selcaldate.month, day,hours, minutes, "0");
  var eventstartdaten = eventstartdate.toISOString();
  var eventenddate = new Date(year, req.body.selcaldate.month, day,endhours, endminutes, "0");
  var eventenddaten = eventenddate.toISOString();
  console.log(eventstartdaten);
  console.log(eventenddaten);  
  if(dataid == 1) {
    for(var j=0;j<req.body.email.length;j++){
        eventEmail.push({"attendees": req.body.email[j].email});
    }
    //console.log("TESST"+JSON.parse(eventEmail))
    sql.connect(dbconfig, function(err) {
        var request = new sql.Request(cp);
    // prevent sql injection
    request.input(attendees, sql.Int);
    request.input(locationid, sql.Int);
    request.input(peopleid, sql.Int);
    console.log("event emails"+eventEmail);
    console.log("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,timestamp,attendies,datastorevalue,endtime) VALUES ("+locationid+","+peopleid+",'"+purpose+"','"+time+"','"+timestamp+"','"+JSON.stringify(eventEmail)+"',"+1+",'"+endtime+"')");

    request.query("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,timestamp,attendies,datastorevalue,endtime) VALUES ("+locationid+","+peopleid+",'"+purpose+"','"+time+"','"+timestamp+"','"+JSON.stringify(eventEmail)+"',"+1+",'"+endtime+"')", 
        function(err, result)
        {
          if(err)
          {
            console.log(err)
            res.json(err);
        //res.end();
    }
    else
    {
        res.json("Room booked successfully");
    }
});
});
} else {
    for(var j=0;j<req.body.email.length;j++){
    eventEmail.push({"EmailAddress": {"Address": req.body.email[j].email,"Name": " "},"Type": "Required"});
    }
    sql.connect(dbconfig, function(err) {
        var request = new sql.Request();
    // prevent sql injection
    request.input(attendees, sql.Int);
    request.input(locationid, sql.Int);
    request.input(peopleid, sql.Int);

    console.log("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,timestamp,attendies) VALUES ("+locationid+","+peopleid+",'"+purpose+"','"+time+"','"+timestamp+"',"+attendees+")");

    request.query("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,timestamp,attendies) VALUES ("+locationid+","+peopleid+",'"+purpose+"','"+time+"','"+timestamp+"',"+attendees+")", 
        function(err, result)
        {
          if(err)
          {
            console.log(err)
            res.json(err);
        //res.end();
    }
    else
    {
        if (cookieName) {
          requestapi({
           method: 'POST',
           url: 'https://outlook.office365.com/api/v1.0/me/events/',
           headers: {
            'Content-Type': 'application/json'
        },
        auth:{ 'bearer' : cookieName },
        json:{"Subject": purpose,"Body": {"ContentType": "HTML","Content": purpose},"Location": {"DisplayName": locationname},"Start": eventstartdaten,"StartTimeZone": "Pacific Standard Time","End": eventenddaten,"EndTimeZone": "Pacific Standard Time","Attendees": eventEmail},
    }, function(error, request, body){
       console.log(body);
   });
      }
      res.json("Room booked successfully");
  }
});
});
}

});


// Edit event data in DB
// Edit data in local database done by JJ < jeel.joshi@softwebsolutions.com >
router.post('/updateevent/:dataid', function (req, res) {
  console.log(req.body);
  console.log(req.body.email.length);
  var eventEmail = [];
  
var cookieName = session.outlookCookie;
var outlookClient = new outlook.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
  authHelper.getAccessTokenFn(cookieName));

var purpose = req.body.purpose;
var attendees  = req.body.attendees;
  //var time  = req.body.time;
  var dataid = req.params.dataid;
  var id = req.body.id;
  var locationid = req.body.locationid;
  var locationname = req.body.locationname;
  //var peopleid = session.getuserId;
  var peopleid = 1;
  var year = req.body.selcaldate[0].year;
  var month = req.body.selcaldate[0].month + 1;
  var day = req.body.selcaldate[0].day;
  var hours = req.body.hours;
  if (!hours){
    var hours = req.body.selhours;
}
var minutes = req.body.minutes;
if (!minutes){
    var minutes = req.body.selminutes;
}
var endhours = req.body.endhours;
if (!endhours){
    var endhours = req.body.selendhours;
}
var endminutes = req.body.endminutes;
if (!endminutes){
    var endminutes = req.body.selendminutes;
}
var seldate = new Date(year, month, day,hours, minutes, "0");
var timedd = seldate.getDate();
  var timemm = seldate.getMonth(); //January is 0!
  var timeyyyy = seldate.getFullYear();
  var timehour = seldate.getHours();
  var timemonth = seldate.getMinutes(); //January is 0!
  var timesecond = seldate.getSeconds();
  var time = timeyyyy+'-'+timemm+'-'+timedd+' '+timehour+':'+timemonth+':'+timesecond;
  var endtime = timeyyyy+'-'+timemm+'-'+timedd+' '+endhours+':'+endminutes+':'+timesecond+'.000';
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var timestamp = yyyy+'-'+mm+'-'+dd;
  console.log(year+"=>"+req.body.selcaldate[0].month+"=>"+day+"=>"+hours+"=>"+minutes+"=>"+"0");
  console.log(year+"=>"+req.body.selcaldate[0].month+"=>"+day+"=>"+endhours+"=>"+endminutes+"=>"+"0");
  var eventstartdate = new Date(year, req.body.selcaldate[0].month, day,hours, minutes, "0");
  var eventstartdaten = eventstartdate.toISOString();
  var eventenddate = new Date(year, req.body.selcaldate[0].month, day,endhours, endminutes, "0");
  var eventenddaten = eventenddate.toISOString();
  console.log(eventstartdaten);
  console.log(eventenddaten);
  console.log("id"+id);
  
  if(dataid == 1) {
    for(var j=0;j<req.body.email.length;j++){
        eventEmail.push({"attendees": req.body.email[j].email});
    }
    sql.connect(dbconfig, function(err) {
        var request = new sql.Request();
    // prevent sql injection
    request.input(attendees, sql.Int);
    request.input(locationid, sql.Int);
    request.input(peopleid, sql.Int);
    var endtime1 = '2016-8-11 08:30:00';

    console.log("UPDATE so_room_reservation SET locationid = '"+locationid+"',peopleid = '"+peopleid+"',purpose = '"+purpose+"',time = '"+time+"',timestamp = '"+timestamp+"',attendies = '"+JSON.stringify(eventEmail)+"',datastorevalue = '"+1+"',endtime = '"+endtime+"' WHERE id = '"+id+"'")

    request.query("UPDATE so_room_reservation SET locationid = '"+locationid+"',peopleid = '"+peopleid+"',purpose = '"+purpose+"',time = '"+time+"',timestamp = '"+timestamp+"',attendies = '"+JSON.stringify(eventEmail)+"',datastorevalue = '"+1+"',endtime = '"+endtime+"' WHERE id = '"+id+"'", 
        function(err, result)
        {
          if(err)
          {
            console.log(err)
            res.json(err);
        //res.end();
    }
    else
    {
        res.json("Room booked successfully");
    }
});
});
  } else{
    for(var j=0;j<req.body.email.length;j++){
    eventEmail.push({"EmailAddress": {"Address": req.body.email[j].email,"Name": " "},"Type": "Required"});
}
    requestapi({
     method: 'PATCH',
     url: 'https://outlook.office365.com/api/v1.0/me/events/'+req.body.eventid,
     headers: {
      'Content-Type': 'application/json'
  },
  auth:{ 'bearer' : cookieName },
  json:{"Subject": purpose,"Body": {"ContentType": "HTML","Content": purpose},"Location": {"DisplayName": locationname},"Start": eventstartdaten,"StartTimeZone": "Pacific Standard Time","End": eventenddaten,"EndTimeZone": "Pacific Standard Time","Attendees": eventEmail},
}, function(error, request, body){
 console.log(body);
 res.json("Room booked successfully"); 
});
}

});


router.post('/checkRoomEvents', function (req, res) {
  var locationid = req.body.locationid;
  var peopleid = session.getuserId;
  sql.connect(dbconfig, function(err) {
      if(err){res.json(err);}
      var request = new sql.Request(cp);
      request.query("SELECT id,locationid,peopleid,purpose,CONVERT(VARCHAR(50), time, 121) as time,timestamp,attendies FROM so_room_reservation WHERE locationid="+locationid+" AND peopleid="+peopleid, function(err, result) {
       if(err)
       {
          res.json(err);
      }
      else
      {
        res.json({data: result, message: "Room data"});
    }
});
  });
});



/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > save amenities into location*/
/**
  * @module : Location
  * @desc   : Add Amenities into location 
  * @return : Return location response
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/addAmenitiesIntoLocation', function (req, res) {
  var id= req.body.id;
  var amenities = req.body.amenities;
  var request = new sql.Request(cp);
  request.query("UPDATE so_location SET amenities = '" + amenities + "' WHERE id = " + id, function(err, result) {
    if (err) {
      res.json(err);
    } else {
      res.json({data: result, message: "success"});
    }
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Office Locations of Particular User Using User Guid */
/**
  * @module : Location
  * @desc   : Get Office Locations of Particular User Using User Guid
  * @return : Return Office Locations Response
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/getUserOfficeLocations/:userguid', function (req, res) {
  var userguid = req.params.userguid;
  var request = new sql.Request(cp);
  request.query("SELECT SOL.* FROM so_officelocations SOL INNER JOIN so_people SP ON SOL.companyid = SP.officeid WHERE SP.userid = '"+userguid+"' ", function(error, result) {
    if(error) {
      res.json(error);
    }
    else {
      res.json({data: result, message: "success"});
    }
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All Office Locations */
/**
  * @module : Location
  * @desc   : Get All Office Locations 
  * @return : Return Office Locations Response
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/allOfficeLocations/:userguid', function (req, res) {
  var userguid = req.params.userguid;
  var request = new sql.Request(cp);
  request.query("SELECT ofc.* FROM so_officelocations as ofc INNER JOIN so_people as ppl ON ofc.companyid = ppl.officeid where ppl.userid = '"+userguid+"' ", function(error, result) {
    if(error) {
      res.json(error);
    }
    else {
      res.json({data: result, message: "success"});
    }
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add New Office Location */
/**
  * @module : Location
  * @desc   : Add New Office Location
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/addOfficeLocation', function (req, res) {
  var userid = req.body.userid;
  var name = req.body.officeLocationData.name;
  var address = req.body.officeLocationData.address;
  var note = req.body.officeLocationData.note;
    var floors = req.body.officeLocationData.floors;
  if(req.body.officeLocationData.newimage) {
    var filename  = req.body.officeLocationData.newimage.filename;
    var image  = req.body.officeLocationData.newimage.base64;
    var ext = filename.split(".");
    var timestamp = Math.floor(new Date() / 1000);
    var newFileName = 'location/location_'+ timestamp +"."+ext[ext.length-1];
    var fd = fs.openSync('./public/images/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
  }
  else {
    var newFileName = '';
  }

  var request = new sql.Request(cp);
  console.log("SELECT officeid FROM so_people WHERE userid = '"+userid+"'");
  request.query("SELECT officeid FROM so_people WHERE userid = '"+userid+"'", function(error1, result1) {
      if(error1)
      {
      }
      else
      {  
        var id = 0;
        if(result1.length)
          {
            id = result1[0].officeid;   
          }
    request.query("INSERT INTO so_officelocations (userid,companyid,name,address ,note, image, createddate,floors) VALUES ('"+userid+"',"+id+",'"+name+"','"+address+"','"+note+"','"+newFileName+"', CURRENT_TIMESTAMP,'"+floors+"')", function(error, result) {
    if (error) {
      res.json(error);
    } else {
      res.json({data: result, message: "success"});
    }
  });
    }
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Update Office Location */
/**
  * @module : Location
  * @desc   : Update Office Location
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/updateOfficeLocation', function (req, res) {
  var id = req.body.id;
  var name = req.body.name;
  var address = req.body.address;
  var note = req.body.note;  
  var floors = req.body.floors; 
  if(req.body.newimage) {
    var filename  = req.body.newimage.filename;
    var image  = req.body.newimage.base64;
    var ext = filename.split(".");
    var timestamp = Math.floor(new Date() / 1000);
    var newFileName = 'location/location_'+ timestamp +"."+ext[ext.length-1];
    var fd = fs.openSync('./public/images/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
    if(req.body.image) {
      if (fs.existsSync('./public/images/'+req.body.image)) {
        fs.unlinkSync('./public/images/'+req.body.image);
      }
    }
  }
  else {
    var newFileName = req.body.image;
  }
    
  var request = new sql.Request(cp);
  request.query("UPDATE so_officelocations SET name = '"+name+"', address = '"+address+"', note = '"+note+"', image = '"+newFileName+"',floors = '"+floors+"', modifieddate = CURRENT_TIMESTAMP WHERE id = " + id, function(error, result) {
    if (error) {
      res.json(error);
    } else {
      res.json({data: result, message: "success"});
    }
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Delete Office Location */
/**
  * @module : Location
  * @desc   : Delete Office Location
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/deleteOfficeLocation', function (req, res) {
  var id = parseInt(req.body.id);
  if(id) {
    var request = new sql.Request(cp);
     request.query("SELECT count(*) as cnt FROM so_floor WHERE locationid = '"+id+"' ", function(error, result) {
      if (error) {
        res.json({error:error,type:'error'});
      } else {
        if (result[0].cnt > 0) {
          res.json({message: "Floor is allocate for this building so you can not delete this.",type:'error'});
        }
        else {
          request.query("DELETE FROM so_officelocations WHERE id = "+id, function(error1, result1) {
            if (error1) {
              res.json({error:error1,type:'error'});
            } else {
              res.json({data: result1, message: "success",type:'success'});
            }
          });
        }
      }
    });
  }
  else {
    res.json({message: "Invalid location Id."});
  }    
});

/* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Mass Delete Space */
/**
  * @module : Location
  * @desc   : Mass Delete Location
  * @return : -
  * @author : Softweb solutions - Dhaval Thaker
*/
router.post('/massDeleteLocation', function (req, res) {
  var ids = req.body.ids;
  console.log(ids);
  if(ids) {
    var request = new sql.Request(cp);
    request.query("DELETE FROM so_officelocations WHERE id IN("+ids.join()+") ", function(error, result) {
      if (error) {
        console.log(error);
      } else {
        res.json({data: result, message: "success"});
      }
    });
  }
  else {
    res.json({message: "Invalid Location Id."});
  }    
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add New Space */
/**
  * @module : Location
  * @desc   : Add New Space
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/addSpace', function (req, res) {
  var userid = req.body.userid;
  var name = req.body.spaceData.name;
  var locationId = req.body.spaceData.location_id;
  var capacity = req.body.spaceData.capacity;
  var spaceType = req.body.spaceData.space_type;
  var size = req.body.spaceData.size;
  var notes = req.body.spaceData.notes;
  var floorid = parseInt(req.body.spaceData.floorid);
  
  var spaceStatus = parseInt(req.body.spaceData.space_status);
  var amenities = req.body.spaceData.amenities;
  if(req.body.spaceData.newimage) {
    var filename  = req.body.spaceData.newimage.filename;
    var image  = req.body.spaceData.newimage.base64;
    var ext = filename.split(".");
    var timestamp = Math.floor(new Date() / 1000);
    var newFileName = 'space/space_'+ timestamp +"."+ext[ext.length-1];
    var fd = fs.openSync('./public/images/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
  }
  else {
    var newFileName = '';
  }

  var request = new sql.Request(cp);
  console.log("SELECT officeid FROM so_people WHERE userid = '"+userid+"'");
  request.query("SELECT officeid FROM so_people WHERE userid = '"+userid+"'", function(error1, result1) {
    if (error1) {
      res.json(error1);
    }
    else {
      var officeId = 0;
      if (result1.length) {
        officeId = result1[0].officeid;
      }
  
      request.query("INSERT INTO so_location (name, address, image, amenities, officeid, notes, timestamp, space_status, capacity,location_id,space_type,size,rooms_from,floorid) VALUES ('"+name+"','','"+newFileName+"','"+amenities+"',"+parseInt(officeId)+",'"+notes+"', CURRENT_TIMESTAMP, "+parseInt(spaceStatus)+","+capacity+","+locationId+",'"+spaceType+"',"+size+",1,"+floorid+")", function(error, result) {
        if (error) {
          res.json(error);
        } else {
          res.json({data: result, message: "success"});
        }
      });
    }
  });
});
/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Update Space */
/**
  * @module : Location
  * @desc   : Update Space
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/updateSpace', function (req, res) {
  var id = req.body.id;
  var name = req.body.name;
  var locationId = req.body.location_id;
  var capacity = req.body.capacity;
  var spaceType = req.body.space_type;
  var size = req.body.size;
  var notes = req.body.notes;
  var spaceStatus = parseInt(req.body.space_status);
  var floorid = parseInt(req.body.floorid);
  var amenities = req.body.amenities;
  if(req.body.newimage) {
    var filename  = req.body.newimage.filename;
    var image  = req.body.newimage.base64;
    var ext = filename.split(".");
    var timestamp = Math.floor(new Date() / 1000);
    var newFileName = 'space/space_'+ timestamp +"."+ext[ext.length-1];
    var fd = fs.openSync('./public/images/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
    if(req.body.image) {
      if (fs.existsSync('./public/images/'+req.body.image)) {
        fs.unlinkSync('./public/images/'+req.body.image);
      }
    }      
  }
  else {
    var newFileName = req.body.image;
  }

  if (spaceType == 'No Type') {
    spaceType = '';
  }

  var request = new sql.Request(cp);
  request.query("UPDATE so_location SET name = '"+name+"', amenities = '" + amenities + "', space_status = "+parseInt(spaceStatus)+", image = '"+newFileName+"', notes = '"+notes+"',capacity = "+capacity+", location_id = '"+locationId+"', space_type = '"+spaceType+"', size = '"+size+"', rooms_from = 1, floorid = "+floorid+" WHERE id="+id, function(error, result) {
    if (error) {
      res.json(error);
    } else {
      res.json({data: result, message: "success"});
    }
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Delete Space */
/**
  * @module : Location
  * @desc   : Delete Space
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/deleteSpace', function (req, res) {
  var id = parseInt(req.body.id);
  if(id) {
    var currentDate = new Date();
    var currentDateISO = currentDate.toISOString();
    var dateArry = currentDate.toISOString().split('.');
    if (dateArry.length > 0) {
      currentDateISO = dateArry[0];
    }

    var request = new sql.Request(cp);
    request.query("SELECT * FROM so_room_reservation WHERE CONVERT(VARCHAR, endtime , 126) >= '"+currentDateISO+"' AND action != 'CANCELED' AND notification_action != 'R' AND locationid = "+ id, function(error, result) {
      if (error) {
        res.json({error:error,type:'error'});
      } else {
        if (result.length > 0) {
          res.json({message: "Event is booked for this space so you can not delete this space.",type:'error'});
        }
        else {
          request.query("DELETE FROM so_location WHERE id = "+id, function(error1, result1) {
            if (error1) {
              res.json({error:error1,type:'error'});
            } else {
              res.json({data: result1, message: "success",type:'success'});
            }
          });
        }
      }
    });
  }
  else {
    res.json({message: "Invalid space Id.",type:'error'});
  }    
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Mass Delete Space */
/**
  * @module : Location
  * @desc   : Mass Delete Space
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/massDeleteSpace', function (req, res) {
  var ids = req.body.ids;
  if(ids) {
    var request = new sql.Request(cp);
    request.query("DELETE FROM so_location WHERE id IN("+ids.join()+") ", function(error, result) {
      if (error) {
        res.json(error);
      } else {
        res.json({data: result, message: "success"});
      }
    });
  }
  else {
    res.json({message: "Invalid space Id."});
  }    
});

/* code added by Jeel Joshi <jeel.joshi@softwebsolutions.com > */
/**
  * @module : Location
  * @desc   : Mass Delete Device
  * @return : -
  * @author : Softweb solutions
*/
router.post('/massDeleteDevice', function (req, res) {
  var ids = req.body.ids;
  if(ids) {
    var request = new sql.Request(cp);
    request.query("DELETE FROM so_device WHERE id IN("+ids.join()+") ", function(error, result) {
      if (error) {
        res.json(error);
      } else {
        res.json({data: result, message: "success"});
      }
    });
  }
  else {
    res.json({message: "Invalid device Id."});
  }    
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Save Room Event */
/**
  * @module : Location
  * @desc   : Save Room Event
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/saveEvent/:dataid', function (req, res) {
  var dataId = req.params.dataid;
  var id = req.body.id;
  var locationId = req.body.locationid;
  var peopleId = req.body.peopleid;
  var purpose = req.body.purpose;
  var attendies = req.body.attendies;
  var dataStoreValue = req.body.datastorevalue;
  var markAsPrivate = req.body.mark_as_private;  
  var time = req.body.time;
  var endTime = req.body.endtime;
  var timestamp = req.body.timestamp;
  var duration = req.body.duration;
  var event_id = req.body.event_id;
  var detail = req.body.detail;
  var start_time = moment.utc(time).format('ddd DD MMM YYYY HH:mm');
  var end_time = moment.utc(endTime).format('HH:mm')+' (UTC)';
  purpose = purpose.replace(new RegExp("'", 'g'), "''");
  detail = detail.replace(new RegExp("'", 'g'), "''");
  timestamp =  Math.round(timestamp/1000.0);
  var userEmail = req.body.UserEmail;
  var officeAdminemail = req.body.officeAdminemail;
  var UserName = req.body.UserName;

  var amenities = req.body.amenities;
  var showamenity = req.body.ShowAmenities;
  var catering = req.body.catering;
  var showcatering = req.body.ShowCatering;

  if(dataId == 1) {
    sql.connect(dbconfig, function(err) {
      var request = new sql.Request(cp);
      request.input(locationId, sql.Int);
      request.input(peopleId, sql.Int);
      request.input(dataStoreValue, sql.Int);
      request.input(timestamp, sql.Int);
      request.input(duration, sql.Int);
      
      if(id == 0) {
        request.query("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,endtime,timestamp,attendies,datastorevalue,mark_as_private,detail,duration,event_id,action,notification_action,initial_duration) VALUES ("+locationId+","+peopleId+",'"+purpose+"','"+time+"','"+endTime+"',"+timestamp+",'"+JSON.stringify(attendies)+"',"+dataStoreValue+","+markAsPrivate+",'"+detail+"',"+parseInt(duration)+",'"+event_id+"','BOOKNOW','B',"+parseInt(duration)+")", function(error, result) {
          if(error) {
            res.json(error);
          }
          else {
            var smtpTransport = commonConfig.impconfig.smtpTransport;
            if (showamenity == true) {
              mail_body_amenities = commonConfig.createEventAmenitiesTemplate(amenities,UserName);
              var mailOptions_amenities = {
                from: userEmail, // sender address
                to: officeAdminemail, // receiver's email
                subject: "New Amenities Request", // Subject line
                html: mail_body_amenities
              }
              smtpTransport.sendMail(mailOptions_amenities, function(amenitiesMailError, amenitiesMailResponse) {
                if (amenitiesMailError) {
                  console.log("amenities Mail Error = "+amenitiesMailError);
                }
              });
            }

            if (showcatering == true) {
              mail_body_catering = commonConfig.createEventCateringTemplate(catering,UserName);
              var mailOptions_catering = {
                from: userEmail, // sender address
                to: officeAdminemail, // receiver's email
                subject: "New Catering Request", // Subject line
                html: mail_body_catering
              }
              smtpTransport.sendMail(mailOptions_catering, function(cateringMailError, cateringMailResponse) {
                if (cateringMailError) {
                  console.log("catering Mail Error"+cateringMailError);
                }
              });
            }
            request.query("SELECT email,name from so_people WHERE id ="+peopleId, function(error, result) {
              if(error) {
                res.json(error);
              }
              else {
                var people_email = result[0].email;
                var people_name = result[0].name;
                request.query("SELECT name from so_location WHERE id ="+locationId, function(err, result1) {
                  if(error) {
                    res.json(err);
                  }
                  else {
                    var location_name = result1[0].name;            
                    
                    var arr = [];
                    attendies.forEach(function (resul) {
                      arr.push(resul.attendees);
                    });
                    //arr.push(people_email);
                    var cnt = 0;
                    async.forEachSeries(arr, function(n1, callback_s1) {
                      mail_body = commonConfig.createEventTemplate(location_name,purpose,start_time,end_time,detail,people_name);
                      var mailOptions = {
                        from: commonConfig.impconfig.adminEmail, // sender address
                        to: n1, // receiver's email  
                        subject: "SoftwebOffice - Invitation to join the meeting", // Subject line
                        html: mail_body
                      }
                      smtpTransport.sendMail(mailOptions, function(error, response) {
                        cnt++;
                        if (error) {
                          console.log("Error"+error);
                        }
                        else {
                          console.log("Message sent: " + response.message);
                          if (cnt == arr.length) {
                            res.json({status:true,"message":"Room booked successfully"});
                          }
                        }
                      });
                      callback_s1();
                    });
                  }
                });
              }
            });
            //res.json("Room booked successfully");
          }
        });
      } 
      else {
        request.query("UPDATE so_room_reservation SET locationid = "+locationId+",peopleid = "+peopleId+",purpose = '"+purpose+"',time = '"+time+"',endtime = '"+endTime+"',timestamp = "+timestamp+",attendies = '"+JSON.stringify(attendies)+"',datastorevalue = "+dataStoreValue+",mark_as_private = "+markAsPrivate+",detail = '"+detail+"',duration = "+duration+",event_id = '"+event_id+"' WHERE id = "+id+"", function(error, result) {
          if(error) {
            res.json(error);
          }
          else {
            res.json("Room Updated successfully");
          }
        });
      }
    });
  }
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get User's All Space */
/**
  * @module : Location
  * @desc   : Get User's All Space
  * @return : Return User's All Space
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/allSpacesOfUser/:userUcGuid/:dataid', function (req, res) {
  var userUcGuid = req.params.userUcGuid;
  var dataid = req.params.dataid;
  var request = new sql.Request(cp);

  if (dataid == 1) {
    request.query("SELECT SL.*, f.floorname as floorName, ol.name as officeLocationName, (SELECT TOP(1) CONVERT(VARCHAR(50), dl.timestamp, 121) as timestamp FROM so_location as l LEFT JOIN so_device as d ON l.id=d.locationid LEFT JOIN so_device_locator as dl ON d.id = dl.beaconid WHERE l.id = SL.id AND d.id = dl.beaconid GROUP BY  dl.timestamp, l.officeid, d.uuid, d.major, d.minor  ORDER BY dl.timestamp desc) as beacon_status FROM so_location SL LEFT JOIN so_floor f ON f.id = SL.floorid LEFT JOIN so_officelocations ol ON ol.id = SL.location_id INNER JOIN so_people SP ON SP.officeid = SL.officeid WHERE SL.rooms_from = 1 AND SP.userid = '"+userUcGuid+"' AND SL.space_status = 1  order by SL.id desc", function(error, result) {
      if (error) {
        res.json('Something went wrong. Please try again.');
      }
      else {
        if (result.length > 0) {
          for (var i = 0; i < result.length; i++) {
            if (result[i].status == 1 && result[i].beacon_status) {
              result[i].status = result[i].status;
            }
            else {
              result[i].status=0;
            }
          }

          res.json({"data": result});
        }
        else {
          res.json({"data": result});  
        }
        
      }
    });
  }
  else {
    res.json('Something went wrong. Please try again.');
  }
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get User's All Space */
/**
  * @module : Location
  * @desc   : Get User's All Space
  * @return : Return User's All Space
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/allSpacesOfUserForListing/:userUcGuid/:dataid', function (req, res) {
  var userUcGuid = req.params.userUcGuid;
  var dataid = req.params.dataid;
  var request = new sql.Request(cp);

  if (dataid == 1) {
    request.query("SELECT SL.*,f.floorname as floorName, ol.name as officeLocationName FROM so_location SL LEFT JOIN so_floor f ON f.id = SL.floorid LEFT JOIN so_officelocations ol ON ol.id = SL.location_id INNER JOIN so_people SP ON SP.officeid = SL.officeid WHERE SL.rooms_from = 1 AND SP.userid = '"+userUcGuid+"' order by SL.id desc", function(error, result) {
      if (error) {
        res.json('Something went wrong. Please try again.');
      }
      else {
        res.json({"data": result});
      }
    });
  }
  else {
    res.json('Something went wrong. Please try again.');
  }
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Space Details */
/**
  * @module : Location
  * @desc   : Get Space Details
  * @return : Return Space Details
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/spaceDetails/:spaceid/:userUcGuid/:dataid', function (req, res) {
  var spaceid = req.params.spaceid;
  var userUcGuid = req.params.userUcGuid;
  var dataid = req.params.dataid;
  var request = new sql.Request(cp);

  var spaceResult = [];
  var spaceEvents = [];
  var spaceDevices = [];

  if (dataid == 1) {
     request.query("SELECT SL.*,SOL.name as officeName FROM so_location SL LEFT JOIN so_officelocations SOL ON SOL.id = SL.location_id INNER JOIN so_office SO ON SO.Id = SL.officeid INNER JOIN so_people SP ON SP.officeid = SO.Id WHERE SL.id = "+spaceid+" AND SL.rooms_from = 1 AND SP.userid = '"+userUcGuid+"' AND SL.space_status = 1 order by SL.id desc",function(error, result) {
      if (error) {
        res.json('Something went wrong. Please try again.');
      }
      else {
        if (result.length == 0) {
          res.status(404).send('Sorry, we cannot find that!');
        }
        else {
          if (result[0].image) {
            result[0].image = base_url+"/images/"+result[0].image;
          }
          else {
            result[0].image = base_url+"/images/room-detail-image.jpg";
          }

          spaceResult = result;

          request.query("SELECT TOP(1) CONVERT(VARCHAR(50), dl.timestamp, 121) as timestamp FROM so_location as l LEFT JOIN so_device as d ON l.id=d.locationid LEFT JOIN so_device_locator as dl ON d.id = dl.beaconid WHERE l.id = '"+spaceid+"' AND d.id = dl.beaconid GROUP BY  dl.timestamp, l.officeid, d.uuid, d.major, d.minor  ORDER BY dl.timestamp desc ", function(statusError, statusResult) {
            var spaceStatus = result[0].status;
            if (result[0].status == 1 && statusResult.length > 0) {
              //var intime = moment(result[0].timestamp).format("HH:mm:ss");
              result[0].status = result[0].status;
            }
            else {
              result[0].status=0;
            }

            request.query("SELECT * FROM so_room_reservation where locationid = "+spaceid+" AND ( action = 'BOOKLATER' OR action = 'BOOKNOW') AND notification_action != 'R' AND datastorevalue = "+dataid, function (eventError, eventResult) {
                if (eventError) {
                  console.log('Event Get Error:',eventError);
                  res.json(eventError);
                }
                else {
                  result[0].allSpaceEvents = eventResult;
                  spaceEvents = eventResult;

                  request.query("SELECT SD.* FROM so_device as SD INNER JOIN so_location as SL ON SL.id = SD.locationid WHERE SD.locationid="+spaceid+" GROUP BY SD.id, SD.name, SD.uuid, SD.major, SD.minor, SD.locationid, SD.devicetype, SD.boardid, SD.timestamp", function(deviceError, deviceResult) {
                      if (deviceError) {
                        console.log('Device Get Error:',deviceError);
                        res.json(deviceError);
                      }
                      else {
                        result[0].allDeviceEvents = deviceResult;
                        spaceDevices = deviceResult;

                        var spaceAmenities = [];
                        if (result[0].amenities) {
                          result[0].amenities = result[0].amenities.split(',');
                          if (result[0].amenities.length) {
                            result[0].amenities.forEach(function(value){
                              spaceAmenities.push("'"+value+"'"); 
                            });
                          }
                        }

                        if (spaceAmenities.length) {
                          request.query("SELECT SA.* FROM so_amenities as SA WHERE SA.am_status = 1 AND SA.am_guid IN ("+spaceAmenities.join()+")", function(amenitiesError, amenitiesResult) {
                              if (amenitiesError) {
                                console.log('Amenities Get Error:',amenitiesError);
                                res.json(amenitiesError);
                              }
                              else {
                                if (amenitiesResult.length > 0) {
                                  for (var a = 0; a < amenitiesResult.length; a++) {
                                    if (amenitiesResult[a].am_image) {
                                      amenitiesResult[a].am_image = base_url+"/images/"+amenitiesResult[a].am_image;
                                    }
                                  }
                                }
                                
                                result[0].amenitiesData = amenitiesResult;
                                res.json({spaceData:result, spaceEvents:spaceEvents, spaceDevices:spaceDevices, message:"success"});  
                              }
                          });
                        }
                        else {
                          result[0].amenitiesData = [];
                          res.json({spaceData:result, spaceEvents:spaceEvents, spaceDevices:spaceDevices, message:"success"});  
                        }
                      }
                  });
                }
            });
          });
        }
      }
    });
  }
  else {
    res.json('Something went wrong. Please try again.');
  }
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Check Room Availability */
/**
  * @module : Location
  * @desc   : Check Room Availability
  * @return : Return Room Availability
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/checkRoomAvailability', function (req, res) {
  var locationId = req.body.locationid;
  var startTime = req.body.startTime;
  var endTime = req.body.endTime;
  
  sql.connect(dbconfig, function(err) {
    var request = new sql.Request(cp);
    console.log("SELECT SRR.* FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startTime+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endTime+"')) AND SRR.locationid = "+parseInt(locationId)+" AND SRR.action != 'CANCELED' ");
    request.query("SELECT SRR.* FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startTime+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endTime+"')) AND SRR.locationid = "+parseInt(locationId)+" AND SRR.action != 'CANCELED' ", function(error, result) {
      if(error) {
        res.json(error);
      }
      else {
        res.json({data: result, message: "success"});
      }
    });
  });
});

/* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Check Space Availability */
/**
  * @module : Location
  * @desc   : Check Space Availability
  * @return : Return Space Availability
  * @author : Softweb solutions - Dhaval Thaker
*/
router.post('/checkSpaceAvailability', function (req, res) {
  var locationId = req.body.locationid;
  var name = req.body.name;
  var id = req.body.id;

  if (id > 0) {
    var query = "SELECT loc.* FROM so_location loc WHERE name = '"+name+"' ANd location_id = '"+locationId+"' AND id !='"+id+"' ";
  }
  else {
    var query = "SELECT loc.* FROM so_location loc WHERE name = '"+name+"' ANd location_id = '"+locationId+"'";
  }

  sql.connect(dbconfig, function(err) {
    var request = new sql.Request(cp);
    request.query(query, function(error, result) {
      if(error) {
        res.json(error);
      }
      else {
        res.json({data: result, message: "success"});
      }
    });
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get All Events of Space */
/**
  * @module : Location
  * @desc   : Get All Events of Space
  * @return : Return All Event Data
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/getAllEventsOfSpace/:spaceid/:dataid', function (req, res) {
  var spaceid = req.params.spaceid;
  var dataid = req.params.dataid;
  
  sql.connect(dbconfig, function(err) {
    var request = new sql.Request(cp);
    request.query("SELECT SRR.* FROM so_room_reservation SRR where locationid = "+spaceid+" AND datastorevalue = "+dataid, function (eventError, eventResult) {
      if(eventError) {
        res.json(eventError);
      }
      else {
        res.json({data: eventResult, message: "success"});
      }
    });
  });
});

/**
  * @module : Location
  * @desc   : Get list of floor
  * @return : Return floor list
  * @author : Softweb solutions - Dhaval Thaker
*/
router.get('/getFloorList', function (req, res) {
  var request = new sql.Request(cp);

  request.query("SELECT * FROM so_floor", function(error, result) {
    if (error) {
      res.json('Something went wrong. Please try again.');
    }
    else {
      res.json({"data": result});
    }
  });
  
});

/**
  * @module : Location
  * @desc   : Set Max floor
  * @return : Return floor
  * @author : Softweb solutions - Dhaval Thaker
*/
router.get('/setMaxFloor', function (req, res) {
  var request = new sql.Request(cp);

  request.query("SELECT * FROM so_officelocations", function(error, result) {
    if (error) {
      res.json('Something went wrong. Please try again.');
    }
    else {
      res.json({"data": result});
    }
  });
  
});

/* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Get All Floor */
/**
  * @module : Location
  * @desc   : Get All Office Locations 
  * @return : Return Office Locations Response
  * @author : Softweb solutions - Dhaval Thaker
*/
router.get('/getFloors/:userguid', function (req, res) {
  var userguid = req.params.userguid;
  var request = new sql.Request(cp);

  request.query("SELECT flr.*,ofc.name as officname FROM so_floor as flr INNER JOIN so_officelocations as ofc on flr.locationid = ofc.id INNER JOIN so_people as ppl ON flr.officeid = ppl.officeid where ppl.userid = '"+userguid+"' ", function(error, result) {
    if(error) {
      res.json(error);
    }
    else {
      res.json({data: result, message: "success"});
    }
  });
});

/* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Add New Floor */
/**
  * @module : Floor
  * @desc   : Add New Floot 
  * @return : -
  * @author : Softweb solutions - Dhaval Thaker
*/
router.post('/addfloor', function (req, res) {

  var userid = req.body.userid;
  var name = req.body.floorData.floorname;
  var locationId = req.body.floorData.locationid;
  var capacity = req.body.floorData.floors;
  var officeid = req.body.officeid;

  if(req.body.floorData.newimage) {
    var filename  = req.body.floorData.newimage.filename;
    var image  = req.body.floorData.newimage.base64;
    var ext = filename.split(".");
    var timestamp = Math.floor(new Date() / 1000);
    var newFileName = 'location/location_'+ timestamp +"."+ext[ext.length-1];
    var fd = fs.openSync('./public/images/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
  }
  else {
    var newFileName = '';
  }

  var request = new sql.Request(cp);
  request.query("SELECT officeid FROM so_people WHERE userid = '"+userid+"'", function(error1, result1) {
      if(error1)
      {
      }
      else
      {  
        var id = 0;
        if(result1.length)
          {
            id = result1[0].officeid;   
          }
     
     request.query("INSERT INTO so_floor (floorname,locationid,officeid,floors,floorplan, createddate) VALUES ('"+name+"','"+locationId+"','"+officeid+"','"+capacity+"','"+newFileName+"', CURRENT_TIMESTAMP)", function(error, result) {
    if (error) {
      res.json(error);
    } else {
      res.json({data: result, message: "success"});
    }
  });
    }
  });
});

/* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Update Floor */
/**
  * @module : Location
  * @desc   : Update Floor
  * @return : -
  * @author : Softweb solutions - Dhaval Thaker
*/
router.post('/updatefloor', function (req, res) {
  var id = req.body.id;
  var name = req.body.floorname;
  var locationId = req.body.locationid;
  var capacity = req.body.floors;

  if(req.body.newimage) {
    var filename  = req.body.newimage.filename;
    var image  = req.body.newimage.base64;
    var ext = filename.split(".");
    var timestamp = Math.floor(new Date() / 1000);
    var newFileName = 'location/location_'+ timestamp +"."+ext[ext.length-1];
    var fd = fs.openSync('./public/images/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
    if(req.body.image) {
      if (fs.existsSync('./public/images/'+req.body.image)) {
        fs.unlinkSync('./public/images/'+req.body.image);
      }
    }      
  }
  else {
    var newFileName = req.body.floorplan;
  }

  var request = new sql.Request(cp);
  
  request.query("UPDATE so_floor SET floorname = '"+name+"', floorplan = '"+newFileName+"', floors = '"+capacity+"', locationid = '"+locationId+"' WHERE id="+id, function(error, result) {
    if (error) {
      res.json(error);
    } else {
      res.json({data: result, message: "success"});
    }
  });
});

/* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Delete Office Location */
/**
  * @module : Location
  * @desc   : Delete Floor
  * @return : -
  * @author : Softweb solutions - Dhaval Thaker
*/
router.post('/deletefloor', function (req, res) {
  var id = req.body.id;
  if(id) {
    var request = new sql.Request(cp);
   
    request.query("SELECT count(*) as cnt FROM so_location WHERE floorid = '"+id+"' ", function(error, result) {

      if (error) {
        res.json({error:error,type:'error'});
      } else {
        if (result[0].cnt > 0) {
          res.json({message: "Space is already assigned for this floor so you can not delete this floor.",type:'error'});
        }
        else {
          request.query("DELETE FROM so_floor WHERE id = "+id, function(error1, result1) {
            if (error1) {
              res.json({error:error1,type:'error'});
            } else {
              res.json({data: result1, message: "success",type:'success'});
            }
          });
        }
      }
    });
  }
  else {
    res.json({message: "Invalid floor id."});
  }    
});

/* code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > Check Space Availability */    
/**   
  * @module : Location    
  * @desc   : Check Space Availability    
  * @return : Return Space Availability   
  * @author : Softweb solutions - Dhaval Thaker   
*/    
router.post('/checkFloorAvailability', function (req, res) {
  var locationId = req.body.locationid;
  var name = req.body.name;
  var id = req.body.id;
  var capacity = req.body.capacity;

  if (id > 0) {
    var query = "SELECT flr.* FROM so_floor as flr WHERE flr.locationid = '"+locationId+"' AND flr.floors = '"+capacity+"'  AND flr.id !='"+id+"' ";
  }
  else {
    var query = "SELECT flr.* FROM so_floor as flr WHERE flr.locationid = '"+locationId+"' AND flr.floors = '"+capacity+"' ";
  }
    var request = new sql.Request(cp);
    request.query(query, function(error, result) {
     if(error) {
        res.json(error);
      }
      else {
        res.json({data: result, message: "success"});
      }
    });  
});

router.get('/getBuildingSpaceData/:floorid', function (req, res) {

  var locationid = req.params.floorid;
  var request = new sql.Request(cp);
  request.query("select loc.name,loc.id from so_location as loc where loc.floorid='"+locationid+"'  ", function(error, result) {
     if (error) {
        res.json('Something went wrong. Please try again.');
      }
      else {
        res.json({"data": result});
      }
    });
    
}); 

router.post('/getSpacecount', function (req, res) {
  var officeid = req.body.officeid;
  var SubscriptionSpace = req.body.SubscriptionSpace;
  var id = req.body.id;
 
  var query = "SELECT count(*) as count FROM so_location  WHERE officeid = '"+officeid+"'";
 

  sql.connect(dbconfig, function(err) {

    var request = new sql.Request(cp);
 
   request.query(query, function(error, result) {
      if(error) {
        res.json(error);
      }
      else {
        res.json({data: result, message: "success"});
      }
    });
  });
});

module.exports = router;