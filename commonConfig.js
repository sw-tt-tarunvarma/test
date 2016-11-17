'use strict'

var express     = require('express');
var session     = require('express-session');
var router      = express.Router();
var request     = require('request');
var authHelper  = require("./authHelper");
var outlook     = require("node-outlook");
var url         = require("url");
var fs          = require('fs');
var parseString = require('xml2js').parseString;
var async       = require("async");
var moment      = require("moment");
var q           = require("q");
//var util = require('util'),
//braintree = require('braintree');

var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "mail.softwebsolutions.com",
    host:"mail.softwebsolutions.com",
    port:587,
    auth: {
        user: "rohan@softwebsolutions.com",
        pass: "TWw&nb8WNZOZ!7qI;T"
    }
});

var acmeLoginCallBackUrl = "https://bankingbotluis.azurewebsites.net/api/authCallback";
var botLoginCallBackUrl = "https://bankingbotluis.azurewebsites.net/api/authCallback";

/* Following String for email template */
var emailContainerHeaderString = '<!DOCTYPE html>';
    emailContainerHeaderString += '<html lang="en-US">';
        emailContainerHeaderString += '<head>';
            emailContainerHeaderString += '<meta charset="utf-8">';
            emailContainerHeaderString += '<style type="text/css">html{width: 100%;}body{-webkit-text-size-adjust: none;-ms-text-size-adjust: none;margin: 0;padding: 0;}a{outline: 0;}table{border-spacing: 0;}img{display: block !important;height: auto !important;}table td{border-collapse: collapse;}@media only screen and (max-width: 640px){body {width: auto!important;}table[class="container"]{width: 100%!important;padding-left: 20px!important;padding-right: 20px!important;}img[class="image-100-percent"]{width: 100% !important;height: auto !important;max-width: 100% !important;}img[class="small-image-100-percent"]{width: 100% !important;height: auto !important;}table[class="full-width"]{width: 100% !important;}table[class="full-width-text"]{width: 100% !important;background-color: #b91925;padding-left: 20px !important;padding-right: 20px !important;}table[class="full-width-text2"]{width: 100% !important;background-color: #f3f3f3;padding-left: 20px !important;padding-right: 20px !important;}table[class="col-2-3img"]{width: 50% !important;margin-right: 20px !important;}table[class="fix-box"]{padding-left: 20px !important;padding-right: 20px !important;}td[class="fix-box"]{padding-left: 20px !important;padding-right: 20px !important;}td[class="font-resize"]{font-size: 18px !important;line-height: 22px !important;}td[class="align_center"]{text-align:center !important;}table[class="align_center"]{text-align:center !important;float:none !important;margin:0 auto !important;}}@media only screen and (max-width: 479px){body{font-size: 10px !important;}table[class="container"]{width: 100%!important;padding-left: 10px!important;padding-right: 10px!important;}table[class="container2"]{width: 100%!important;float: none !important;}img[class="image-100-percent"]{width: 100% !important;height: auto !important;max-width: 100% !important;min-width: 124px !important;}img[class="small-image-100-percent"]{width: 100% !important;height: auto !important;max-width: 100% !important;min-width: 124px !important;}table[class="full-width"]{width: 100% !important;}table[class="full-width-text"]{width: 100% !important;background-color: #b91925;padding-left: 20px !important;padding-right: 20px !important;}table[class="full-width-text2"]{width: 100% !important;background-color: #f3f3f3;padding-left: 20px !important;padding-right: 20px !important;}td[class="text-center"]{text-align: center !important;}div[class="text-center"]{text-align: center !important;}table[class="fix-box"]{padding-left: 0px !important;padding-right: 0px !important;}td[class="fix-box"]{padding-left: 0px !important;padding-right: 0px !important;}}</style>'
        emailContainerHeaderString += '</head>';
        emailContainerHeaderString += '<body style="font-size:12px;">';
            emailContainerHeaderString += '<div>';

var emailContainerFooterString = '</div>';
        emailContainerFooterString += '</body>';
    emailContainerFooterString += '</html>';


//Email Template End

