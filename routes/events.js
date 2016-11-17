var express     = require('express');
var session     = require('express-session');
var router      = express.Router();
var request     = require('request');
var parseString = require('xml2js').parseString;
var moment      = require("moment");
var fs          = require('fs');

/**
  * @module : Web Services (Apple TV)
  * @desc   : Create Event service in O365
  * @return : return room is available or not as per specified room address
  * @author : Softweb solutions
*/
router.post('/createevent',function(req,res){


  var event_subject      =  req.body.event_subject;
  var event_body_message =  req.body.event_body_message;
  var event_starttime    =  req.body.event_starttime;
  var event_endtime      =  req.body.event_endtime;
  var location_name      =  req.body.location_name;
  var roomemaialaddress  =  req.body.roomemaialaddress;

  
  var soapRe ='<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages"    xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> <soap:Header> <t:RequestServerVersion Version="Exchange2007_SP1" /> <t:TimeZoneContext> <t:TimeZoneDefinition Id="UTC" /> </t:TimeZoneContext> </soap:Header> <soap:Body>  <m:CreateItem SendMeetingInvitations="SendToAllAndSaveCopy"> <m:Items> <t:CalendarItem>';

  

  soapRe += "<t:Subject>"+event_subject+"</t:Subject><t:Body BodyType='HTML'>"+event_body_message+"</t:Body> <t:ReminderMinutesBeforeStart>60</t:ReminderMinutesBeforeStart> <t:Start>"+event_starttime+"</t:Start> <t:End>"+event_endtime+"</t:End> <t:Location>"+location_name+"</t:Location> <t:RequiredAttendees> <t:Attendee> <t:Mailbox><t:EmailAddress>"+roomemaialaddress+"</t:EmailAddress></t:Mailbox> </t:Attendee> </t:RequiredAttendees>";


  soapRe += '<t:MeetingTimeZone TimeZoneName="UTC" /></t:CalendarItem></m:Items></m:CreateItem></soap:Body></soap:Envelope>';

     var requestapi = new sql.Request(cp);

      requestapi.query("SELECT TOP(1) Session FROM so_session WHERE Session NOT LIKE '%undefined%' ORDER BY ID DESC", function(err1, result1) {
       if(err1)
       {
        res.json(err1);
       }
       else
       {

                var Office365Token  = result1[0].Session;
                request.post({
                  url:'https://outlook.office365.com/ews/Exchange.asmx',
                  body : soapRe,
                  headers: {'Content-Type': 'text/xml; charset=utf-8'},
                  auth:{ 'bearer' : Office365Token },
                },
                function (error, response, body){

                  console.log(error)
                  console.log(response)


                     if (!error && response.statusCode == 200) {  
                          
                          console.log(response);

                          res.json({"status":true,"message": "Event create successfully.","code":200});  
                      
                      }else
                      {
                          res.json({"status":false,"message": "Event create failure.","code":response.statusCode});  

                      }

                });


       }



     });


});


// End Create Event service in O365 Date: 16-jun-2016 By Softweb

/**
  * @module : Web Services (Apple TV)
  * @desc   : Get a List of room respective to the Events
  * @return : return room is available or not as per specified room address
  * @author : Softweb solutions
*/
router.post('/getRoomEvent_2016',function(req,res){
  
  var requestsql        =   new sql.Request(cp);
  var startTime         =   req.body.startTime;
  var endTime           =   req.body.endTime;
  var dataSOAP          =   '';
  var roomList          =   '';
  var availDataArray    =   [];
  var setRoomData       =   [];
  var starttimebooking  =   req.body.startTime;
  var timeSlot          =   30;//30 Minutes 
  var endtimebooking    =   req.body.endTime;
  
  var locquery = "SELECT id, name, address, capacity, amenities, office_location FROM so_location ";
  requestsql.query(locquery, function(err, result) {
    roomList = result;

    var soapRe ='<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetUserAvailabilityRequest xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"><TimeZone xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Bias>360</Bias><StandardTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>5</DayOrder><Month>10</Month><DayOfWeek>Sunday</DayOfWeek></StandardTime><DaylightTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>1</DayOrder><Month>4</Month><DayOfWeek>Sunday</DayOfWeek></DaylightTime></TimeZone><MailboxDataArray>';

    for (var i = 0; i < result.length; i++) {
      soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+result[i].address+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
    }  
        
    soapRe+='</MailboxDataArray><FreeBusyViewOptions xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><TimeWindow><StartTime>'+starttimebooking+'</StartTime><EndTime>'+endtimebooking+'</EndTime></TimeWindow><MergedFreeBusyIntervalInMinutes>15</MergedFreeBusyIntervalInMinutes><RequestedView>Detailed</RequestedView></FreeBusyViewOptions></GetUserAvailabilityRequest></soap:Body></soap:Envelope>';
    
    requestsql.query("SELECT TOP(1) Session FROM so_session WHERE Session NOT LIKE '%undefined%' ORDER BY ID DESC",
      function(err, result1) {
        if(err)
        {
          res.json({"status":false,"data":null, "message":"Something went wrong.", "errorCode":response.statusCode});
        }
        else
        {
          session.outlookCookie  = result1[0].Session;
          var Office365Token     = session.outlookCookie;

          request.post({
            url:'https://outlook.office365.com/ews/Exchange.asmx',
            body : soapRe,
            headers: {'Content-Type': 'text/xml; charset=utf-8'},
            auth:{ 'bearer' : Office365Token },
          },
          function (error, response, body){
            //console.log(response);
            console.log(response.statusCode);
            if (!error && response.statusCode == 200) { 
              parseString(body,function (err,result) {
          
         // console.log(result)

                var eventobj = result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"];

                var total_room_events =  result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"].length;
                  console.log(total_room_events);
                
                for(var loop=0;loop<total_room_events;loop++)
                {
                  var roomTitle = roomList[loop].name;
                  /*if(roomTitle == 'Meeting Room 01')
                  {
                    roomTitle = 'Gelaxy';
                  }*/
                  
                  var calendarData = [];
                  if(eventobj[loop]["FreeBusyView"] != undefined)
                  {
                    if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"] == undefined)
                    {
                      availDataArray.push({
                        'roomAddress' : roomList[loop].address,
                        'roomTitle'   : roomTitle,
                        'events'      : null,
                        'isAvailable' : false,
                      });
                    }
                    else if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0] != undefined)
                    {
                      if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"] != undefined)
                      {
                        if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"].length)
                        {
                          var calendarEventObj = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"];
                          
                          if(calendarEventObj.length>0)
                          {
                            var eventDataArray    =   [];
                            var cntEvent = 0;
                            for (var j = 0; j < calendarEventObj.length; j++) 
                            {
                              var resStartTime = calendarEventObj[j]['StartTime'];
                              resStartTime = new Date(resStartTime);

                              /*---UTC COnversion*/
                              //resStartTime = moment.utc(resStartTime).format();
                              //resStartTime = moment.utc(resStartTime);
                              //resStartTime = resStartTime.format("YYYY-MM-DDTHH:mm:ss")

                              /*var resStartTime  = moment.utc(resStartTime).toDate();
                              var resStartTime = moment(resStartTime).format();*/

                              /*---UTC COnversion*/

                              var resStartTimestamp = moment(resStartTime).unix();
                              
                              var resEndTime = calendarEventObj[j]['EndTime'];
                              resEndTime = new Date(resEndTime);
                              
                              /*---UTC COnversion*/
                              //resEndTime = moment.utc(resEndTime).format();
                              //resEndTime = moment.utc(resEndTime);
                             // resEndTime = resEndTime.format("YYYY-MM-DDTHH:mm:ss");

                              /*var resEndTime  = moment.utc(resEndTime).toDate();
                              var resEndTime = moment(resEndTime).format();*/

                              /*---UTC COnversion*/
                              
                              var resEndTimestamp = moment(resEndTime).unix();
                              
                              var bookMinutes = Math.floor((resEndTimestamp-resStartTimestamp)/60);

                              var subject = (calendarEventObj[j]['CalendarEventDetails']) ? calendarEventObj[j]['CalendarEventDetails'][0]['Subject'][0] : '';
                              var roomID = (calendarEventObj[j]['CalendarEventDetails']) ? calendarEventObj[j]['CalendarEventDetails'][0]['ID'][0] : '';
                              
                              eventDataArray.push({
                                'roomID'    : roomID,
                                'startTime' : resStartTime,
                                'endTime'   : resEndTime,
                                'duration'  : bookMinutes,
                                'subject'   : (subject!='')?subject:null,
                              });

                              cntEvent = cntEvent + 1;
                            }

                            if(cntEvent>0)
                            {
                              availDataArray.push({
                                'roomAddress' : roomList[loop].address,
                                'roomTitle'   : roomTitle,
                                'events'      : eventDataArray,
                                'isAvailable' : true,
                              });
                            }
                            else{
                              availDataArray.push({
                                'roomAddress' : roomList[loop].address,
                                'roomTitle'   : roomTitle,
                                'events'      : null,
                                'isAvailable' : false,
                              });  
                            }
                          }
                        }
                      }
                    }
                  }
                }//Loop end
                res.json({"status":true,"data":availDataArray, "message":"Data loaded successfully"});
                //res.json(result);
              });
            }
            else
            {
              res.json({"status":false,"data":null, "message":"Something went wrong.", "errorCode":response.statusCode});
            }
          });
        }
      });  
  });
});

