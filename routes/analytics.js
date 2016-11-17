var express   = require('express');
var router    = express.Router();
var moment    = require('moment');
var gcm       = require('node-gcm');
var apn       = require('apn');
var fs        = require('fs');
var async     = require("async");
var requestapi= require('request');
var outlook = require("node-outlook");
var request = require('request');
var authHelper = require("../authHelper");
var session     = require('express-session');


/**
  * @module : Office 
  * @desc   : Get list of office
  * @return : Return office list
  * @author : Softweb solutions
*/
router.get('/', function (req, res) {
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_office", function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      if(result.length == 0)
      {
        res.status(404).send('Sorry, we cannot find that!');
      }
      else
      {
        res.json(result);
      }
    }
  });
});


 /**
* @module : Amenities
* @desc   : Get All Amenities
* @return : Return all amenities
* @author : Softweb solutions - Dhaval Thaker
*/
router.get('/allAmenities/', function (req, res) {
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_amenities WHERE am_status = 1", function(error, result) {
    if (error) {
      res.json(error);
    } 
    else {
      res.json({"data": result});
    }
  });
});


/**
  * @module : Office 
  * @desc   : Get office based on office id selected
  * @return : Return office detail
  * @author : Softweb solutions
*/
router.get('/getOffice/:officeid', function (req, res) {
  var officeid = req.params.officeid;
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_office WHERE id = "+officeid, function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      if(result.length == 0)
      {
        res.status(404).send('Sorry, we cannot find that!');
      }
      else
      {
        res.json(result);
      }
    }
  });
});


/**
  * @module : Office 
  * @desc   : Insert office
  * @return : Return add office
  * @author : Softweb solutions
*/
router.post('/insertOffice', function (req, res) {
  var officename = req.body.officename;
  var officeaddress = req.body.officeaddress;
  var timestamp = Math.floor(new Date() / 1000);

  if(req.body.officeimage != null)
  {
    var filename  = req.body.officeimage.filename;
    var image     = req.body.officeimage.base64;
    var ext       = filename.split(".");
    var fd =  fs.openSync('public/images/office/'+timestamp+"."+ext[ext.length-1], 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
    image = timestamp+"."+ext[ext.length-1];
  }
  else
  {
    var image = "";
  }

  var companyid = req.body.companyid;
  var notes = req.body.notes;
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var timestamp = yyyy+'-'+mm+'-'+dd;
  var request = new sql.Request(cp);
  request.input('officename',sql.VarChar(50));
  request.input('officeaddress',sql.VarChar(50));
  request.input('companyid',sql.Int);

  request.query("INSERT INTO so_office (officename, officeaddress,officeimage,companyid,timestamp) VALUES ('"+officename+"', '"+officeaddress+"', '"+image+"' '"+companyid+"', '"+timestamp+"')", function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      res.json("Office Added successfully");
    }
  });
});


/**
  * @module : Office 
  * @desc   : Edit office
  * @return : Return Edit office
  * @author : Softweb solutions
*/
router.post('/editOffice', function (req, res) {
  
  var id = req.body.id;
  var officename = req.body.officename;
  var officeaddress = req.body.officeaddress;
  var companyid = req.body.companyid;
  var notes = req.body.notes;
  var oldimage  = req.body.officeimage;
  var timestamp = Math.floor(new Date() / 1000);
  var uploadimage = "";

  if(req.body.officeimage != null)
  {
    var filename  = req.body.officeimage.filename;
    var image     = req.body.officeimage.base64;
    var ext       = filename.split(".");
    if (fs.existsSync('public/images/office/'+oldimage)) {
      fs.unlinkSync('public/images/office/'+oldimage);
    }
    var fd =  fs.openSync('public/images/office/'+timestamp+"."+ext[ext.length-1], 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
    image = "images/office/"+timestamp+"."+ext[ext.length-1];
    uploadimage = "officeimage = '"+image+"',";
  }
  
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var timestamp = yyyy+'-'+mm+'-'+dd;
  var request = new sql.Request(cp);
  request.input('officename',sql.VarChar(50));
  request.input('officeaddress',sql.VarChar(50));
  request.input('companyid',sql.Int);
  
  request.query("UPDATE so_office SET officename = '"+officename+"',"+uploadimage+" officeaddress = '"+officeaddress+"', companyid = '"+companyid+"',  timestamp = '"+timestamp+"' WHERE id = "+id, function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      res.json("Office updated successfully");
    }
  });
});

