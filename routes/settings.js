var express   = require('express');
var fs        = require('fs');
var router    = express.Router();

/**
  * @module : Setting 
  * @desc   : Get reference sessonr 
  * @return : Return list sensor
  * @author : Softweb solutions
*/
router.get('/get', function (req, res) {
  var request = new sql.Request(cp);
  request.query("SELECT * FROM iot_refSensorThreshold",
  function(err, result){
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
      res.json({"data": result});
    }
  });
});

/**
  * added by JJ<jeel.joshi@softwebsolutions.com>
  * @module : Setting 
  * @desc   : Get Logo
  * @return : Return Logo data
  * @author : Softweb solutions
*/
router.post('/getLogo', function (req, res) {
  var userid = req.body.userid;
  /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > get Office Logo */
  var request = new sql.Request(cp);
  
  request.query("SELECT SOS.* FROM so_officesettings SOS WHERE companyid = (SELECT DISTINCT officeid FROM so_people WHERE userid = '"+userid+"')",
  function(err, result) {
    if (err) {
      res.json(err);
      res.end();
    }
    else {
      res.json({"data": result});
    }
  });
});

//added by JJ<jeel.joshi@softwebsolutions.com>
router.post('/addLogo', function (req, res) {
  var imagedata = req.body;
  var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var modified = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var userid = req.body.userid;
 if(imagedata.mainLogo.logoImage) {
        var filename  = imagedata.mainLogo.logoImage.filename;
        var image  = imagedata.mainLogo.logoImage.base64;
        var ext = filename.split(".");
        var timestamp = Math.floor(new Date() / 1000);
      //  var newFileName = 'app/logo_'+ timestamp +"."+ext[ext.length-1];
        var newFileName = 'app/'+ filename ;
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
      var request = new sql.Request(cp);
       /* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > get Office id */
      console.log("SELECT DISTINCT officeid FROM so_people WHERE userid = '"+userid+"'");
      request.query("SELECT DISTINCT officeid FROM so_people WHERE userid = '"+userid+"'", function(error, result) {
        if (error) {
          res.json(error);
        } else {
          if(result.length)
          {
            var id = result[0].officeid;   
          }
    
          request.query("SELECT companyid FROM so_officesettings WHERE companyid = '"+id+"'", function(error1, result1) {
              if (error1) {
                res.json(error1);
              } else {
                if(result1.length)
                {
          console.log('update so_officesettings set logo="'+filename+'" WHERE companyid='+id+'');
    request.query("update so_officesettings set logo='"+filename+"' WHERE companyid="+id, function(err, result2) {
              if (err) {
                res.json(err);
              } else {
                res.json({status:"true",message: "Logo updated successfully!","data":filename});
              }
            });
          }
          else {
            request.query("INSERT INTO so_officesettings (userid, companyid, logo, createddate, modifieddate) VALUES ('"+userid+"',"+id+",'"+filename+"','"+created+"','"+modified+"')", function(error3, result3) {
              if (error3) {
                res.json(error3);
              } else {
                res.json({message: "Logo uploaded successfully!"});
              }
            });
          }
                
              }
            });
          //console.log(id);
           
        }
      });
});

/**
  * added by JJ<jeel.joshi@softwebsolutions.com>
  * @module : Setting 
  * @desc   : Get Brandingtext
  * @return : Return brandingtext data
  * @author : Softweb solutions
*/
router.post('/getBrandingText', function (req, res) {
  var userid = req.body.userid;
  
  var request = new sql.Request(cp);
  console.log("SELECT DISTINCT officeid FROM so_people WHERE userid = '"+userid+"'");
      request.query("SELECT DISTINCT officeid FROM so_people WHERE userid = '"+userid+"'", function(error, result) {
        if (error) {
          res.json(error);
        } else {
          if(result.length)
          {
            var id = result[0].officeid;   
          }
  request.query("SELECT brandingtext FROM so_officesettings WHERE companyid = '"+id+"'",
  function(err, result1) {
    if (err) {
      res.json(err);
    }
    else {
      res.json({"data": result1});
    }
  });
}
});
    });

//added by JJ<jeel.joshi@softwebsolutions.com>
router.post('/addBrandingText', function (req, res) {
  var ischecked = req.body.toggle;
  var officeid = req.body.officeid;
  var userid = req.body.userid;
  var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var modified = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  if(ischecked == true){
    var toggle = 0;
  } else {
    var toggle = 1;
  }
  var request = new sql.Request(cp);
  
      request.query("SELECT brandingtext FROM so_officesettings WHERE companyid = '"+officeid+"'", function(error1, result1) {
          if (error1) {
            res.json(error1);
          } else {
            if(result1.length)
            {
              request.query("update so_officesettings set brandingtext='"+toggle+"' WHERE companyid="+officeid, function(err, result2) {
              if (err) {
                res.json(err);
              } else {
                res.json({status:"true",message: "Brandingtext updated successfully!"});
              }
              });
            }
            else {
            request.query("INSERT INTO so_officesettings (userid,companyid,createddate,modifieddate,brandingtext) VALUES ('"+userid+"','"+officeid+"','"+created+"','"+modified+"','"+toggle+"')", function(error3, result3) {
              if (error3) {
                res.json(error3);
              } else {
                res.json({message: "Brandingtext inserted successfully!"});
              }
            });
          }                
          }

            });
        });

//added by JJ<jeel.joshi@softwebsolutions.com>
router.post('/getAbandoneMeeting', function (req, res) {
  var userid = req.body.userid;
  
  var request = new sql.Request(cp);
        console.log("SELECT DISTINCT officeid FROM so_people WHERE userid = '"+userid+"'");
            request.query("SELECT DISTINCT officeid FROM so_people WHERE userid = '"+userid+"'", function(error, result) {
              if (error) {
                res.json(error);
              } else {
                if(result.length)
                {
                  var id = result[0].officeid;   
                }
        request.query("SELECT abandoned_meeting FROM so_officesettings WHERE companyid = '"+id+"'",
        function(err, result1) {
          if (err) {
            res.json(err);
          }
          else {
            res.json({"data": result1});
          }
        });
      }
      });
  });

//added by JJ<jeel.joshi@softwebsolutions.com>
router.post('/addAbandonedMeeting', function (req, res) {
  var toggle = req.body.cancel_meeting;
  if(toggle == null) {
    toggle = 8;
  }
  var officeid = req.body.officeid;
  var userid = req.body.userid;
  var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var modified = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
 
  var request = new sql.Request(cp);
  
    request.query("SELECT abandoned_meeting FROM so_officesettings WHERE companyid = '"+officeid+"'", function(error1, result1) {
        if (error1) {
          res.json(error1);
        } else {
            if(result1.length)
            {
              request.query("update so_officesettings set abandoned_meeting='"+toggle+"' WHERE companyid="+officeid, function(err, result2) {
              if (err) {
                res.json(err);
              } else {
                res.json({status:"true",message: "Abandoned meeting updated successfully!"});
              }
              });
            }
            else {
            request.query("INSERT INTO so_officesettings (userid,companyid,createddate,modifieddate,abandoned_meeting) VALUES ('"+userid+"','"+officeid+"','"+created+"','"+modified+"','"+toggle+"')", function(error3, result3) {
              if (error3) {
                res.json(error3);
              } else {
                res.json({message: "Abandoned meeting inserted successfully!"});
              }
            });
          }                
        }
    });
});


/**
  * @module : Setting 
  * @desc   : Update setting
  * @return : Return Update setting
  * @author : Softweb solutions
*/
router.post('/updateSetting', function (req, res) {
  
  var ID    = req.body.Id;
  var DeviceId  = req.body.DeviceId;
  var SensorId  = req.body.SensorId;
  var SensorName    = req.body.SensorName;
  var SensorType = req.body.SensorType;
  var MinThreshold = req.body.MinThreshold;
  var MaxThreshold = req.body.MaxThreshold;
  var ThresholdStartTime = req.body.ThresholdStartTime;
  var ThresholdEndTime = req.body.ThresholdEndTime;
  
  if(DeviceId!='' && DeviceId!=null)
    var did = "DeviceId = '"+DeviceId+"',";
  else
    var did = "DeviceId = '',";

  if(SensorId!='' && SensorId!=null)
    var sid = "SensorId = '"+SensorId+"',";
  else
    var sid = "SensorId = '',";

  if(SensorName!='' && SensorName!=null)
    var sname = "SensorName = '"+SensorName+"',";
  else
    var sname = "SensorName = '',";

  if(SensorType!='' && SensorType!=null)
    var stype = "SensorType = '"+SensorType+"',";
  else
    var stype = "SensorType = '',";

  if(MinThreshold!='' && MinThreshold!=null)
    var minhold = "MinThreshold = '"+MinThreshold+"',";
  else
    var minhold = "MinThreshold = '',";

  if(MaxThreshold!='' && MaxThreshold!=null)
    var maxhold = "MaxThreshold = '"+MaxThreshold+"',";
  else
    var maxhold = "MaxThreshold = '',";

  if(ThresholdStartTime!='' && ThresholdStartTime!=null)
    var Tstart = "ThresholdStartTime = '"+ThresholdStartTime+"',";
  else
    var Tstart = "ThresholdStartTime = 'null',";

  if(ThresholdEndTime!='' && ThresholdEndTime!=null)
    var Tend = "ThresholdEndTime = '"+ThresholdEndTime+"',";
  else
    var Tend = "ThresholdEndTime = 'null',";
  
  var request = new sql.Request(cp);
  var update_statement = did+sid+sname+stype+minhold+maxhold+Tstart+Tend;
  var res_val = update_statement.slice(0,update_statement.length-1);
  request.query("UPDATE iot_refSensorThreshold set "+res_val+" WHERE Id ="+ID, 
  function(err, result){
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


/**
  * @module : Setting 
  * @desc   : Delete sensor
  * @return : Return Delete sensor response
  * @author : Softweb solutions
*/
router.post('/delete', function (req, res) {
  var ID = req.body.Id;
  var request = new sql.Request(cp);
  request.query("DELETE FROM iot_refSensorThreshold where Id="+ID+"", function(err, result) {
    if(err)
    {
      res.json(err);
    }
    else
    {
      res.json({"data": "", message: "sucess"});
    }
  });
});

  /**
  * @module : Office 
  * @desc   : Update integrations
  * @return : Return add office
  * @author : Softweb solutions JJ <jeel.joshi@softwebsolutions.com>
  */
  router.post('/scheduleMeetingConnect', function (req, res) {
    //var schedule_meeting = req.body.meeting.name;
    /*var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var modified = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');*/
    var userid = req.body.userid;
    console.log(userid);
      var request = new sql.Request(cp);
      
      request.query("UPDATE so_schedulemeetings SET schedule_meeting = '3' WHERE userid = " + userid, function(error, result) {
      if (error) {
          res.json(error);
        } else {
            res.json({"data": result, message: "success"});
        }
      });
});




module.exports = router;