/**
  * @module : Web Services (Apple TV)
  * @desc   : Get a List of room respective to the Events
  * @return : return room is available or not as per specified room address
  * @author : Softweb solutions
*/
router.post('/getRoomStatus',function(req,res){
  
  var requestsql        =   new sql.Request(cp);
  var startTime         =   req.body.startTime;
  var endTime           =   req.body.endTime;
  var dataSOAP          =   '';
  var roomList          =   '';
  var availDataArray    =   [];
  var setRoomData       =   [];
  var starttimebooking  =   req.body.startTime;
  var timeSlot          =   30;//30 Minutes 
  var endtimebooking    =   req.body.endTime;
  
  var locquery = "SELECT id, name, address, capacity, amenities, office_location FROM so_location ";
  requestsql.query(locquery, function(err, result) {
    roomList = result;

    var soapRe ='<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetUserAvailabilityRequest xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"><TimeZone xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Bias>390</Bias><StandardTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>5</DayOrder><Month>10</Month><DayOfWeek>Sunday</DayOfWeek></StandardTime><DaylightTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>1</DayOrder><Month>4</Month><DayOfWeek>Sunday</DayOfWeek></DaylightTime></TimeZone><MailboxDataArray>';

    for (var i = 0; i < result.length; i++) {
      soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+result[i].address+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
    }  
        
    soapRe+='</MailboxDataArray><FreeBusyViewOptions xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><TimeWindow><StartTime>'+starttimebooking+'</StartTime><EndTime>'+endtimebooking+'</EndTime></TimeWindow><MergedFreeBusyIntervalInMinutes>15</MergedFreeBusyIntervalInMinutes><RequestedView>Detailed</RequestedView></FreeBusyViewOptions></GetUserAvailabilityRequest></soap:Body></soap:Envelope>';
    
    requestsql.query("SELECT TOP(1) Session FROM so_session WHERE Session NOT LIKE '%undefined%' ORDER BY ID DESC",
      function(err, result1) {
        if(err)
        {
          res.json({"status":false,"data":null, "message":"Something went wrong.", "errorCode":response.statusCode});
        }
        else
        {
          session.outlookCookie  = result1[0].Session;
          var Office365Token = session.outlookCookie;

          request.post({
            url:'https://outlook.office365.com/ews/Exchange.asmx',
            body : soapRe,
            headers: {'Content-Type': 'text/xml; charset=utf-8'},
            auth:{ 'bearer' : Office365Token },
          },
          function (error, response, body){
            //console.log(response);
            console.log(response.statusCode);
            if (!error && response.statusCode == 200) { 
              parseString(body,function (err,result) {

                var eventobj = result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"];

                var total_room_events =  result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"].length;
                  console.log(total_room_events);
                  
                for(var loop=0;loop<total_room_events;loop++)
                {
                  var calendarData = [];
                  if(eventobj[loop]["FreeBusyView"] != undefined)
                  {
                    if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"] == undefined)
                    {
                      availDataArray.push({
                          'roomAddress' : roomList[loop].address,
                          'roomTitle'   : roomList[loop].name,
                          'isAvailable' : true,
                      });
                    }
                    else if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0] != undefined)
                    {
                      if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"] != undefined)
                      {
                        if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"].length)
                        {
                          var calendarEventObj = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"];
                          
                          if(calendarEventObj.length>0)
                          {
                            var cntEvent = 0;
                            for (var j = 0; j < calendarEventObj.length; j++) 
                            {
                              var BusyType = calendarEventObj[j]['BusyType']; //Busy
                              if(BusyType == 'Busy')
                              {
                                cntEvent = cntEvent + 1;  
                              }
                            }

                            if(cntEvent>0)
                            {
                              availDataArray.push({
                                'roomAddress' : roomList[loop].address,
                                'roomTitle'   : roomList[loop].name,
                                'isAvailable' : false,
                              });
                            }
                            else{
                              availDataArray.push({
                                'roomAddress' : roomList[loop].address,
                                'roomTitle'   : roomList[loop].name,
                                'isAvailable' : true,
                              });  
                            }
                          }
                        }
                      }
                    }
                  }
                }//Loop end
                res.json({"status":true,"data":availDataArray, "message":"Data loaded successfully"});
                //res.json(result);
              });
            }
            else
            {
              res.json({"status":false,"data":null, "message":"Something went wrong.", "errorCode":response.statusCode});
            }
          });
        }
      });  
  });
});