/**
  * @module : Meeting Notification 
  * @desc   : Common function for get event details from o365
  * @return : Return room detail
  * @author : Softweb solutions
*/
function getEventDetails(requestque,eventID)
{
  console.log("MMMMMMMMMMMMMM");
  console.log(eventID);
  var deferred = q.defer(); 
  if(requestque != undefined || eventID != undefined )
  {

    requestque.query("select TOP(1) pbd.ID,  p.name as organizerName, l.name as roomName, l.address as roomEmailAddress, pbd.eventid, pbd.timestamp, pbd.duration, pbd.total_event_duration, pbd.mailAction, pbd.action, pbd.delete_event FROM so_people_booking_details as pbd LEFT JOIN so_location as l ON pbd.locationid = l.id LEFT JOIN so_people as p ON pbd.userid = p.userid WHERE pbd.eventid = '"+eventID+"' AND (pbd.action = 'BOOKNOW' OR pbd.action = 'BOOKLATER') group by pbd.ID, p.name, l.name, l.address, pbd.eventid, pbd.timestamp, pbd.duration, pbd.total_event_duration, pbd.mailAction, pbd.action, pbd.delete_event order by pbd.ID desc",
    function(err, result) {
        
        if(err)
        {
          var res = {status : false, data:null, message:err.message}
          deferred.reject(res);
        }
        else
        {
          if(result.length > 0)
          {
            //Need to Open comment
            var meetingDuration = result[0].total_event_duration;
            //var meetingDuration = result[0].duration; //Need to comment
            
            var eventStartTimeStamp = result[0].timestamp;
            var eventEndtTimeStamp = parseInt(eventStartTimeStamp) + (parseInt(meetingDuration) * parseInt(60));
            console.log("eventEndtTimeStamp==>"+eventEndtTimeStamp);
            var eventStart = moment(eventStartTimeStamp * 1000);//new Date(
            console.log("Start date==>"+eventStart);
            var start = moment(eventStart).format("YYYY-MM-DD HH:mm:ss");
            console.log("Start ==>"+start);
            
            var eventEnd = moment(eventEndtTimeStamp * 1000);
            console.log("event End ==>"+eventEnd);
            var end = moment(eventEnd).format("YYYY-MM-DD HH:mm:ss");
            console.log("End ==>"+end);

            var data = {
              'bookingID'           :  result[0].ID,
              'organizerName'       :  result[0].organizerName,
              'organizerEmail'      :  result[0].roomEmailAddress,
              'roomName'            :  result[0].roomName,
              'eventid'             :  result[0].eventid,
              'start'               :  start,
              'end'                 :  end,
              'timeZone'            :  'UTC',
              'duration'            :  result[0].duration,
              'total_event_duration':  result[0].total_event_duration,
              'mailAction'          :  result[0].mailAction,
              'action'              :  result[0].action,
              'delete_event'        :  result[0].delete_event,
            }
            console.log(data);
            var res = {status : true, data:data, message:'Data get successfully.'}
            deferred.resolve(res);
          }
          else
          {
            var res = {status : false, data:null, message:'Event not found.'} 
            deferred.resolve(res);
          }  
        }
    });
    return deferred.promise;
  }
  else
  {
    var res = {status : false, data:null, message:"Data missing..!"}
    deferred.reject(res);
    return deferred.promise;
  }
}


/**
  * @module : Meeting Notification 
  * @desc   : Get event booking detail from db
  * @return : Return event booking detail
  * @author : Softweb solutions
*/
function eventBookingDetail(requestque,eventID)
{
    var deferred = q.defer(); 
    if(requestque != undefined || eventID != undefined )
    {

        console.log("*****************************************");
        console.log("SELECT duration, eventid, mailAction FROM so_people_booking_details WHERE (action = 'BOOKNOW' OR action = 'BOOKLATER') and eventid = '"+eventID+"'");
        console.log("*****************************************");
        requestque.query("SELECT duration, eventid, mailAction FROM so_people_booking_details WHERE (action = 'BOOKNOW' OR action = 'BOOKLATER') and eventid = '"+eventID+"'",
        function(err, bookingDetail) {
          if(err)
          {
            deferred.reject(err);
          }
          else
          {
            console.log(bookingDetail);
            deferred.resolve(bookingDetail);
          }
        });
        return deferred.promise;
    }
    else
    {
        deferred.reject("Data missing.!");
        return deferred.promise;
    }  
}


/**
  * @module : Meeting Notification 
  * @desc   : Check for even exist or not
  * @return : Response of existance
  * @author : Softweb solutions
*/
function checkEventExistance(requestSQL,eventID)
{
  var deferred = q.defer(); 
  if(requestSQL != undefined || eventID != undefined )
  {
    requestSQL.query("SELECT * FROM so_prompt WHERE eventid = '"+eventID+"'",
    function(err, result) {
      if(err)
      {
        deferred.reject(err);
      }
      else
      {
        deferred.resolve(result);
      }
    });
    return deferred.promise;
  }
  else
  {
    deferred.reject("Data not found");
    return deferred.promise;
  }  
}

