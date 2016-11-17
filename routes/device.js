var express   = require('express');
var router    = express.Router();
var moment    = require('moment');
/*var Protocol  = require('azure-iot-device-mqtt').Mqtt;
var Client    = require('azure-iot-device').Client;
var Message   = require('azure-iot-device').Message;
var connectionString = 'HostName=JLLIOTAP.azure-devices.net;DeviceId=d3e9c9d4-71a0-4d2d-aa48-9fa6831373be;SharedAccessKey=iK1xWUIXx2B6+vDSX1MH2A==';
var client    = Client.fromConnectionString(connectionString, Protocol);
*/
/**
  * @module : Device Management 
  * @desc   : Helper function to print results in the console
  * @return : Print result in console
  * @author : Softweb solutions
*/
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}


/**
  * @module : Device Management 
  * @desc   : Get location as selected details
  * @return : return device detail
  * @author : Softweb solutions
*/
router.post('/deviceLocation', function (req, res) {
  
  var deviceuuid = req.body.deviceuuid;
  var devicemajor = req.body.devicemajor;
  var deviceminor = req.body.deviceminor;
  var request = new sql.Request(cp);
  request.query("SELECT d.uuid as device_uuid, d.major as device_major, d.minor as device_minor, l.id as locationid, l.name as location_name, l.address as location_address, l.image as location_image FROM so_device as d INNER JOIN so_location as l ON d.locationid=l.id where d.uuid = '"+deviceuuid+"' AND d.major = '"+devicemajor+"' AND d.minor = '"+deviceminor+"' GROUP BY d.uuid, d.major,d.minor, l.id, l.name , l.address , l.image", function(err, result) {
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
        res.json({"data": result});
      }
    }
  });
});


 /**
  * @module : Device checkin/check out  Management 
  * @desc   : set device event log
  * @return : return maintain device log
  * @author : Softweb solutions
*/
router.post('/logDeviceEvents', function (req, res) {
  
  var deviceuuid  = req.body.deviceuuid;
  var devicemajor = req.body.devicemajor;
  var deviceminor = req.body.deviceminor;
  var timestamp   = req.body.timestamp;
  var status      = req.body.status;
  var emailid     = req.body.emailaddress;
  var peopleid    = req.body.userid;
  
  var locationStatus;
  var isin;

  if(status == "in")
  {
    locationStatus = 1;
    isin = 1;
  }
  else if(status == "out")
  {
    locationStatus = 0;
    isin = 0;
  }
  
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_device where major = '"+devicemajor+"' AND minor = '"+deviceminor+"'",
  function(err, result) {
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
        var beacon_id = result[0].id;
        var request = new sql.Request(cp);
        request.query("UPDATE so_device_locator SET isin=0 WHERE loginid='"+peopleid+"'", function(error, response) {
          if(error)
          {
            res.json(error);
          }
          else
          {
            request.query("INSERT INTO so_device_locator (beaconid,loginid,status,timestamp,isin,emailid) VALUES ('"+beacon_id+"','"+peopleid+"','"+status+"','"+timestamp+"', "+isin+",'"+emailid+"')", function(err, result) {
              if(err)
              {
                res.json(err);
              }
              else
              {
                request.query("SELECT TOP 1 l.address,dl.emailid, l.id,l.name,l.notes,dl.status, CONVERT(VARCHAR(50), dl.timestamp, 121) as timestamp FROM so_device_locator as dl, so_device as d INNER JOIN so_location as l ON l.id=d.locationid WHERE d.major='"+devicemajor+"' AND d.minor='"+deviceminor+"' AND dl.beaconid = d.id  GROUP BY l.address,dl.emailid,l.id,l.image,l.name,l.notes,dl.status, dl.timestamp ORDER BY dl.timestamp DESC",
                function(err1, result1) {
                  if(err1)
                  {
                    res.json(err1);
                  }
                  else
                  {
                    if(locationStatus == 1)
                    {
                      request.query("SELECT  l.id, l.name FROM so_location as l  INNER JOIN so_device as d ON l.id=d.locationid  INNER JOIN so_device_locator as dl ON d.id=dl.beaconid  WHERE dl.loginid = '"+peopleid+"'  AND dl.status='in' AND dl.isin=1  ORDER BY dl.timestamp DESC", function(error, response) {
                        if(error)
                        {
                          res.json(error);
                        }
                        else
                        {
                          if(response.length > 0)
                          {
                            request.query("UPDATE so_location set status=1 where id="+response[0].id, function(err2, result2) {
                              if(err2)
                              {
                                res.json(err2);
                              }
                              else
                              {
                                request.query("UPDATE so_location set status='"+locationStatus+"' where id="+result1[0].id, function(err2, result2) {
                                  if(err2)
                                  {
                                    res.json(err2);
                                  }
                                  else
                                  {
                                    io.sockets.emit('locationStatusChange', {
                                      status: locationStatus,
                                      id: result1[0].id
                                    });
                                    result1[0].major = devicemajor;
                                    result1[0].minor = deviceminor;
                                    result1[0].status = status;
                                    
                                    var data_device = {
                                      "room_address": result1[0].address,
                                      "room_name": result1[0].name,
                                      "room_id": result1[0].id,
                                      "user_email":result1[0].emailid,
                                      "beacon_major": devicemajor,
                                      "beacon_minor": deviceminor,
                                      "status":status,
                                      "timestamp":timestamp,
                                    };
                  
                                    res.json({"data": data_device, "message": "Successfully checked in","Status": true})
                                  }
                                });
                              }
                            });
                          }
                          else
                          {
                            if(result1[0] != undefined){
                            request.query("UPDATE so_location set status='"+locationStatus+"' where id="+result1[0].id, function(err2, result2) {
                              if(err2)
                              {
                                res.json(err2);
                              }
                              else
                              {
                                io.sockets.emit('locationStatusChange', {
                                  status: locationStatus,
                                  id: result1[0].id
                                });
                                result1[0].major = devicemajor;
                                result1[0].minor = deviceminor;
                                result1[0].status = status;
                                var data = {
                                  "room_address": result1[0].address,
                                  "room_name": result1[0].name,
                                  "room_id": result1[0].id,
                                  "user_email":result1[0].emailid,
                                  "beacon_major": devicemajor,
                                  "beacon_minor": deviceminor,
                                  "status":status,
                                  "timestamp":timestamp
                                };
                  
                                
                                  res.json({"data": data, "message": "Successfully checked in user.","Status": true})
                                }
                              });
                            }
                          }
                        }
                      });
                    }
                    else
                    {
                      if(result1[0]!=undefined)
                      {
                        request.query("SELECT count(p.id) as people_count FROM so_people as p INNER JOIN so_device_locator as dl ON p.id=dl.loginid INNER JOIN so_device as d ON d.id = dl.beaconid INNER JOIN so_location as l ON l.id=d.locationid WHERE d.uuid='"+deviceuuid+"' AND d.major="+devicemajor+" AND d.minor="+deviceminor+" AND dl.isin=1 AND l.id="+result1[0].id, function(err3, result3) {
                          if(err3)
                          {
                            res.json(err3);
                          }
                          else
                          {
                            if(result3[0].people_count > 0)
                            {
                              result1[0].major = devicemajor;
                              result1[0].minor = deviceminor;
                              result1[0].status = status;
                              result1[0].timestamp = timestamp;
                                            
                              var data = {
                                "room_address": result1[0].address,
                                "room_name": result1[0].name,
                                "room_id": result1[0].id,
                                "user_email":result1[0].emailid,
                                "beacon_major": devicemajor,
                                "beacon_minor": deviceminor,
                                "status":status,
                                "timestamp":timestamp
                              };
                          
                            
                              res.json({"data": data, "message": "Success1","Status": true})
                            }
                            else
                            {
                              request.query("UPDATE so_location set status='"+locationStatus+"' where id="+result1[0].id, function(err2, result2) {
                                if(err2)
                                {
                                  res.json(err2);
                                }
                                else
                                {
                                  io.sockets.emit('locationStatusChange', {
                                    status: locationStatus,
                                    id: result1[0].id
                                  });

                                  result1[0].major = devicemajor;
                                  result1[0].minor = deviceminor;
                                  result1[0].status = status;
                                  result1[0].timestamp = timestamp;
                                    
                                  var data = JSON.stringify({
                                    "room_address": result1[0].address,
                                    "room_name": result1[0].name,
                                    "user_email":result1[0].emailid,
                                    "beacon_major": devicemajor,
                                    "beacon_minor": deviceminor,
                                    "status":status,
                                    "timestamp":timestamp
                                  });

                                  res.json({"data": result1, "message": "Successfully checked out user.","Status": true})
                                }
                              });
                            }
                          }
                        });
                      }
                    }
                  }
                });
              }
            });
          }
        });
      }
    }
  });
});





