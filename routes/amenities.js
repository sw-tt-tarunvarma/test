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
var Guid      = require('guid');


/**
* @module : Amenities
* @desc   : Load amenities view
* @return : Return amenities view
* @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/**
* @module : Amenities
* @desc   : Get All Amenities
* @return : Return all amenities
* @author : Softweb solutions - Alpeshsinh Solanki
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
* @module : Amenities
* @desc   : Get All Room
* @return : Return all room
* @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/allRoom/', function (req, res) {
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_location", function(error, result) {
    if (error) {
      res.json(error);
    } 
    else {      
      res.json({"data": result});
    }
  });
});


/**
  * @module : Amenities
  * @desc   : Add Amenities into location 
  * @return : Return id
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/editRoomAmenities', function (req, res) {
  var id= req.body.id;
  var amenities = req.body.amenities;
  var request = new sql.Request(cp);
  request.query("UPDATE so_location SET amenities = '" + amenities + "' WHERE id = " + id, function(err, result) {
    if (err) {
      res.json(err);
    } else {
      res.json({data: result, message: "success"});
    }
  });
});

/**
  * @module : Amenities
  * @desc   : Add Amenities into location 
  * @return : Return id
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/addNewAmenities', function (req, res) {
  var amenities = req.body.amenities;
  var filename  = req.body.image.filename;
  var image  = req.body.image.base64;
  var ext = filename.split(".");
  var guid = Guid.raw();
  var date = new Date();
  var newFileName = 'amenities/amenities_'+ amenities +"."+ext[ext.length-1];
  var fd = fs.openSync('./public/images/'+newFileName, 'w');
  image  =  image.replace(/^data:image\/\w+;base64,/, "");
  var buff = new Buffer(image,'base64');
  fs.write(fd, buff, 0, buff.length, 0, function(err,written){
    fs.closeSync( fd );
  });
  
  var request = new sql.Request(cp);
  request.query("INSERT INTO so_amenities (am_guid, amenities,am_image ,am_status, am_createddate) VALUES ('"+guid+"','"+amenities+"','"+newFileName+"',1, CURRENT_TIMESTAMP)", function(error, result) {
    if (error) {
      res.json(error);
    } else {
      res.json({data: result, message: "success"});
    }
  });
});

module.exports = router;