/**
  * @module : Forgot Password 
  * @desc   : Reset password request from user
  * @return : Response of existance
  * @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
*/
function forgotEmailTemplate(name,link)
{
  /*var mail_text = "";  
    mail_text +=  "<span font-size:16px;line-height:22px;> Hey "+name+",</span><br><br>";

    mail_text += "<div>You've requested a password reset. Follow this link to complete the reset process<br><br>";
    mail_text += link + "<br><br>";
    mail_text += "If this email comes as a surprise, please let us know here: support@smartoffice.com<br>";
    mail_text += "</div><br>Have a great day,<br>Smartoffice Team.";

return mail_text;*/
  var mail_text = "";
  mail_text += emailContainerHeaderString;
    mail_text +=   "<table id='mainStructure' style='background-color:#f1f1f1;' border='0' cellpadding='0' cellspacing='0' width='100%'> <!--START VIEW ONLINE AND ICON SOCAIL --> <tbody> <!--START TOP NAVIGATION LAYOUT--> <tr> <td valign='top'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td class='fix-box' align='center' valign='top'><!-- start top navigation container --> <table class='container' style='background-color:#ffffff;' align='center' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start top navigaton --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='560'> <!-- start space --> <tbody> <tr> <td class='' valign='top' height='15'></td> </tr> <!-- end space --> <tr> <td valign='middle'><table class='container2' align='left' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' align='center' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> </tbody> </table> <!--start content nav --> <table class='container2' align='right' border='0' cellpadding='0' cellspacing='0'> <!--start call us --> <tbody> <tr> <td><table align='center' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' style='font-size: 12px; line-height: 27px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#43494f; font-weight:normal; text-align:center;'>&nbsp;</td> <td class='' style='padding-left:5px; padding-top:20px; font-size: 15px; line-height: 12px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#ffffff; font-weight:normal;' align='left' valign='middle'></td></tr></tbody> </table></td></tr></tbody></table></td> </tr><tr> <td class='' valign='top' height='20'></td> </tr></tbody> </table> <!-- end top navigaton --></td> </tr> </tbody> </table> </td> </tr> </tbody> </table></td> </tr> <tr> <td class='fix-box' align='center' valign='top'><!-- start layout-6 container width 600px --> <table class='container' bgcolor='#ffffff' align='center' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start layout-6 container width 560px --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='580'> <!--start space height --> <tbody> <tr> <td width='100%' height='30' class=''></td> </tr> <tr> <td align='center' class=''><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Hello "+name+",</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>You've requested a password reset. Follow this link to complete the reset process:</td> </tr> <!-- start space --><tr><td></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>"+link+"</td> </tr><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>If this email comes as a surprise, please let us know here: support@smartoffice.com</td> </tr><tr><td><br></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Have a great day,</td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'> Smartoffice Team,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' align='left' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> <!-- start space --> <tr> <td class='' valign='top' height='30'></td> </tr> <!-- end space --> </tbody> </table></td> </tr> <!--end space height --> </tbody> </table> <!-- end layout-6 container width 560px --></td> </tr> </tbody> </table> </td> </tr> </tbody></table>";
    mail_text += emailContainerFooterString;
    return mail_text;
}

/**
  * @module : Invite Members 
  * @desc   : Invite members to join office
  * @return : Response of existance
  * @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
*/
function inviteEmailTemplate(n1,link,officename,officelogo)
{
  var mail_text = "";
  mail_text += emailContainerHeaderString;
    mail_text +=   "<table id='mainStructure' style='background-color:#f1f1f1;' border='0' cellpadding='0' cellspacing='0' width='100%'><tbody><tr> <td valign='top'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td class='fix-box' align='center' valign='top'><table class='container' style='background-color:#ffffff;' align='center' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='560'><tbody> <tr> <td class='' valign='top' height='15'></td> </tr><tr> <td valign='middle'><table class='container2' align='left' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' align='center' valign='top'><img src='"+base_url+"/images/app/"+officelogo+"' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> </tbody> </table><table class='container2' align='right' border='0' cellpadding='0' cellspacing='0'><tbody> <tr> <td><table align='center' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' style='font-size: 12px; line-height: 27px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#43494f; font-weight:normal; text-align:center;'>&nbsp;</td> <td class='' style='padding-left:5px; padding-top:20px; font-size: 15px; line-height: 12px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#ffffff; font-weight:normal;' align='left' valign='middle'></td></tr></tbody> </table></td></tr></tbody></table></td> </tr><tr> <td class='' valign='top' height='20'></td> </tr></tbody> </table></td> </tr> </tbody> </table> </td> </tr> </tbody> </table></td> </tr> <tr> <td class='fix-box' align='center' valign='top'><table class='container' bgcolor='#ffffff' align='center' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='580'><tbody> <tr> <td width='100%' height='30' class=''></td> </tr> <tr> <td align='center' class=''><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Hello,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>"+officename+" has invited you to join them on smartoffice. It's an easy way to coordinate room booking and other things around the office that give you more time to do great work. The best way to start is by accepting this invite:</td> </tr><tr><td><br></td></tr> <tr><td class='' valign='top' height='15'><a style='background: #00a8ff none repeat scroll 0 0;border: 1px solid #00a8ff;border-radius: 3px;color: #fff;font-weight: 600;cursor: pointer;display: inline-block;font-size: 1rem;line-height: 1.5;padding: 0.375rem 1rem;text-align: center;text-decoration: none;vertical-align: middle;' href='"+link+"'> Click to Join our SmartOffice </a></td> </tr><tr><td><br></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Smartoffice makes scheduling your work day easy, and your office feel like the future:</td> </tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><ul><li>Find free space when you need to get work done (via mobile and web)</li><br><li>Book rooms in advance, or when you walk in (without digging through calendars)</li><br><li>Get updated on what’s happening in the office, even if you’re not</li><br><li>See who’s available, and who you shouldn’t interrupt.</li></ul></td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Thanks,</td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'> "+officename+" Team,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' align='left' valign='top'><img src='"+base_url+"/images/app/"+officelogo+"' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr><tr> <td class='' valign='top' height='30'></td> </tr></tbody> </table></td> </tr></tbody> </table></td> </tr> </tbody> </table> </td> </tr> </tbody></table>";
    mail_text += emailContainerFooterString;
    return mail_text;
}

