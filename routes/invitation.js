var express   = require('express');
var fs        = require('fs');
var router    = express.Router();
var nodemailer = require('nodemailer');
var async       = require("async");
var request     = require('request');
var crypto      = require('crypto');
var commonConfig  = require("../commonConfig");

/**
  * @module : Office 
  * @desc   : Get list of office
  * @return : Return office list
  * @author : Softweb solutions
  */
  router.get('/', function (req, res) {
    res.render('invite_member', { title: 'Softweb Smart Office', message: "IOTWEBAPP" });
  });


/**
  * @module : Office 
  * @desc   : Insert office
  * @return : Return add office
  * @author : Softweb solutions JJ <jeel.joshi@softwebsolutions.com>
  */
  router.post('/invite', function (req, res) {
    var smtpTransport = commonConfig.impconfig.smtpTransport;
    var data = req.body.addInviteData;
    var userid = req.body.userid;
    var officeid = req.body.officeid;
    var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var request = new sql.Request(cp);
    var arr = [];
    data.forEach(function (result) {
      arr.push(result.email);
    });
    
    var cnt = 0;

    async.forEachSeries(arr, function(n1, callback_s1) {
    
       var userTokenGen = new Date().getTime()+n1+userid+officeid;
       var userToken = crypto.createHash('md5').update(userTokenGen).digest('hex');
       var link = base_url+"inviteregister#/inviteregister/"+userToken;
        console.log("INSERT INTO so_invitation (userid,officeid,emailaddress,token,createddate) VALUES ('"+userid+"',"+officeid+",'"+n1+"','"+userToken+"','"+created+"')");
        request.query("INSERT INTO so_invitation (userid,officeid,emailaddress,token,createddate) VALUES ('"+userid+"',"+officeid+",'"+n1+"','"+userToken+"','"+created+"')",
  function(err, result)
  {
    if(err)
    {
      res.json(err);
    }
    else
    {
      console.log("SELECT o.OfficeName,os.logo from so_office o INNER JOIN so_officesettings os ON o.id = os.companyid where o.id = '"+officeid+"'");
        request.query("SELECT o.OfficeName,os.logo from so_office o INNER JOIN so_officesettings os ON o.id = os.companyid where o.id = '"+officeid+"'",
  function(err1, result1)
  {
    if(err1)
    {
      res.json(err1);
    }
    else
    {
      var officename = '';
      var officelogo = '';
        if(result1.length)
          {
            officename = result1[0].OfficeName;   
            officelogo = result1[0].logo;
          }
          mail_body = commonConfig.inviteEmailTemplate(n1,link,officename,officelogo);
          var mailOptions = {
            from: commonConfig.impconfig.adminEmail, // sender address
            to: n1, // list of receivers  
            subject: "You are invited to join your team on Smartoffice", // Subject line
            html: mail_body
        }
      
      smtpTransport.sendMail(mailOptions, function(error, response){
          cnt++;
          if(error){
            console.log("Error"+error);
          }else{
            console.log("Message sent: " + response.message);
            if(cnt == arr.length)
            {
              res.json({status:true,"message":"Mail send successfully"});
            }
          }
        });
      callback_s1();
    }
  });
    }
  });  
    });

    //return false;
   
});
  module.exports = router;