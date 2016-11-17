var express  = require('express');
var session  = require('express-session');
var router   = express.Router();
var request  = require('request');
var fs       = require('fs');
var moment   = require("moment");
nodemailer   = require("nodemailer");


/**
  * @module : Config run 
  * @desc   : Default run this file
  * @return : Return default required data
  * @author : Softweb solutions
*/
router.post('/', function(req, res) {
	session.outlookCookie  = undefined;
  var data = '';
  var requestapi = new sql.Request(cp);

  requestapi.query("SELECT TOP(1) Session, refreshid FROM so_session WHERE Session NOT LIKE '%undefined%' ORDER BY ID DESC", function(err1, result1) {
    if(err1)
    {
      res.json(err1);
    }
    else
    {
      session.outlookCookie   = result1[0].Session;
      session.refreshtokenid  = result1[0].refreshid;
      var refresh_token = session.refreshtokenid;
      var clientid      = "1ab43855-8623-4c7a-8b76-0d33b42d05af";
      var clientsec     = "8lJGCY8brQDzW3H4tdr8wvjI7lyW2E/vhWTB/nYA2to=";
      var redirectUri   = "https://outlook.office365.com/";
      
      data="grant_type=refresh_token&refresh_token="+refresh_token+"&client_id="+clientid+"&client_secret="+clientsec+"&resource="+redirectUri;
      request({
        method:'POST',
        url:'https://login.windows.net/common/oauth2/token',
        body : data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        auth:{ 'bearer' : session.outlookCookie },
      },
      function (error, response, body) {
  	
        var resdata = [];
        resdata = JSON.parse(body);
        session.outlookCookie  = resdata.access_token;
        session.refreshtokenid = resdata.refresh_token;
        if(response.statusCode!=undefined)
        {      
          if((response.statusCode!=200) && (response.statusCode!=400))
          {         
      	  	var CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');
            fs.appendFile('../public/images/errorconsole.txt', 'DATE:== '+CurrentDate +'|| RESPONSE:== '+ JSON.stringify(response) +'|| ERROR:== '+ new Error().stack +'||' , function (err) {
              if (err) throw err;
            });
      		
      		  var smtpTransport = nodemailer.createTransport("SMTP",{
    				  service : "mail.softwebsolutions.com",
    				  host    :"mail.softwebsolutions.com",
    				  port    :587,
    				  auth    : {
              					  user: "tarun@softwebsolutions.com",
              					  pass: "Qm,;es9Q#H#8d^-^SC"
    				            }
    			  });

      		  smtpTransport.sendMail({
              from    : "no-reply@example.com", // sender address
              to      : 'tarun@softwebsolutions.com, ishit@softwebsolutions.com', // list of receivers 
              subject : "JLL Roombit - Restart your app (token)", // Subject line
              html    : "Hello Admin,<br><br> Please restart your server and login from backend as a admin.<br><br>Thanks,<br>JLL Roombit Team." // plaintext body
        		}, function(error, response1){
        		 if(error){
        		   console.log(error);
        		 }else{
        		   console.log("Message sent: " + response1.message);
        		   return false;
        		 }
        		}); 
          }
        }
           
        if(session.outlookCookie != undefined)
        {
          var requestapi = new sql.Request(cp);
          requestapi.query("INSERT INTO so_session (Session,refreshid) VALUES ('"+session.outlookCookie+"','"+session.refreshtokenid+"')", function(err, result) {
            if(err)
            {
              res.json(err);
            }
            else
            {
              res.json({data: session.outlookCookie, message: "success"});
            }
          });
        }
      });
    }
  });
});

module.exports = router;