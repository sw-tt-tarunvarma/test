var express = require('express');
var router 	= express.Router();
var gcm 		= require('node-gcm');
var apn 		= require('apn');
var fs 			= require('fs');
var zip 		= require("node-native-zip");


/**
  * @module : App images 
  * @desc   : Common function for send push notification forf this file
  * @return : send push Notification
  * @author : Softweb solutions
*/
function sendNotification(type,result)
{
  var regid = result.deviceid;
  var msg   = result.message;
  var title = result.title;
  var name  = result.name;
  var email = result.email;

	if(type=="android")
  {
    var sender = new gcm.Sender('AIzaSyDtLyJtSXb3oR4GxA81bPPrnJ6cVRvv8KM');
    var message = new gcm.Message();
    message.addDataWithObject({
      message: msg,
      title:title,
      type:"animation"
    });
    
    var registrationIds = [];
    registrationIds.push(regid);
    sender.send(message, registrationIds, 4, function (err, result) {     
      console.log("Android===",result);
    });
  }

  if(type=="ios")
  {
    var options = { 
      cert: '../public/images/Jll_Singapore_Cert/cert.pem',
      key: '../public/images/Jll_Singapore_Cert/key.pem',
      "passphrase":'1234',
      production:true,
      debug : true  
    };
   
    var apnConnection = new apn.Connection(options);
    var myDevice = new apn.Device(regid);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.sound = "ping.aiff";
    note.alert = msg;
    note.payload = {'messageFrom': 'JLL - Roombit','type':'animation'};
    apnConnection.pushNotification(note, myDevice);
    var status = apnConnection.notificationsQueued;
  }
}


/**
  * @module : App images 
  * @desc   : Get username if in session
  * @return : send push Notification
  * @author : Softweb solutions
*/
router.get('/', function (req, res) {
  var request = new sql.Request(cp);
  request.query("SELECT TOP 1 * FROM so_app_images order by ID desc",
  function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      if(result.length != undefined)
      {
        res.json({"data":result});
      }
    }
	});
});


/**
  * @module : App images 
  * @desc   : Upload images
  * @return : Upload file response
  * @author : Softweb solutions
*/
router.post('/uploadfiles',function(req,res){

  var logintitle 	 = "login_animation";
  var hometitle 	 = "home_animation";
  var loadingtitle   = "loading_animation";
  var bgtitle 	     = "background_image";
  var login_animation_url   = req.body.login_animation_url;
  var home_animation_url    = req.body.home_animation_url;
  var loading_animation_url = req.body.loading_animation_url;
  var background_image_url  = req.body.background_image_url;
  var allfiles = [];

  if((login_animation==undefined) || (login_animation_url==undefined))
    login_animation='';

	if(req.body.login_animation!=null)
	{
	  var filename  		   = req.body.login_animation.filename;
    var login_animation  = req.body.login_animation.base64;
    var ext       		   = filename.split(".");

    var fd1 =  fs.openSync('../public/images/app/'+logintitle+"."+ext[ext.length-1], 'w');
    login_animation  =  login_animation.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(login_animation,'base64');
    fs.write(fd1, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd1 );
    });
    login_animation = '/images/app/'+logintitle+"."+ext[ext.length-1];
  }
  else if(req.body.login_animation_url!='')
  {
    login_animation=req.body.login_animation_url;
  }

  if((home_animation==undefined) || (home_animation_url==undefined))
    home_animation='';

  if(req.body.home_animation!=null)
	{
	  var filename  		 = req.body.home_animation.filename;
    var home_animation = req.body.home_animation.base64;
    var ext       		 = filename.split(".");
    
    var fd2 =  fs.openSync('../public/images/app/'+hometitle+"."+ext[ext.length-1], 'w');
    home_animation  =  home_animation.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(home_animation,'base64');
    fs.write(fd2, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd2 );
    });
    home_animation = '/images/app/'+hometitle+"."+ext[ext.length-1];
  }
  else if(req.body.home_animation_url!='')
  {
    home_animation=req.body.home_animation_url;
  }
    
  if((loading_animation==undefined) || (loading_animation_url==undefined))
    loading_animation='';

  if(req.body.loading_animation!=null)
	{
    var filename  		     = req.body.loading_animation.filename;
    var loading_animation    = req.body.loading_animation.base64;
    var ext       		     = filename.split(".");

    var fd3 =  fs.openSync('../public/images/app/'+loadingtitle+"."+ext[ext.length-1], 'w');
    loading_animation  =  loading_animation.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(loading_animation,'base64');
    fs.write(fd3, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd3 );
    });
    loading_animation = '/images/app/'+loadingtitle+"."+ext[ext.length-1];
  }
  else if(req.body.loading_animation_url!='')
  {
    loading_animation = req.body.loading_animation_url;
  }
  
  if((background_image==undefined || background_image_url==undefined)) 
    background_image='';

  if(req.body.background_image!=null)
	{
    var filename  		  = req.body.background_image.filename;
    var background_image  = req.body.background_image.base64;
    var ext       		  = filename.split(".");
    var fd =  fs.openSync('../public/images/app/'+bgtitle+"."+ext[ext.length-1], 'w');
    background_image  =  background_image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(background_image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
    background_image = '/images/app/'+bgtitle+"."+ext[ext.length-1];
  }
  else if(req.body.background_image_url!='' && background_image_url!=undefined)
  {
    background_image = req.body.background_image_url;
  }
  res.json({"data":"Upload file success"});
});