/**
  * @module : Device Management 
  * @desc   : Add device data in DB
  * @return : return device detail
  * @author : Softweb solutions
*/
router.post('/adddevice', function (req, res) {

  var name  = req.body.name;
  var UUID  = req.body.uuid;
  var Major = req.body.major;
  var Minor = req.body.minor;
  if(req.body.locationid !== null && typeof req.body.locationid === 'object'){
    var LocationId = req.body.locationid.id;
  }
  else {
    var LocationId = req.body.locationid;
  }
  var DeviceType = req.body.devicetype;

  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_device WHERE major="+Major+" and minor="+Minor, 
  function(err, result)
  {
    if(err)
    {
      res.json({"message": err.message})
    }
    else
    {
      if(result.length==0)
      {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();   
        var timestamp = yyyy+'-'+mm+'-'+dd;

        request.query("INSERT INTO so_device (name,uuid,major,minor,locationid,devicetype, boardid, timestamp) VALUES ('"+name+"','"+UUID+"',"+Major+",'"+Minor+"','"+LocationId+"','"+DeviceType+"', '', '"+timestamp+"')", 
        function(err, result)
        {
          if(err)
          {
            res.json({"message": err.message})
          }
          else
          {
            res.json({"message": "Device Added successfully."})
          }
        });
      }
      else
      {
        res.json({"errmessage": "Device Already Configured."})
      }      
    }
  });
});