/**
  * @module : Register 
  * @desc   : Welcome email to new user
  * @return : Response of existance
  * @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
*/
function registerEmailTemplate(firstname,lastname)
{
 /* var mail_text = "";  
    mail_text +=  "<span font-size:16px;line-height:22px;> Hey "+firstname+" "+lastname+",</span><br><br>";

    mail_text += "<div>Welcome to <a href='"+base_url+"'>Smartoffice</a>. We're glad to have you.<br><br>";
    mail_text += "If this email comes as a surprise, please let us know here: support@smartoffice.com<br>";
    mail_text += "</div><br>Have a great day,<br>Smartoffice Team.";

return mail_text;*/
 var mail_text = "";
  mail_text += emailContainerHeaderString;
    mail_text +=   "<table id='mainStructure' style='background-color:#f1f1f1;' border='0' cellpadding='0' cellspacing='0' width='100%'> <!--START VIEW ONLINE AND ICON SOCAIL --> <tbody> <!--START TOP NAVIGATION LAYOUT--> <tr> <td valign='top'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td class='fix-box' align='center' valign='top'><!-- start top navigation container --> <table class='container' style='background-color:#ffffff;' align='center' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start top navigaton --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='560'> <!-- start space --> <tbody> <tr> <td class='' valign='top' height='15'></td> </tr> <!-- end space --> <tr> <td valign='middle'><table class='container2' align='left' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' align='center' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> </tbody> </table> <!--start content nav --> <table class='container2' align='right' border='0' cellpadding='0' cellspacing='0'> <!--start call us --> <tbody> <tr> <td><table align='center' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' style='font-size: 12px; line-height: 27px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#43494f; font-weight:normal; text-align:center;'>&nbsp;</td> <td class='' style='padding-left:5px; padding-top:20px; font-size: 15px; line-height: 12px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#ffffff; font-weight:normal;' align='left' valign='middle'></td></tr></tbody> </table></td></tr></tbody></table></td> </tr><tr> <td class='' valign='top' height='20'></td> </tr></tbody> </table> <!-- end top navigaton --></td> </tr> </tbody> </table> </td> </tr> </tbody> </table></td> </tr> <tr> <td class='fix-box' align='center' valign='top'><!-- start layout-6 container width 600px --> <table class='container' bgcolor='#ffffff' align='center' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start layout-6 container width 560px --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='580'> <!--start space height --> <tbody> <tr> <td width='100%' height='30' class=''></td> </tr> <tr> <td align='center' class=''><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Hey "+firstname+" "+lastname+",</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Welcome to Softweb SmartOffice. We are pleased to have you in our family.</td> </tr> <!-- start space --><tr><td></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>You're almost ready to get going, we just need to verify your email before starting. Visit this link in your browser to confirm your address:</td> </tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><a href='"+base_url+"'>Smartoffice</a></td></tr><tr><td></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Smartoffice makes scheduling your work day easy, and your office feel like the future:</td> </tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><ul><li>Find free space when you need to get work done (via mobile and web)</li><br><li>Book rooms in advance, or when you walk in (without digging through calendars)</li><br><li>Get updated on what’s happening in the office, even if you’re not</li><br><li>See who’s available, and who you shouldn’t interrupt.</li></ul></td> </tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Thank you so much for choosing us!</td> </tr><tr><td><br></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Have a great time with SmartOffice!</td> </tr><tr><td><br></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Softweb SmartOffice Team</td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><a href='http://www.softwebsmartoffice.com/'>http://www.softwebsmartoffice.com/</a></td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' align='left' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> <!-- start space --> <tr> <td class='' valign='top' height='30'></td> </tr> <!-- end space --> </tbody> </table></td> </tr> <!--end space height --> </tbody> </table> <!-- end layout-6 container width 560px --></td> </tr> </tbody> </table> </td> </tr> </tbody></table>";
    mail_text += emailContainerFooterString;
    return mail_text;
}

