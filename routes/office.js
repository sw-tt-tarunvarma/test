var express   = require('express');
var fs        = require('fs');
var router    = express.Router();

/**
  * @module : Office 
  * @desc   : Get list of office
  * @return : Return office list
  * @author : Softweb solutions
*/
router.get('/', function (req, res) {
  res.render('office', { title: 'Softweb Smart Office', message: "IOTWEBAPP" });
});


/**
  * @module : Office 
  * @desc   : Get all office based on office id
  * @return : Return office detail
  * @author : Softweb solutions
*/
router.get('/getalloffices/:companyid', function (req, res) {
	
	var companyid = req.params.companyid;
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_office where companyid = '"+companyid+"'", function(err, result) {
    if(err)
    {
    	res.json(err);
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
  * @desc   : Get office based on people id
  * @return : Return office detail
  * @author : Softweb solutions - JJ<jeel.joshi@softwebsolutions.com>
*/
router.post('/getOfficeName', function (req, res) {
  
  var userid = req.body.userid;
  var au_isadmin = req.body.au_isadmin;
  var companyid = req.body.companyid;

  console.log(req.body);
  console.log('officdata');
  

  if(au_isadmin == 'false')
  {
    var query = " select so.id, so.OfficeName,p.email from so_people as p INNER JOIN so_office so ON p.officeid = so.id where p.officeid = '"+companyid+"' and p.role = 'Admin'";
  }
  else {
    var query = "SELECT so.id, so.OfficeName,sp.email,sp.name FROM so_people sp INNER JOIN so_office so ON sp.officeid = so.id WHERE sp.userid = '"+userid+"' ";
  }

  sql.connect(dbconfig, function(err) {

    var request = new sql.Request(cp);

    request.query(query, function(error, result) {
      if(err)
    {
      res.json(err);
    }
    else
    {
        res.json(result);
    }
    });
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
  * @author : Softweb solutions JJ <jeel.joshi@softwebsolutions.com>
*/
router.post('/insertOffice', function (req, res) {
  var officename = req.body.office.officename;
  var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  var modified = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  var userid = req.body.userid;
  //console.log("userid==="+userid);return false;
  var request = new sql.Request(cp);
  request.input('OfficeName',sql.VarChar(50));

  request.query("INSERT INTO so_office (userid, OfficeName, OfficeAddress, Notes, Image, createddate, modifieddate) VALUES ('"+userid+"', '"+officename+"', "+null+", "+null+", "+null+", '"+created+"', '"+modified+"')", function(err, result) {
    if(err)
    {
      res.json(err);
    }
    else
    {
      console.log("SELECT Id FROM so_office WHERE userid = '"+userid+"' ORDER BY Id DESC");
      request.query("SELECT Id FROM so_office WHERE userid = '"+userid+"' ORDER BY Id DESC", function(error, result1) {
      if(error)
      {
      }
      else
      {  
        var id = 0;
        if(result1.length)
          {
            id = result1[0].Id;   
          }
        console.log("UPDATE so_people SET officeid = "+id+" WHERE userid = '"+userid+"'");
        request.query("UPDATE so_people SET officeid = "+id+" WHERE userid = '"+userid+"'", function(err1, result2) {
              if (err1) {
                console.log(err1);
              } else {
                
              }
        });
      }
    });
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

module.exports = router;