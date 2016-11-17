var express = require('express');
var router 	= express.Router();

/**
  * @module : Company 
  * @desc   : get username if in session
  * @return : Return user list
  * @author : Softweb solutions
*/
router.get('/', function (req, res) {
	var request = new sql.Request(cp);
	request.query("SELECT * FROM so_company", function(err, result) {
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
  * @module : Company 
  * @desc   : get Company list
  * @return : Return company list
  * @author : Softweb solutions
*/
router.get('/getCompany/:companyid', function (req, res) {
	var companyid = req.params.companyid;
 	var request = new sql.Request(cp);
    request.query("SELECT * FROM so_company WHERE id = "+companyid, function(err, result) {
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
  * @module : Company 
  * @desc   : Add new company
  * @return : Return company detail
  * @author : Softweb solutions
*/
router.post('/insertCompany', function (req, res) {
	var companyname = req.body.companyname;
	var companyaddress = req.body.companyaddress;
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	var timestamp = yyyy+'-'+mm+'-'+dd;
	  
	var request = new sql.Request(cp);
	request.input('companyname',sql.VarChar(50));
	request.input('companyaddress',sql.VarChar(50));
	request.input('timestamp',sql.Int);
	request.query("INSERT INTO so_company (companyname, companyaddress, timestamp) VALUES ('"+companyname+"','"+companyaddress+"', '"+timestamp+"')", function(err, result) {
  	if(err)
   	{
   		res.json(err);
   		res.end();
   	}
   	else
   	{
   		res.json("Company Added successfully");
   	}
	});
});


/**
  * @module : Company 
  * @desc   : Update new company
  * @return : Return Update Company
  * @author : Softweb solutions
*/
router.post('/editCompany', function (req, res) {
	var id = req.body.id;
	var companyname = req.body.companyname;
	var companyaddress = req.body.companyaddress;
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	var timestamp = yyyy+'-'+mm+'-'+dd;
	  
	var request = new sql.Request(cp);
	request.input('companyname',sql.VarChar(50));
	request.input('companyaddress',sql.VarChar(50));
	request.input('timestamp',sql.Int);
	request.query("UPDATE so_company SET companyname = '"+companyname+"', companyaddress = '"+companyaddress+"', timestamp = '"+timestamp+"' WHERE id = "+id, function(err, result) {
     	if(err)
     	{
     		res.json(err);
     		res.end();
     	}
     	else
     	{
     		res.json("Company Edited successfully");
     	}
  	});
});


/**
  * @module : Company 
  * @desc   : Delete new company
  * @return : Return Delete Company
  * @author : Softweb solutions
*/
router.delete('/deleteCompany/:companyid', function (req, res) {
	var companyid = req.params.companyid;
	var request = new sql.Request(cp);
  	request.query("DELETE FROM so_company WHERE id = "+companyid, function(err, result) {
        if(err)
        {
        	res.json(err);
         	res.end();
        }
        else
        {
			res.json("Company Deleted successfully");
        }
  	});
});

module.exports = router;