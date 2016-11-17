var express   = require('express');
var fs        = require('fs');
var router    = express.Router();

/**
  * @module : Space 
  * @desc   : Get list of office
  * @return : Return office list
  * @author : Softweb solutions
  */
  router.get('/', function (req, res) {
    res.render('space', { title: 'Softweb Smart Office', message: "IOTWEBAPP" });
  });


/**
  * @module : Space 
  * @desc   : Insert space
  * @return : Return add space
  * @author : Softweb solutions JJ <jeel.joshi@softwebsolutions.com>
  */
  router.post('/addSpaces', function (req, res) {
    var spacedata = req.body;
    var officeid = req.body.officeid;
    var spaces = spacedata.spaceData;
   // console.log(spaces);return false;
    var userid = req.body.userid;

    /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Add Multiple Records in 1 Request */
    var query = "";
    for (var prop in spaces) {
      var name = spaces[prop].name;
      if(spaces[prop].newimage) {
        var filename  = spaces[prop].newimage.filename;
        var image  = spaces[prop].newimage.base64;
        var ext = filename.split(".");
        var timestamp = new Date().getTime();
        var newFileName = 'space/space_'+ timestamp +"."+ext[ext.length-1];
        var fd = fs.openSync('./public/images/'+newFileName, 'w');
        image  =  image.replace(/^data:image\/\w+;base64,/, "");
        var buff = new Buffer(image,'base64');
        fs.write(fd, buff, 0, buff.length, 0, function(err,written){
          //fs.closeSync( fd );
        });
      }
      else {
        var newFileName = '';
      }
      if(name != undefined) {
        query += "INSERT INTO so_location (name, image,officeid, rooms_from,space_status) VALUES ('"+name+"','"+newFileName+"',"+officeid+","+1+","+1+");"
      }
    }
    console.log(query);
    if (query && query.trim()) {
      var request = new sql.Request(cp);
      request.query(query, function(error, result) {
        if (error) {
          res.json({"success": false, message: error});
        } else {
          res.json({"success": true,"data": result, message: "spaces added"});
        }
      });
    }
    else {
      res.json({"success": false, message: 'Something went wrong. Please try again.'});
    }
    
  });

  module.exports = router;