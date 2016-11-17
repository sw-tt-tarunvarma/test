var express   = require('express');
var fs        = require('fs');
var router    = express.Router();
var crypto      = require('crypto');
var commonConfig  = require("../commonConfig");

/**
  * @module : User profile
  * @desc   : get user detail
  * @return : Return user detail
  * @author : Softweb solutions
*/
router.get('/:id', function (req, res) {
  var peopleid = req.params.id;
  var request = new sql.Request(cp);
  request.query("SELECT * FROM so_people where id="+peopleid, function(err, result) {
    if(err)
    {
     res.json(err);
    }
    else
    {
      result[0].image = base_url+"images/"+result[0].image;
      res.json({"data":result, message: "sucess"});
    }
  });
});


/**
  * @module : User profile
  * @desc   : Update user profile
  * @return : Return update profile
  * @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
*/
router.post('/UpdateProfile', function (req, res) {
  var ID = req.body.id;
  var name  = req.body.name;
  var username  = req.body.username;
  var updateimage = "";
  var removelogo =req.body.isremoveProfileLogo;
  var timestamp = Math.floor(new Date() / 1000);
  var newFileName = '';
  if(req.body.image.filename != null)
  {
    var filename  = req.body.image.filename;
    var image  = req.body.image.base64;
    var ext = filename.split(".");
    timestamp = Math.floor(new Date() / 1000);
    newFileName = timestamp +"."+ext[ext.length-1];
    var fd = fs.openSync('./public/images/people/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
     // fs.closeSync( fd );
    });
  }
  var request = new sql.Request(cp);

  console.log(removelogo);

  if(removelogo == true)
  {
     request.query("UPDATE so_people set name ='"+name+"',username ='"+username+"',image='',TimeStamp="+timestamp+" WHERE id ="+ID,
  function(err, result)
  {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
     // res.json({"data":"0"});
      res.json({"data":0,mesaage:"Profile Updated successfully"});
    }
  });
  }
  else
  {
     request.query("UPDATE so_people set name ='"+name+"',username ='"+username+"',image='"+newFileName+"',TimeStamp="+timestamp+" WHERE id ="+ID,
  function(err, result)
  {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {
     res.json({"data":1,"mesaage":"Profile Updated successfully"});
    }
  });
  }



 
});

/**
  * @module : User profile
  * @desc   : Get user profile logo
  * @return : Return update profile
  * @author : Softweb solutions - Dt <dhaval.thaker@softwebsolutions.com>
*/

router.post('/getprofileLogo', function (req, res) {
  var userid = req.body.userid;
  var request = new sql.Request(cp);
  request.query("SELECT userid FROM so_people WHERE userid = '"+userid+"'", function(error1, result1) {
      if(error1)
      {
      }
      else
      {  
        var id = 0;
        if(result1.length)
          {
            id = result1[0].userid;   
          }
  request.query("SELECT * FROM so_people WHERE userid = '"+userid+"'",
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
}
});
});

/**
  * @module : User profile
  * @desc   : Remove user profile logo
  * @return : Return update profile
  * @author : Softweb solutions - Dt <dhaval.thaker@softwebsolutions.com>
*/

router.post('/removeProfile', function (req, res) {
  var userid = req.body.userid;
  var request = new sql.Request(cp);
  
   request.query("UPDATE so_people set  image=null WHERE userid ='"+userid+"'",
  function(err, result)
  {
    if(err)
    {
      res.json(err);
      res.end();
    }
    else
    {

      //res.json(result);
      res.json("Profile Removed successfully");
      
    }
  });

});

/**
  * @module : User profile
  * @desc   : Update user password
  * @return : Return update password
  * @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
*/
router.post('/UpdatePassword', function (req, res) {
  var userid = req.body.userid;
  var oldpassword = req.body.oldpassword;
  var password = req.body.newpassword;
  var request = new sql.Request(cp);
  var shasum = crypto.createHash('sha1');
  var shasumold = crypto.createHash('sha1');
   shasum.update(password);
   shasumold.update(oldpassword);
   password = shasum.digest('hex');
   oldpassword = shasumold.digest('hex');

  console.log("SELECT userpassword FROM so_people where userid='"+userid+"' and userpassword = '"+oldpassword+"'")
  request.query("SELECT userpassword FROM so_people where userid='"+userid+"' and userpassword = '"+oldpassword+"'", function(err, result)
   {
   
    if(err)
    {
      console.log('if');
      console.log(err);
      res.json(err);
      res.end();
    }
    else
    {
      if(result.length == 0)
       { 
          
          res.status(404).send('Password does not  match');
       }
       else
       {
        request.query("UPDATE so_people set userpassword = '"+password+"' WHERE userid ='"+userid+"'",
        function(err, result)
        {

        if(err)
        {
          res.json("Password does not  match");
          res.json(err);
        }
        else
        {
          request.query("UPDATE UserCredentials set uc_password = '"+password+"' WHERE uc_appuserguid ='"+userid+"'",
          function(err, result)
          {
            if(err)
            {
              res.json(err);
              res.end();
            }
            else
            {
              res.json("Password reset successfully");
            }
          });
        }
      });
   
    }

  }


  });

 
});

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Update Space */
/**
  * @module : Location
  * @desc   : Update Space
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/updatePeople', function (req, res) {
  var id = req.body.id;
  var name = req.body.name;
  var locationId = req.body.location_id;
  var capacity = req.body.capacity;
  var spaceType = req.body.space_type;
  var size = req.body.size;
  var notes = req.body.notes;
  var status = req.body.status;
  if(req.body.newimage) {
    var filename  = req.body.newimage.filename;
    var image  = req.body.newimage.base64;
    var ext = filename.split(".");
    var timestamp = Math.floor(new Date() / 1000);
    var newFileName = 'space/space_'+ timestamp +"."+ext[ext.length-1];
    var fd = fs.openSync('./public/images/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
      fs.closeSync( fd );
    });
    if(req.body.image) {
      if (fs.existsSync('./public/images/'+req.body.image)) {
        fs.unlinkSync('./public/images/'+req.body.image);
      }
    }      
  }
  else {
    var newFileName = req.body.image;
  }

  var request = new sql.Request(cp);
  request.query("UPDATE so_people SET name = '"+name+"', status = "+status+", image = '"+newFileName+"', notes = '"+notes+"',capacity = "+capacity+", location_id = '"+locationId+"', space_type = '"+spaceType+"', size = '"+size+"', rooms_from = 1 WHERE id="+id, function(error, result) {
    if (error) {
      res.json(error);
    } else {
      res.json({data: result, message: "success"});
    }
  });
});

module.exports = router;