/**
  * @module : Send Create event email 
  * @desc   : Send an email when create e meeting to attendies
  * @return : Response of existance
  * @author : Softweb solutions
*/
/**
  * @module : Send Create event email 
  * @desc   : Send an email when create e meeting to attendies
  * @return : Response of existance
  * @author : Softweb solutions
*/
function createEventTemplate(location_name,purpose,time,endTime,detail,people_name)
{

  var mail_text = "";
  mail_text += emailContainerHeaderString;
    mail_text +=   "<table id='mainStructure' style='background-color:#f1f1f1;' border='0' cellpadding='0' cellspacing='0' width='100%'> <!--START VIEW ONLINE AND ICON SOCAIL --> <tbody> <!--START TOP NAVIGATION LAYOUT--> <tr> <td valign='top'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td class='fix-box' align='center' valign='top'><!-- start top navigation container --> <table class='container' style='background-color:#ffffff;' align='center' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start top navigaton --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='560'> <!-- start space --> <tbody> <tr> <td class='' valign='top' height='15'></td> </tr> <!-- end space --> <tr> <td valign='middle'><table class='container2' align='left' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' align='center' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> </tbody> </table> <!--start content nav --> <table class='container2' align='right' border='0' cellpadding='0' cellspacing='0'> <!--start call us --> <tbody> <tr> <td><table align='center' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' style='font-size: 12px; line-height: 27px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#43494f; font-weight:normal; text-align:center;'>&nbsp;</td> <td class='' style='padding-left:5px; padding-top:20px; font-size: 15px; line-height: 12px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#ffffff; font-weight:normal;' align='left' valign='middle'></td></tr></tbody> </table></td></tr></tbody></table></td> </tr><tr> <td class='' valign='top' height='20'></td> </tr></tbody> </table> <!-- end top navigaton --></td> </tr> </tbody> </table> </td> </tr> </tbody> </table></td> </tr> <tr> <td class='fix-box' align='center' valign='top'><!-- start layout-6 container width 600px --> <table class='container' bgcolor='#ffffff' align='center' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start layout-6 container width 560px --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='580'> <!--start space height --> <tbody> <tr> <td width='100%' height='30' class=''></td> </tr> <tr> <td align='center' class=''><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Hello,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>"+people_name+" has invited you to "+location_name+"</td> </tr> <!-- start space --><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><span>Title: </span>"+purpose+"</td> </tr><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><span>When: </span>"+time+" to "+endTime+"</td> </tr><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><span>Organizer: </span>"+people_name+"</td> </tr><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><span>Description: </span>"+detail+"</td> </tr><tr><td><br></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Have a great day,</td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'> Smartoffice Team,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' align='left' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> <!-- start space --> <tr> <td class='' valign='top' height='30'></td> </tr> <!-- end space --> </tbody> </table></td> </tr> <!--end space height --> </tbody> </table> <!-- end layout-6 container width 560px --></td> </tr> </tbody> </table> </td> </tr> </tbody></table>";
    mail_text += emailContainerFooterString;
    return mail_text;
}

/**
  * @module : Send Amenities email 
  * @desc   : Send an email to admin  
  * @return : Response of existance
  * @author : Softweb solutions
*/
function createEventAmenitiesTemplate(amenities,UserName)
{

  var mail_text = "";
  mail_text += emailContainerHeaderString;
    mail_text +=   "<table id='mainStructure' style='background-color:#f1f1f1;' border='0' cellpadding='0' cellspacing='0' width='100%'> <!--START VIEW ONLINE AND ICON SOCAIL --> <tbody> <!--START TOP NAVIGATION LAYOUT--> <tr> <td valign='top'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td class='fix-box' align='center' valign='top'><!-- start top navigation container --> <table class='container' style='background-color:#ffffff;' align='center' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start top navigaton --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='560'> <!-- start space --> <tbody> <tr> <td class='' valign='top' height='15'></td> </tr> <!-- end space --> <tr> <td valign='middle'><table class='container2' align='left' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' align='center' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> </tbody> </table> <!--start content nav --> <table class='container2' align='right' border='0' cellpadding='0' cellspacing='0'> <!--start call us --> <tbody> <tr> <td><table align='center' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' style='font-size: 12px; line-height: 27px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#43494f; font-weight:normal; text-align:center;'>&nbsp;</td> <td class='' style='padding-left:5px; padding-top:20px; font-size: 15px; line-height: 12px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#ffffff; font-weight:normal;' align='left' valign='middle'></td></tr></tbody> </table></td></tr></tbody></table></td> </tr><tr> <td class='' valign='top' height='20'></td> </tr></tbody> </table> <!-- end top navigaton --></td> </tr> </tbody> </table> </td> </tr> </tbody> </table></td> </tr> <tr> <td class='fix-box' align='center' valign='top'><!-- start layout-6 container width 600px --> <table class='container' bgcolor='#ffffff' align='center' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start layout-6 container width 560px --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='580'> <!--start space height --> <tbody> <tr> <td width='100%' height='30' class=''></td> </tr> <tr> <td align='center' class=''><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Hello Administrator,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>I have requested to add amenities in this room.</td> </tr> <!-- start space --><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><span>Amenities Description: </span>"+amenities+"</td> </tr><tr><td>&nbsp;</td></tr><br><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Thanks,</td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'> "+UserName+"</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' align='left' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> <!-- start space --> <tr> <td class='' valign='top' height='30'></td> </tr> <!-- end space --> </tbody> </table></td> </tr> <!--end space height --> </tbody> </table> <!-- end layout-6 container width 560px --></td> </tr> </tbody> </table> </td> </tr> </tbody></table>";
    mail_text += emailContainerFooterString;
    return mail_text;
}