/**
  * @module : Web Services (Mobile)
  * @desc   : Get a room's availability for specific time range
  * @return : return room is available or not as per specified room address
  * @author : Softweb solutions
*/
router.post('/getroomavailability',function(req,res){
  var emailaddress =  req.body.emailaddress;
  if(session.outlookCookie == undefined)
  {
    var requestapi = new sql.Request(cp);
    requestapi.query("SELECT TOP(1) Session FROM so_session WHERE Session NOT LIKE '%undefined%' ORDER BY ID DESC", function(err1, result1) 
    {
      if(err1)
      {
        res.json(err1);
      }
      else
      {
        session.outlookCookie  = result1[0].Session;
        req.session.isOutlook = 1;

        var availableflag = 0;
        var Office365Token = session.outlookCookie;
        var roomemaialaddress =  req.body.roomemailid;
        var starttimebooking =  req.body.starttime;
        var starttimebookingspl =  starttimebooking.split("T");
        var starttimebookingspldate =  starttimebookingspl[0].split("-");
        var giventmstp = moment(starttimebooking).unix();
        if(req.body.endtime != undefined){
          var lastbookingtime =  req.body.endtime;
        }
        else
        {
          var lastbookingtime = starttimebookingspldate[0]+'-'+starttimebookingspldate[1]+'-'+starttimebookingspldate[2]+'T24:00:00';
        }
        var lasttmstp = moment(lastbookingtime).unix();
        var remaintime = (lasttmstp - giventmstp)/60;
        var minutes = remaintime;
        var endtimebooking = moment(starttimebooking).add('minutes', minutes).format('YYYY-MM-DDTHH:mm:ss');
        var givenendtmstp = moment(endtimebooking).unix();
        var timeslot = starttimebooking+" TO "+endtimebooking;

        var locquery = "SELECT user_permission FROM so_location WHERE address = '"+roomemaialaddress+"'";
        requestapi.query(locquery, function(err, result) 
        {
          if(err)
          {
            console.log(err);
          }
          else
          {
            var soapRe ='<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetUserAvailabilityRequest xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"><TimeZone xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Bias>360</Bias><StandardTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>5</DayOrder><Month>10</Month><DayOfWeek>Sunday</DayOfWeek></StandardTime><DaylightTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>1</DayOrder><Month>4</Month><DayOfWeek>Sunday</DayOfWeek></DaylightTime></TimeZone><MailboxDataArray>';

            var permission = JSON.parse(result[0].user_permission);
            if(permission != null)
            {
              if(emailaddress != '') 
              {
                var arrayFound = permission.filter(function(item) {
                  return item.Email == emailaddress;
                });
                if(arrayFound.length > 0) {
                  if((arrayFound[0].Permission != 'Reviewer') && (arrayFound[0].Permission != 'none')){
                    availableflag = 1;
                    soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+roomemaialaddress+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
                  }
                } 
                else 
                {
                  var arrayFoundDefault = permission.filter(function(item) {
                    return item.Name == 'Default';
                  });
                  if((arrayFoundDefault[0].Permission != 'Reviewer') && (arrayFoundDefault[0].Permission != 'none')){
                    availableflag = 1;
                    soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+roomemaialaddress+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
                  }
                }
              } 
              else 
              {
                var arrayFoundDefault = permission.filter(function(item) {
                  return item.Name == 'Default';
                });
                if((arrayFoundDefault[0].Permission != 'Reviewer') && (arrayFoundDefault[0].Permission != 'none')){
                  availableflag = 1;
                  soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+roomemaialaddress+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
                }
              }
            }
            soapRe+='</MailboxDataArray><FreeBusyViewOptions xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><TimeWindow><StartTime>'+starttimebooking+'</StartTime><EndTime>'+endtimebooking+'</EndTime></TimeWindow><MergedFreeBusyIntervalInMinutes>15</MergedFreeBusyIntervalInMinutes><RequestedView>FreeBusy</RequestedView></FreeBusyViewOptions></GetUserAvailabilityRequest></soap:Body></soap:Envelope>';

            if(availableflag == 1)
            {
              request.post({
                url:'https://outlook.office365.com/ews/Exchange.asmx',
                body : soapRe,
                headers: {'Content-Type': 'text/xml; charset=utf-8'},
                auth:{ 'bearer' : Office365Token },
              },
              function (error, response, body){
                if (!error && response.statusCode == 200)
                {
                  parseString(body,function (err,result){
                    var eventobj = result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"];
                    var total_room_events =  result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"].length;
                    for(var loop=0;loop<total_room_events;loop++)
                    {
                      if(eventobj[loop]["FreeBusyView"] != undefined)
                      {
                        if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"] == undefined){
                          res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                        }
                        else if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0] != undefined)
                        {
                          if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"] != undefined)
                          {
                            if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"].length)
                            {
                              var eventobjlength = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"].length;
                              var starttime = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][0]["StartTime"];
                              var nowv = JSON.stringify(starttime);
                              nowv = nowv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                              var timestamp = Math.floor(new Date(nowv) / 1000);
                              var untm = moment(nowv).unix();

                              var endtime   = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][0]["EndTime"];
                              var endv = JSON.stringify(endtime);
                              endv = endv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                              var entm = moment(endv).unix();
                              var busytype =  eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][0]["BusyType"];

                              if(giventmstp > untm && giventmstp < entm)
                              {
                                var remaintimeavailable = (entm -untm)/60;
                                var minutesavailable = remaintimeavailable;
                                var endtimebookingavailable = moment(starttimebooking).add('minutes', minutesavailable).format('YYYY-MM-DDTHH:mm:ss');
                                timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                              }
                              else if(giventmstp < untm && givenendtmstp < untm)
                              {
                                if(req.body.endtime != undefined)
                                {
                                  if(busytype == "Busy")
                                  {
                                    timeslot = starttimebooking+" TO "+lastbookingtime;
                                    res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintime})
                                  } 
                                  else 
                                  {
                                    res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                  }
                                } 
                                else 
                                {
                                  res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                }
                              }
                              else if(giventmstp < untm && givenendtmstp > untm)
                              {
                                var remaintimeavailable = (untm - giventmstp)/60;
                                var minutesavailable = remaintimeavailable;
                                var endtimebookingavailable = moment(starttimebooking).add('minutes', minutesavailable).format('YYYY-MM-DDTHH:mm:ss');
                                timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                if(req.body.endtime != undefined)
                                {
                                  if(busytype == "Busy")
                                  {
                                    timeslot = starttimebooking+" TO "+lastbookingtime;
                                    res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                                  } 
                                  else 
                                  {
                                    res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintimeavailable})
                                  }
                                }
                                else 
                                {
                                  res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintimeavailable})
                                }
                              }
                              else if(giventmstp == untm)
                              {
                                var remaintimeavailable = (entm -untm)/60;
                                var minutesavailable = remaintimeavailable;
                                var endtimebookingavailable = moment(starttimebooking).add('minutes', minutesavailable).format('YYYY-MM-DDTHH:mm:ss');
                                timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                              }
                              else if(giventmstp == entm)
                              {
                                if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][1] != undefined)
                                {
                                  var starttime = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][1]["StartTime"];
                                  var nowv = JSON.stringify(starttime);
                                  nowv = nowv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                                  console.log(nowv);
                                  var timestamp = Math.floor(new Date(nowv) / 1000);
                                  var untm = moment(nowv).unix();
                                  console.log(untm);

                                  if(giventmstp > untm)
                                  {
                                    console.log(untm);
                                  }
                                  var endtime   = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][1]["EndTime"];
                                  var endv = JSON.stringify(endtime);
                                  endv = endv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                                  console.log(endv);
                                  var entm = moment(endv).unix();
                                  if(giventmstp > untm && giventmstp < entm)
                                  {
                                    var remaintimeavailable = (entm -untm)/60;
                                    console.log(remaintimeavailable);
                                    var minutesavailable = remaintimeavailable;
                                    var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                    timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                    console.log("Busy");
                                    res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                                  }
                                  else if(giventmstp < untm && givenendtmstp < untm)
                                  {
                                    console.log("Available");
                                    if(req.body.endtime != undefined)
                                    {
                                      if(busytype == "Busy")
                                      {
                                        timeslot = starttimebooking+" TO "+lastbookingtime;
                                        res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintime})
                                      } 
                                      else 
                                      {
                                        res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                      }
                                    } 
                                    else 
                                    {
                                      res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                    }
                                  }
                                  else if(giventmstp < untm && givenendtmstp > untm)
                                  {
                                    var remaintimeavailable = (untm - giventmstp)/60;
                                    console.log(remaintimeavailable);
                                    var minutesavailable = remaintimeavailable;
                                    var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                    timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                    console.log("Available");
                                    if(req.body.endtime != undefined)
                                    {
                                      if(busytype == "Busy")
                                      {
                                        timeslot = starttimebooking+" TO "+lastbookingtime;
                                        res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                                      } 
                                      else 
                                      {
                                        res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintimeavailable})
                                      }
                                    } 
                                    else 
                                    {
                                      res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintimeavailable})
                                    }
                                  }
                                  else if(giventmstp == untm)
                                  {
                                    var remaintimeavailable = (entm -untm)/60;
                                    console.log(remaintimeavailable);
                                    var minutesavailable = remaintimeavailable;
                                    var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                    timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                    console.log("Busy");
                                    res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                                  }
                                  else if(giventmstp == entm)
                                  {
                                    if(req.body.endtime != undefined)
                                    {
                                      res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                    } 
                                    else 
                                    {
                                      res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                    }
                                  }
                                } 
                                else 
                                {
                                  console.log("Available");
                                  if(req.body.endtime != undefined){
                                      res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                  } 
                                  else 
                                  {
                                    res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  });
                }
                else
                {
                  fs.appendFile('public/images/errorconsole.txt', JSON.stringify(response.statusCode) +" "+JSON.stringify(response.statusCode)+"  ||  ", function (err) {
                    if (err) throw err;
                    console.log('Error Console Manage in file...');
                  });
                  nodemailer = require("nodemailer");
                  var smtpTransport = nodemailer.createTransport("SMTP",{
                    service: "mail.softwebsolutions.com",
                    host:"mail.softwebsolutions.com",
                    port:587,
                    auth: {
                      user: "tarun@softwebsolutions.com",
                      pass: "Qm,;es9Q#H#8d^-^SC"
                    }
                  });

                  smtpTransport.sendMail({
                   from: "no-reply@example.com", // sender address
                   to: 'tarun@softwebsolutions.com', // list of receivers 
                   subject: "JLL Roombit - Restart your app (events)", // Subject line
                   text: JSON.stringify(response)
                  }, function(error, response1){
                   if(error)
                   {
                     console.log(error);
                   }
                   else
                   {
                     console.log("Message sent: " + response1.message);
                     return false;
                   }
                  });
                }
              });
            } else {
              res.json({"isavailable":false,"message": "There isn't any permission to book room for this user."})
            }
          }
        });
      }
    });
  }
  else
  {
    req.session.isOutlook = 1;
    var availableflag = 0;
    var Office365Token = session.outlookCookie;
    var roomemaialaddress =  req.body.roomemailid;
    var starttimebooking =  req.body.starttime;
    var starttimebookingspl =  starttimebooking.split("T");
    var starttimebookingspldate =  starttimebookingspl[0].split("-");
    var giventmstp = moment(starttimebooking).unix();
    if(req.body.endtime != undefined){
      var lastbookingtime =  req.body.endtime;
    }
    else{
      var lastbookingtime = starttimebookingspldate[0]+'-'+starttimebookingspldate[1]+'-'+starttimebookingspldate[2]+'T24:00:00';
    }
    var lasttmstp = moment(lastbookingtime).unix();
    var remaintime = (lasttmstp - giventmstp)/60;
    var minutes = remaintime;
    var endtimebooking = moment(starttimebooking).add('minutes', minutes).format('YYYY-MM-DDTHH:mm:ss');
    var givenendtmstp = moment(endtimebooking).unix();
    var timeslot = starttimebooking+" TO "+endtimebooking;
    var requestapi = new sql.Request(cp);
    var locquery = "SELECT user_permission FROM so_location WHERE address = '"+roomemaialaddress+"'";

    requestapi.query(locquery, function(err, result) 
    {
      if(err)
      {
        res.json(err);
      }
      else
      {
        var soapRe ='<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetUserAvailabilityRequest xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"><TimeZone xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Bias>360</Bias><StandardTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>5</DayOrder><Month>10</Month><DayOfWeek>Sunday</DayOfWeek></StandardTime><DaylightTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>1</DayOrder><Month>4</Month><DayOfWeek>Sunday</DayOfWeek></DaylightTime></TimeZone><MailboxDataArray>';
        var permission = JSON.parse(result[0].user_permission);
        if(permission != null)
        {
          if(emailaddress != '') 
          {
            var arrayFound = permission.filter(function(item) {
              return item.Email == emailaddress;
            });
            if(arrayFound.length > 0) 
            {
              if((arrayFound[0].Permission != 'Reviewer') && (arrayFound[0].Permission != 'none'))
              {
                availableflag = 1;
                soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+roomemaialaddress+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
              }
            }
            else
            {
              var arrayFoundDefault = permission.filter(function(item) {
                return item.Name == 'Default';
              });
              if((arrayFoundDefault[0].Permission != 'Reviewer') && (arrayFoundDefault[0].Permission != 'none'))
              {
                availableflag = 1;
                soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+roomemaialaddress+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
              }
            }
          }
          else
          {
            var arrayFoundDefault = permission.filter(function(item) {
              return item.Name == 'Default';
            });
            if((arrayFoundDefault[0].Permission != 'Reviewer') && (arrayFoundDefault[0].Permission != 'none'))
            {
              availableflag = 1;
              soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+roomemaialaddress+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
            }
          }
        }
        soapRe+='</MailboxDataArray><FreeBusyViewOptions xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><TimeWindow><StartTime>'+starttimebooking+'</StartTime><EndTime>'+endtimebooking+'</EndTime></TimeWindow><MergedFreeBusyIntervalInMinutes>15</MergedFreeBusyIntervalInMinutes><RequestedView>FreeBusy</RequestedView></FreeBusyViewOptions></GetUserAvailabilityRequest></soap:Body></soap:Envelope>';
        if(availableflag == 1)
        {
          request.post({
            url:'https://outlook.office365.com/ews/Exchange.asmx',
            body : soapRe,
            headers: {'Content-Type': 'text/xml; charset=utf-8'},
            auth:{ 'bearer' : Office365Token },
          },
          function (error, response, body){
            if (!error && response.statusCode == 200) 
            {  
              parseString(body,function (err,result) {
                console.log("Result===>",JSON.stringify(result));
                var eventobj = result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"];
                var total_room_events =  result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"].length;
                for(var loop=0;loop<total_room_events;loop++)
                {
                  if(eventobj[loop]["FreeBusyView"] != undefined)
                  {
                    if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"] == undefined){
                      console.log('Available');
                      res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                    }
                    else if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0] != undefined)
                    {
                      if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"] != undefined)
                      {
                        if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"].length)
                        {
                          var eventobjlength = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"].length;
                          var starttime = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][0]["StartTime"];
                          var nowv = JSON.stringify(starttime);
                          nowv = nowv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                          console.log(nowv);
                          var timestamp = Math.floor(new Date(nowv) / 1000);
                          var untm = moment(nowv).unix();
                          console.log(untm);

                          if(giventmstp > untm)
                          {
                            console.log(untm);
                          }
                          var endtime   = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][0]["EndTime"];
                          var endv = JSON.stringify(endtime);
                          endv = endv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                          console.log(endv);
                          var entm = moment(endv).unix();
                          var busytype =  eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][0]["BusyType"];

                          if(giventmstp > untm && giventmstp < entm)
                          {
                            var remaintimeavailable = (entm -untm)/60;
                            console.log(remaintimeavailable);
                            var minutesavailable = remaintimeavailable;
                            var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                            timeslot = starttimebooking+" TO "+endtimebookingavailable;
                            console.log("Busy");
                            res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                          }
                          else if(giventmstp < untm && givenendtmstp < untm)
                          {
                            console.log("Available");
                            if(req.body.endtime != undefined)
                            {
                              if(busytype == "Busy")
                              {
                                timeslot = starttimebooking+" TO "+lastbookingtime;
                                res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintime})
                              }
                              else
                              {
                                res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                              }
                            }
                            else
                            {
                              res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                            }
                          }
                          else if(giventmstp < untm && givenendtmstp > untm)
                          {
                            var remaintimeavailable = (untm - giventmstp)/60;
                            console.log(remaintimeavailable);
                            var minutesavailable = remaintimeavailable;
                            var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                            timeslot = starttimebooking+" TO "+endtimebookingavailable;
                            console.log("Available");
                            if(req.body.endtime != undefined)
                            {
                              if(busytype == "Busy")
                              {
                                timeslot = starttimebooking+" TO "+lastbookingtime;
                                res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                              }
                              else
                              {
                                res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintimeavailable})
                              }
                            }
                            else
                            {
                              res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintimeavailable})
                            }
                          }
                          else if(giventmstp == untm)
                          {
                            var remaintimeavailable = (entm -untm)/60;
                            console.log(remaintimeavailable);
                            var minutesavailable = remaintimeavailable;
                            var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                            timeslot = starttimebooking+" TO "+endtimebookingavailable;
                            console.log("Busy");
                            res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                          }
                          else if(giventmstp == entm)
                          {
                            if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][1] != undefined)
                            {
                              var starttime = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][1]["StartTime"];
                              var nowv = JSON.stringify(starttime);
                              nowv = nowv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                              console.log(nowv);
                              var timestamp = Math.floor(new Date(nowv) / 1000);
                              var untm = moment(nowv).unix();
                              console.log(untm);

                              if(giventmstp > untm)
                              {
                                console.log(untm);
                              }
                              var endtime   = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][1]["EndTime"];
                              var endv = JSON.stringify(endtime);
                              endv = endv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                              console.log(endv);
                              var entm = moment(endv).unix();
                              if(giventmstp > untm && giventmstp < entm)
                              {
                                var remaintimeavailable = (entm -untm)/60;
                                console.log(remaintimeavailable);
                                var minutesavailable = remaintimeavailable;
                                var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                console.log("Busy");
                                res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                              }
                              else if(giventmstp < untm && givenendtmstp < untm)
                              {
                                if(req.body.endtime != undefined)
                                {
                                  if(busytype == "Busy")
                                  {
                                    timeslot = starttimebooking+" TO "+lastbookingtime;
                                    res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintime})
                                  }
                                  else
                                  {
                                    res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                  }
                                }
                                else
                                {
                                  res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                }
                              }
                              else if(giventmstp < untm && givenendtmstp > untm)
                              {
                                var remaintimeavailable = (untm - giventmstp)/60;
                                console.log(remaintimeavailable);
                                var minutesavailable = remaintimeavailable;
                                var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                console.log("Available");
                                if(req.body.endtime != undefined)
                                {
                                  if(busytype == "Busy")
                                  {
                                    timeslot = starttimebooking+" TO "+lastbookingtime;
                                    res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                                  }
                                  else
                                  {
                                    res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintimeavailable})
                                  }
                                }
                                else 
                                {
                                  res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintimeavailable})
                                }
                              }
                              else if(giventmstp == untm)
                              {
                                var remaintimeavailable = (entm -untm)/60;
                                console.log(remaintimeavailable);
                                var minutesavailable = remaintimeavailable;
                                var endtimebookingavailable = moment(starttimebooking).add(minutesavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                timeslot = starttimebooking+" TO "+endtimebookingavailable;
                                console.log("Busy");
                                res.json({"isavailable":false,"timeslot":timeslot,"inminute":remaintimeavailable})
                              }
                              else if(giventmstp == entm)
                              {
                                if(req.body.endtime != undefined){
                                  res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                }
                                else
                                {
                                  res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                                }
                              }
                            }
                            else
                            {
                              if(req.body.endtime != undefined){
                                  res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                              }
                              else
                              {
                                res.json({"isavailable":true,"timeslot":timeslot,"inminute":remaintime})
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              });
            }
          });
        }else{
          res.json({"isavailable":false,"message": "There isn't any permission to book room for this user."})
        }
      }
    });
  }
});


