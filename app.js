// Node Server Modules and Configuration
// Written By : Softweb Solutions
// Year : 2015-16

var express       = require('express');  /* node js framework */
var path          = require('path'); /* fetch the url */
var favicon       = require('serve-favicon'); /* server favicon */
var logger        = require('morgan'); /* HTTP request logger middleware for node.js */
var cookieParser  = require('cookie-parser');	/* for enable cookie */
var bodyParser    = require('body-parser');	/* Body parsing middleware */
var session       = require('express-session');	/* For enable session */ 
var cors          = require('cors');	/* middleware for dynamically or statically enabling CORS in express/connect applications */
var fs            = require('fs');
var jwt 		      = require('jsonwebtoken');
var url 		      = require('url');
var moment        = require("moment");
var commonConfig  = require("./commonConfig");

// Site base url
base_url=commonConfig.impconfig.websiteURL;

// Routes Define 
var login     = require('./routes/login');
var botlogin     = require('./routes/botlogin');
var inviteregister = require('./routes/inviteregister');
var forgotpassword     = require('./routes/forgotpassword');
var resetpassword     = require('./routes/resetpassword');
var googleauth   = require('./routes/googleauth');
var register  = require('./routes/register');
var location  = require('./routes/location');
var people    = require('./routes/people');
var device    = require('./routes/device');
var office    = require('./routes/office');
var space    = require('./routes/space');
var invitation    = require('./routes/invitation');
var schedulemeeting    = require('./routes/schedulemeeting');
var index     = require('./routes/index');
var users     = require('./routes/users');
var company   = require('./routes/company');
var schedule   = require('./routes/schedule');
var profile   = require('./routes/profile');
var settings  = require('./routes/settings');
var token     = require('./routes/run');
var events    = require('./routes/events');
var del   	  = require('./routes/del');
var search    = require('./routes/search'); // added by Dhaval Thaker
var analytics = require('./routes/analytics'); // added by Dhaval Thaker
var appimages = require('./routes/appimages');
var configure = require('./routes/configure');
var amenities = require('./routes/amenities'); // added by Alpeshsinh Solanki
var mobservices = require('./routes/mobservices');
var cron = require('./routes/cron');
var floorplan    = require('./routes/floorplan');
var contactus = require('./routes/contactus');
//var billing = require('./routes/billing');
var app = express();

var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

// setup the logger 
app.use(logger('combined', {skip: function (req, res) { return res.statusCode < 400 },stream: accessLogStream}));

//app.use(logger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms', {skip: function (req, res) { return res.statusCode < 400 },stream: accessLogStream}));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({limit:'1550mb', extended: true}));
app.use(bodyParser.json({limit:'1550mb'}));
app.use(cookieParser());
app.use(cors());
app.use(session({secret: 'ssshhhhh',resave: true,saveUninitialized: true}));

/* Token use for data communication security [3-05-2016] : Softweb solutions*/
app.use(function(req, res, next) {

  var path = url.parse(req.url).pathname;
  var js_path = path.includes('/js/');
  var images_path = path.includes('/images/');
  var css_path = path.includes('/css/');
   var token = path.substring(path.indexOf('/')+15);
   var inviteToken = path.substring(path.indexOf('/')+16);
  
  if(req.headers.xtokenaccess=='aHR0cDovL3Jvb21iaXRhcC1zdGFnaW5nLmF6dXJld2Vic2l0ZXMubmV0Lw==')
  {
    next();
  }
 else if((path =='/mobservices/SoftwebHOQAddUser') || (path =='/mobservices/SoftwebHOQAddUserCredentials') || (path =='/mobservices/SoftwebHOQCheckUser') || (path =='/mobservices/SoftwebHOQAddOffice') || (path =='/mobservices/SoftwebHOQForgotUser') || (path =='/mobservices/SoftwebHOQUpdateUser') ||  (path =='/outlooklogin') || (path =='/office') || (path =='/space') || (path =='/forgotpassword') || (path =='/forgotpassword/forgotpassword') || (path =='/resetpassword') || (path =='/resetpassword/resetpassword') || (path =='/resetpassword/getUserId') || (path =='/forgotpassword/getUserName') || (path =='resetpassword/resetpassword/'+token) || (path=='/googleauth/oauthCallback') || (path=='/googleauth') ||  (path=='/inviteregister') || (path=='/inviteregister/createAccount') || (path=='/inviteregister/getInvitationData') || (path =='/inviteregister/'+inviteToken) || (path=='/botlogin') || (path=='/botlogin/botlogin') || (path =='/register') || (path =='/register/register') || (path =='/contactus') || (path =='/contactus/contactus') || (path =='/') || (path =='/office/getOfficeName') || (path =='/index') || (path =='/mobservices/getLoginUrlForBot') || (path =='/logout') || (path=='/index/getroom') || (path=='/billing/subscribe') || (path=='/index/authorize') || (path =='/profile/UpdatePassword') || (js_path==true) || (images_path==true) || (css_path==true)) 
  {
    next();
  }
  else if(req.body.deviceID && req.body.secretKey)
  {
    next();
  }
  else if(req.headers.authorization)
  {
    var token = req.headers.authorization;
    jwt.verify(token, commonConfig.impconfig.jwtSecretKey, function(err, decoded) 
    {
      if(err)
      {
        res.json({status:false,'data':null, 'message':err.message});
      }
      else
      {
        next();
      }   
    });
  }
  else 
  {
    res.json({status:false,'data':null, 'message':"Invalid Token"});
  } 
});

/*
* Token use for data communication security [END] : Softweb Solutions
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', login);
app.use('/botlogin', botlogin);
 app.use('/inviteregister', inviteregister);
app.use('/forgotpassword', forgotpassword);
app.use('/resetpassword', resetpassword);
app.use('/invitation', invitation);
app.use('/googleauth', googleauth);
app.use('/register', register);
app.use('/location', location);
app.use('/people', people);
app.use('/device', device);
app.use('/office', office);
app.use('/space', space);
app.use('/schedulemeeting', schedulemeeting);
app.use('/index', index);
app.use('/users', users);
app.use('/schedule', schedule);
app.use('/company',company);
app.use('/profile',profile);
app.use('/settings', settings);
app.use('/run', token);
app.use('/events', events);
app.use('/del', del);
app.use('/appimages', appimages);
app.use('/configure', configure);
app.use('/search', search); // added by Dhaval Thaker
app.use('/analytics', analytics); // added by Dhaval Thaker
app.use('/amenities', amenities); // added by Alpeshsinh Solanki
app.use('/mobservices', mobservices);
app.use('/floorplan', floorplan);
app.use('/contactus', contactus);
//app.use('/billing', billing);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {

  if(err) {

    var CurrentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    fs.appendFile('public/images/errorconsole.txt', 'DATE:== '+CurrentDate +'|| RESPONSE:== '+ JSON.stringify(err) +'|| ERROR:== '+ new Error().stack +'||' , function (err) {
      if (err) throw err;
      console.log('Error Console Manage in public/images/errorconsole.txt file...');
    });
		
    var smtpTransport = nodemailer.createTransport(commonConfig.impconfig.emailServer, commonConfig.emailConfig);

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: commonConfig.impconfig.noRplyEmail,
      to: commonConfig.impconfig.tempAdminEmail,
      subject: commonConfig.impconfig.organizationName+" Database Connection Error", 
      text: JSON.stringify(err)
    }

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
        console.log("Error"+error);
      }else{
        console.log("Message sent: " + response.message);
      }
    });
  }
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;