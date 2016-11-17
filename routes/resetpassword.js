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

/**
  * @module : Login
  * @desc   : Get home page
  * @return : load main index file
  * @author : Softweb solutions
  */
  router.get('/', function(req, res, next) {

    if(!req.session.isOutlook){
      //res.redirect(authHelper.getAuthUrl());
      res.render('resetpassword', { title: 'Softweb Smart Office register', message: "IOTWEBAPP" });
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
router.post('/resetpassword', function (req, res) {
   var token = req.body.token;
   var userid = req.body.userid;
   var password = req.body.newpassword;
   var request = new sql.Request(cp);
   var shasum = crypto.createHash('sha1');
   shasum.update(password);
   password = shasum.digest('hex');
   request.query("UPDATE so_people set userpassword = '"+password+"' WHERE forgotuserToken ='"+token+"'",
  function(err, result)
  {
    if(err)
    {
      res.json(err);
    }
    else
    {
      request.query("UPDATE UserCredentials set uc_password = '"+password+"' WHERE uc_appuserguid ='"+userid+"'",
      function(err1, result1)
      {
        if(err1)
        {
          res.json(err1);
        }
        else
        {
          request.query("UPDATE so_people set forgotuserToken = "+null+" WHERE userid ='"+userid+"'",
            function(err2, result2)
            {
              if(err2)
              {
                res.json(err2);
              }
              else
              {
                res.json("Password reset successfully");
              }
          });
        }
      });
    }
  });
});


//added by JJ <jeel.joshi@softwebsolutions.com>
router.post('/getUserId', function (req, res) {
  var token = req.body.token;
  var request = new sql.Request(cp);
  request.query("SELECT * from so_people WHERE forgotuserToken = '"+token+"'",
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