/**
  * @module : Send Catering email 
  * @desc   : Send an email to admin  
  * @return : Response of existance
  * @author : Softweb solutions
*/
function createEventCateringTemplate(amenities,UserName)
{

  var mail_text = "";
  mail_text += emailContainerHeaderString;
    mail_text +=   "<table id='mainStructure' style='background-color:#f1f1f1;' border='0' cellpadding='0' cellspacing='0' width='100%'> <!--START VIEW ONLINE AND ICON SOCAIL --> <tbody> <!--START TOP NAVIGATION LAYOUT--> <tr> <td valign='top'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td class='fix-box' align='center' valign='top'><!-- start top navigation container --> <table class='container' style='background-color:#ffffff;' align='center' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start top navigaton --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='560'> <!-- start space --> <tbody> <tr> <td class='' valign='top' height='15'></td> </tr> <!-- end space --> <tr> <td valign='middle'><table class='container2' align='left' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' align='center' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> </tbody> </table> <!--start content nav --> <table class='container2' align='right' border='0' cellpadding='0' cellspacing='0'> <!--start call us --> <tbody> <tr> <td><table align='center' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' style='font-size: 12px; line-height: 27px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#43494f; font-weight:normal; text-align:center;'>&nbsp;</td> <td class='' style='padding-left:5px; padding-top:20px; font-size: 15px; line-height: 12px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#ffffff; font-weight:normal;' align='left' valign='middle'></td></tr></tbody> </table></td></tr></tbody></table></td> </tr><tr> <td class='' valign='top' height='20'></td> </tr></tbody> </table> <!-- end top navigaton --></td> </tr> </tbody> </table> </td> </tr> </tbody> </table></td> </tr> <tr> <td class='fix-box' align='center' valign='top'><!-- start layout-6 container width 600px --> <table class='container' bgcolor='#ffffff' align='center' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start layout-6 container width 560px --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='580'> <!--start space height --> <tbody> <tr> <td width='100%' height='30' class=''></td> </tr> <tr> <td align='center' class=''><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Hello Administrator,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>I have requested to catering in this room.</td> </tr> <!-- start space --><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><span>Catering Description: </span>"+amenities+"</td> </tr><tr><td>&nbsp;</td></tr><br><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Thanks,</td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'> "+UserName+"</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' align='left' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> <!-- start space --> <tr> <td class='' valign='top' height='30'></td> </tr> <!-- end space --> </tbody> </table></td> </tr> <!--end space height --> </tbody> </table> <!-- end layout-6 container width 560px --></td> </tr> </tbody> </table> </td> </tr> </tbody></table>";
    mail_text += emailContainerFooterString;
    return mail_text;
}

/**
  * @module : CommonConfig 
  * @desc   : Send Username And Password to User After Import
  * @return : Response of existance
  * @author : Softweb solutions - Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com>
*/
function importMemberEmailTemplate(firstname,lastname,email,password){
  var mail_text = "";
  mail_text += emailContainerHeaderString;
    mail_text +=   "<table id='mainStructure' style='background-color:#f1f1f1;' border='0' cellpadding='0' cellspacing='0' width='100%'> <!--START VIEW ONLINE AND ICON SOCAIL --> <tbody> <!--START TOP NAVIGATION LAYOUT--> <tr> <td valign='top'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td class='fix-box' align='center' valign='top'><!-- start top navigation container --> <table class='container' style='background-color:#ffffff;' align='center' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start top navigaton --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='560'> <!-- start space --> <tbody> <tr> <td class='' valign='top' height='15'></td> </tr> <!-- end space --> <tr> <td valign='middle'><table class='container2' align='left' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' align='center' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> </tbody> </table> <!--start content nav --> <table class='container2' align='right' border='0' cellpadding='0' cellspacing='0'> <!--start call us --> <tbody> <tr> <td><table align='center' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' style='font-size: 12px; line-height: 27px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#43494f; font-weight:normal; text-align:center;'>&nbsp;</td> <td class='' style='padding-left:5px; padding-top:20px; font-size: 15px; line-height: 12px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#ffffff; font-weight:normal;' align='left' valign='middle'></td></tr></tbody> </table></td></tr></tbody></table></td> </tr><tr> <td class='' valign='top' height='20'></td> </tr></tbody> </table> <!-- end top navigaton --></td> </tr> </tbody> </table> </td> </tr> </tbody> </table></td> </tr> <tr> <td class='fix-box' align='center' valign='top'><!-- start layout-6 container width 600px --> <table class='container' bgcolor='#ffffff' align='center' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start layout-6 container width 560px --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='580'> <!--start space height --> <tbody> <tr> <td width='100%' height='30' class=''></td> </tr> <tr> <td align='center' class=''><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Hey "+firstname+" "+lastname+",</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Welcome to Softweb SmartOffice. We are pleased to have you in our family.</td> </tr> <!-- start space --><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Your Email is : "+email+"</td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Your Password is :  "+password+"</td></tr><tr><td><br></td></tr><tr><td></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Smartoffice makes scheduling your work day easy, and your office feel like the future:</td> </tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><ul><li>Find free space when you need to get work done (via mobile and web)</li><br><li>Book rooms in advance, or when you walk in (without digging through calendars)</li><br><li>Get updated on what’s happening in the office, even if you’re not</li><br><li>See who’s available, and who you shouldn’t interrupt.</li></ul></td> </tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Thank you so much for choosing us!</td> </tr><tr><td><br></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Have a great time with SmartOffice!</td> </tr><tr><td><br></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Softweb SmartOffice Team</td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'><a href='http://www.softwebsmartoffice.com/'>http://www.softwebsmartoffice.com/</a></td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' align='left' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> <!-- start space --> <tr> <td class='' valign='top' height='30'></td> </tr> <!-- end space --> </tbody> </table></td> </tr> <!--end space height --> </tbody> </table> <!-- end layout-6 container width 560px --></td> </tr> </tbody> </table> </td> </tr> </tbody></table>";
    mail_text += emailContainerFooterString;
    return mail_text;
}

