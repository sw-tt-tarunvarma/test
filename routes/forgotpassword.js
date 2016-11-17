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
var nodemailer = require('nodemailer');
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
      res.render('forgotpassword', { title: 'Softweb Smart Office register', message: "IOTWEBAPP" });
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
router.post('/forgotpassword', function (req, res) {
    var email = req.body.email;
    var name = req.body.name;
    var userTokenGen = new Date().getTime()+email;
    var userToken = crypto.createHash('md5').update(userTokenGen).digest('hex');
    var request = new sql.Request(cp);
    var smtpTransport = commonConfig.impconfig.smtpTransport;
    var link = "<a href='"+base_url+"resetpassword#/resetpassword/"+userToken+"'>"+base_url+"resetpassword#/resetpassword/"+userToken+"</a>";
    
    mail_body = commonConfig.forgotEmailTemplate(name,link);

       var mailOptions = {
            from: commonConfig.impconfig.adminEmail, // sender address
            to: email, // receiver's email  
            subject: "Reset your Smartoffice password", // Subject line
            html: mail_body
        }
  request.query("UPDATE so_people set forgotuserToken ='"+userToken+"' WHERE email = '"+email+"'",
  function(err, result)
  {
    if(err)
    {
      res.json(err);
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
});

router.post('/getUserName', function (req, res) {
  var email = req.body.email;
  console.log(email);
  var request = new sql.Request(cp);
  request.query("SELECT * from so_people WHERE email = '"+email+"'",
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