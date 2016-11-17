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
  * @module : Login
  * @desc   : Get home page
  * @return : load main index file
  * @author : Softweb solutions
  */
  router.get('/', function(req, res, next) {

    if(!req.session.isOutlook){
      //res.redirect(authHelper.getAuthUrl());
      res.render('register', { title: 'Softweb Smart Office register', message: "IOTWEBAPP" });
    }
    else
    {
      res.render('index', { title: 'JLL - Roombit', message: "IOTWEBAPP" });
    }

  });


/**
  * @module : Login
  * @desc   : Get check authorization
  * @return : Return authorization
  * @author : Softweb solutions
  */
  router.get('/authorize', function(req, res) {
    var url_parts = url.parse(req.url, true);
    var code = url_parts.query.code;
    var token = authHelper.getTokenFromCode(code, 'https://outlook.office365.com/', tokenReceived, res);
  });


/**
  * @module : Login
  * @desc   : Receive token
  * @return : Return token
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
      res.cookie('nodetutorialtoken', token.token.access_token, { maxAge: 3600, httpOnly: true });
      res.writeHead(302, {'Location': 'getroom'});
      res.end();


    }
  }


/**
  * @module : Login
  * @desc   : get username if in session
  * @return : Return user detail
  * @author : Softweb solutions
  */
  router.get('/getUserSession', function (req, res) {
  });

//added by JJ <jeel.joshi@softwebsolutions.com>
router.post('/register', function (req, res) {
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var phonenumber = req.body.phonenumber;
  var company = req.body.company;
  var calendarsystem = req.body.calendarsystem;
  var roomno = req.body.roomno;
  var username = req.body.username;
  var userpassword = req.body.password;
  var userid = req.body.userid;
  var companyid = null;
  var userrole = "Admin";
  var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  var modified = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  var fullname = firstname+" "+lastname;

  var guid = Guid.raw();
  
  
  sql.connect(dbconfig, function(err) {
   var request = new sql.Request();
   var shasum = crypto.createHash('sha1');
   shasum.update(userpassword);
   userpassword = shasum.digest('hex');
   var timestamp = Math.floor(new Date() / 1000);

   var smtpTransport = commonConfig.impconfig.smtpTransport;
    
    mail_body = commonConfig.registerEmailTemplate(firstname,lastname);

       var mailOptions = {
            from: commonConfig.impconfig.adminEmail, // sender address
            to: email, // receiver's email  
            subject: "Congratulations on your new SmartOffice Account", // Subject line
            html: mail_body
        }
 

request.query("INSERT INTO so_people (userpassword,name,email,role,defaultlocationid,timestamp,userid,created,modified,issignin) VALUES ('"+userpassword+"','"+fullname+"','"+email+"','"+userrole+"',"+companyid+",'"+timestamp+"','"+userid+"','"+created+"','"+modified+"',"+0+")", 
  function(err, result)
  {
    if(err)
    {
      console.log(err);
      res.json(err);
      }
      else
      {
        console.log(guid)

        console.log("RESULT: "+result);
        
        console.log("INSERT INTO UserCredentials (uc_guid, uc_appuserguid,uc_password) VALUES ('"+guid+"','"+userid+"','"+userpassword+"')")
        request.query("INSERT INTO UserCredentials (uc_guid, uc_appuserguid,uc_password) VALUES ('"+guid+"','"+userid+"','"+userpassword+"')", 
          function(err1, result1)
          {
            if(err1)
            {
              console.log(err1)
              res.json(err1);
            }
            else
            {
              smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
            console.log("Error"+error);
          }else{
            console.log("Message sent: " + response.message);
            res.json({status:true,"message":"Mail send successfully"});
          }
        });
            }
        });
      }
    });
});
  
});

module.exports = router;