/**
  * @module : Contact Us 
  * @desc   : Form from user
  * @return : Response of existance
  * @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
*/
function contactUsEmailTemplate(firstname,lastname,email,phonenumber,company,roomno,userrole)
{
  var mail_text = "";
  mail_text += emailContainerHeaderString;
    mail_text +=   "<table id='mainStructure' style='background-color:#f1f1f1;' border='0' cellpadding='0' cellspacing='0' width='100%'> <!--START VIEW ONLINE AND ICON SOCAIL --> <tbody> <!--START TOP NAVIGATION LAYOUT--> <tr> <td valign='top'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td class='fix-box' align='center' valign='top'><!-- start top navigation container --> <table class='container' style='background-color:#ffffff;' align='center' bgcolor='#ffffff' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start top navigaton --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='560'> <!-- start space --> <tbody> <tr> <td class='' valign='top' height='15'></td> </tr> <!-- end space --> <tr> <td valign='middle'><table class='container2' align='left' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' align='center' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> </tbody> </table> <!--start content nav --> <table class='container2' align='right' border='0' cellpadding='0' cellspacing='0'> <!--start call us --> <tbody> <tr> <td><table align='center' border='0' cellpadding='0' cellspacing='0'> <tbody> <tr> <td class='' style='font-size: 12px; line-height: 27px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#43494f; font-weight:normal; text-align:center;'>&nbsp;</td> <td class='' style='padding-left:5px; padding-top:20px; font-size: 15px; line-height: 12px; font-family: Arial,Tahoma, Helvetica, sans-serif; color:#ffffff; font-weight:normal;' align='left' valign='middle'></td></tr></tbody> </table></td></tr></tbody></table></td> </tr><tr> <td class='' valign='top' height='20'></td> </tr></tbody> </table> <!-- end top navigaton --></td> </tr> </tbody> </table> </td> </tr> </tbody> </table></td> </tr> <tr> <td class='fix-box' align='center' valign='top'><!-- start layout-6 container width 600px --> <table class='container' bgcolor='#ffffff' align='center' border='0' cellpadding='0' cellspacing='0' width='600'> <tbody> <tr> <td valign='top'><!-- start layout-6 container width 560px --> <table class='full-width' align='center' border='0' cellpadding='0' cellspacing='0' width='580'> <!--start space height --> <tbody> <tr> <td width='100%' height='30' class=''></td> </tr> <tr> <td align='center' class=''><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'> <tbody> <tr> <td style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Hello Admin,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr><tr><td><br></td></tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>You've one chat request. Details are below:</td> </tr> <!-- start space --><tr><td><br></td></tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>First Name: "+firstname+"</td> </tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Last Name: "+lastname+"</td> </tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Email: "+email+"</td> </tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Company: "+company+"</td> </tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Phone Number: "+phonenumber+"</td> </tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Room No: "+roomno+"</td> </tr><tr><td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>User Role: "+userrole+"</td> </tr><tr><td><br></td></tr><tr><td><br></td></tr><tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'>Have a great day,</td> </tr> <tr> <td class='' style='font-size: 15px; line-height:22px; padding-left:10px; padding-right:10px; font-family: Arial,Tahoma,Helvetica,sans-serif; color:#78808c; text-align: left;' align='center'> Smartoffice Team,</td> </tr> <tr> <td class='' valign='top' height='15'></td> </tr> <tr> <td class='' align='left' valign='top'><img src='"+base_url+"/images/app/logo-dark.svg' alt='' border='0' vspace='0' width='114' hspace='0'></td> </tr> <!-- start space --> <tr> <td class='' valign='top' height='30'></td> </tr> <!-- end space --> </tbody> </table></td> </tr> <!--end space height --> </tbody> </table> <!-- end layout-6 container width 560px --></td> </tr> </tbody> </table> </td> </tr> </tbody></table>";
    mail_text += emailContainerFooterString;
    return mail_text;
}

