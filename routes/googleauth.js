var express       = require('express');
var request       = require('request');
var url           = require("url");
var async         = require("async");
var parseString   = require('xml2js').parseString;
var http          = require('http');
var express       = require('express');
var router        = express.Router();
var Session       = require('express-session');
var session       = require('express-session');
var google        = require('googleapis');
var plus          = google.plus('v1');
var OAuth2        = google.auth.OAuth2;
var Guid          = require('guid');
var commonConfig  = require("../commonConfig");

base_url = commonConfig.impconfig.websiteURL;

const ClientId          = commonConfig.impconfig.googleClientId;
const ClientSecret      = commonConfig.impconfig.googleClientSecret;
const RedirectionUrl    = base_url+"googleauth/oauthCallback";//"http://localhost:1234/oauthCallback";

var app = express();
router.use(Session({
    secret: 'raysources-secret-19890913007',
    resave: true,
    saveUninitialized: true
}));


function getOAuthClient () {
    return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}

router.use("/oauthCallback", function (req, res) {

  var oauth2Client = getOAuthClient();
  var session = req.session;
  var code = req.query.code;

  oauth2Client.getToken(code, function(err, tokens) {

      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(!err) {
        oauth2Client.setCredentials(tokens);
        session["tokens"]=tokens;

        var p = new Promise(function (resolve, reject) {
          plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
            resolve(response || err);
          });
        }).then(function (data) {
          

          var d1 = {"au_companyguid":null,"au_email":data.emails[0].value,"au_firstname":data.name.givenName,"au_lastname":data.name.familyName,"au_rolename":"Admin","au_isadmin":"1","au_statusguid":null,"au_createdby":null,"au_createddate":null,"au_modifiedby":null,"au_modifieddate":null};

          
                  request.post({
                    url:base_url+'/mobservices/SoftwebHOQAddUser',
                    body: {
                        'data' : d1,
                        'isgoogle' : 1
                    },
                    json: true,
                  },
                  function (error, response, body){

                      if(JSON.stringify(response.body.Status) == true)
                      {
                         sql.connect(dbconfig, function(err) {
                           var request = new sql.Request();
                           var guid = Guid.raw();
                           var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                           var modified = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

                     
                            request.query("INSERT INTO so_people (userid,userpassword,name,email,role,created,modified) VALUES ('"+guid+"','"+null+"','"+data.displayName+"','"+data.emails[0].value+"','"+'Manager'+"','"+created+"','"+modified+"')", 
                              function(err, result)
                              {
                                if(err)
                                {
                                  console.log(err);
                                  res.json(err);
                                }
                                else
                                {                                 
                                var au_guid = JSON.stringify(response.body.data[0][0]["au_guid"]);
                                var au_isadmin = JSON.stringify(response.body.data[0][0]["au_isadmin"]);
                                var token = JSON.stringify(response.body.token);
                                session.au_guid = au_guid;
                                session.au_isadmin = au_isadmin;
                                session.token = token;
                                res.redirect('/index');
                                res.end();
                                return false;
                               }
                             });
                           });
                      }
                      else
                      {
                        var au_guid = response.body.data[0][0]["au_guid"];
                        var au_isadmin = response.body.data[0][0]["au_isadmin"];
                        var token = JSON.stringify(response.body.token);
                        session.au_guid = au_guid;
                        session.au_isadmin = au_isadmin;
                        session.token = token;
                        res.redirect('/index');
                        res.end();
                        return false;
                      }

                });

           })

       
          }
          else{
            res.send(`
              &lt;h3&gt;Login failed!!&lt;/h3&gt;
              `);
          }
        });
});

router.get('/getSsSession', function(req, res, next) {
  res.json({"status":true,"au_guid":req.session.au_guid,"au_isadmin":req.session.au_isadmin, "message":"Get google values"});  
});

router.use("/", function (req, res) {
    req.headers.xtokenaccess== commonConfig.impconfig.xtokenaccessHeafer;
    var oauth2Client = new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
    var scopes = [
      //'https://www.googleapis.com/auth/plus.me'
      'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'
    ];

    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes // If you only need one scope you can pass it as string
    });
    res.redirect(url);
});

module.exports = router;