/**
  * @module : Web Services (Mobile)
  * @desc   : Get a all room availability for specific time range
  * @return : return room is available or not as per specified room address
  * @author : Softweb solutions
*/
router.post('/getallroomavailability',function(req,res){

  var Office365Token = "";
  var requestsql    =  new sql.Request(cp);
  var attribute     =  req.body.attribute;
  var capacity      =  req.body.capacity;
  var flag          =  req.body.flag;
  var emailaddress  =  req.body.emailaddress;
  var attributename = {"attribute":"PHONE,TV,WHITE_BOARD,WHITEBOARD,PROJECTOR"};
  
  attribute=attribute.replace('PHONE','Polycom');
  attribute=attribute.replace('WHITE_BOARD','Whiteboard');
  attribute=attribute.replace('WHITEBOARD','Whiteboard');
  attribute=attribute.replace('PROJECTOR','Projector'); 
 
  var getNotAvailableRoom = '';
  var startTimePosted =  req.body.originalStartTime;
  var startTimeStamp = moment(startTimePosted).unix();
  var endTimePosted =  req.body.originalEndTime;
  var endTimeStamp = moment(endTimePosted).unix();

  var roomQueryDate = "SELECT sn.roomID, sl.address, sl.name, sn.startTime, sn.endTime FROM so_notification sn LEFT JOIN so_location as sl ON sl.id = sn.roomID WHERE  ('"+startTimeStamp+"' >= sn.startTime  AND '"+startTimeStamp+"' < sn.endTime) OR ('"+endTimeStamp+"' >= sn.startTime  AND '"+endTimeStamp+"' < sn.endTime ) GROUP BY sn.roomID, sl.address, sl.name, sn.startTime, sn.endTime";
  requestsql.query(roomQueryDate, function(err, result) {
    for(var a=0;a<result.length;a++)
    {
      if(result[a].address != null)
      {
        getNotAvailableRoom+="'"+result[a].address+"',";  
      }        
    }
    getNotAvailableRoom = getNotAvailableRoom.replace(/,\s*$/, "");
    if(req.body.attribute != undefined && req.body.attribute != ''){
      var attributesplit = attribute.split(",");
      var locquery = "SELECT l.* FROM so_location as l ";
      var append = '';
      for(var j=0;j<attributesplit.length;j++){
        if(j == 0){
          append = "WHERE (";
        }
        else{
          append = " OR";
        }
        var attributesplitlower = attributesplit[j].toLowerCase();
        //locquery+= append+" (',' + l.amenities + ',') LIKE '%,"+attributesplit[j]+",%'";
        locquery+= append+" (',' + LOWER(l.amenities) + ',') LIKE '%"+attributesplitlower+"%'";
      }
      locquery+= ")";
      if(req.body.capacity != undefined && req.body.capacity != ''){
        locquery+= " AND l.capacity >= "+req.body.capacity;
      }
      if(getNotAvailableRoom.length > 0)
      {
        locquery+= " AND l.address NOT IN ("+getNotAvailableRoom+")";
      }
    }else{
      var locquery = "SELECT l.* FROM so_location as l";
      if(req.body.capacity != undefined && req.body.capacity != ''){
        locquery+= " WHERE l.capacity >= "+req.body.capacity;
      }
      if(getNotAvailableRoom.length > 0)
      {
        locquery+= " AND l.address NOT IN ("+getNotAvailableRoom+")";
      }
    }
    requestsql.query(locquery, function(err, result) 
    {
      if(err)
      {
         res.json({"status": false,"data": null,"message": err.message,"code":err.statusCode});
      }
      else
      {
        if(result.length > 0)
        { 

          var giventimeslot             =  req.body.timeslot;
          var starttimebookingbefore    =  req.body.starttime;
          var starttimebookingbeforespl =  starttimebookingbefore.split("T");
          var starttimebookingspltime   =  starttimebookingbeforespl[1].split(":");

          var starttimebooking =  starttimebookingbeforespl[0]+"T"+starttimebookingspltime[0]+":"+starttimebookingspltime[1]+":00";
          var starttimebookingspl =  starttimebooking.split("T");
          var starttimebookingspldate =  starttimebookingspl[0].split("-");
          var giventmstp = moment(starttimebooking).unix();
          var lastbookingtime =  req.body.endtime;
          var lasttimebookingspl =  lastbookingtime.split("T");
          var lasttmstp = moment(lastbookingtime).unix();
          var remaintime = (lasttmstp - giventmstp)/60;
          var minutes = remaintime;
          var endtimebooking = moment(starttimebooking).add(minutes,'minutes').format('YYYY-MM-DDTHH:mm:ss');
          var givenendtmstp = moment(endtimebooking).unix();
          var timeslot = starttimebooking+" TO "+endtimebooking;

          var allrooms = [];
          var allnewrooms = [];
          var name = [];
          var coordinates = [];
          /*var major = [];
          var minor = [];*/
          var chkattribute = [];
          var capacity = [];
          var office_location = [];
          var show_more_location = [];
          var soapRe ='<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetUserAvailabilityRequest xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"><TimeZone xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Bias>360</Bias><StandardTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>5</DayOrder><Month>10</Month><DayOfWeek>Sunday</DayOfWeek></StandardTime><DaylightTime><Bias>0</Bias><Time>02:00:00</Time><DayOrder>1</DayOrder><Month>4</Month><DayOfWeek>Sunday</DayOfWeek></DaylightTime></TimeZone><MailboxDataArray>';

          for(var roomloop=0;roomloop<result.length;roomloop++)
          {
            allrooms.push({"address":result[roomloop].address});

            var permission = JSON.parse(result[roomloop].user_permission);
            if(permission != null)
            {
              if(emailaddress != '')
              {
                var arrayFound = permission.filter(function(item) {
                  return item.Email == emailaddress;
                });
                if(arrayFound.length > 0) 
                {
                  if((arrayFound[0].Permission != 'Reviewer') && (arrayFound[0].Permission != 'none'))
                  {
                    allnewrooms.push({"address":result[roomloop].address}); 
                    name.push({"name":result[roomloop].name});
                    coordinates.push({"x_coordinate":result[roomloop].x_cordinate,"y_coordinate":result[roomloop].y_cordinate});
                    capacity.push({"capacity":result[roomloop].capacity});
                    office_location.push({"office_location":result[roomloop].office_location});

                    if(req.body.attribute != undefined && req.body.attribute != '')
                    {
                      req.body.attribute = "Polycom,TV,Whiteboard,Projector";
                      var chkattr = {};
                      attributesplit = req.body.attribute.split(",");
                      for(var chk=0;chk<attributesplit.length;chk++)
                      {
                        var amenitieslower = result[roomloop].amenities.toLowerCase();
                        var attributesplitlower = attributesplit[chk].toLowerCase();
                        var chkexists = amenitieslower.indexOf(attributesplitlower);
                        if(chkexists > -1)
                        {
                          if(attributesplit[chk]=='Polycom'){attributesplit[chk]='PHONE'}
                          if(attributesplit[chk]=='Whiteboard'){attributesplit[chk]='WHITE_BOARD'}
                          if(attributesplit[chk]=='Projector'){attributesplit[chk]='PROJECTOR'}
                          chkattr[attributesplit[chk]] = true;
                        } 
                      }
                      chkattribute.push(chkattr);
                    } 
                    else 
                    {
                      var chkattr = {};
                      var attributesplit = attributename.attribute.replace('PHONE','Polycom');
                      attributesplit=attributesplit.replace('WHITE_BOARD','Whiteboard');
                      attributesplit=attributesplit.replace('WHITEBOARD','Whiteboard');
                      attributesplit=attributesplit.replace('PROJECTOR','Projector');
                      attributesplit = attributesplit.split(",");
                      for(var chk=0;chk<attributesplit.length;chk++)
                      {
                        if(result[roomloop].amenities != "")
                        {
                          var chkexists = result[roomloop].amenities.indexOf(attributesplit[chk]);
                          if(attributesplit[chk]=='Polycom'){attributesplit[chk]='PHONE'}
                          if(attributesplit[chk]=='Whiteboard'){attributesplit[chk]='WHITE_BOARD'}
                          if(attributesplit[chk]=='Projector'){attributesplit[chk]='PROJECTOR'}
                          if(chkexists > -1)
                          {
                            chkattr[attributesplit[chk]] = true;
                          }
                          else
                          {
                            chkattr[attributesplit[chk]] = false;
                          }
                        }
                        else
                        {
                          if(attributesplit[chk]=='Polycom'){attributesplit[chk]='PHONE'}
                          if(attributesplit[chk]=='Whiteboard'){attributesplit[chk]='WHITE_BOARD'}
                          if(attributesplit[chk]=='Projector'){attributesplit[chk]='PROJECTOR'}
                          chkattr[attributesplit[chk]] = false;
                        }
                      }
                      chkattribute.push(chkattr);
                    }
                    soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+result[roomloop].address+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
                  }
                } 
                else
                {
                  var arrayFoundDefault = permission.filter(function(item) {
                    return item.Name == 'Default';
                  });
                  if(arrayFoundDefault[0]!=undefined)
                  {
                    if((arrayFoundDefault[0].Permission != 'Reviewer') && (arrayFoundDefault[0].Permission != 'none'))
                    {
                      allnewrooms.push({"address":result[roomloop].address});
                      name.push({"name":result[roomloop].name});
                      coordinates.push({"x_coordinate":result[roomloop].x_cordinate,"y_coordinate":result[roomloop].y_cordinate});
                      capacity.push({"capacity":result[roomloop].capacity});
                      office_location.push({"office_location":result[roomloop].office_location});

                      if(req.body.attribute != undefined && req.body.attribute != '')
                      {
                        req.body.attribute = "Polycom,TV,Whiteboard,Projector";
                        var chkattr = {};
                        attributesplit = req.body.attribute.split(",");
                        for(var chk=0;chk<attributesplit.length;chk++){
                          var amenitieslower = result[roomloop].amenities.toLowerCase();
                          var attributesplitlower = attributesplit[chk].toLowerCase();
                          var chkexists = amenitieslower.indexOf(attributesplitlower);
                          if(chkexists > -1){
                            if(attributesplit[chk]=='Polycom'){attributesplit[chk]='PHONE'}
                            if(attributesplit[chk]=='Whiteboard'){attributesplit[chk]='WHITE_BOARD'}
                            if(attributesplit[chk]=='Projector'){attributesplit[chk]='PROJECTOR'}
                            chkattr[attributesplit[chk]] = true;
                          } 
                        }
                        chkattribute.push(chkattr);
                      }
                      else
                      {
                        var chkattr = {};
                        var attributesplit = attributename.attribute.replace('PHONE','Polycom');
                        attributesplit=attributesplit.replace('WHITE_BOARD','Whiteboard');
                        attributesplit=attributesplit.replace('WHITEBOARD','Whiteboard');
                        attributesplit=attributesplit.replace('PROJECTOR','Projector');
                        attributesplit = attributesplit.split(",");
                        for(var chk=0;chk<attributesplit.length;chk++)
                        {
                          if(result[roomloop].amenities != "")
                          {
                            var chkexists = result[roomloop].amenities.indexOf(attributesplit[chk]);
                            if(attributesplit[chk]=='Polycom'){attributesplit[chk]='PHONE'}
                            if(attributesplit[chk]=='Whiteboard'){attributesplit[chk]='WHITE_BOARD'}
                            if(attributesplit[chk]=='Projector'){attributesplit[chk]='PROJECTOR'}
                            if(chkexists > -1)
                            {
                              chkattr[attributesplit[chk]] = true;
                            } else {
                              chkattr[attributesplit[chk]] = false;
                            }
                          }
                          else
                          {
                            if(attributesplit[chk]=='Polycom'){attributesplit[chk]='PHONE'}
                            if(attributesplit[chk]=='Whiteboard'){attributesplit[chk]='WHITE_BOARD'}
                            if(attributesplit[chk]=='Projector'){attributesplit[chk]='PROJECTOR'}
                            chkattr[attributesplit[chk]] = false;
                          }
                        }
                        chkattribute.push(chkattr);
                      }
                      soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+result[roomloop].address+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
                    }
                  }
                }
              } else {
                var arrayFoundDefault = permission.filter(function(item) {
                  return item.Name == 'Default';
                });
                if((arrayFoundDefault[0].Permission != 'Reviewer') && (arrayFoundDefault[0].Permission != 'none')){
                  allnewrooms.push({"address":result[roomloop].address});
                  name.push({"name":result[roomloop].name});
                  coordinates.push({"x_coordinate":result[roomloop].x_cordinate,"y_coordinate":result[roomloop].y_cordinate});
                  capacity.push({"capacity":result[roomloop].capacity});  
                  office_location.push({"office_location":result[roomloop].office_location});
                  soapRe+='<MailboxData xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><Email><Name></Name><Address>'+result[roomloop].address+'</Address><RoutingType>SMTP</RoutingType></Email><AttendeeType>Organizer</AttendeeType><ExcludeConflicts>false</ExcludeConflicts></MailboxData>';
                }
              }
            }
          }
          soapRe+='</MailboxDataArray><FreeBusyViewOptions xmlns="http://schemas.microsoft.com/exchange/services/2006/types"><TimeWindow><StartTime>'+starttimebooking+'</StartTime><EndTime>'+endtimebooking+'</EndTime></TimeWindow><MergedFreeBusyIntervalInMinutes>15</MergedFreeBusyIntervalInMinutes><RequestedView>FreeBusy</RequestedView></FreeBusyViewOptions></GetUserAvailabilityRequest></soap:Body></soap:Envelope>';

          requestsql.query("SELECT TOP(1) Session FROM so_session WHERE Session NOT LIKE '%undefined%' ORDER BY ID DESC",
          function(err1, result1) {
            if(err1)
            {
              res.json({"status": false,"data": null,"message": err1.message,"code":err1.statusCode});
            }
            else
            {
              Office365Token = result1[0].Session;
              request.post({
                url:'https://outlook.office365.com/ews/Exchange.asmx',
                body : soapRe,
                headers: {'Content-Type': 'text/xml; charset=utf-8'},
                auth:{ 'bearer' : Office365Token },
              },
              function (error, response, body){
                if (!error && response.statusCode == 200) {  
                  parseString(body,function (err,result) {
                    var eventobj = result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"];
                    var total_room_events =  result["s:Envelope"]["s:Body"][0]["GetUserAvailabilityResponse"][0]["FreeBusyResponseArray"][0]["FreeBusyResponse"].length;
                    var availableslots = [];
                    var showmwmore_rooms_singapour = [];
                    var showmwmore_rooms_lombard = [];

                    for(var loop=0;loop<total_room_events;loop++)
                    {
                      var timeslot = [];
                      if(eventobj[loop]["FreeBusyView"] != undefined)
                      {
                        if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"] == undefined)
                        {
                          if(flag == 0)
                          {
                            var timeslotdiff = starttimebookingspl[1]+"-"+lasttimebookingspl[1];
                            timeslot.push({"schedule":timeslotdiff,"inminute":remaintime});
                            if(req.body.attribute != undefined && req.body.attribute != ''){
                              if(attributesplit.length == Object.keys(chkattribute[loop]).length){
                                availableslots.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"inminute":remaintime,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                              }
                            }else{
                              availableslots.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"inminute":remaintime,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                            }
                          } 
                        }
                        else if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0] != undefined)
                        {
                          if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"] != undefined)
                          {
                            if(eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"].length)
                            {
                              var eventobjlength = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"].length;
                              for(var e=0;e<eventobjlength;e++)
                              {
                                var starttime = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][e]["StartTime"];
                                var nowv = JSON.stringify(starttime);
                                nowv = nowv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                                var nowvspl =  nowv.split("T");
                                var timestamp = Math.floor(new Date(nowv) / 1000);
                                var untm = moment(nowv).unix();
                                
                                var endtime   = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][e]["EndTime"];
                                var endv = JSON.stringify(endtime);
                                endv = endv.replace('[','').replace(']', '').replace('"', '').replace('"','');
                                var endvspl =  endv.split("T");
                                var entm = moment(endv).unix();

                                if(e == 0)
                                {
                                  var remaintimeavailable = (untm - giventmstp)/60;
                                  if(remaintimeavailable >= giventimeslot){
                                    var endtimebookingavailable = moment(starttimebooking).add(remaintimeavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                    var timeslotdiff = starttimebooking+" TO "+endtimebookingavailable;
                                    timeslot.push({"schedule":timeslotdiff,"inminute":remaintimeavailable});
                                  }
                                  else{
                                    if(remaintimeavailable > 0)
                                    {
                                      var endtimebookingavailable = moment(starttimebooking).add('minutes', remaintimeavailable).format('YYYY-MM-DDTHH:mm:ss');
                                      var timeslotdiff = starttimebooking+" TO "+endtimebookingavailable;
                                      timeslot.push({"schedule":timeslotdiff,"inminute":remaintimeavailable});
                                    }
                                  }
                                }else{
                                  var endtimeprev = eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][e-1]["EndTime"];
                                  var endvprev = JSON.stringify(endtimeprev);
                                  endvprev = endvprev.replace('[','').replace(']', '').replace('"', '').replace('"','');
                                  var endvprevspl =  endvprev.split("T");
                                  var untmprev = moment(endvprev).unix();

                                  var remaintimeavailable = (untm - untmprev)/60;
                                  if(remaintimeavailable >= giventimeslot){
                                    var endtimebookingavailable = moment(endvprev).add(remaintimeavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                    var timeslotdiff = endvprev+" TO "+endtimebookingavailable;
                                    timeslot.push({"schedule":timeslotdiff,"inminute":remaintimeavailable});
                                  }
                                  else{
                                    if(remaintimeavailable > 0)
                                    {
                                      var endtimebookingavailable = moment(endvprev).add('minutes', remaintimeavailable).format('YYYY-MM-DDTHH:mm:ss');
                                      var timeslotdiff = endvprev+" TO "+endtimebookingavailable;
                                      timeslot.push({"schedule":timeslotdiff,"inminute":remaintimeavailable});
                                    }
                                  }
                                }

                                if(e+1 == eventobjlength)
                                {
                                  var endtimeavailable = (givenendtmstp - entm)/60;
                                  if(endtimeavailable >= giventimeslot)
                                  {
                                    var afterendtimebookingavailable = moment(endv).add(endtimeavailable,'minutes').format('YYYY-MM-DDTHH:mm:ss');
                                    var timeslotdiffend = endv+" TO "+afterendtimebookingavailable;
                                    timeslot.push({"schedule":timeslotdiffend,"inminute":endtimeavailable});
                                  }
                                  else
                                  {
                                    if(endtimeavailable > 0)
                                    {
                                      var afterendtimebookingavailable = moment(endv).add('minutes', endtimeavailable).format('YYYY-MM-DDTHH:mm:ss');
                                      var timeslotdiffend = endv+" TO "+afterendtimebookingavailable;
                                      timeslot.push({"schedule":timeslotdiffend,"inminute":endtimeavailable});
                                    }
                                  }
                                }
                                var busytype =  eventobj[loop]["FreeBusyView"][0]["CalendarEventArray"][0]["CalendarEvent"][e]["BusyType"];
                              } //for loop eventobjlength
                              
                              if(flag != 0){
                                timeslot.sort(function(a, b){
                                    return b.inminute - a.inminute;
                                });
                              }

                              if(flag == 0)
                              {
                                if((timeslot[0]!=undefined) && (timeslot[0].inminute < remaintime))
                                {
                                  if(req.body.attribute != undefined && req.body.attribute != '')
                                  {
                                    if(attributesplit.length == Object.keys(chkattribute[loop]).length)
                                    {
                                      var string = allnewrooms[loop].address;
                                      substring = "ap.jll.com";
                                      if(string.indexOf(substring) > -1)
                                      {
                                        showmwmore_rooms_singapour.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"isavailable":true,"timeslot":timeslot,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                                      }else 
                                      {
                                        show_more_location.push(office_location[loop].office_location);                                                 showmwmore_rooms_lombard.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"isavailable":true,"timeslot":timeslot,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                                      }
                                    }
                                  }
                                  else
                                  {
                                    var string = allnewrooms[loop].address;
                                    substring = "ap.jll.com";
                                    if(string.indexOf(substring) > -1)
                                    {
                                      showmwmore_rooms_singapour.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"isavailable":true,"timeslot":timeslot,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                                    }
                                    else
                                    {
                                      show_more_location.push(office_location[loop].office_location);
                                      showmwmore_rooms_lombard.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"isavailable":true,"timeslot":timeslot,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                                    }
                                  }
                                }
                                if((timeslot[0]!=undefined) && timeslot[0].inminute == remaintime) 
                                {
                                  if(req.body.attribute != undefined && req.body.attribute != '')
                                  {
                                    if(attributesplit.length == Object.keys(chkattribute[loop]).length)
                                    {
                                      availableslots.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"inminute":timeslot[0].inminute,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                                    }
                                  }else{
                                    availableslots.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"inminute":timeslot[0].inminute,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                                  }
                                }
                              }  // flag ==0
                              else
                              {
                                if((timeslot[0]!=undefined) && (timeslot[0].inminute < remaintime))
                                {
                                  if(req.body.attribute != undefined && req.body.attribute != '')
                                  {
                                    if(attributesplit.length == Object.keys(chkattribute[loop]).length)
                                    {
                                      availableslots.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"isavailable":true,"timeslot":timeslot,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                                    }
                                  }else{
                                    availableslots.push({"emailid":allnewrooms[loop].address,"name":name[loop].name,"office_location":office_location[loop].office_location,"isavailable":true,"timeslot":timeslot,"attribute":chkattribute[loop],"capacity":capacity[loop].capacity,"x_cordinate":coordinates[loop].x_coordinate,"y_cordinate":coordinates[loop].y_coordinate});
                                  }
                                }
                              }
                            } // if calendar event length
                          } // calaendar event is != undefined     
                        } // else if close        
                      }  // freebusy view end ! = undefined
                    } // for loop total_room_events
                    if(availableslots.length > 0)
                    {
                      var SHOW_ME_MORE_LOCATION = {};
                      show_more_location.forEach(function(key) {
                        SHOW_ME_MORE_LOCATION[key] = (SHOW_ME_MORE_LOCATION[key] || 0) + 1
                      })
                      res.json({"status": true,"data": {"avilable_rooms": availableslots,"SHOW_ME_MORE_ROOMS_SINGAPORE":showmwmore_rooms_singapour.length,"SHOW_ME_MORE_ROOMS_LOMBARD":showmwmore_rooms_lombard.length,SHOW_ME_MORE_LOCATION },"message": "Success","code": 200} );
                    }
                    else
                    {
                      res.json({"status": true,"data": null,"message": "No Record Found.","code" : 200});
                    }
                    //response.json(result);
                  }); // parseString
                }
                else
                { 
                  if(error==null)  
                    res.json({"status": false,"data": null,"message": "Invalid Token","code" : 401});
                  else
                    res.json({"status": false,"data": null,"message": error.message,"code" : error.statusCode});
                }
              });  // function (error, response, body){
            } // result1 else close
          }); 
        }
      }   
    }); 
  }); // close request sql
});


