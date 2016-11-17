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
  var floorId = req.body.floorId;
  var people = req.body.people;
  var spaceType = req.body.spaceType;
  var amenities = req.body.amenities;
  var bookable = req.body.bookable;
  var userUcGuid = req.body.userUcGuid;

  if (bookable == 'available') {
    var query = "SELECT SL.* FROM so_location SL INNER JOIN so_people SP ON SL.officeid = SP.officeid LEFT JOIN so_floor SF ON SL.floorid = SF.id LEFT JOIN so_officelocations SOL ON SL.location_id = SOL.id WHERE SL.id NOT IN (SELECT DISTINCT SRR.locationid FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startTime+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endTime+"'))) AND SL.rooms_from = 1 AND SL.space_status = 1 AND SP.userid = '"+userUcGuid+"' ";
  }
  else {
    var query = "SELECT SL.* FROM so_location SL INNER JOIN so_people SP ON SL.officeid = SP.officeid LEFT JOIN so_floor SF ON SL.floorid = SF.id LEFT JOIN so_officelocations SOL ON SL.location_id = SOL.id WHERE SL.rooms_from = 1 AND SL.space_status = 1 AND SP.userid = '"+userUcGuid+"' ";
  }

  if(parseInt(officeId)) {
    query += " AND SOL.id = "+parseInt(officeId); 
  }

  if(parseInt(floorId)) {
    query += " AND SF.id = "+parseInt(floorId); 
  }

  if(parseInt(people)) {
    query += " AND SL.capacity = "+parseInt(people); 
  }

  if(spaceType.trim()) {
    query += " AND SL.space_type = '"+spaceType.trim()+"' "; 
  }

  if(amenities) {
    amenities.forEach(function(value){
      query += " AND SL.amenities LIKE '%"+value+"%' "; 
    });
  }
  
  var request = new sql.Request(cp);
  request.query(query, function(error, result) {
    if (error) {
      res.json(error);
    } else {
      request.query("SELECT * FROm so_amenities where am_status = 1", function(amenitiesError, amenitiesResult) {
        if (amenitiesError) {
          request.query("SELECT * FROM so_room_reservation WHERE ((CONVERT(VARCHAR, time , 126) LIKE '"+date+"%') OR (CONVERT(VARCHAR, endtime , 126) LIKE '"+date+"%'))", function(reservationError, reservationData) {
            if (reservationError) {
              res.json({data: result,reservationData: [],amenitiesData:[], message: "success"});
            } else {
              res.json({data: result,reservationData: reservationData,amenitiesData:[], message: "success"});
            }
          });
        } else {
          request.query("SELECT * FROM so_room_reservation WHERE ((CONVERT(VARCHAR, time , 126) LIKE '"+date+"%') OR (CONVERT(VARCHAR, endtime , 126) LIKE '"+date+"%'))", function(reservationError, reservationData) {
            if (reservationError) {
              res.json({data: result,reservationData: [],amenitiesData:amenitiesResult, message: "success"});
            } else {
              res.json({data: result,reservationData: reservationData,amenitiesData:amenitiesResult, message: "success"});
            }
          });
        }        
      });
    }
  });

});

module.exports = router;