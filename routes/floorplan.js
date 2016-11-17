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
var nodemailer = require('nodemailer');
var commonConfig  = require("../commonConfig");




/**
  * @module : Location
  * @desc   : Add new location 
  * @return : Return location detail response
  * @author : Softweb solutions
  */
  router.post('/insertfloormap', function (req, res) {

      var x1 = req.body.floordata.x1;
      var y1 = req.body.floordata.y1;
      var x2 = req.body.floordata.x2;
      var y2 = req.body.floordata.y2;
      var color =req.body.floordata.color;
      var stroke = req.body.floordata.stroke;
      var room = req.body.floordata.spaceid;
      var floorid = req.body.floorid;

      var request = new sql.Request(cp);
     console.log("INSERT INTO so_floorPlan (roomId, imagePath,x1, y1, x2, y2, color,createddate,floorid) VALUES ('"+room+"','test.jpg','"+x1+"','"+y1+"', '"+x2+"','"+y2+"','"+color+"',CURRENT_TIMESTAMP,'"+floorid+"')");
    
      request.query("INSERT INTO so_floorPlan (roomId, imagePath,x1, y1, x2, y2, color, createddate,floorid) VALUES ('"+room+"','test.jpg','"+x1+"','"+y1+"', '"+x2+"','"+y2+"','"+color+"',CURRENT_TIMESTAMP,'"+floorid+"')", function(err, result) {
        if(err)
        {
          res.json(err);
      }
      else
      {
          res.json({data: null, message: "success"});
      }
  });
  });

router.get('/deleteFloor/:id', function (req, res) {

  var id = req.params.id;
  if(id) {
    var request = new sql.Request(cp);
    request.query("DELETE FROM so_floorPlan WHERE id = "+id, function(error, result) {
      if (error) {
        res.json(error);
      } else {
        res.json({data: result, message: "success"});
      }
    });
  }
  else {
    res.json({message: "Invalid space Id."});
  }    
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get User's All Space */
/**
  * @module : Location
  * @desc   : Get User's All Space
  * @return : Return User's All Space
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.get('/floordata/:id', function (req, res) {
  var locationid = req.params.id;
  var request = new sql.Request(cp);

  request.query("SELECT loc.name,fl.* FROM so_floorPlan as fl INNER JOIN so_location as loc ON fl.roomid = loc.id where loc.floorid = '"+locationid+"' order by id asc", function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      res.json(result);     
    }
  });
});

router.get('/getFloorImage/:floorid', function (req, res) {
  var floorid = req.params.floorid;
  var request = new sql.Request(cp);

  request.query("select floorplan from so_floor where id = '"+floorid+"'", function(err, result) {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      res.json(result);     
    }
  });
});

router.post('/checkFloorAvailability', function (req, res) {
  console.log(req.body);
  var floorid = req.body.floor;
  var roomid = req.body.room;

  console.log(floorid);
  console.log(roomid);
  
 /* if (id > 0) {
    var query = ";
  }
  else {
    var query = "SELECT loc.* FROM so_location loc WHERE name = '"+name+"' ANd location_id = '"+locationId+"'";
  }*/

  sql.connect(dbconfig, function(err) {
    var request = new sql.Request(cp);

    console.log("SELECT * FROM so_floorPlan  WHERE roomId = '"+roomid+"' ANd floorid = '"+floorid+"'");
    request.query("SELECT * FROM so_floorPlan  WHERE roomId = '"+roomid+"' ANd floorid = '"+floorid+"' ", function(error, result) {
      if(error) {
        res.json(error);
      }
      else {
        res.json({data: result, message: "success"});
      }
    });
  });
});


module.exports = router;