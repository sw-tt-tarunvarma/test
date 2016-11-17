var express 	= require('express');
var md5 	    = require('MD5');
var fs 		    = require('fs');
var router    = express.Router();
var moment 	  = require('moment');
var gcm 		  = require('node-gcm');
var apn 		  = require('apn');
var async 		= require("async");

/**
  * @module : People 
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
  * @module : People 
  * @desc   : Common function for send push notification
  * @return : send push Notification
  * @author : Softweb solutions
*/
function sendNotification(type,result,time)
{
	var regid = result.deviceid;
  var msg   = result.message;
  var title = result.title;
  var name  = result.name;
  var email = result.email;
  var notify_type  = result.type;
  var timestamp = time;
  var roomID = result.roomListID;
  var dates = result.startTime;
  var startTime = moment(dates).unix();
  var datee = result.endTime;
  var endTime = moment(datee).unix();
  var request = new sql.Request(cp);


  if(notify_type == 1)
  {
    var roomQuery = "SELECT id, name FROM so_location where id = "+roomID;
  }
  else
  {
    var roomQuery = "SELECT 1 ";
  }  

  

  request.query(roomQuery,function(err, result){
    if(err)
    {
      //res.json({"status":false,"data":null, "message":err.message});
      console.log(err);
    }
    else
    {
      if(result.length > 0)
      {
        var roomName = result[0].name;
      }        
      var options = { 
        cert          : 'cert.pem',
        key           : 'key.pem',
        "passphrase"  : 'test123',
        production    : true,
        debug         : true  
      };
      var sender = new gcm.Sender('AIzaSyBQkz-8eqwqLlks7yRpwjt8RO6AxMKuNuw');
      
      if((type=="android") || (type=="Tablet"))
      {
        var message = new gcm.Message();
        if(roomName != "" && notify_type == 1)
        {
          message.addDataWithObject({
            message   : msg,
            title     : title,
            type      : notify_type, 
            roomName  : roomName,
            startTime : startTime,
            endTime   : endTime
          });  
        }
        else
        {
          message.addDataWithObject({
            message   : msg,
            title     : title,
            type      : notify_type
          }); 
        }  
                  
        var registrationIds = [];
        registrationIds.push(regid);
       
        sender.send(message, registrationIds, 4, function (err, sender_result) {  
         

         // if(sender_result.success==1)
          var status = "true";
                  
          var request = new sql.Request(cp);

          request.query("SELECT id FROM so_people WHERE email ='"+email+"'",function(err, result)
          {
            if(err)
            {
              console.log(err);
            }
            else
            {
              if(result[0]!=undefined)
              {
                var peopleid = result[0].id;
                request.query("SELECT * FROM so_notification WHERE status='true' AND timestamp ='"+timestamp+"' AND peopleid="+result[0].id,
                function(err, result1)
                {
                  if(err)
                  {
                    console.log(err);
                  }
                  else
                  {  
                    
                    if(result1[0] == undefined)
                    {
                      var request = new sql.Request(cp);
                      var newmsg = msg.replace(/'/g, "''");
                      var newtitle = title.replace(/'/g, "''");
                      
                      
                      if (notify_type == 1){
                        var selectQuery = "INSERT INTO so_notification (title,message,status,timestamp,peopleid,flag,type,roomID,startTime,endTime) VALUES ('"+newtitle+"','"+newmsg+"','"+status+"','"+timestamp+"',"+peopleid+",0,'"+notify_type+"','"+roomID+"','"+startTime+"','"+endTime+"'); ";
                      }
                      else{
                        var selectQuery = "INSERT INTO so_notification (title,message,status,timestamp,peopleid,flag,type) VALUES ('"+newtitle+"','"+newmsg+"','"+status+"','"+timestamp+"',"+peopleid+",0,'"+notify_type+"')";                          
                      }
                      request.query(selectQuery,function(err, result){
                        if(err)
                        {
                          console.log(err);
                        }
                        else
                        {
                          console.log(result);
                        }
                      });  
                    }
                  }
                });
              }else
              {
                console.log(err);
              }
            }
          });
        });
      }
      else if((type=="ios") || (type=="iPad"))
      {
		    var apnConnection = new apn.Connection(options);

        console.log(apnConnection);

        var myDevice = new apn.Device(regid);
        var note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.sound = "ping.aiff";
         if(roomName != "" && notify_type == 1)
        {
          note.alert = roomName+" - Under maintenance";
          note.payload = {
            'messageFrom' : 'Softweb - SmartOffice',
            'title' : roomName+' - Under maintenance',
            'type'        : '"'+notify_type+'"',
            'roomName'      : roomName,
            'startTime'     : startTime,
            'endTime'       : endTime,
            'message'     : msg
          };  
          
        }
        else
        {
          note.alert = msg;  
          note.payload = {
            'messageFrom' : 'Softweb - SmartOffice',
            'type'        : '"'+notify_type+'"',
            'message'     : msg
          };
        }

        console.log(regid)
        console.log(note)
        console.log(myDevice);

        apnConnection.pushNotification(note, myDevice);
        var status = apnConnection.notificationsQueued;
        
        console.log(status)
        var request = new sql.Request(cp);
        request.query("SELECT id FROM so_people WHERE email ='"+email+"'",function(err, result)
        {
          if(err)
          {
            console.log(err);
          }
          else
          {
            if(result[0]!=undefined)
            {
              var peopleid = result[0].id;
              request.query("select * FROM so_notification WHERE timestamp = '"+timestamp+"' AND peopleid="+result[0].id,
              function(err, result1)
              {
                if(err)
                {
                  console.log(err);
                }
                else
                {
                  if(result1[0] == undefined)
                  {
                    var request = new sql.Request(cp);
                    var newmsg = msg.replace(/'/g, "''");
                    var newtitle = title.replace(/'/g, "''");

                   if (notify_type == 1) {
                      var selectQuery = "INSERT INTO so_notification (title,message,status,timestamp,peopleid,flag,type,roomID,startTime,endTime) VALUES ('"+newtitle+"','"+newmsg+"','"+status+"','"+timestamp+"',"+peopleid+",0,"+notify_type+",'"+roomID+"','"+startTime+"','"+endTime+"'); ";
                    }
                    else{
                      var selectQuery = "INSERT INTO so_notification (title,message,status,timestamp,peopleid,flag,type) VALUES ('"+newtitle+"','"+newmsg+"','"+status+"','"+timestamp+"',"+peopleid+",0,"+notify_type+")";
                    }
                    
                    request.query(selectQuery,function(err, result){
                      if(err)
                      {
                        console.log(err);
                      }
                      else
                      {
                        console.log(result);
                      }
                    });
                  }
                }
              });  
            }
            else
            {
              console.log(err);
            }
          }
        });  
      }
    }
  });
}


/**
  * @module : People 
  * @desc   : Get all people based on office id
  * @return : send push Notification
  * @author : Softweb solutions
*/
router.get('/getAllUsers/:userguid', function (req, res) {
  var request = new sql.Request(cp);
  var userguid = req.params.userguid;
  //request.query("select tbl.* from so_people as tbl inner join (select max(id) as maxID, userid from so_people as tbl group by userid) maxID on maxID.maxID = tbl.id where tbl.officeid != '' order by name, email",
  request.query("select * from so_people as SP where SP.officeid IN(select distinct ppl.officeid from so_people as ppl where ppl.userid ='"+userguid+"')",
  function(err, result)
  {
    if(err)
    {
      console.log(err)
    }
    else
    {
      res.json({data:result});
    }
  });  
});

/**
  * @module : People 
  * @desc   : Update User Role
  * @return : -
  * @author : Softweb solutions -Jeel Joshi<jeel.joshi@softwebsolutions.com>
*/
router.post('/addUserRole', function (req, res) {
  var request = new sql.Request(cp);
  var peopleid = req.body.peopleid;
  var role = req.body.role;

  request.query("UPDATE so_people set role = '"+role+"' WHERE userid = '"+peopleid+"'",
  function(err, result)
  {
    if(err)
    {
      console.log(err)
    }
    else
    {
      res.json({message:"success"});
    }
  });  
});

/**
  * @module : People 
  * @desc   : Update User Location
  * @return : -
  * @author : Softweb solutions -Jeel Joshi<jeel.joshi@softwebsolutions.com>
*/
router.post('/addUserLocation', function (req, res) {
  var request = new sql.Request(cp);
  var peopleid = req.body.peopleid;
  var locationid = req.body.locationid;

  request.query("UPDATE so_people set defaultlocationid = "+locationid+" WHERE userid = '"+peopleid+"'",
  function(err, result)
  {
    if(err)
    {
      console.log(err)
    }
    else
    {
      res.json({message:"success"});
    }
  });  
});

/**
  * @module : People 
  * @desc   : Get read/unread Update Notification
  * @return : Update notification as unread once read it
  * @author : Softweb solutions
*/
router.post('/Updatenotifystatus', function (req, res) {
  
  var id   = req.body.ID;   
  var read = req.body.readnotify;  
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_notification WHERE ID="+id,
  function(err, result1)
  {
    if(err)
    {
      console.log(err)
    }
    else
    {
      request.query("UPDATE so_notification set readnotify = "+read+" WHERE peopleid='"+result1[0].peopleid+"' AND timestamp='"+result1[0].timestamp+"'",
      function(err, result)
      {
        if(err)
        {
        console.log(err)
        }
        else
        {
          request.query("SELECT count(*) from so_notification WHERE (readnotify = 0  OR readnotify IS NULL)  AND ID="+id,
          function(err, result1)
          {
            if(err)
            {
              console.log(err)
            }
            else
            {
              if(result1[0].length==undefined)
              result1[0].length = 0;
              res.json({"message":"Notification Update Successfully.","Total_unreadmsg":result1[0].length});
            }
          });  
        }
      });  
    }
  });
});


/**
  * @module : People 
  * @desc   : Get read/unread Update Notification
  * @return : Update notification as unread once read it
  * @author : Softweb solutions
*/
router.post('/adduser', function (req, res) {

  var name       = req.body.name;
  var userid     = req.body.userid;
  var email      = req.body.email;
  var username   = req.body.username;
  var timeStamp  = req.body.timeStamp;
  var os         = req.body.os;
  var deviceid   = req.body.deviceid;
  
  if( (deviceid==undefined) || (deviceid=="") || (email=="") || (email==undefined) )
  {
    res.json({"message":"Contact is not valid","status":false});
  }
  else
  {    
    var request = new sql.Request(cp);
    request.query("SELECT * FROM so_people WHERE os='"+os+"' AND deviceid='"+deviceid+"'",
    function(err, result)
    {
      if(err)
      {
        console.log(err)
      }
      else
      {
        if(result.length==0)
        {
          request.query("INSERT INTO so_people (name,userid,email,username,os,deviceid) VALUES ('"+name+"','"+userid+"','"+email+"','"+username+"','"+os+"','"+deviceid+"')",
          function(err, result)
          {
            if(err)
            {
              res.json({"message":"Contact Updated failed","status":false});
              res.end();
            }
            else
            {
              res.json({"message":"Contact Updated successfully","status":true});
            }
          });
        }else
        {
          request.query("UPDATE so_people set name='"+name+"',userid='"+userid+"',email='"+email+"',username='"+username+"' WHERE os='"+os+"' AND deviceid='"+deviceid+"'",
          function(err, result)
          {
            if(err)
            {
              console.log(err)
              res.json({"message":"Contact Updated failed","status":false});
              res.end();
            }
            else
            {
              res.json({"message":"Contact Updated successfully","status":true});
            }
          });
        }
      }
    });
  }
});


/**
  * @module : People 
  * @desc   : Send message by notification to all user or selected user
  * @return : Send notification and return response 
  * @author : Softweb solutions
*/
router.post('/sendmessage', function (req, res) {
  var d = new Date();
  var time = moment().unix();
  var total = 0;
  var result = [];

  if(req.body.length != undefined)
  {

    var msg = req.body.length-1;
    var request = new sql.Request(cp);
    request.query("SELECT * FROM so_people",
    function(err, result1)
    {
      if(err)
      {
        console.log(err)
      }
      else
      {
        if(result1[0]!=undefined)
        {
          total = result1.length;
          for(var loop=0;loop<total;loop++)
          {

            result.deviceid = result1[loop].deviceid;
            result.message  = req.body[msg].message;
            result.title    = req.body[msg].title;
            result.OS       = result1[loop].os;
            result.name     = result1[loop].name;
            result.email    = result1[loop].email;
            result.type     = ((req.body[msg].type > 0) ? req.body[msg].type : 0);
            result.roomListID = req.body[msg].roomListID;
            result.startTime  = req.body[msg].startTime;
            result.endTime    = req.body[msg].endTime;

            var device_os = result.OS;
            if(device_os=="android")
            sendNotification("android",result,time);
            else if(device_os=="ios")
            sendNotification("ios",result,time);
          }  
        }
      }
    });  
  }
  else {
    /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Send Message To Selected Users */
    if (req.body.userIds) {
      var request = new sql.Request(cp);
      request.query("SELECT * FROM so_people WHERE id IN("+req.body.userIds+")",
      function(err, result1) {
        if (err) {
          console.log(err)
        }
        else {
          console.log(result1);
          if (result1[0]!=undefined){
            total = result1.length;
            for (var loop=0;loop<total;loop++) {
              result.deviceid = result1[loop].deviceid;
              result.message  = req.body.message;
              result.title    = req.body.title;
              result.type     = ((req.body.type > 0) ? req.body.type : 0);
              result.OS       = result1[loop].os;
              result.name     = result1[loop].name;
              result.email    = result1[loop].email;
              result.roomListID = req.body.roomListID;
              result.startTime  = req.body.startTime;
              result.endTime    = req.body.endTime;
              
              if (result.OS && result.OS.trim()) {
                var device_os = result.OS;
                if (device_os=="android")
                  sendNotification("android",result,time);
                else if (device_os=="ios")
                  sendNotification("ios",result,time);
                else if (device_os=="tablet")
                  sendNotification("Tablet",result,time);
                else if (device_os=="ipad")
                  sendNotification("iPad",result,time);
              }
            }
          }
        }
      });
    }        
  }
  res.json("Message Sent successfully");
});


/**
  * @module : People (Web Service)
  * @desc   : Get list of all notification for selected user
  * @return : Return list of notification
  * @author : Softweb solutions
*/
router.post('/getnotification', function (req, res) {

  var user_emailaddress = req.body.email;
  var offset ="";
  var total ="";
  var result2 = [];
  var resultMaintenanceRoom = [];
  var finalResult = [];

  if(req.body.offset=='')
  {
    offset = "0";  
  }else
  {
    offset = req.body.offset;
  }
  
  if(req.body.count=='')
  {
    total = "10";  
  }else
  {
    total = req.body.count;
  }

  var request = new sql.Request(cp);
  request.query("SELECT id FROM so_people where email = '"+user_emailaddress+"'",
  function(err, result)
  {
    if(err)
    {
      res.json({"status":false,"data":null, "message":err.message});
    }
    else
    {
      if(result[0]!=undefined)
      {
        var userid = result[0].id;
        var request = new sql.Request(cp);
        function doSomething() {
          return new Promise(function(resolve) {
            var request = new sql.Request(cp);
            request.query("SELECT sp.name,sp.email,sn.status,sn.type,sn.timestamp,CAST(sn.title AS NVARCHAR(max)) as title, CAST(sn.message AS NVARCHAR(max)) as 'message',sn.flag,sn.readnotify, sn.roomID, sl.name as roomName, sn.startTime, sn.endTime FROM so_people as sp  LEFT JOIN so_notification as sn ON sp.id = sn.peopleid LEFT JOIN so_location as sl ON sl.id = sn.roomID  where sn.status='true' and sn.peopleid = '"+result[0].id+"' and sn.type = 1 group by sn.timestamp,sp.name,sp.email,sn.status,sn.type, CAST(sn.title AS NVARCHAR(max)), CAST(sn.message AS NVARCHAR(max)),sn.flag,sn.readnotify, sn.roomID, sl.name, sn.startTime, sn.endTime order by sn.timestamp desc",
            function(err, maintenanceResult)
            {
              if(err)
              {
                res.json({"Status":false,"data":null, "message":err.message});
              }
              else
              {
                resolve(maintenanceResult);
              }
            });
          });
        }

        doSomething().then(function(value) {
          async.forEachSeries(value, function(maintainanceResult, callback){
            request.query("UPDATE so_notification SET flag=1 WHERE peopleid='"+userid+"' AND timestamp='"+maintainanceResult.timestamp+"'",
            function(err, result)
            {
              if(err)
              {
                res.json({"Status":false,"data":null, "message":err.message});
              }  
            });
              
            request.query("SELECT TOP(1) ID FROM so_notification WHERE  peopleid='"+userid+"' AND timestamp='"+maintainanceResult.timestamp+"'",
            function(err, result3)
            {
              if(err)
              {
                res.json({"Status":false,"data":null, "message":err.message});
              }
              else
              {
                if(offset == "0")
                {
                  resultMaintenanceRoom.push({
                    "ID"        :   result3[0].ID,
                    "name"      :   maintainanceResult.name,
                    "email"     :   maintainanceResult.email,
                    "status"    :   maintainanceResult.status,
                    "type"      :   maintainanceResult.type,
                    "timestamp" :   maintainanceResult.timestamp,
                    "title"     :   maintainanceResult.title,
                    "message"   :   maintainanceResult.message,
                    "flag"      :   maintainanceResult.flag,
                    "readnotify":   maintainanceResult.readnotify,
                    "roomName"  :   maintainanceResult.roomName,
                    "startTime" :   maintainanceResult.startTime,
                    "endTime"   :   maintainanceResult.endTime
                  });
                }  
              }
              callback();
            });
          },function(err){
            if(err)
            {
              res.json({"Status":false,"data":null, "message":err.message});
            }
            request.query("SELECT sp.name,sp.email,sn.status,sn.type,sn.timestamp,CAST(sn.title AS NVARCHAR(max)) as title, CAST(sn.message AS NVARCHAR(max)) as 'message',sn.flag,sn.readnotify FROM so_people as sp  LEFT JOIN so_notification as sn ON sp.id = sn.peopleid  where sn.status='true' and sn.peopleid = '"+result[0].id+"' and sn.type = 0 group by sn.timestamp,sp.name,sp.email,sn.status,sn.type, CAST(sn.title AS NVARCHAR(max)), CAST(sn.message AS NVARCHAR(max)),sn.flag,sn.readnotify order by sn.timestamp desc  OFFSET "+offset+" ROWS FETCH NEXT "+total+" ROWS ONLY",
            function(err, result1)
            {
              if(err)
              {
                res.json({"Status":false,"data":null, "message":err.message});
              }
              else
              {
                async.forEachSeries(result1, function(result1, callback){
                  request.query("UPDATE so_notification SET flag=1 WHERE peopleid='"+userid+"' AND timestamp='"+result1.timestamp+"'",
                  function(err, result)
                  {
                    if(err)
                    {
                      res.json({"Status":false,"data":null, "message":err.message});
                    }  
                  });
                  
                  request.query("SELECT TOP(1) ID FROM so_notification WHERE  peopleid='"+userid+"' AND timestamp='"+result1.timestamp+"'",
                  function(err, result3)
                  {
                    if(err)
                    {
                      res.json({"Status":false,"data":null, "message":err.message});
                    }
                    else
                    {
                      result2.push({
                        "ID"        :   result3[0].ID,
                        "name"      :   result1.name,
                        "email"     :   result1.email,
                        "status"    :   result1.status,
                        "type"      :   result1.type,
                        "timestamp" :   result1.timestamp,
                        "title"     :   result1.title,
                        "message"   :   result1.message,
                        "flag"      :   result1.flag,
                        "readnotify":   result1.readnotify
                      }); 
                    }
                    callback();
                  });
                },function(err){
                  if(err)
                  {
                    res.json({"Status":false,"data":null, "message":err.message});
                  } 
                  if(result2.length>0 || resultMaintenanceRoom.length>0)
                  {
                    res.json({
                      "Status" : true, 
                      "data":{
                          //"notification" : {
                            "roomMaintenance" : resultMaintenanceRoom,
                            "roomNormal"      : result2,
                          //}
                        },
                      "message":"Success"
                    });
                  }
                  else
                  {
                    res.json({"Status":true,"data":null, "message":"Record not found."});
                  }  
                });  
              }
            }); 
          });
        });
      }
      else
      {
        res.json({"Status":false,"data":null, "message":"People not found"});
      }   
    }
  });
});


/**
  * @module : People (Web Service)
  * @desc   : Get Count Users's NEW Notification  From database
  * @return : Return unread notification count
  * @author : Softweb solutions
*/
router.post('/getnotificationcount', function (req, res) {

  var user_emailaddress = req.body.email;
  var result2 = [];
  var request = new sql.Request(cp);
  request.query("SELECT id FROM so_people where email = '"+user_emailaddress+"'",
  function(err, result)
  {
    if(err)
    {
      console.log(err)
    }
    else
    {
      if(result[0]!=undefined)
      {
        var request = new sql.Request(cp);
        request.query("SELECT count(*) as total FROM so_people as sp LEFT JOIN so_notification as sn ON sp.id = sn.peopleid  where sn.status='true' and (sn.readnotify=0 OR sn.readnotify IS NULL) and sn.peopleid = '"+result[0].id+"' GROUP BY sn.timestamp",
        function(err, result1)
        {
          if(err)
          {
            console.log(err)
          }
          else
          {
            if(result1.length>0)
            {
              res.json({total_record:result1.length,"message":"Success"});
            }
            else
            {
              res.json({total_record:result1.length,"message":"Record not Found"});
            }
          }
        });  
      }   
    }
  });  
});


/**
  * @module : People (Web Service)
  * @desc   : Users logout from device
  * @return : Return delete device
  * @author : Softweb solutions
*/
router.post('/logoutdevice', function (req, res) {
  var deviceid = req.body.token; 
  var request = new sql.Request(cp);
  request.query("DELETE FROM so_people where deviceid='"+deviceid+"'",
  function(err, result)
  {
    if(err)
    {
      console.log(err)
    }
    else
    {
      res.json({"message":"Record Delete","status":"true"});
    }
  });
});


/**
  * @module : People (Web Service)
  * @desc   : User action store
  * @return : Return insert people action
  * @author : Softweb solutions
*/
router.post('/usersaction', function (req, res) {
   
  var userid  = req.body.userid;
  var action  = req.body.action;
  var time    = req.body.timestamp;
  var request = new sql.Request(cp);

  request.query("SELECT TOP(1) name, email FROM so_people WHERE userid = '"+userid+"'", 
  function(err1, result1) {
    if(err1)
    {
      res.json(err1);
    }
    else
    {
      var data = JSON.stringify({
        "name":result1[0].name,
        "email":result1[0].email,
        "action":action,
        "timestamp":time
      });
      request.query("INSERT INTO so_people_action (userid,action,timestamp) VALUES ('"+userid+"','"+action+"','"+time+"')", function(err, result) {
        if(err)
        {
          res.json({"Success":"false"});
        }
        else
        {
          res.json({"Success":"true"});
        }
      });
    }
  });
});


/**
  * @module : People (Web Service)
  * @desc   : Get room detail and store in db with booking detail
  * @return : Return send success message after booking detail store
  * @author : Softweb solutions
*/
router.post('/usersbookingdetails', function (req, res) {

  var userid       = req.body.userid;
  var email        = req.body.email;
  var duration     = req.body.duration;
  var capacity     = req.body.capacity;
  var amenities    = req.body.amenities;
  var deviceid     = req.body.deviceid;
  var devicetype   = req.body.devicetype;
  var timestamp    = req.body.timestamp;
  var action       = req.body.action;
  var eventid 		= '';

  if((req.body.eventid!=undefined) && (req.body.eventid!=''))
  {
    eventid = req.body.eventid;
  }	

  var request = new sql.Request(cp);
  request.query("SELECT id, name FROM so_location WHERE address ='"+email+"'",
  function(err, result) {
  if(err)
    {
    res.json({"Success":"false"});
    }
    else
    {
      if(result[0]!=undefined)
      {
        var locationid = result[0].id;
        var locationname = result[0].name;
        var request = new sql.Request(cp);
        request.query("SELECT TOP(1) name, email FROM so_people WHERE userid = '"+userid+"'", function(err1, result1) {
          if(err1)
          {
            res.json(err1);
          }
          else
          {
            var data = JSON.stringify({
              "userid":userid,
              "username":result1[0].name,
              "useremail":result1[0].email,
              "locationname":locationname,
              "locationemail":email,
              "duration":duration,
              "capacity":capacity,
              "amenities":amenities,
              "deviceid":deviceid,
              "devicetype":devicetype,
              "action":action,
              "timestamp":timestamp,
              "eventid":eventid
            });
             
      			/*var Protocol = require('azure-iot-device-mqtt').Mqtt;
      			var Client = require('azure-iot-device').Client;
      			var Message = require('azure-iot-device').Message;
      			var connectionString = 'HostName=JLLIOTAP.azure-devices.net;DeviceId=d3e9c9d4-71a0-4d2d-aa48-9fa6831373be;SharedAccessKey=iK1xWUIXx2B6+vDSX1MH2A==';
      			var client = Client.fromConnectionString(connectionString, Protocol);*/
             
      		  var connectCallback = function (err) {
        		  if (err) 
              {
        			  console.error('Could not connect: ' + err.message);
        				fs.appendFile('../streamlog.txt', err.message+"  ||  ", function (err) {
        				  if (err) throw err;
        				  console.log('The "data to append" was appended to file!');
        				});
        		  }
              else 
              {
        				client.on('message', function (msg) {
        				  client.complete(msg, printResultFor('completed'));
        		    });

        				var message = new Message(data);
        			  message.properties.add('myproperty', 'myvalue');
        			  client.sendEvent(message, printResultFor('send'));
        				client.on('error', function (err) {
          				fs.appendFile('../streamlog.txt', err.message+"  ||  ", function (err) {
          				  if (err) throw err;
          				});
        				});
        				client.on('disconnect', function () {
        				  client.removeAllListeners();
        				  client.connect(connectCallback);
        				});
        		  }
        		};

      		//client.open(connectCallback);
          request.query("INSERT INTO so_people_booking_details (userid,locationid,duration,capacity,amenities,timestamp,action,deviceid,devicetype,eventid) VALUES ('"+userid+"','"+locationid+"','"+duration+"','"+capacity+"','"+amenities+"','"+timestamp+"','"+action+"','"+deviceid+"','"+devicetype+"','"+eventid+"')", function(err, result) {
            if(err)
            {
              res.json({"Success":"false"});
            }
            else
            {
              res.json({"data":data,"Success":"true"});
            }
          });
        }
      });
      }else
      {
        res.json({"Success":"false","Message":"Location not found"}); 
      }   
    }
  });
});


/**
  * @module : People
  * @desc   : Get list of Room location for send message popup box room list dropdown
  * @return : Return room list
  * @author : Softweb solutions
*/
router.post('/getRoomList', function (req, res) 
{
  var request = new sql.Request(cp);
  request.query("SELECT id, name FROM so_location order by name",function(err, result){
    if(err)
    {
      res.json({"status":false,"data":null, "message":err.message});
    }
    else
    {
      if(result.length > 0)
      {
        res.json({"status":'success',"data":result, "message":"Room list get successfully"});
      }
      else
      {
        res.json({"status":false,"data":null, "message":"No record found"}); 
      }  
    }
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get User Detail Using userId */
/**
  * @module : People
  * @desc   : Get User Detail Using userId
  * @return : Return User Detail
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/getUserUsingGuid/:userId', function (req, res) {
  var userId = req.params.userId;
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_people where userid = '"+userId+"' ", function(error, result) {
    if(error) {
     res.json(error);
    }
    else {
      if(result.length && result[0].image) {
        result[0].image = result[0].image;
      }

      res.json({"data":result, message: "sucess"});
    }
  });
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add token into session table */
/**
  * @module : People
  * @desc   : Add token into session table
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/addTokenIntoUserSession', function (req, res) {
  var email       = req.body.email;
  var token        = req.body.token;
  var request = new sql.Request(cp);
  request.query("INSERT INTO so_session (webtoken,email) VALUES('"+token+"','"+email+"')", function(error, result) {
    if(error) {
      res.json(error);
    }
    else {
      res.json({"data":result, message: "sucess"});
    }
  });
});

module.exports = router;