/**
  * @module : Device Management 
  * @desc   : Edit device data in DB
  * @return : return edit device detail
  * @author : Softweb solutions
*/
router.get('/editdevice/:id', function (req, res) {
  var ID = req.params.id;
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_device WHERE id="+ID, 
  function(err, result)
  {
    if(err)
    {
      res.json({'message':err.messsage});
    }
    else
    {
      res.json({'message':"Device updated successfully"});
    }
  });
});


/**
  * @module : Device Management 
  * @desc   : Delete device data in DB
  * @return : return Delete device detail
  * @author : Softweb solutions
*/
router.get('/deletedevicedata/:id', function (req, res) {
  var ID = req.params.id;
  var request = new sql.Request(cp);
  request.query("DELETE from so_device WHERE id="+ID, 
  function(err, result)
  {
    if(err)
    {
      res.json({'message':err.messsage});
    }
    else
    {
      res.json({'message':"Device deleted successfully"});
    }
  });
});


/**
  * @module : Device Management 
  * @desc   : Update device data in DB
  * @return : return Update device detail
  * @author : Softweb solutions
*/
router.post('/updatedevicedata', function (req, res) {

  var ID    = req.body.id;
  var name  = req.body.name;
  var UUID  = req.body.uuid;
  var Major = req.body.major;
  var Minor = req.body.minor;
  if(req.body.locationid !== null && typeof req.body.locationid === 'object'){
    var LocationId = req.body.locationid.id;
  }
  else {
    var LocationId = req.body.locationid;
  }
  var DeviceType = req.body.devicetype;
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var timestamp = yyyy+'-'+mm+'-'+dd;

  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_device WHERE id!="+ID+" and major="+Major+" and minor="+Minor,
  function(err, result)
  {
    if(err)
    {
      res.json({'message':err.messsage});
    }
    else
    {
      if(result[0]==undefined)
      {
        if(result.length==0)
        {
          request.query("UPDATE so_device set name = '"+name+"',UUID = '"+UUID+"',Major = '"+Major+"',Minor = '"+Minor+"',LocationId = '"+LocationId+"',DeviceType = '"+DeviceType+"',TimeStamp = '"+timestamp+"' WHERE id ="+ID, 
            function(err, result)
          {
            if(err)
            {
              res.json({'message':err.messsage});
            }
            else
            {
              res.json({'message':"Device updated successfully"});
            }
          });
        }
      }
      else
      {
        res.json({"message": "Device Already Configured."});
      }      
    }
  });
});

/**
 * code added by JJ <jeel.joshi@softwebsolutions.com>
* @module : Device
* @desc   : Get Device detail
* @return : Return device detail
* @author : Softweb solutions
*/
router.get('/getDevices', function (req, res) {
  var request = new sql.Request(cp);
  request.query("SELECT d.* FROM so_device as d order by d.name", function(err, result) {
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

module.exports = router;