/*code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > save amenities into location*/
/**
  * @module : Search
  * @desc   : Get Searchdata
  * @return : Return search response
  * @author : Softweb solutions - Dhaval Thaker
*/
router.post('/getSearchResult', function (req, res) {
  var bookDetails= req.body.bookDetails;
  var location= req.body.location;
  var people= req.body.People;
  var postAmenitiesData= req.body.Amenities;
  var startTime= req.body.startTime;
  var convttime= new Date(startTime).toISOString().replace(/T/, ' ').replace(/Z/, '');
  var timeslot= req.body.timeslot;
  var setdurdate= req.body.setdurdate;
   var duration=  req.body.setdurdate;
  //var tt= convttime.setDate(convttime.getDate() - 1);

  console.log(req.body);

  console.log(bookDetails);
  console.log(location);
  console.log('People = '+people);
  console.log(postAmenitiesData);
  console.log(startTime);
  console.log(timeslot);
  console.log(duration);
  console.log(convttime);


  //var amenities = req.body.amenities;
  var request = new sql.Request(cp);

  //console.log("SELECT so_location.*,GROUP_CONCAT(so_amenities.amenities) FROM so_location ,so_amenities WHERE  amenities LIKE '%"+postAmenitiesData+"%' and  capacity = '"+people+"' and FIND_IN_SET( so_amenities.am_guid, so_location.amenities )");

/*  request.query("SELECT time FROM so_room_reservation WHERE  time = '"+startTime+"'", function(err, result1) {
  request.query("SELECT amenities as finalname from so_amenities where am_guid IN (SELECT id FROM so_location WHERE  amenities LIKE '%"+postAmenitiesData+"%' and  capacity = '"+people+"')", function(err, result) {

    console.log(result1);
    if (err) {
      res.json(err);
    } else {
      res.json({data: result, message: "success"});
    }
  });
*/
 console.log("WITH    SplitList AS ( SELECT   so_location.id ,ame.amenities, ame.am_guid FROM  so_location CROSS APPLY dbo.Split(so_location.amenities, ',') S                  INNER JOIN so_amenities ame ON CAST(ame.am_guid as varchar(50)) = cast(S.Items as varchar(50))) SELECT  so_room_reservation.*,so_location.* ,STUFF(( SELECT  ', ' + SplitList.amenities FROM    SplitList WHERE   SplitList.id = so_location.id            FOR  XML PATH('')), 1, 2, '') as amenitie FROM   so_room_reservation INNER JOIN  so_location ON so_location.id = so_room_reservation.locationid where CONVERT(VARCHAR, so_room_reservation.time , 126) LIKE '"+startTime+"%' AND (CONVERT(VARCHAR, so_room_reservation.time , 108) BETWEEN '"+timeslot+"' AND '"+duration+"')  OR amenities LIKE '"+postAmenitiesData+"'  OR so_location.capacity = '"+people+"' OR so_location.rooms_from = '3'");

//request.query("select so_room_reservation.*,so_location.* from so_room_reservation INNER JOIN so_location ON so_location.id = so_room_reservation.locationid where CONVERT(VARCHAR, so_room_reservation.time , 126) LIKE '"+startTime+"%' and amenities LIKE '%"+postAmenitiesData+"%' and  capacity = '"+people+"'", function(err, result) {

request.query("WITH    SplitList AS ( SELECT   so_location.id ,ame.amenities, ame.am_guid FROM  so_location CROSS APPLY dbo.Split(so_location.amenities, ',') S                  INNER JOIN so_amenities ame ON CAST(ame.am_guid as varchar(50)) = cast(S.Items as varchar(50))) SELECT  so_room_reservation.*,so_location.* ,STUFF(( SELECT  ', ' + SplitList.amenities FROM    SplitList WHERE   SplitList.id = so_location.id            FOR  XML PATH('')), 1, 2, '') as amenitie FROM   so_room_reservation INNER JOIN  so_location ON so_location.id = so_room_reservation.locationid where CONVERT(VARCHAR, so_room_reservation.time , 126) LIKE '"+startTime+"%' AND (CONVERT(VARCHAR, so_room_reservation.time , 108) BETWEEN '"+timeslot+"' AND '"+duration+"')  OR amenities LIKE '"+postAmenitiesData+"'  OR so_location.capacity = '"+people+"' OR so_location.rooms_from = '3' ", function(err, result) {

/*request.query("SELECT time FROM so_room_reservation WHERE  time = 2016-08-26T04:30:00.000Z", function(err, result) {*/
 /* request.query("SELECT * FROM so_location WHERE  amenities LIKE '%"+postAmenitiesData+"%' and  capacity = '"+people+"'", function(err, result) {*/
  //request.query("SELECT so_location.*,Substring(so_amenities.amenities,',',',') FROM so_location ,so_amenities WHERE  amenities LIKE '%"+postAmenitiesData+"%' and  capacity = '"+people+"' and FIND_IN_SET( so_amenities.am_guid, so_location.amenities ) GROUP BY so_location.amenities", function(err, result) {
  /*request.query("SELECT amenities as finalname from so_amenities where am_guid IN (SELECT id FROM so_location WHERE  amenities LIKE '%"+postAmenitiesData+"%' and  capacity = '"+people+"')", function(err, result) {*/

    console.log(result);
    if (err) {
      res.json(err);
    } else {
             res.json({data: result, message: "success"});
            }
    });
  });


