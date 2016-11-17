var express     = require('express');
var authHelper  = require("../authHelper");
var request     = require('request');
var url         = require("url");
var async       = require("async");
var parseString = require('xml2js').parseString;
var router      = express.Router();
var request     = require('request');
var session     = require('express-session');
var crypto      = require('crypto');
var Guid      = require('guid'); 
var commonConfig  = require("../commonConfig");

/**
  * @module : inviteregister
  * @desc   : Get home page
  * @return : load main index file
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.get('/', function(req, res, next) {
    if (!req.session.isOutlook) {
      res.render('inviteregister', { title: 'Softweb Smart Office Register', message: "IOTWEBAPP" });
    }
    else {
      res.render('index', { title: 'JLL - Roombit', message: "IOTWEBAPP" });
    }  
});

router.post('/createAccount', function (req, res) {
  console.log(req.body);

  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var name = req.body.name;
  var officeid = req.body.officeid;
  var username = req.body.username;
  var userpassword = req.body.userpassword;
  var userid = req.body.userid;
  var role = req.body.role;
  var currentDate = new Date();
  var timestamp = currentDate.getTime();
  var created = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  var modified = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  var guid = Guid.raw();
  
  console.log(userpassword);
  sql.connect(dbconfig, function(err) {
    console.log(userpassword);
    var request = new sql.Request(cp);
    var shasum = crypto.createHash('sha1');
    console.log(shasum);
    console.log(userpassword);
    shasum.update(userpassword);
    console.log(shasum);
    userpassword = shasum.digest('hex');

    var smtpTransport = commonConfig.impconfig.smtpTransport;    
    var mail_body = commonConfig.registerEmailTemplate(firstname,lastname);
    var mailOptions = {
      from: commonConfig.impconfig.adminEmail, // sender address
      to: email, // receiver's email  
      subject: "Your new Smartoffice account", // Subject line
      html: mail_body
    }

    console.log("INSERT INTO so_people (userpassword,name,email,role,officeid,timestamp,userid,created,modified,issignin) VALUES ('"+userpassword+"','"+username+"','"+email+"','"+role+"',"+officeid+",'"+timestamp+"','"+userid+"','"+created+"','"+modified+"',"+0+")");

    request.query("INSERT INTO so_people (userpassword,name,email,role,officeid,timestamp,userid,created,modified,issignin) VALUES ('"+userpassword+"','"+username+"','"+email+"','"+role+"',"+officeid+",'"+timestamp+"','"+userid+"','"+created+"','"+modified+"',"+0+")",
    function(err, result) {
      if (err) {
        console.log(err);
        res.json(err);
      }
      else {
        console.log("RESULT: "+result);          
        console.log("INSERT INTO UserCredentials (uc_guid, uc_appuserguid,uc_password) VALUES ('"+guid+"','"+userid+"','"+userpassword+"')")
        request.query("INSERT INTO UserCredentials (uc_guid, uc_appuserguid,uc_password) VALUES ('"+guid+"','"+userid+"','"+userpassword+"')", 
        function(err1, result1) {
          if (err1) {
            console.log(err1)
            res.json(err1);
          }
          else {
            request.query("UPDATE so_invitation set token = "+null+" WHERE emailaddress ='"+email+"'",
            function(err2, result2)
            {
              if(err2)
              {
                res.json(err2);
              }
              else
              {
                smtpTransport.sendMail(mailOptions, 
            function(error, response){
              if (error) {
                console.log("Error"+error);
              } 
              else {
                console.log("Message sent: " + response.message);
                res.json({status:true,"message":"Mail send successfully"});
              }
            });
              }
          });
          }
        });
      }
    });
  });  
});

//added by JJ <jeel.joshi@softwebsolutions.com>
router.post('/getInvitationData', function (req, res) {
  var token = req.body.token;
  var request = new sql.Request(cp);
  request.query("SELECT * from so_invitation WHERE token = '"+token+"'",
      function(err, result)
      {
        if(err)
        {
          res.json(err);
          res.end();
        }
        else
        {
          res.json({data: result, message: "success"});
        }
      });
});

module.exports = router;