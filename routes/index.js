var express     = require('express');
var session     = require('express-session');
var router      = express.Router();
var request     = require('request');
var authHelper  = require("../authHelper");
var outlook     = require("node-outlook");
var url         = require("url");
var fs          = require('fs');
var parseString = require('xml2js').parseString;
var async       = require("async");
var moment      = require("moment");
var jwt         = require('jsonwebtoken');

/**
  * @module : Home page
  * @desc   : GET home page
  * @return : Return homepage view
  * @author : Softweb solutions
*/
router.get('/', function(req, res, next) {
  	/*if(!req.session.isOutlook ){
			res.redirect(authHelper.getAuthUrl());
		}
		else
		{*/
       
    if(!req.cookies.token && !req.session.token){
      res.redirect('/');
    }
    else
    {
      res.render('index', { title: 'Softweb Smart Office', message: "IOTWEBAPP" });
    }
});


/**
  * @module : Home page
  * @desc   : GET log
  * @return : Return log
  * @author : Softweb solutions
*/
router.get('/getlog', function(req, res, next) {
  fs.readFile('../public/images/errorconsole.txt', 'utf8', function (err,errorlog) {
    if (err) 
    {
      res.json("No log found.")
    }
    else
    {
      if(errorlog=='')
        res.json("No log found.")
      else
        res.json(errorlog)
    }
  });
});


/**
  * @module : Home page
  * @desc   : Get Token
  * @return : Return Token
  * @author : Softweb solutions
*/
router.post('/gettoken', function(req, res) {
 
  if(req.body.deviceID && req.body.secretKey)
  {
     if(req.body.secretKey == 'SmxsUm9vbWJpdDpTaW5nYXBvcmU=')
     {
      var authToken = jwt.sign({ device_id: req.body.deviceID }, 'SmxsUm9vbWJpdDpTaW5nYXBvcmU=');
      if(authToken)
      {
          res.json({status:true,"data":{"token":authToken},"message":"success"});
      }
      else
      {
          res.json({status:false,'data':null,"message":"Invalid token"});
      }   
    }
    else
    {
        res.json({status:false,'data':null,"message":"Invalid SecretKey"});
    }    
  }
  else
  {
      res.json({status:false,'data':null, 'message':'Device id and secret key not found'});
  }    
});

/**
  * @module : Home page
  * @desc   : Check for authorization
  * @return : Return Token
  * @author : Softweb solutions
*/
router.get('/authorize', function(req, res) {
  var url_parts = url.parse(req.url, true);
  var code = url_parts.query.code;
  var token = authHelper.getTokenFromCode(code, 'https://outlook.office365.com/', tokenReceived, res);  
});


/**
  * @module : Home page
  * @desc   : Receive token
  * @return : Return Token
  * @author : Softweb solutions
*/
function tokenReceived(res, error, token) {
  if (error) {
    console.log("Access token error: ", error.message);
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write('<p>ERROR: ' + error + '</p>');
    res.end();
  }
  else {
    var id_token = token.token.id_token;
    var splt = id_token.split(".");

    var k = new Buffer(splt[1], 'base64')
    var p = k.toString();

    var getemailjson = JSON.parse(p);    
    var getemail = getemailjson.unique_name;

    var requestsql = new sql.Request(cp);
    requestsql.query("SELECT * FROM so_people WHERE email = '"+getemail+"'",
    function(err, result) {
      if(err)
      {
        console.log(err);
      }
      else
      {
        if(result.length>0)
        {
          session.getuserId = result[0].id;          
        }
      }
    });
    
    res.cookie('nodetutorialtoken', token.token.access_token, { maxAge: 3600, httpOnly: true });
    session.outlookCookie  = token.token.access_token;
    session.refreshtokenid = token.token.refresh_token;
    var requestapi = new sql.Request(cp);
    requestapi.query("INSERT INTO so_session (Session,refreshid) VALUES ('"+session.outlookCookie+"','"+session.refreshtokenid+"')", function(err, result) {
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log({data: session.outlookCookie, message: "success"});
      }
    });
    res.writeHead(302, {'Location': 'getroom'});
    res.end();
  }
}


/**
  * @module : Home page
  * @desc   : Get room list
  * @return : Return room list
  * @author : Softweb solutions
*/
router.get('/getroom', function(req, res) {
  
  req.session.isOutlook = 1;
  session.outlookCookie = req.cookies.nodetutorialtoken;
  session.refreshtokenid = req.cookies.refreshtoken;
  var Office365Token = req.session.outlookCookie;

  request.get({
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
              console.log(err);
            }
            else
            {
              if(result.length>0)
              {
                // Restrict the update because amenties is updating in local. AS. 17/08/16

                /*requestsql.query("UPDATE so_location SET name='"+bodymsg.RoomName+"', address='"+bodymsg.RoomAddress+"', amenities='"+bodymsg.ResourceCustom+"', capacity='"+bodymsg.ResourceCapacity+"', user_permission='"+JSON.stringify(bodymsg.AccessRights)+"',office_location='"+bodymsg.Office+"' WHERE address='"+bodymsg.RoomAddress+"'", function(err2, result2) {
                  if(err2)
                  {
                    res.json(err2);
                  }
                  else
                  {
                    console.log("3->update rooms in db");
                  }
                });*/
              }
              else
              {
                requestsql.query("INSERT INTO so_location (name,address,image,officeid,notes,timestamp,status,capacity,amenities,user_permission,office_location) VALUES ('"+bodymsg.RoomName+"','"+bodymsg.RoomAddress+"','','','', CURRENT_TIMESTAMP, 0, '"+bodymsg.ResourceCapacity+"','"+bodymsg.ResourceCustom+"','"+JSON.stringify(bodymsg.AccessRights)+"','"+bodymsg.Office+"')",
                function(err, result) {
                  if(err)
                  {
                    res.json(err);
                  }
                  else
                  {
                    console.log("3->insert rooms in db");
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
            console.log(err);
          }
          else
          {
            if(result.length > 0)
            {
              for(var k=0;k<result.length;k++)
              {
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
  res.redirect("/index");
});


/**
  * @module : Home page
  * @desc   : Logout
  * @return : Return redirect on home screen
  * @author : Softweb solutions
*/
router.get('/logout', function (req, res) {
  req.session.destroy();
  //Cookies.remove('token');
  res.clearCookie('token');
  res.redirect("/");
});


/**
  * @module : Home page
  * @desc   : Delete room event
  * @return : Return room list
  * @author : Softweb solutions
*/
router.post('/deleteevent', function(req, res) {
  var eventid = req.body.eventid;  
  request.put({
    url:"https://roomdetails.azurewebsites.net/api/UpdateEvent?ItemId="+eventid,
    headers: {'Content-Type': 'application/json'},
  },
  function (error, response, body) {
    res.json("Event Updated Successfully.");
  });
});

mqtt  = require('mqtt');

router.post('/lights', function(req,res) {
console.log(req.body)
var msg = req.body.message;
var client  = mqtt.connect('mqtt://115.115.91.42');
client.on('connect', function () {

  client.subscribe('smartofficetopic')
  client.publish('smartofficetopic',msg)
  
})
 
client.on('message', function (topic, message) {
  // message is Buffer 
  client.end()
})
res.json({"data":msg,"status":true})
});

module.exports = router;