/**
  * @module : App images 
  * @desc   : publish Upload images 
  * @return : publish Upload images 
  * @author : Softweb solutions
*/
router.post('/publishanimationfiles',function(req,res){
  var timestamp = Math.floor(new Date() / 1000);
  var allfiles = [];

  if(fs.existsSync("../public/images/app/login_animation.gif")) 
  {
    allfiles.push({"name":"login_animation.gif","path":"../public/images/app/login_animation.gif"});
    var login_animation = "images/app/login_animation.gif";
  }
        
  if (fs.existsSync("../public/images/app/home_animation.gif")) 
  {
    allfiles.push({"name":"home_animation.gif","path":"../public/images/app/home_animation.gif"});
    var home_animation = "images/app/home_animation.gif";
  }

  if (fs.existsSync("../public/images/app/loading_animation.gif")) 
  {
    allfiles.push({"name":"loading_animation.gif","path":"../public/images/app/loading_animation.gif"});
    var loading_animation = "images/app/loading_animation.gif";
  }

  if (fs.existsSync("../public/images/app/background_image.png")) 
  {
    allfiles.push({"name":"background_image.png","path":"../public/images/app/background_image.png"});
    var background_image = "images/app/background_image.png";
  }

	var request = new sql.Request(cp);
	request.query("INSERT INTO so_app_images (login_animation_url,home_animation_url,loading_animation_url,background_image_url,timestamp) VALUES ('"+login_animation+"','"+home_animation+"','"+loading_animation+"','"+background_image+"','"+timestamp+"')",
		function(err,result){
			if(err)
			{
				res.json(err);
				res.end();
			}
			else
			{
        var archive = new zip();
			  archive.addFiles(
				allfiles,
				function () {
				  var buff = archive.toBuffer();
				  fs.writeFile("../public/images/app/animation.zip", buff, function () {
					res.writeHead(302, {'Location': 'send_notification'});
				    res.end();
				  });
			  }, function (err) {
				  console.log(err);
			  }); 
			}
		})
});


/**
  * @module : App images 
  * @desc   : Send message by notification about new animation
  * @return : send notification
  * @author : Softweb solutions
*/
router.get('/send_notification',function(req,res){

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
        var userinfo = {}
        total = result1.length;
        for(var loop=0;loop<total;loop++)
        {
          userinfo.deviceid = result1[loop].deviceid;
          userinfo.message  = "Newer animation is available. Do you want to update?";
          userinfo.title    = "Newer animation";
          userinfo.OS       = result1[loop].os;
          userinfo.name     = result1[loop].name;
          userinfo.email    = result1[loop].email; 
          var device_os = userinfo.OS.toLowerCase();

          if(device_os=="android")
            sendNotification("android",userinfo);
          else if(device_os=="ios")
            sendNotification("ios",userinfo);
        }
      }
    }
  }); 
  res.json("Success")
});


/**
  * @module : App images 
  * @desc   : Get Animation 
  * @return : Get Animation 
  * @author : Softweb solutions
*/
router.get('/getanimation',function(req,res){
  var allfiles = [];	
  var request = new sql.Request(cp);
  request.query("SELECT TOP 1 * FROM so_app_images order by ID desc", function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      if(result.length != undefined)
      {
        res.json({"zip_url":base_url+"images/app/animation.zip","timestamp":result[0].timestamp});
      }
    }	  
  });
});

module.exports = router;