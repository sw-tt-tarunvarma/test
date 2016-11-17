var express     = require('express');
var authHelper  = require("../authHelper");
var request     = require('request');
var url         = require("url");
var async       = require("async");
var parseString = require('xml2js').parseString;
var router      = express.Router();
var request     = require('request');
var session     = require('express-session');

/**
  * @module : Login
  * @desc   : Get home page
  * @return : load main index file
  * @author : Softweb solutions
*/
router.get('/', function(req, res, next) {
    //console.log(req.session);
    if(!req.session.isOutlook){
      //res.redirect(authHelper.getAuthUrl());
      res.render('login', { title: 'Softweb Smart Office login', message: "IOTWEBAPP" });
    }
    else
    {
          res.render('index', { title: 'JLL - Roombit', message: "IOTWEBAPP" });
    }
  
});

//added by JJ <jeel.joshi@softwebsolutions.com>
router.get('/outlooklogin', function (req, res) {
  res.redirect(authHelper.getAuthUrl());
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


/**
  * @module : Login
  * @desc   : logout
  * @return : Return redirect on home page
  * @author : Softweb solutions
*/
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;