/**
  * @module : Office 
  * @desc   : Delete office
  * @return : Return Delete office
  * @author : Softweb solutions
*/
router.delete('/deleteOffice/:officeid', function (req, res) {
  var officeid = req.params.officeid;
  var request = new sql.Request(cp);
  request.query("DELETE FROM so_office WHERE id = "+officeid, function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      res.json("Office Deleted successfully");
    }
  });
});

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Search Result*/
/**
  * @module : Search
  * @desc   : Get Search Result
  * @return : Return Get Search Result
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/getSearchResults', function (req, res) {
  var date = req.body.date;
  var startTime = req.body.startTime;
  var endTime = req.body.endTime;
  var officeId = req.body.officeId;
  var people = req.body.people;
  var spaceType = req.body.spaceType;
  var amenities = req.body.amenities;
  var bookable = req.body.bookable;

  /*var query = "WITH SplitList AS (SELECT SLL.id ,SA.amenities, SA.am_guid FROM so_location SLL CROSS APPLY dbo.Split(SLL.amenities, ',') S INNER JOIN so_amenities SA ON CAST(SA.am_guid as varchar(50)) = cast(S.Items as varchar(50))) SELECT SL.*,STUFF((SELECT ', ' + SplitList.amenities FROM SplitList WHERE SplitList.id = SL.id FOR XML PATH('')), 1, 2, '') as amenitiesNames FROM so_location SL WHERE SL.id NOT IN (SELECT DISTINCT SRR.locationid FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) >= '"+startTime+"') OR (CONVERT(VARCHAR, SRR.time , 126) >= '"+startTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) <= '"+endTime+"')))";*/
  
  if (bookable == 'available') {
    var query = "WITH SplitList AS (SELECT SLL.id ,SA.amenities, SA.am_guid FROM so_location SLL CROSS APPLY dbo.Split(SLL.amenities, ',') S INNER JOIN so_amenities SA ON CAST(SA.am_guid as varchar(50)) = cast(S.Items as varchar(50))) SELECT SL.*,STUFF((SELECT ', ' + SplitList.amenities FROM SplitList WHERE SplitList.id = SL.id FOR XML PATH('')), 1, 2, '') as amenitiesNames FROM so_location SL WHERE SL.id NOT IN (SELECT DISTINCT SRR.locationid FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) BETWEEN '"+startTime+"' AND '"+endTime+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) BETWEEN '"+startTime+"' AND '"+endTime+"')))";
  }
  else {
    var query = "WITH SplitList AS (SELECT SLL.id ,SA.amenities, SA.am_guid FROM so_location SLL CROSS APPLY dbo.Split(SLL.amenities, ',') S INNER JOIN so_amenities SA ON CAST(SA.am_guid as varchar(50)) = cast(S.Items as varchar(50))) SELECT SL.*,STUFF((SELECT ', ' + SplitList.amenities FROM SplitList WHERE SplitList.id = SL.id FOR XML PATH('')), 1, 2, '') as amenitiesNames FROM so_location SL WHERE SL.id IN (SELECT DISTINCT SRR.locationid FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) BETWEEN '"+startTime+"' AND '"+endTime+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) BETWEEN '"+startTime+"' AND '"+endTime+"')))";
  }

  //query += " AND SL.rooms_from = 1";
  
  if(parseInt(officeId)) {
    query += " AND SL.location_id = "+parseInt(officeId); 
  }

  if(parseInt(people)) {
    query += " AND SL.capacity = "+parseInt(people); 
  }

  if(spaceType.trim()) {
    query += " AND SL.space_type = '"+spaceType.trim()+"' "; 
  }

  if(amenities.trim()) {
    query += " AND SL.amenities LIKE '%"+amenities.trim()+"%' "; 
  }

  var request = new sql.Request(cp);
  console.log(query);
  request.query(query, function(error, result) {
    if (error) {
      res.json(error);
    } else {

      request.query("SELECT * FROM so_room_reservation WHERE ((CONVERT(VARCHAR, time , 126) LIKE '"+date+"%') OR (CONVERT(VARCHAR, endtime , 126) LIKE '"+date+"%'))", function(error1, result1) {
        if (error1) {
          //res.json(error1);
          res.json({data: result,reservationData: [], message: "success"});
        } else {
          res.json({data: result,reservationData: result1, message: "success"});
        }
        
      });      

    }
  });

});

module.exports = router;