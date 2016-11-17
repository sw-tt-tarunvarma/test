var express     = require('express');
var authHelper  = require("../authHelper");
var request     = require('request');
var url         = require("url");
var async       = require("async");
var parseString = require('xml2js').parseString;
var router      = express.Router();
var request     = require('request');
var session     = require('express-session');

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
      res.render('contactus', { title: 'Softweb Smart Office', message: "IOTWEBAPP" });
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
router.post('/contactus', function (req, res) {
  var firstname = req.body.contactData.firstname;
  var lastname = req.body.contactData.lastname;
  var email = req.body.contactData.email;
  var phonenumber = req.body.contactData.phonenumber;
  var company = req.body.contactData.company;
  var roomno = req.body.contactData.roomno;
  var userrole = req.body.contactData.role;
  if(roomno == 10){
    var room = '10';
  } else if(roomno == 30) {
    room = '30';
  } else{
    room = '>30';
  }
  if(userrole == 'undefined' || userrole == undefined){
    var role = '-';
  }
 
   var smtpTransport = commonConfig.impconfig.smtpTransport;
    
    mail_body = commonConfig.contactUsEmailTemplate(firstname,lastname,email,phonenumber,company,room,role);

       var mailOptions = {
            from: email, // sender address
            to: commonConfig.impconfig.ContactusEmail, // receiver's email  
            subject: "Contact us - SmartOffice", // Subject line
            html: mail_body
        }
   
      smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
        console.log("Error"+error);
      }else{
        console.log("Message sent: " + response.message);
        res.json({status:true,"message":"Mail send successfully"});
      }
    });
});

module.exports = router;