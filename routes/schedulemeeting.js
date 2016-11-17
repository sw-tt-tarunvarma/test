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
    res.render('schedule_meeting', { title: 'Softweb Smart Office', message: "IOTWEBAPP" });
  });


/**
  * @module : Office 
  * @desc   : Insert office
  * @return : Return add office
  * @author : Softweb solutions JJ <jeel.joshi@softwebsolutions.com>
  */
  router.post('/schedulemeeting', function (req, res) {
    var schedule_meeting = req.body.meeting.name;
    var created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var modified = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var userid = req.body.userid;
      var request = new sql.Request(cp);
      request.query("INSERT INTO so_schedulemeetings (userid, companyid, schedule_meeting, createddate, modifieddate) VALUES ('"+userid+"',"+1+",'"+schedule_meeting+"','"+created+"','"+modified+"')", function(error, result) {
        if (error) {
          res.json(error);
        } else {
            res.json({"data": result, message: "success"});
        }
      });
});

  module.exports = router;