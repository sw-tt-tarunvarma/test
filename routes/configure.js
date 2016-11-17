var express  = require('express');
var session  = require('express-session');
var router   = express.Router();
var request  = require('request');

/**
  * @module : Notification Configuration
  * @desc   : list configured notification
  * @return : Return configuration list
  * @author : Softweb solutions
*/
router.get('/notification',function(req,res){

  var requestapi = new sql.Request(cp);
  var configure_result = {};
  
  requestapi.query("SELECT * FROM so_notification_configure", function(err, result) {
    if(err)
    {
      res.json({"status":false,"data":null,"message":err.message,"code":err.statusCode})  
    }
    else
    {
      if(result[0]!=undefined)
      {
        total = result.length;    
        for(var loop=0;loop<total;loop++)
        {  
            result.notification_name       = result[loop].Name;
            result.notification_frequency  = result[loop].Frequency;
            result.notification_duration   = result[loop].Duration;
        }      
        res.json({"status":true,"data":{"notification":result},"message": "Success","code": 200})  
      }
      else
      {
        res.json({"status":false,"data":null,"Message":"Data not available","code": 200})  
      }
    } 
  });
});

/**
  * @module : Notification Configuration
  * @desc   : add configured notification
  * @return : Return add notification configuration
  * @author : Softweb solutions
*/
router.get('/add_notification',function(req,res){

  var requestapi = new sql.Request(cp);
  request.query("INSERT INTO so_notification_configure(Name,Frequency,Duration,timestamp) VALUES ('"+Name+"','"+Frequency+"','"+Duration+"','"+timestamp+"')", function(err, result) {
    if(err)
    {
      res.json({"status":false,"data":null,"message":err.message,"code":err.statusCode});
    }
    else
    {
      res.json({"status":true,"data":null,"code":200});
    }
  });            
});

module.exports = router;