module.exports = {

    impconfig : {
        organizationName    : "Smart Office", //people.js, index.js
        websiteURL          : "http://smartoffice.softwebopensource.com/", //index.js
        //websiteURL          : "http://localhost:3000", //index.js        

        roomDetailBaseUrl   : "http://roomdetails-staging.azurewebsites.net/", //index.js
        outlookOfficeUrl    : "https://outlook.office.com/api/v2.0/me/events", //index.js
        outlookOffice365Url : "https://outlook.office365.com/ews/Exchange.asmx", //event.js

        emailServer         : "SMTP",
        adminEmail          : "rohan@softwebsolutions.com",
        tempAdminEmail      : "rohan@softwebsolutions.com,mayank.patel@softwebsolutions.com",
        noRplyEmail         : "Smart Office <no-reply@smartoffice.com>",
        senderId            : "AIzaSyCyaE26CDl-X_CVfWUV7jR9z5L5Abnx8_s", //people.js
        notificationCert    : "../public/images/Jll_Singapore_Cert/cert.pem", //people.js
        notificationKey     : "../public/images/Jll_Singapore_Cert/key.pem", //people.js
        passphrase          : "1234", //people.js
        xtokenaccessHeafer  : "aHR0cDovL3Jvb21iaXRhcC1zdGFnaW5nLmF6dXJld2Vic2l0ZXMubmV0Lw==", //app.js
        jwtSecretKey        : "SmxsUm9vbWJpdDpTaW5nYXBvcmU=", //app.js
        connectionString    : "HostName=JLLIOTAP.azure-devices.net;DeviceId=d3e9c9d4-71a0-4d2d-aa48-9fa6831373be;SharedAccessKey=iK1xWUIXx2B6+vDSX1MH2A==", //people.js, device.js

        googleClientId      : "57025079773-qj7a0ru0qikhv9raqe9h9vgn0a8see8f.apps.googleusercontent.com", //googleauth.js
        googleClientSecret  : "WPrOPHdMcYG8gNYI93jxvEbd", //googleauth.js
        smtpTransport    : smtpTransport,
        ContactusEmail          : "rohan@softwebsolutions.com"
    },

    dbConfig              : {
                              user: 'sa',
                              password: 'softweb#123',
                              server: '115.115.91.49', // You can use 'localhost\\instance' to connect to named instance
                              database: 'smartoffice_live',
                              options: {
                                  encrypt: true // Use this if you're on Windows Azure
                              }
                            },
    dbConfigHOQ           : {
                              user: 'sa',
                              password: 'softweb#123',
                              server: '115.115.91.49', // You can use 'localhost\\instance' to connect to named instance
                              database: 'SoftwebHOQ',
                              options: {
                                  encrypt: true // Use this if you're on Windows Azure
                              }
                            },
    emailConfig           : {
                              service: "mail.softwebsolutions.com",
                              host:"mail.softwebsolutions.com",
                              port:587,
                              auth: {
                                  user: "tarun@softwebsolutions.com",
                                  pass: "Qm,;es9Q#H#8d^-^SC"
                              }
                            }, 
    /*brainTreeConfig       : {
                              config: {
                                        environment: braintree.Environment.Sandbox,
                                        merchantId: 'qynb59772rz69mkz',
                                        publicKey: 's5h6jysfjgj93vqm',
                                        privateKey: 'b77657f8cb2080dcf879330849626b70'
                                      }
                            },*/
    emailTemplate : {
        emailContainerHeaderString : emailContainerHeaderString,
        emailContainerFooterString : emailContainerFooterString
    },
    getEventDetails     : getEventDetails, 
    eventBookingDetail  : eventBookingDetail,
    checkEventExistance : checkEventExistance, 
    forgotEmailTemplate : forgotEmailTemplate,
    inviteEmailTemplate : inviteEmailTemplate,
    registerEmailTemplate : registerEmailTemplate,
    importMemberEmailTemplate : importMemberEmailTemplate, 
    contactUsEmailTemplate : contactUsEmailTemplate,
    createEventTemplate: createEventTemplate,
    createEventAmenitiesTemplate: createEventAmenitiesTemplate,
    createEventCateringTemplate: createEventCateringTemplate,
    freeSubscriptionPeriod: 15, //Days
    freeTrialSpaces: 10, //Number of spaces    
};