/**
  * @module : Web Services (Mobile)
  * @desc   : Use for room release and hold
  * @return : return room status response insert
  * @author : Softweb solutions
*/
router.post('/addpromptstatus',function(req,res){

  var major       =  req.body.devicemajor;
  var minor       =  req.body.deviceminor;
  var timestamp   =  req.body.timestamp; 
  var status      =  req.body.status; 
  var request     =  new sql.Request(cp);

  request.query("SELECT id,locationid FROM so_device  WHERE major = '"+major+"' AND minor = '"+minor+"'",
  function(err, result)
  {
    if(err)
    {
      res.json({"message":err.message,"success":"false"});
    }
    else
    {
      if(result[0]!=undefined)
      {
        var location_id = result[0].locationid;
        var beacon_id   = result[0].id;
        var request = new sql.Request(cp);
        request.query("INSERT INTO so_prompt(devicemajor,deviceminor,locationid,timestamp,status,beaconid) VALUES('"+major+"','"+minor+"','"+location_id+"','"+timestamp+"','"+status+"','"+beacon_id+"')",
        function(err, result)
        {
          if(err)
          {
            res.json({"message":err.message,"success":"false"});
          }
          else
          {
            res.json({"message":"Status inserted successfully.","success":"true"});
          }
        });  
      }else{
        res.json({"message":"Room location is not found","success":"true"});
      }
    }
  });  
});

module.exports = router;