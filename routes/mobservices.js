var express  = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var sql = require('mssql');
var crypto = require('crypto');
var UUid = require('uuid');
var moment    = require('moment');
var nodemailer = require('nodemailer');
var commonConfig  = require("../commonConfig");
var fs        = require('fs');
var csv = require("fast-csv");
var Guid      = require('guid'); 

var router = express.Router();

var baseUrl = "http://smartoffice.softwebopensource.com/";

dbconfigoffice = {
    user: 'sa',
    password: 'softweb#123',
    server: '115.115.91.49', // You can use 'localhost\\instance' to connect to named instance
    database: 'smartoffice_live',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};



dbconfig = {
    user: 'sa',
    password: 'softweb#123',
    server: '115.115.91.49', // You can use 'localhost\\instance' to connect to named instance
    database: 'SoftwebHOQ',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};


var dbConn = new sql.Connection(dbconfig);

dbConn.connect().then(function() {

router.route('/SoftwebHOQGetUsers').get(function (req, res) {
    
    var request = new sql.Request(dbConn);

    request.query('select * from AppUser', function(err, recordsets) {
        res.json({"Records": recordsets});
    });

});

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Import User Using CSV */
/**
  * @webservice  : SoftwebHOQAddUsercsv
  * @desc   : Import User Using CSV
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/SoftwebHOQAddUsercsv', function (req, res) {
    var csvFile = req.body.csvFile;
    var officeId = req.body.officeId;
    var password = req.body.password;
    if (csvFile == undefined) {
        res.json({"type":"error","status":false,"message": "Please Upload CSV File."});
        return false;
    } 
    else if (!csvFile || !csvFile.filename || csvFile.filename == '') {
        res.json({"type":"error","status":false,"message": "CSV File is not valid."});
        return false;
    }

    if (password == undefined) {
        res.json({"type":"error","status":false,"message": "Please set password."});
        return false;
    } 
    else if (!password || password == '') {
        res.json({"type":"error","status":false,"message": "Password is not valid."});
        return false;
    }

    var filename  = req.body.csvFile.filename;
    var image  = req.body.csvFile.base64;
    var ext = filename.split(".");
    var timestamp = Math.floor(new Date() / 1000);
    var newFileName = filename+'_'+timestamp ;
    var fd = fs.openSync('./public/images/membercsv/'+newFileName, 'w');
    image  =  image.replace(/^data:image\/\w+;base64,/, "");
    var buff = new Buffer(image,'base64');
    fs.write(fd, buff, 0, buff.length, 0, function(err,written){
        //fs.closeSync( fd );
    });
    var stream = fs.createReadStream('./public/images/membercsv/'+newFileName);
    var fileBuffer =  fs.readFileSync('./public/images/membercsv/'+newFileName);
    to_string = fileBuffer.toString();
    split_lines = to_string.split("\n");
    var datacount = split_lines.length-1 - 1;
    var uniqueindex = 0; 
    console.log(datacount);
    csv.fromStream(stream, {headers : true})
    .on("data", function(data) {
        if (datacount <= 200) {
            console.log(data);
            console.log(validateEmail(data.email.trim()));
            if (data && data.name && data.name.trim() && data.email.trim() && validateEmail(data.email.trim())) {
                var au_companyguid = null;
                var au_email = data.email.trim();
                var au_firstname = data.name.trim();
                var au_lastname = data.name.trim();
                var au_rolename = "Member";
                var au_isadmin = "0";
                var au_statusguid = null;
                var au_createdby = null;
                var au_modifiedby = null;
                var au_createddate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                var au_modifieddate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

                var request = new sql.Request(dbConn);
                request.input("au_companyguid", null);
                request.input("au_email", au_email);
                request.input("au_firstname", au_firstname);
                request.input("au_lastname", au_lastname);
                request.input("au_rolename", au_rolename);
                request.input("au_isadmin", au_isadmin);
                request.input("au_statusguid", null);
                request.input("au_createdby", null);
                request.input("au_createddate", au_createddate);
                request.input("au_modifiedby", null);
                request.input("au_modifieddate", au_modifieddate);

                var uuid = UUid.v1();
                var webtoken = uuid.replace(/-/g, "");
                
                //resData.au_email = [];
                request.execute('AppUser_add', function(err, recordsets, returnValue, affected) {
                    console.log(err);
                    console.log(au_email);
                    console.log(recordsets);
                    if (recordsets[0][0].Status == 1 && recordsets[0][0].Status != -1 && returnValue == 0) {
                        console.log("In if");
                        var au_guid = recordsets[1][0]["au_guid"];
                        var shasum = crypto.createHash('sha1');
                        shasum.update(password);
                        var userpassword = shasum.digest('hex');
                        var credentialRequest = new sql.Request(dbConn);
                        credentialRequest.input("uc_appuserguid", au_guid);
                        credentialRequest.input("uc_password", userpassword);
                        credentialRequest.execute('UserCredentials_add', function(credentialErr, credentialResult, credentialReturnValue, credentialAffected) {
                            console.log(credentialResult);
                            if (credentialResult[0][0].STATUS == 1) {
                                saveUserInLocalSystem(data,officeId,au_guid,password);
                                uniqueindex++;
                            }
                        });
                    }
                })
            } 
        }
    })
    .on("end", function() {
        if (datacount > 200) {
            res.json({"type":"error","status":false,"message":"Csv should not contain more than 200 records"});
        }
        else {
             setTimeout(function() { 
                res.json({"type":"success","status":true,"message":"Member imported successfully."});
            }, 30000);
            
        }
    });
});



router.post('/SoftwebHOQAddUser', function (req, res) {

//var au_guid = req.body.au_guid;
var au_companyguid = req.body.data.au_companyguid;
var au_email = req.body.data.au_email;
var au_firstname = req.body.data.au_firstname;
var au_lastname = req.body.data.au_lastname;
var au_rolename = req.body.data.au_rolename;
var au_isadmin = req.body.data.au_isadmin;
var au_statusguid = req.body.data.au_statusguid;
var au_createdby = req.body.data.au_createdby;
var au_modifiedby = req.body.data.au_modifiedby;
var au_createddate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var au_modifieddate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

console.log(au_companyguid);
console.log(au_email);
console.log(au_firstname);
console.log(au_lastname);
console.log(au_rolename);
console.log(au_statusguid);
console.log(au_createdby);
console.log(au_createddate);
console.log(au_modifiedby);
console.log(au_modifieddate);

var request = new sql.Request(dbConn);

//request.input("au_guid", au_guid);
request.input("au_companyguid", null);
request.input("au_email", au_email);
request.input("au_firstname", au_firstname);
request.input("au_lastname", au_lastname);
request.input("au_rolename", au_rolename);
request.input("au_isadmin", au_isadmin);
request.input("au_statusguid", null);
request.input("au_createdby", null);
request.input("au_createddate", au_createddate);
request.input("au_modifiedby", null);
request.input("au_modifieddate", au_modifieddate);

var uuid = UUid.v1();

var webtoken = uuid.replace(/-/g, "");

request.execute('AppUser_add', function(err, recordsets, returnValue, affected) {

    console.log(recordsets); // count of recordsets returned by the procedure 
    console.log(recordsets.length); // count of recordsets returned by the procedure 
    console.log(recordsets[0].length); // count of rows contained in first recordset 
    console.log(returnValue); // procedure return value 
    console.log(recordsets.returnValue); // same as previous line 
    console.log(affected); // number of rows affected by the statemens 
    //console.log("GUID"+recordsets[1][0].au_guid)
    console.log("ST"+JSON.stringify(recordsets[0][0].Status))

    

    if(JSON.stringify(recordsets[0][0].Status) == -1)
    {
        res.json({"Status":false,"token":webtoken,"Error": "Record is already exist."});
    }
    else
    {
        res.json({"Status":true,"token":webtoken,"data":recordsets, "Message": "Record inserted successfully."});   
    }


  })


});

router.post('/SoftwebHOQCheckUser', function (req, res) {

var username = req.body.username;    
var password = req.body.password;   
var isgoogle = req.body.uc_isfromgoogle; 

if(password == undefined || password == '' || password == null)
{
    password = 'GOOGLE';
}
else
 {

var shasum = crypto.createHash('sha1');
        shasum.update(password);
        password = shasum.digest('hex');

}   

var uuid = UUid.v1();

var webtoken = uuid.replace(/-/g, "");

var request = new sql.Request(dbConn);


request.input("username", username);
request.input("uc_password", password);
request.input("uc_isfromgoogle", isgoogle);

request.execute('CheckUserName', function(err, recordsets, returnValue, affected) {
    console.log(recordsets)
    
    
    if(JSON.stringify(recordsets[0][0].Status) == -1)
    {
        res.json({"Status":false,"Error": "Authorize failed"});
    }
    else
    {   
        callinsert(webtoken,username);
        res.json({"token":webtoken,"Status":true,"Records": "Authorize successfully","data":recordsets});    
    }
});

});

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Create Login Webservice */
    /**
      * @webservice : login
      * @desc : authenticate user for mobile
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
 router.post('/SoftwebHOQCheckUserdevice', function (req, res) {    
        var username = req.body.username;
        var password = req.body.password;
        var deviceToken = req.body.device_token;
        var deviceType = req.body.device_type;
        /*var latitude = req.body.latitude;
        var longitude = req.body.longitude;*/
        var isgoogle = req.body.uc_isfromgoogle;


        if (username == undefined && password == undefined && deviceToken == undefined && deviceType == undefined && latitude == undefined && longitude == undefined) {
            res.json({"Status":false,"Error": "request is not valid."});
            return false;
        }

        if (username == undefined) {
            res.json({"Status":false,"Error": "'username' is not set in request."});
            return false;
        }    
        else if (username == '' || username == null || !username.trim()) {
            res.json({"Status":false,"Error": "'username' is not valid."});
            return false;
        }

        if (password == undefined) {
            res.json({"Status":false,"Error": "'password' is not set in request."});
            return false;
        }
        else if (password == '' || password == null || !password.trim()) {
            res.json({"Status":false,"Error": "'password' is not valid."});
            return false;
        }
        else {
            var shasum = crypto.createHash('sha1');
            shasum.update(password);
            password = shasum.digest('hex');
        }

        if (deviceToken == undefined) {
            res.json({"Status":false,"Error": "'deviceToken' is not set in request."});
            return false;
        }    
        else if (deviceToken == '' || deviceToken == null || !deviceToken.trim()) {
            res.json({"Status":false,"Error": "'deviceToken' is not valid."});
            return false;
        }

        if (deviceType == undefined) {
            res.json({"Status":false,"Error": "'deviceType' is not set in request."});
            return false;
        }    
        else if (deviceType != 'ios' && deviceType != 'android') {
            res.json({"Status":false,"Error": "'deviceType' is not valid."});
            return false;
        }

        /*if (latitude == undefined) {
            res.json({"Status":false,"Error": "'latitude' is not set in request."});
            return false;
        }    
        else if (latitude == '' || latitude == null || !latitude.trim()) {
            res.json({"Status":false,"Error": "'latitude' is not valid."});
            return false;
        }

        if (longitude == undefined) {
            res.json({"Status":false,"Error": "'longitude' is not set in request."});
            return false;
        }    
        else if (longitude == '' || longitude == null || !longitude.trim()) {
            res.json({"Status":false,"Error": "'longitude' is not valid."});
            return false;
        }*/

        var uuid = UUid.v1();
        var webtoken = uuid.replace(/-/g, "");
        var request = new sql.Request(dbConn);

        request.input("username", username);
        request.input("uc_password", password);
        request.input("uc_isfromgoogle", isgoogle);

        request.execute('CheckUserName', function(error, result, returnValue, affected) {
            console.log(result);
            if(result) {
                if(result[0][0].Status && result[0][0].Status == -1) {
                    res.json({"Status":false,"Error": "Please enter valid email address and Password"});
                }
                else {
                    callinsert(webtoken,username);

                    var dbConn = new sql.Connection(dbconfigoffice);
                    dbConn.connect().then(function () {
                        var request = new sql.Request(dbConn);

                        request.query("UPDATE so_people SET deviceid = '"+deviceToken+"', os = '"+deviceType+"' where userid = '"+result[0][0].uc_appuserguid+"' ")
                        .then(function (updateResult) {
                        })
                        .catch(function (error) {
                            console.log(error);
                        });

                        request.query("SELECT SP.*, SO.id as main_office_id, SO.OfficeName as main_office_name, SOL.id as office_location_id,  SOL.name as office_location_name FROM so_people SP LEFT JOIN so_office SO ON SO.Id = SP.officeid LEFT JOIN so_officelocations SOL ON SO.Id = SOL.companyid where SP.userid = '"+result[0][0].uc_appuserguid+"' ")
                        .then(function (userResult) {
                            console.log(userResult);
                            dbConn.close();
                            var userData = {};
                            //userData.token = webtoken;
                            if (userResult && userResult.length) {
                                userData.user_id = parseInt(userResult[0].id) ? parseInt(userResult[0].id) : '';
                                userData.username = userResult[0].username ? userResult[0].username : '';
                                userData.email = userResult[0].email ? userResult[0].email : '';
                                userData.name = userResult[0].name ? userResult[0].name : '';
                                userData.first_name = '';
                                userData.last_name = '';

                                if (userResult[0].image && userResult[0].image.trim()) {
                                    userResult[0].image = baseUrl +"images/people/"+ userResult[0].image;
                                }
                                userData.user_image = userResult[0].image ? userResult[0].image :'';
                                userData.office_id = parseInt(userResult[0].main_office_id) ? parseInt(userResult[0].main_office_id) :parseInt(0);
                                userData.main_office_name = userResult[0].main_office_name ? userResult[0].main_office_name :'';
                                userData.office_location_id = parseInt(userResult[0].office_location_id) ? parseInt(userResult[0].office_location_id) :parseInt(0);
                                userData.location_name = userResult[0].office_location_name ? userResult[0].office_location_name :'';

                                if (userResult[0].name) {
                                    var userName = userResult[0].name.split(" ");
                                    if (userName.length > 0) {
                                        if (userName.length == 2) {
                                            userData.first_name = userName[0];
                                            userData.last_name = userName[1];
                                        }
                                        else if (userName.length == 1) {
                                            userData.first_name = userName[0];
                                        }
                                    } 
                                }
                            }

                            res.json({"token":webtoken,"Status":true,"Message": "Authorize successfully","data":userData});                        
                        })
                        .catch(function (error) {
                            console.log(error);
                            dbConn.close();
                            res.json({"Status":false,"Error": "Something wrong please try again later."});
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                        res.json({"Status":false,"Error": "Something wrong please try again later."});
                    });                
                }
            }
            else {
                res.json({"Status":false,"Error": "Something wrong please try again later."});
            }            
        });
    });



router.route('/SoftwebHOQAddUserCredentials').post(function (req, res) {

    var au_guid = req.body.uc_appuserguid;    
    var uc_password = req.body.uc_password; 

    var shasum = crypto.createHash('sha1');
            shasum.update(uc_password);
            password = shasum.digest('hex');


    var request = new sql.Request(dbConn);
    request.input("uc_appuserguid", au_guid);
    request.input("uc_password", password);

    request.execute('UserCredentials_add', function(err, recordsets, returnValue, affected) {
      console.log(recordsets)
        res.json({"Records": "User credentials add successfully"});    
    });
});


router.post('/SoftwebHOQDeleteUser', function (req, res) {

var au_guid = req.body.data.au_guid;    
var request = new sql.Request(dbConn);
request.input("au_guid", au_guid);

request.execute('AppUser_delete', function(err, recordsets, returnValue, affected) {
//request.query("DELETE FROM AppUser where au_guid = '"+au_guid+"'", function(err, recordsets) {
    console.log(recordsets)
    res.json({"Records": "Delete user successfully"});    
});

});

router.post('/SoftwebHOQUpdateUser', function (req, res) {

var au_guid = req.body.au_guid;
var uc_password = req.body.uc_password;    

var shasum = crypto.createHash('sha1');
            shasum.update(uc_password);
            password = shasum.digest('hex');

var request = new sql.Request(dbConn);
request.input("au_guid", au_guid);
request.input("uc_password", password);

request.execute('AppUser_update', function(err, recordsets, returnValue, affected) {
//request.query("DELETE FROM AppUser where au_guid = '"+au_guid+"'", function(err, recordsets) {
    console.log(recordsets)
    res.json({"Records": "Update data successfully"});    
});

});


    router.post('/SoftwebHOQAddOffice', function (req, res) {
        var au_guid = req.body.au_guid;
        var officename = req.body.officename.officename;    
        var au_createddate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+".000";
        var au_modifieddate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')+".000";
        var request = new sql.Request(dbConn);
        console.log(au_guid);
        console.log(officename);
        console.log(au_createddate);
        console.log(au_modifieddate);
        request.input("com_name", officename);
        request.input("com_primaryuser", au_guid);
        request.input("com_signontypeguid",null);
        request.input("com_timezoneguid",null);
        request.input("com_description",null);
        request.input("com_url",null);
        request.input("com_imageurl",null);
        request.input("com_industryguid",null);
        request.input("com_addressguid",null);
        request.input("com_statusguid",null);
        request.input("com_createdby", au_guid);
        request.input("com_createddate", au_createddate);
        request.input("com_modifiedby", null);
        request.input("com_modifieddate", au_modifieddate);
        request.execute('Company_add', function(err, recordsets, returnValue, affected) {
            console.log(JSON.stringify(recordsets[0][0]));
            console.log(recordsets);
            console.log(returnValue);
            res.json({"Records": "Office added successfully"});
        });

    });

router.post('/SoftwebHOQForgotUser', function (req, res) {

var email = req.body.email;    
console.log(email)
var request = new sql.Request(dbConn);
request.input("au_email", email);

request.execute('AppUser_forgetpassword', function(err, recordsets, returnValue, affected) {
    
    if(JSON.stringify(recordsets[0][0]) != undefined)
    {
        res.json({"Status":true, "Message":"Mail sent successfully", "Password": JSON.stringify(recordsets[0][0].uc_password)});    
    }
    else
    {
        res.json({"Status":false, "Message":"User Invalid"});        
    }
});

});

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Forgot Password Webservice For Mobile */
    /**
      * @webservice : SoftwebHOQForgotUserForDevice
      * @desc : Forgot Password Webservice For Mobile
      * @author : Softweb solutions - Alpeshsinh Solanki
    */
    router.post('/SoftwebHOQForgotUserForDevice', function (req, res) {
        var email = req.body.email;
        if (email == undefined) {
            res.json({"Status":false,"Error": "'email' is not set in request."});
            return false;
        }    
        else if (email == '' || email == null || !email.trim()) {
            res.json({"Status":false,"Error": "'email' is not valid."});
            return false;
        }

        console.log(email);
        var request = new sql.Request(dbConn);
        request.input("au_email", email);
        request.execute('AppUser_forgetpassword', function(err, recordsets, returnValue, affected) {
            if (JSON.stringify(recordsets[0][0]) != undefined) {
                var userTokenGen = new Date().getTime()+email;
                var userToken = crypto.createHash('md5').update(userTokenGen).digest('hex');
                var smtpTransport = commonConfig.impconfig.smtpTransport;
                var link = "<a href='"+base_url+"resetpassword#/resetpassword/"+userToken+"'>"+base_url+"resetpassword#/resetpassword/"+userToken+"</a>";
                mail_body = commonConfig.forgotEmailTemplate(email,link);
                var mailOptions = {
                    from: commonConfig.impconfig.adminEmail, // sender address
                    to: email, // receiver's email
                    subject: "Reset your Smartoffice password", // Subject line
                    html: mail_body
                }

                var localDbConn = new sql.Connection(dbconfigoffice);
                localDbConn.connect()
                .then(function () {
                    var localRequest = new sql.Request(localDbConn);
                    localRequest.query("UPDATE so_people set forgotuserToken ='"+userToken+"' WHERE email = '"+email+"' ")
                    .then(function (updateResult) {
                        smtpTransport.sendMail(mailOptions, function(mailError, mailResponse) {
                            if(mailError){
                                console.log("Forgot Password Mail Send Error : "+mailError);
                                res.json({"Status":false,"Error": mailError});
                            }
                            else {
                                res.json({"Status":true, "Message":"Mail sent successfully", "Password": JSON.stringify(recordsets[0][0].uc_password)});
                            }
                        })
                        
                    })
                    .catch(function (updateError) {
                        console.log("Forgot Password Mail Update Error : "+updateError);
                        res.json({"Status":false,"Error": updateError});
                    });
                                        
                })
                .catch(function (connectError) {
                    console.log("Forgot Password Mail Connect Error : "+connectError);
                    res.json({"Status":false,"Error": connectError});
                });
            }
            else {
                res.json({"Status":false, "Message":"User Invalid"});
            }
        });
    });





}).catch(function(err) {
    // ... error checks 
    console.log(err)
});  

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Save User Into Local System */
/**
  * @webservice : saveUserInLocalSystem
  * @desc : Save User Into Local System
  * @return : 
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
function saveUserInLocalSystem(data,officeid,userGuid,userpassword) {
    var firstname = data.name.trim();
    var lastname = '';
    var email = data.email.trim();
    var name = data.name.trim();
    var username = '';
    var userid = userGuid;
    var role = 'Member';
    var currentDate = new Date();
    var timestamp = currentDate.getTime();
    var created = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var modified = currentDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var guid = Guid.raw();

    var fullname = firstname+" "+lastname;

    var smtpTransport = commonConfig.impconfig.smtpTransport;    
    var mail_body = commonConfig.importMemberEmailTemplate(firstname,lastname,email,userpassword);
    var mailOptions = {
        from: commonConfig.impconfig.adminEmail, // sender address
        to: email, // receiver's email  
        subject: "Your new Smartoffice account", // Subject line
        html: mail_body
    }

    var shasum = crypto.createHash('sha1');
    shasum.update(userpassword);
    userpassword = shasum.digest('hex');

    console.log("INSERT INTO so_people (userpassword,name,email,role,officeid,timestamp,userid,created,modified,issignin) VALUES ('"+userpassword+"','"+fullname+"','"+email+"','"+role+"',"+officeid+",'"+timestamp+"','"+userid+"','"+created+"','"+modified+"',"+0+")");

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        console.log("INSERT INTO so_people (userpassword,name,email,role,officeid,timestamp,userid,created,modified,issignin) VALUES ('"+userpassword+"','"+fullname+"','"+email+"','"+role+"',"+officeid+",'"+timestamp+"','"+userid+"','"+created+"','"+modified+"',"+0+")");
        request.query("INSERT INTO so_people (userpassword,name,email,role,officeid,timestamp,userid,created,modified,issignin) VALUES ('"+userpassword+"','"+fullname+"','"+email+"','"+role+"',"+officeid+",'"+timestamp+"','"+userid+"','"+created+"','"+modified+"',"+0+")")
        .then(function (recordSet) {
            console.log(recordSet);
            console.log("INSERT INTO UserCredentials (uc_guid, uc_appuserguid,uc_password) VALUES ('"+guid+"','"+userid+"','"+userpassword+"')")
            request.query("INSERT INTO UserCredentials (uc_guid, uc_appuserguid,uc_password) VALUES ('"+guid+"','"+userid+"','"+userpassword+"')")
            .then(function (recordSet1) {
                console.log(recordSet1);
                smtpTransport.sendMail(mailOptions, function(mailError, response){
                    if (mailError) {
                        console.log("Mail Error"+mailError);
                    }
                    else {
                        console.log("Mail sent: " + response.message);
                    }
                });
                dbConn.close();
            }).catch(function (err1) {
                console.log("Error in Insert UserCredentials" + err1);
                dbConn.close();
            });
        }).catch(function (err) {
            console.log("Error in Insert People" + err);
            dbConn.close();
        });
    }).catch(function (err) {
        console.log(err);
    });    
}


function callinsert(token,username)
{
    var dbConn = new sql.Connection(dbconfigoffice);
    //3.
    dbConn.connect().then(function () {
        //4.
        var transaction = new sql.Transaction(dbConn);
        //5.
        transaction.begin().then(function () {
            //6.
            var request = new sql.Request(transaction);
            //7.
            request.query("insert into so_session (webtoken,email) VALUES ('"+token+"','"+username+"')")
        .then(function () {
                //8.
                transaction.commit().then(function (recordSet) {
                    console.log(recordSet);
                    dbConn.close();
                }).catch(function (err) {
                    //9.
                    console.log("Error in Transaction Commit " + err);
                    dbConn.close();
                });
            }).catch(function (err) {
                //10.
                console.log("Error in Transaction Begin " + err);
                dbConn.close();
            });
             
        }).catch(function (err) {
            //11.
            console.log(err);
            dbConn.close();
        });
    }).catch(function (err) {
        //12.
        console.log(err);
    });
}

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Spaces Webservice */
/**
  * @webservice : getSpaces
  * @desc : get spaces with filter paramater
  * @return : Return spaces
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/getSpaces').post(function (req, res) {
    var userId = req.body.user_id;  
    var selectedDate = req.body.selected_date;
    var duration = req.body.duration;   
    var buildingId = req.body.building_id;   
    var floorId = req.body.floor_id; 
    var noOfAttendees = req.body.no_of_attendees; 
    var amenities = req.body.amenities;

    if (userId == undefined) {
        res.json({"Status":false,"Error": "'user_id' is not set in request."});
        return false;
    }    
    else if (userId != parseInt(userId)) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }
    else if (userId <= 0) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }
    
    if (selectedDate == undefined || selectedDate == '' || selectedDate == null || !selectedDate.trim()) {
        selectedDate = new Date();
    }
    else {        
        selectedDate = new Date(selectedDate*1000);
        //selectedDate = new Date(moment.unix(selectedDate).format("YYYY-MM-DDTHH:mm:00"));        
        //selectedDate = new Date(selectedDate.getTime() - parseInt(selectedDate.getTimezoneOffset()) *60000);
    }

    if (duration == undefined || duration != parseInt(duration)) {
        duration = parseInt(30);
    }

    if (buildingId == undefined) {
        buildingId = parseInt(0);
    }
    else if (buildingId != parseInt(buildingId)) {
        buildingId = parseInt(0);
    }

    if (floorId == undefined) {
        floorId = parseInt(0);
    }
    else if (floorId != parseInt(floorId)) {
        floorId = parseInt(0);
    }

    if (noOfAttendees == undefined || noOfAttendees != parseInt(noOfAttendees)) {
        noOfAttendees = parseInt(0);
    }

    if (amenities == undefined || amenities == null || !amenities.trim()) {
        amenities = '';
    }

    var amenitiesArray = [];
    if (amenities.trim()) {
        amenitiesArray = amenities.split(",");
    }

    var startTime = new Date(selectedDate.getFullYear(),selectedDate.getMonth(),selectedDate.getDate(),selectedDate.getHours(),selectedDate.getMinutes());
    var endTime = new Date(startTime.getTime() + parseInt(duration)*60000);
      
    var startMonth = startTime.getUTCMonth() + 1;
    if (startMonth.toString().length == 1) {
        startMonth = "0"+startMonth;
    }

    var startDay = startTime.getUTCDate();
    if (startDay.toString().length == 1) {
        startDay = "0"+startDay;
    }

    var endMonth = endTime.getUTCMonth() + 1;
    if (endMonth.toString().length == 1) {
        endMonth = "0"+endMonth;
    }

    var endDay = endTime.getUTCDate();
    if (endDay.toString().length == 1) {
        endDay = "0"+endDay;
    }

    var startDate = startTime.getUTCFullYear()+'-'+startMonth+'-'+startDay;
    var endDate = endTime.getUTCFullYear()+'-'+endMonth+'-'+endDay

    var startDateTime = startTime;
    var endDateTime = endTime;
    startTime = startTime.toISOString().replace('.000Z', '');
    endTime = endTime.toISOString().replace('.000Z', '');

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        var amenitiesData = [];
        request.query("SELECT * FROm so_amenities where am_status = 1")
        .then(function (amenitiesResult) {
            if (amenitiesResult.length) {
                amenitiesData = amenitiesResult;
            }
        })
        .catch(function (error) {
            console.log(error);
        });

        var resultData = {};
        resultData.spaces = [];

        setTimeout(function(){ 
            var query = "SELECT SL.*, (SELECT DISTINCT SRR.locationid FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startTime+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endTime+"') OR (CONVERT(VARCHAR, SRR.time , 126) >= '"+startTime+"' AND CONVERT(VARCHAR, SRR.time , 126) < '"+endTime+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) > '"+startTime+"' AND CONVERT(VARCHAR, SRR.endtime , 126) < '"+endTime+"')) AND SRR.locationid = SL.id AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R' ) as booked_id, SD.id as device_id, SD.name as device_name, SD.uuid as device_uuid, SD.major as device_major, SD.minor as device_minor, SD.devicetype as device_devicetype, SD.boardid as device_boardid, SF.id as floorId, SF.floorname as floorName, SOL.id as buldingId, SOL.name as buldingName FROM so_location SL INNER JOIN so_people SP ON SL.officeid = SP.officeid LEFT JOIN so_device SD ON SL.id = SD.locationid LEFT JOIN so_floor SF ON SL.floorid = SF.id LEFT JOIN so_officelocations SOL ON SL.location_id = SOL.id WHERE SL.rooms_from = 1  AND SL.space_status = 1  AND SP.id = "+parseInt(userId)+" ";

            if (parseInt(noOfAttendees) && noOfAttendees > 0) {
                query += " AND SL.capacity = "+parseInt(noOfAttendees); 
            }

            if (parseInt(buildingId) && buildingId > 0) {
                query += " AND SOL.id = "+parseInt(buildingId); 
            }

            if (parseInt(floorId) && floorId > 0) {
                query += " AND SF.id = "+parseInt(floorId); 
            }

            if (amenitiesArray.length) {
                query += " AND (";
                for (var a = 0; a < amenitiesArray.length; a++) {
                    if (a == parseInt((amenitiesArray.length)-1)) {
                        query += " (SL.amenities LIKE '%"+amenitiesArray[a]+"%' )"; 
                    }
                    else {
                        query += " (SL.amenities LIKE '%"+amenitiesArray[a]+"%' ) AND "; 
                    }                    
                }                
                query += ")";
            }
            console.log(query);
            request.query(query).then(function (result) {
                var spaceData = {};
                var spaceIds = [];
                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        if (spaceData.hasOwnProperty(result[i].id)) {
                            space = spaceData[result[i].id];
                            if (parseInt(result[i].device_id)) {
                                var dev = {};
                                dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                dev.device_name = result[i].device_name ? result[i].device_name : '';
                                dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                dev.device_major = result[i].device_major ? result[i].device_major : '';
                                dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                space.beaconData.push(dev);
                            }
                        }
                        else {
                            var space = {};
                            if (result[i].image) {
                                result[i].image = baseUrl+'images/'+result[i].image;
                            }

                            if (parseInt(result[i].id)) {
                                spaceIds.push(parseInt(result[i].id));
                            }

                            space.id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                            space.name = result[i].name ? result[i].name : '';
                            space.status = (result[i].booked_id == result[i].id) ? parseInt(1) : 0;
                            space.image = result[i].image ? result[i].image : '';
                            space.capacity = parseInt(result[i].capacity) ? parseInt(result[i].capacity) : 0 ;
                            space.notes = result[i].notes ? result[i].notes :'';
                            space.space_type = result[i].space_type ? result[i].space_type : '';
                            space.size = result[i].size ? result[i].size : '';
                            space.booked_id = parseInt(0);
                            space.organizerName = '';
                            space.attendees = [];
                            space.start_time = '';
                            space.end_time = '';
                            space.start_time_timestamp = '';
                            space.end_time_timestamp = '';
                            space.duration = parseInt(0);
                            space.available_start_time = '';
                            space.available_end_time = '';  
                            space.available_start_time_timestamp = '';
                            space.available_end_time_timestamp = '';                          
                            space.purpose = '';
                            space.building_id = parseInt(result[i].buldingId) ? parseInt(result[i].buldingId) : 0 ;
                            space.building_name = result[i].buldingName ? result[i].buldingName : '';
                            space.floor_id = parseInt(result[i].floorId) ? parseInt(result[i].floorId) : 0 ;
                            space.floor_name = result[i].floorName ? result[i].floorName : '';
                            space.beaconData = [];
                            space.amenities = [];

                            if (amenitiesData.length && result[i].amenities) {
                                result[i].amenities = result[i].amenities.split(",");
                                if (result[i].amenities.length) {
                                    for (var j = 0; j < result[i].amenities.length; j++) {
                                        for (var k = 0; k < amenitiesData.length; k++) {
                                            if (result[i].amenities[j] == amenitiesData[k].am_guid) {
                                                var ameni = {};
                                                ameni.id = amenitiesData[k].am_guid ? amenitiesData[k].am_guid : '';
                                                ameni.name = amenitiesData[k].amenities ? amenitiesData[k].amenities : '';
                                                ameni.image = amenitiesData[k].am_image ? amenitiesData[k].am_image : '';
                                                if (ameni.image) {
                                                    ameni.image = baseUrl+'images/'+ameni.image;
                                                }
                                                space.amenities.push(ameni);
                                            }
                                        }
                                    }
                                }
                            }

                            if (parseInt(result[i].device_id)) {
                                var dev = {};
                                dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                dev.device_name = result[i].device_name ? result[i].device_name : '';
                                dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                dev.device_major = result[i].device_major ? result[i].device_major : '';
                                dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                space.beaconData.push(dev);
                            }

                            spaceData[result[i].id] = space;
                        }
                    }
                }                
                
                if (spaceIds.length && spaceData) {
                    console.log("SELECT SRR.*,SP.name as organizer_name, SP.email as organizer_email FROM so_room_reservation SRR LEFT JOIN so_people SP ON SP.id = SRR.peopleid WHERE ((CONVERT(VARCHAR, SRR.time , 126) LIKE '%"+startDate+"%') OR (CONVERT(VARCHAR, SRR.time , 126) LIKE '%"+endDate+"%')) AND SRR.locationid IN ("+spaceIds.join()+") AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R'  ORDER BY SRR.time ASC");
                    request.query("SELECT SRR.*,SP.name as organizer_name, SP.email as organizer_email FROM so_room_reservation SRR LEFT JOIN so_people SP ON SP.id = SRR.peopleid WHERE ((CONVERT(VARCHAR, SRR.time , 126) LIKE '%"+startDate+"%') OR (CONVERT(VARCHAR, SRR.time , 126) LIKE '%"+endDate+"%')) AND SRR.locationid IN ("+spaceIds.join()+") AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R'  ORDER BY SRR.time ASC")
                    .then(function (eventResult) {
                        var eventData = {};
                        if (eventResult.length) {
                            for (var a = 0; a < eventResult.length; a++) {
                                if (eventData.hasOwnProperty(eventResult[a].locationid)) {
                                    eventData[eventResult[a].locationid].push(eventResult[a]);
                                }
                                else {
                                    eventData[eventResult[a].locationid] = [];
                                    eventData[eventResult[a].locationid].push(eventResult[a]);
                                }                                
                            }
                        }
                        
                        if (spaceData) {
                            var maxStartDateTime = new Date(selectedDate.getUTCFullYear(),selectedDate.getUTCMonth(),selectedDate.getUTCDate(),00,00,00);
                            var maxEndDateTime = new Date(selectedDate.getUTCFullYear(),selectedDate.getUTCMonth(),selectedDate.getUTCDate(),23,59,59);
                            for (var spaceid in spaceData) {
                                if (spaceData.hasOwnProperty(spaceid)) {
                                    if (eventData.hasOwnProperty(spaceData[spaceid].id) && eventData[spaceData[spaceid].id].length) {
                                        for (var p = 0; p < eventData[spaceData[spaceid].id].length; p++) {
                                            var dataStartDate = new Date(eventData[spaceData[spaceid].id][p].time);
                                            var dataEndDate = new Date(eventData[spaceData[spaceid].id][p].endtime);
                                            if (spaceData[spaceid].status == 1) {
                                                if (dataStartDate <= startDateTime && dataEndDate > startDateTime) {
                                                    spaceData[spaceid].start_time = dataStartDate;
                                                    spaceData[spaceid].end_time = dataEndDate;
                                                    spaceData[spaceid].booked_id = eventData[spaceData[spaceid].id][p].id;
                                                    spaceData[spaceid].organizerName = eventData[spaceData[spaceid].id][p].organizer_name ? eventData[spaceData[spaceid].id][p].organizer_name : '';
                                                    spaceData[spaceid].purpose = eventData[spaceData[spaceid].id][p].purpose ? eventData[spaceData[spaceid].id][p].purpose : '';

                                                    try {
                                                        eventData[spaceData[spaceid].id][p].attendies = JSON.parse(eventData[spaceData[spaceid].id][p].attendies);
                                                        if (eventData[spaceData[spaceid].id][p].attendies && eventData[spaceData[spaceid].id][p].attendies.length) {
                                                            for(var c = 0; c < eventData[spaceData[spaceid].id][p].attendies.length; c++) {
                                                                spaceData[spaceid].attendees.push({email : eventData[spaceData[spaceid].id][p].attendies[c].attendees});
                                                            }
                                                        }
                                                    }
                                                    catch (e) { }

                                                    spaceData[spaceid].available_start_time = dataEndDate;
                                                    spaceData[spaceid].available_end_time = new Date(spaceData[spaceid].available_start_time.getTime() + parseInt(duration) *60000); 
                                                }
                                                else if (dataStartDate < endDateTime && dataEndDate > endDateTime) {
                                                    spaceData[spaceid].start_time = dataStartDate;
                                                    spaceData[spaceid].end_time = dataEndDate;
                                                    spaceData[spaceid].booked_id = eventData[spaceData[spaceid].id][p].id;
                                                    spaceData[spaceid].organizerName = eventData[spaceData[spaceid].id][p].organizer_name ? eventData[spaceData[spaceid].id][p].organizer_name : '';
                                                    spaceData[spaceid].purpose = eventData[spaceData[spaceid].id][p].purpose ? eventData[spaceData[spaceid].id][p].purpose : '';

                                                    try {
                                                        eventData[spaceData[spaceid].id][p].attendies = JSON.parse(eventData[spaceData[spaceid].id][p].attendies);
                                                        if (eventData[spaceData[spaceid].id][p].attendies && eventData[spaceData[spaceid].id][p].attendies.length) {
                                                            for(var c = 0; c < eventData[spaceData[spaceid].id][p].attendies.length; c++) {
                                                                spaceData[spaceid].attendees.push({email : eventData[spaceData[spaceid].id][p].attendies[c].attendees});
                                                            }
                                                        }
                                                    }
                                                    catch (e) { }

                                                    spaceData[spaceid].available_start_time = dataEndDate;
                                                    spaceData[spaceid].available_end_time = new Date(spaceData[spaceid].available_start_time.getTime() + parseInt(duration) *60000);
                                                }
                                                else if (startDateTime <= dataStartDate && endDateTime > dataStartDate) {
                                                    spaceData[spaceid].start_time = dataStartDate;
                                                    spaceData[spaceid].end_time = dataEndDate;
                                                    spaceData[spaceid].booked_id = eventData[spaceData[spaceid].id][p].id;
                                                    spaceData[spaceid].organizerName = eventData[spaceData[spaceid].id][p].organizer_name ? eventData[spaceData[spaceid].id][p].organizer_name : '';
                                                    spaceData[spaceid].purpose = eventData[spaceData[spaceid].id][p].purpose ? eventData[spaceData[spaceid].id][p].purpose : '';

                                                    try {
                                                        eventData[spaceData[spaceid].id][p].attendies = JSON.parse(eventData[spaceData[spaceid].id][p].attendies);
                                                        if (eventData[spaceData[spaceid].id][p].attendies && eventData[spaceData[spaceid].id][p].attendies.length) {
                                                            for(var c = 0; c < eventData[spaceData[spaceid].id][p].attendies.length; c++) {
                                                                spaceData[spaceid].attendees.push({email : eventData[spaceData[spaceid].id][p].attendies[c].attendees});
                                                            }
                                                        }
                                                    }
                                                    catch (e) { }

                                                    spaceData[spaceid].available_start_time = dataEndDate;
                                                    spaceData[spaceid].available_end_time = new Date(spaceData[spaceid].available_start_time.getTime() + parseInt(duration) *60000); 
                                                }
                                                else if (startDateTime < dataEndDate && endDateTime > dataEndDate) {
                                                    spaceData[spaceid].start_time = dataStartDate;
                                                    spaceData[spaceid].end_time = dataEndDate;
                                                    spaceData[spaceid].booked_id = eventData[spaceData[spaceid].id][p].id;
                                                    spaceData[spaceid].organizerName = eventData[spaceData[spaceid].id][p].organizer_name ? eventData[spaceData[spaceid].id][p].organizer_name : '';
                                                    spaceData[spaceid].purpose = eventData[spaceData[spaceid].id][p].purpose ? eventData[spaceData[spaceid].id][p].purpose : '';

                                                    try {
                                                        eventData[spaceData[spaceid].id][p].attendies = JSON.parse(eventData[spaceData[spaceid].id][p].attendies);
                                                        if (eventData[spaceData[spaceid].id][p].attendies && eventData[spaceData[spaceid].id][p].attendies.length) {
                                                            for(var c = 0; c < eventData[spaceData[spaceid].id][p].attendies.length; c++) {
                                                                spaceData[spaceid].attendees.push({email : eventData[spaceData[spaceid].id][p].attendies[c].attendees});
                                                            }
                                                        }
                                                    }
                                                    catch (e) { }

                                                    spaceData[spaceid].available_start_time = dataEndDate;
                                                    spaceData[spaceid].available_end_time = new Date(spaceData[spaceid].available_start_time.getTime() + parseInt(duration) *60000);
                                                }                                                
                                            }
                                            else {                                                
                                                if (dataEndDate <= startDateTime) {
                                                    spaceData[spaceid].start_time = dataEndDate;
                                                }                                                
                                                else if (endDateTime <= dataStartDate) {
                                                    spaceData[spaceid].end_time = dataStartDate;
                                                }

                                                if (!spaceData[spaceid].start_time) {
                                                    spaceData[spaceid].start_time = maxStartDateTime;
                                                }

                                                if (!spaceData[spaceid].end_time) {
                                                    spaceData[spaceid].end_time = maxEndDateTime;
                                                }
                                            }
                                        }

                                        if ((!spaceData[spaceid].booked_id || spaceData[spaceid].booked_id == 0) && spaceData[spaceid].attendees.length == 0 && (!spaceData[spaceid].available_start_time || spaceData[spaceid].available_start_time == '') && (!spaceData[spaceid].available_end_time || spaceData[spaceid].available_end_time == '') && (!spaceData[spaceid].purpose || spaceData[spaceid].purpose == '')) {
                                            spaceData[spaceid].status = parseInt(0);
                                        }

                                        if (spaceData[spaceid].status == 1) {
                                            for (var s = 0; s < eventData[spaceData[spaceid].id].length; s++) {
                                                var dataStartDate = new Date(eventData[spaceData[spaceid].id][s].time);
                                                var dataEndDate = new Date(eventData[spaceData[spaceid].id][s].endtime);
                                                    
                                                if (spaceData[spaceid].available_start_time <= dataStartDate && dataStartDate < spaceData[spaceid].available_end_time) {
                                                    spaceData[spaceid].available_start_time = dataEndDate;
                                                    spaceData[spaceid].available_end_time = new Date(spaceData[spaceid].available_start_time.getTime() + parseInt(duration) *60000);
                                                }
                                                else if (spaceData[spaceid].available_start_time < dataEndDate && dataEndDate < spaceData[spaceid].available_end_time) {
                                                    spaceData[spaceid].available_start_time = dataEndDate;
                                                    spaceData[spaceid].available_end_time = new Date(spaceData[spaceid].available_start_time.getTime() + parseInt(duration) *60000);
                                                }
                                            }

                                            if (spaceData[spaceid].available_start_time) {
                                                var asm = spaceData[spaceid].available_start_time.getUTCMonth() + 1;
                                                var asd = spaceData[spaceid].available_start_time.getUTCDate();
                                                var ash = spaceData[spaceid].available_start_time.getUTCHours();
                                                var asmi = spaceData[spaceid].available_start_time.getUTCMinutes();
                                                var ass = spaceData[spaceid].available_start_time.getUTCSeconds();

                                                if (asm.toString().length == 1) {
                                                    asm = "0"+asm;
                                                }
                                                
                                                if (asd.toString().length == 1) {
                                                    asd = "0"+asd;
                                                }
                                                
                                                if (ash.toString().length == 1) {
                                                    ash = "0"+ash;
                                                }
                                                
                                                if (asmi.toString().length == 1) {
                                                    asmi = "0"+asmi;
                                                }
                                                
                                                if (ass.toString().length == 1) {
                                                    ass = "0"+ass;
                                                }
                                                spaceData[spaceid].available_start_time_timestamp = Math.round(new Date(spaceData[spaceid].available_start_time).getTime()/1000.0)+'.0';
                                                spaceData[spaceid].available_start_time = spaceData[spaceid].available_start_time.getUTCFullYear()+'-'+asm+'-'+asd+' '+ash+':'+asmi+':'+ass;
                                            }

                                            if (spaceData[spaceid].available_end_time) {
                                                var aem = spaceData[spaceid].available_end_time.getUTCMonth() + 1;
                                                var aed = spaceData[spaceid].available_end_time.getUTCDate();
                                                var aeh = spaceData[spaceid].available_end_time.getUTCHours();
                                                var aemi = spaceData[spaceid].available_end_time.getUTCMinutes();
                                                var aes = spaceData[spaceid].available_end_time.getUTCSeconds();

                                                if (aem.toString().length == 1) {
                                                    aem = "0"+aem;
                                                }
                                                
                                                if (aed.toString().length == 1) {
                                                    aed = "0"+aed;
                                                }
                                                
                                                if (aeh.toString().length == 1) {
                                                    aeh = "0"+aeh;
                                                }
                                                
                                                if (aemi.toString().length == 1) {
                                                    aemi = "0"+aemi;
                                                }
                                                
                                                if (aes.toString().length == 1) {
                                                    aes = "0"+aes;
                                                }

                                                spaceData[spaceid].available_end_time_timestamp = Math.round(new Date(spaceData[spaceid].available_end_time).getTime()/1000.0)+'.0';
                                                spaceData[spaceid].available_end_time = spaceData[spaceid].available_end_time.getUTCFullYear()+'-'+aem+'-'+aed+' '+aeh+':'+aemi+':'+aes;
                                            }
                                        }
                                    }
                                    else {
                                        spaceData[spaceid].start_time = maxStartDateTime;
                                        spaceData[spaceid].end_time = maxEndDateTime;

                                        if ((!spaceData[spaceid].booked_id || spaceData[spaceid].booked_id == 0) && spaceData[spaceid].attendees.length == 0 && (!spaceData[spaceid].available_start_time || spaceData[spaceid].available_start_time == '') && (!spaceData[spaceid].available_end_time || spaceData[spaceid].available_end_time == '') && (!spaceData[spaceid].purpose || spaceData[spaceid].purpose == '')) {
                                            spaceData[spaceid].status = parseInt(0);
                                        }
                                    }

                                    if (spaceData[spaceid].start_time && spaceData[spaceid].end_time) {
                                        var diff = Math.abs(spaceData[spaceid].start_time - spaceData[spaceid].end_time);
                                        spaceData[spaceid].duration = parseInt(Math.floor((diff/1000)/60));

                                        if (spaceData[spaceid].start_time == maxStartDateTime) {
                                            
                                            var sm = spaceData[spaceid].start_time.getMonth() + 1;
                                            var sd = spaceData[spaceid].start_time.getDate();
                                            var sh = spaceData[spaceid].start_time.getHours();
                                            var smi = spaceData[spaceid].start_time.getMinutes();
                                            var ss = spaceData[spaceid].start_time.getSeconds();
                                        }
                                        else {
                                            spaceData[spaceid].start_time_timestamp = Math.round(new Date(spaceData[spaceid].start_time).getTime()/1000.0)+'.0';
                                            var sm = spaceData[spaceid].start_time.getUTCMonth() + 1;
                                            var sd = spaceData[spaceid].start_time.getUTCDate();
                                            var sh = spaceData[spaceid].start_time.getUTCHours();
                                            var smi = spaceData[spaceid].start_time.getUTCMinutes();
                                            var ss = spaceData[spaceid].start_time.getUTCSeconds();
                                        }

                                        if (spaceData[spaceid].end_time == maxEndDateTime) {

                                            var em = spaceData[spaceid].end_time.getMonth() + 1;
                                            var ed = spaceData[spaceid].end_time.getDate();
                                            var eh = spaceData[spaceid].end_time.getHours();
                                            var emi = spaceData[spaceid].end_time.getMinutes();
                                            var es = spaceData[spaceid].end_time.getSeconds();
                                        }
                                        else {
                                            spaceData[spaceid].end_time_timestamp = Math.round(new Date(spaceData[spaceid].end_time).getTime()/1000.0)+'.0';
                                            var em = spaceData[spaceid].end_time.getUTCMonth() + 1;
                                            var ed = spaceData[spaceid].end_time.getUTCDate();
                                            var eh = spaceData[spaceid].end_time.getUTCHours();
                                            var emi = spaceData[spaceid].end_time.getUTCMinutes();
                                            var es = spaceData[spaceid].end_time.getUTCSeconds();
                                        }
                                        
                                        if (sm.toString().length == 1) {
                                            sm = "0"+sm;
                                        }
                                        
                                        if (sd.toString().length == 1) {
                                            sd = "0"+sd;
                                        }
                                        
                                        if (sh.toString().length == 1) {
                                            sh = "0"+sh;
                                        }
                                        
                                        if (smi.toString().length == 1) {
                                            smi = "0"+smi;
                                        }
                                        
                                        if (ss.toString().length == 1) {
                                            ss = "0"+ss;
                                        }

                                        if (!spaceData[spaceid].start_time_timestamp || spaceData[spaceid].start_time_timestamp == '') {
                                            spaceData[spaceid].start_time_timestamp = Math.round(new Date(spaceData[spaceid].start_time).getTime()/1000.0)+'.0';
                                        }
                                        spaceData[spaceid].start_time = spaceData[spaceid].start_time.getUTCFullYear()+'-'+sm+'-'+sd+' '+sh+':'+smi+':'+ss;
                                        if (em.toString().length == 1) {
                                            em = "0"+em;
                                        }
                                        
                                        if (ed.toString().length == 1) {
                                            ed = "0"+ed;
                                        }
                                        
                                        if (eh.toString().length == 1) {
                                            eh = "0"+eh;
                                        }
                                        
                                        if (emi.toString().length == 1) {
                                            emi = "0"+emi;
                                        }
                                        
                                        if (es.toString().length == 1) {
                                            es = "0"+es;
                                        }
                                        if (!spaceData[spaceid].end_time_timestamp || spaceData[spaceid].end_time_timestamp == '') {
                                            spaceData[spaceid].end_time_timestamp = Math.round(new Date(spaceData[spaceid].end_time).getTime()/1000.0)+'.0';
                                        }
                                        spaceData[spaceid].end_time = spaceData[spaceid].end_time.getUTCFullYear()+'-'+em+'-'+ed+' '+eh+':'+emi+':'+es;
                                    }
                                    resultData.spaces.push(spaceData[spaceid]);
                                }
                            }
                        }
                        res.json({"Status":true,"StatusCode":200,"data": resultData});
                    })
                    .catch(function (error) {
                        console.log(error);
                        res.json({"Status":true,"StatusCode":200,"data": resultData});
                    });
                }
                else {                    
                    res.json({"Status":true,"StatusCode":200,"data": resultData});
                }

                dbConn.close();
            }).catch(function (err) {
                console.log(err);
                dbConn.close();
            });
        }, 500);
    }).catch(function (err) {
        console.log(err);
    });
});

/*code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > save amenities into location*/
/**
  * @webservice  : getRoomFromBeacon
  * @desc   : Get rooms from beacon
  * @author : Softweb solutions - Dhaval Thaker
*/
router.route('/getRoomFromBeacon').post(function (req, res) {

    var userId = req.body.userId; 
    var tokem = req.body.token; 
    var major = req.body.major;
    var minor = req.body.minor;
    var timestamp = req.body.timestamp;
    var status = req.body.status;  
    //4.
    var dbConn = new sql.Connection(dbconfigoffice);
    //5.
    dbConn.connect().then(function () {
        //6.
        var request = new sql.Request(dbConn);
        //7.

        console.log("select sl.name from so_device_locator as sdl INNER JOIN so_device sd ON sdl.beaconid =  sd.id INNER JOIN so_location as sl ON sd.locationid = sl.id INNER JOIN so_room_reservation as  srr ON srr.locationid = sl.id WHERE srr.peopleid = '"+userId+"' AND sd.major = '"+major+"' AND sd.minor = '"+minor+"' AND sdl.status = '"+status+"' AND sd.timestamp = '"+timestamp+"'");


        request.query("select sl.name from so_device_locator as sdl INNER JOIN so_device sd ON sdl.beaconid =  sd.id INNER JOIN so_location as sl ON sd.locationid = sl.id INNER JOIN so_room_reservation as  srr ON srr.locationid = sl.id WHERE srr.peopleid = '"+userId+"' AND sd.major = '"+major+"' AND sd.minor = '"+minor+"' AND sdl.status = '"+status+"' AND sd.timestamp = '"+timestamp+"' AND sl.space_status = 1 ").then(function (recordSet) {
            var space = {list:recordSet};
            res.json({"Status":true,"StatusCode":200,"data": space});
            console.log(space);
            dbConn.close();
        }).catch(function (err) {
            //8.
            console.log(err);
            dbConn.close();
        });
    }).catch(function (err) {
        //9.
        console.log(err);
    });
});

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Filter Webservice */
/**
  * @webservice : getFilter
  * @desc : get bulding, fllor and amenities data
  * @return : Return bulding, floor and amenities data
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/getFilter').post(function (req, res) {

    var userId = req.body.user_id;

    if (userId == undefined) {
        res.json({"Status":false,"Error": "'user_id' is not set in request."});
        return false;
    }    
    else if (userId != parseInt(userId)) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }
    else if (userId <= 0) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var responseData = {};
        responseData.building = [];
        responseData.amenities = [];
        var request = new sql.Request(dbConn);
        request.query("SELECT * FROM so_amenities where am_status = 1").then(function (amenitiesResult) {
            if (amenitiesResult.length) {
                for (var i = 0; i < amenitiesResult.length; i++) {
                    var ameni = {};
                    ameni.id = amenitiesResult[i].am_guid ? amenitiesResult[i].am_guid : '';
                    ameni.name = amenitiesResult[i].amenities ? amenitiesResult[i].amenities : '';
                    ameni.image = amenitiesResult[i].am_image ? amenitiesResult[i].am_image : '';
                    if (ameni.image) {
                        ameni.image = baseUrl+'images/'+ameni.image;
                    }

                    responseData.amenities.push(ameni);
                }
            }
            request.query("SELECT SOL.*, SF.id as floorId, SF.floorname as floorName FROM so_officelocations SOL LEFT JOIN so_floor SF ON SF.locationid = SOL.id  INNER JOIN so_people SP ON SOL.companyid = SP.officeid WHERE SP.id = "+ parseInt(userId)).then(function (buildingResult) {
                var buildingData = {};
                if (buildingResult.length) {
                    for (var i = 0; i < buildingResult.length; i++) {
                        if (buildingData.hasOwnProperty(buildingResult[i].id)) {
                            building = buildingData[buildingResult[i].id];
                            var floor = {};
                            floor.id = parseInt(buildingResult[i].floorId) ? parseInt(buildingResult[i].floorId) : 0;
                            floor.name = buildingResult[i].floorName ? buildingResult[i].floorName : '';
                            building.floor.push(floor);
                        }
                        else {
                            var building = {};
                            building.id = parseInt(buildingResult[i].id) ? parseInt(buildingResult[i].id) : 0;
                            building.name = buildingResult[i].name ? buildingResult[i].name : '';
                            building.floor = [];
                            var floor = {};
                            floor.id = parseInt(buildingResult[i].floorId) ? parseInt(buildingResult[i].floorId) : 0;
                            floor.name = buildingResult[i].floorName ? buildingResult[i].floorName : '';
                            building.floor.push(floor);
                            buildingData[buildingResult[i].id] = building;
                        }
                    }
                }

                if (buildingData) {
                    for (var buildId in buildingData) {
                        if (buildingData.hasOwnProperty(buildId)) {
                            responseData.building.push(buildingData[buildId]);
                        }
                    }
                }
                res.json({"Status":true,"StatusCode":200,"data": responseData});
            }).catch(function (err) {
                console.log(err);
            });
            dbConn.close();
        }).catch(function (err) {
            console.log(err);
            dbConn.close();
        });
    }).catch(function (err) {
        console.log(err);
    });
});

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > bookRoom Webservice */
/**
  * @webservice : bookRoom
  * @desc : book room for event
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/bookRoom').post(function (req, res) {
    var userId = req.body.user_id; 
    var locationId = req.body.room_id; 
    var purpose = req.body.purpose;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    var attendees = req.body.attendees;
    var detail = req.body.note;
    var markAsPrivate = req.body.mark_as_private;
    var amenities = req.body.amenities;
    var catering = req.body.catering;

    if (userId == undefined) {
        res.json({"Status":false,"Error": "'user_id' is not set in request."});
        return false;
    }    
    else if (userId != parseInt(userId)) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }
    else if (userId <= 0) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }

    if (locationId == undefined) {
        res.json({"Status":false,"Error": "'room_id' is not set in request."});
        return false;
    }    
    else if (locationId != parseInt(locationId)) {
        res.json({"Status":false,"Error": "'room_id' is not valid."});
        return false;
    }
    else if (locationId <= 0) {
        res.json({"Status":false,"Error": "'room_id' is not valid."});
        return false;
    }

    if (purpose == undefined) {
        res.json({"Status":false,"Error": "'purpose' is not set in request."});
        return false;
    }    
    else if (purpose == '' || purpose == null || !purpose.trim()) {
        res.json({"Status":false,"Error": "'purpose' is not valid."});
        return false;
    }

    if (startDate == undefined) {
        res.json({"Status":false,"Error": "'start_date' is not set in request."});
        return false;
    }    
    else if (startDate == '' || startDate == null || !startDate.trim()) {
        res.json({"Status":false,"Error": "'start_date' is not valid."});
        return false;
    }    

    if (endDate == undefined) {
        res.json({"Status":false,"Error": "'end_date' is not set in request."});
        return false;
    }    
    else if (endDate == '' || endDate == null || !endDate.trim()) {
        res.json({"Status":false,"Error": "'end_date' is not valid."});
        return false;
    }    

    startDate = new Date(startDate*1000);
    endDate = new Date(endDate*1000);
    //startDate = new Date(startDate);
    //endDate = new Date(endDate);

    //startDate = new Date(startDate.getTime() - parseInt(startDate.getTimezoneOffset()) *60000);
    //endDate = new Date(endDate.getTime() - parseInt(endDate.getTimezoneOffset()) *60000);

    var currentDate = new Date();
    currentDate = new Date(currentDate.getTime() - parseInt(1) *60000);

    if (startDate >= endDate) {
        res.json({"Status":false,"Error": "'end_date' is not valid."});
        return false;
    }
    /*else if (startDate < currentDate) {
        res.json({"Status":false,"Error": "'start_date' is must be greater than current date time."});
        return false;
    }
    else if (endDate < currentDate) {
        res.json({"Status":false,"Error": "'end_date' is must be greater than current date time."});
        return false;
    }*/

    if (attendees == undefined) {
        res.json({"Status":false,"Error": "'attendees' is not set in request."});
        return false;
    }    
    else if (typeof(attendees) != 'object') {
        res.json({"Status":false,"Error": "'attendees' is must be array."});
        return false;
    }
    else if (!attendees.length) {
        res.json({"Status":false,"Error": "'attendees' is not valid."});
        return false;
    }

    if (detail == undefined) {
        detail = '';
    }

    if (markAsPrivate == undefined) {
        markAsPrivate = 0;
    }
    else if (markAsPrivate != 1) {
        markAsPrivate = 0;
    }

    var attend = [];    
    for (var j=0;j<attendees.length;++j) {
        if (attendees[j].email) {
            attend.push({attendees: attendees[j].email});    
        }        
    }

    if (!attend.length) {
        res.json({"Status":false,"Error": "'attendees' is not valid."});
        return false;
    }

    var timestamp =  Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),startDate.getUTCHours(),startDate.getUTCMinutes(),startDate.getUTCSeconds(),startDate.getUTCMilliseconds());
    timestamp =  Math.round(timestamp/1000.0);
              
    var timeDiff = Math.abs(startDate - endDate);
    var dbDuration = parseInt(Math.floor((timeDiff/1000)/60));
    var dbEventId = '';

    if (dbDuration > 480) {
        res.json({"Status":false,"Error": "Maxium duration is 8 hour so please change the time."});
        return false;
    }
    
    var startDateISO = startDate.toISOString().replace('.000Z', '');
    var endDateISO = endDate.toISOString().replace('.000Z', '');

    purpose = purpose.replace(new RegExp("'", 'g'), "''");
    detail = detail.replace(new RegExp("'", 'g'), "''");

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        request.query("SELECT SL.*, SP.email as spaceAdminEmail, SP.name as spaceAdminName FROM so_location SL LEFT JOIN so_office SO ON SL.officeid = SO.Id LEFT JOIN so_people SP ON SP.userid = SO.userid WHERE SL.id = "+parseInt(locationId))
        .then(function (spaceResult) {
            if (spaceResult.length > 0) {
                console.log(spaceResult);
                if (spaceResult[0].space_status != 1) {
                    res.json({"Status":false,"Error": "room is not available."});
                    dbConn.close();
                }
                else {
                    console.log("SELECT SRR.* FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) >= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) < '"+endDateISO+"')) AND SRR.locationid = "+parseInt(locationId)+" AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R'");
                    request.query("SELECT SRR.* FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) >= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) < '"+endDateISO+"')) AND SRR.locationid = "+parseInt(locationId)+" AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R'")
                    .then(function (result) {
                        if (result.length) {
                            res.json({"Status":false,"Error": "Room already booked for this timeslot."});
                            dbConn.close();
                        }
                        else {
                            console.log("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,endtime,timestamp,attendies,datastorevalue,mark_as_private,detail,action,duration,event_id,notification_action,initial_duration) VALUES ("+parseInt(locationId)+","+parseInt(userId)+",'"+purpose+"','"+startDate.toISOString()+"','"+endDate.toISOString()+"',"+timestamp+",'"+JSON.stringify(attend)+"',"+1+","+markAsPrivate+",'"+detail+"','BOOKNOW',"+parseInt(dbDuration)+",'"+dbEventId+"','B',"+parseInt(dbDuration)+")");                            
                            
                            request.query("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,endtime,timestamp,attendies,datastorevalue,mark_as_private,detail,action,duration,event_id,notification_action,initial_duration) VALUES ("+parseInt(locationId)+","+parseInt(userId)+",'"+purpose+"','"+startDate.toISOString()+"','"+endDate.toISOString()+"',"+timestamp+",'"+JSON.stringify(attend)+"',"+1+","+markAsPrivate+",'"+detail+"','BOOKNOW',"+parseInt(dbDuration)+",'"+dbEventId+"','B',"+parseInt(dbDuration)+")")
                            .then(function (recordSet) {

                                request.query("SELECT SP.name as userName, SP.email as userEmail FROM so_people SP WHERE SP.id = "+parseInt(userId))
                                .then(function (userNameResult) {
                                    if (userNameResult.length) {
                                        var spaceName = spaceResult[0].name;
                                        var userName = userNameResult[0].userName;
                                        var eventMailStartTime = moment.utc(startDate).format('ddd DD MMM YYYY HH:mm');
                                        var eventMailEndTime = moment.utc(endDate).format('HH:mm')+' (UTC)';            
                                        var smtpTransport = commonConfig.impconfig.smtpTransport;
                                        var attendiesEmails = [];
                                        attend.forEach(function (email) {
                                            attendiesEmails.push(email.attendees);
                                        });

                                        if (attendiesEmails.length > 0) {
                                            for (var e = 0; e < attendiesEmails.length; e++) {
                                                mail_body = commonConfig.createEventTemplate(spaceName,purpose,eventMailStartTime,eventMailEndTime,detail,userName);
                                                var mailOptions = {
                                                    from: commonConfig.impconfig.adminEmail, // sender address
                                                    to: attendiesEmails[e], // receiver's email
                                                    subject: "SoftwebOffice - Invitation to join the meeting", // Subject line
                                                    html: mail_body
                                                }

                                                smtpTransport.sendMail(mailOptions, function(mailSendError, mailSendResponse) {
                                                    if (mailSendError) {
                                                        console.log("Event Send Mail Error "+mailSendError);
                                                    }                                                
                                                });
                                            }
                                        }

                                        if (amenities != undefined && amenities != '' && amenities != null && amenities.trim() && spaceResult[0].spaceAdminEmail) {
                                            mail_body_amenities = commonConfig.createEventAmenitiesTemplate(amenities,userNameResult[0].userEmail);
                                            var mailOptions_amenities = {
                                                from: userNameResult[0].userEmail, // sender address
                                                to: spaceResult[0].spaceAdminEmail, // receiver's email  
                                                subject: "New Amenities Request", // Subject line
                                                html: mail_body_amenities
                                            }
                                            smtpTransport.sendMail(mailOptions_amenities, function(amenitiesMailError, amenitiesMailResponse) {
                                                if (amenitiesMailError) {
                                                    console.log("amenities Mail Error "+amenitiesMailError);
                                                }
                                            });
                                        }

                                        if (catering != undefined && catering != '' && catering != null && catering.trim() && spaceResult[0].spaceAdminEmail) {
                                            mail_body_catering = commonConfig.createEventCateringTemplate(catering,userNameResult[0].userEmail);

                                            var mailOptions_catering = {
                                                from: userNameResult[0].userEmail, // sender address
                                                to: spaceResult[0].spaceAdminEmail, // receiver's email 
                                                subject: "New Catering Request", // Subject line
                                                html: mail_body_catering
                                            }

                                            smtpTransport.sendMail(mailOptions_catering, function(cateringMailError, cateringMailResponse) {
                                                if (cateringMailError) {
                                                    console.log("catering Mail Error "+cateringMailError);
                                                }
                                            });
                                        }
                                    }
                                }).catch(function (err) {
                                    console.log(err);
                                });



                                var eventData = {};                    
                                var query = "SELECT SRR.id as event_id, SRR.purpose as event_purpose, SRR.time as event_start_time, SRR.endtime as event_end_time, SRR.attendies as event_attendies, SL.*,SP.name as organizer_name, SP.email as organizer_email, SD.id as device_id, SD.name as device_name, SD.uuid as device_uuid, SD.major as device_major, SD.minor as device_minor, SD.devicetype as device_devicetype, SD.boardid as device_boardid, SF.id as floorId, SF.floorname as floorName, SOL.id as buldingId, SOL.name as buldingName FROM so_room_reservation SRR LEFT JOIN so_location SL ON SL.id = SRR.locationid LEFT JOIN so_people SP ON SP.id = SRR.peopleid LEFT JOIN so_device SD ON SL.id = SD.locationid LEFT JOIN so_floor SF ON SL.floorid = SF.id LEFT JOIN so_officelocations SOL ON SL.location_id = SOL.id WHERE SRR.peopleid = "+parseInt(userId)+" AND SRR.locationid = "+parseInt(locationId)+" AND CONVERT(VARCHAR, SRR.time , 126) = '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) = '"+endDateISO+"' ";
                                console.log(query);
                                request.query(query)
                                .then(function (result) {
                                    if (result.length) {
                                        for (var i = 0; i < result.length; i++) {
                                            if (eventData && eventData.event_id &&  eventData.event_id == result[i].event_id) {
                                                if (parseInt(result[i].device_id)) {
                                                    var dev = {};
                                                    dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                                    dev.device_name = result[i].device_name ? result[i].device_name : '';
                                                    dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                                    dev.device_major = result[i].device_major ? result[i].device_major : '';
                                                    dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                                    dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                                    dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                                    eventData.spaces.beaconData.push(dev);
                                                }
                                            }
                                            else {
                                                if (result[i].image) {
                                                    result[i].image = baseUrl+'images/'+result[i].image;
                                                }
                                                eventData.event_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                                                eventData.start_time = new Date(result[i].event_start_time);
                                                eventData.end_time = new Date(result[i].event_end_time);
                                                eventData.duration = parseInt(0);

                                                if (eventData.start_time && eventData.end_time) {
                                                    var diff = Math.abs(eventData.start_time - eventData.end_time);
                                                    eventData.duration = parseInt(Math.floor((diff/1000)/60));

                                                    var sm = eventData.start_time.getUTCMonth() + 1;
                                                    var sd = eventData.start_time.getUTCDate();
                                                    var sh = eventData.start_time.getUTCHours();
                                                    var smi = eventData.start_time.getUTCMinutes();
                                                    var ss = eventData.start_time.getUTCSeconds();
                                                    var em = eventData.end_time.getUTCMonth() + 1;
                                                    var ed = eventData.end_time.getUTCDate();
                                                    var eh = eventData.end_time.getUTCHours();
                                                    var emi = eventData.end_time.getUTCMinutes();
                                                    var es = eventData.end_time.getUTCSeconds();
                                                                    
                                                    if (sm.toString().length == 1) {
                                                        sm = "0"+sm;
                                                    }
                                                    
                                                    if (sd.toString().length == 1) {
                                                        sd = "0"+sd;
                                                    }
                                                    
                                                    if (sh.toString().length == 1) {
                                                        sh = "0"+sh;
                                                    }
                                                    
                                                    if (smi.toString().length == 1) {
                                                        smi = "0"+smi;
                                                    }
                                                    
                                                    if (ss.toString().length == 1) {
                                                        ss = "0"+ss;
                                                    }

                                                    eventData.start_time_timestamp = Math.round(new Date(eventData.start_time).getTime()/1000.0)+'.0';
                                                    eventData.start_time = eventData.start_time.getUTCFullYear()+'-'+sm+'-'+sd+' '+sh+':'+smi+':'+ss;                                        
                                                    if (em.toString().length == 1) {
                                                        em = "0"+em;
                                                    }
                                                    
                                                    if (ed.toString().length == 1) {
                                                        ed = "0"+ed;
                                                    }
                                                    
                                                    if (eh.toString().length == 1) {
                                                        eh = "0"+eh;
                                                    }
                                                    
                                                    if (emi.toString().length == 1) {
                                                        emi = "0"+emi;
                                                    }
                                                    
                                                    if (es.toString().length == 1) {
                                                        es = "0"+es;
                                                    }
                                                    
                                                    eventData.end_time_timestamp = Math.round(new Date(eventData.end_time).getTime()/1000.0)+'.0';
                                                    eventData.end_time = eventData.end_time.getUTCFullYear()+'-'+em+'-'+ed+' '+eh+':'+emi+':'+es;
                                                }   

                                                eventData.spaces = {};
                                                eventData.spaces.id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                                                eventData.spaces.name = result[i].name ? result[i].name : '';
                                                eventData.spaces.status = parseInt(1);
                                                eventData.spaces.image = result[i].image ? result[i].image : '';
                                                eventData.spaces.capacity = parseInt(result[i].capacity) ? parseInt(result[i].capacity) : 0 ;
                                                eventData.spaces.notes = result[i].notes ? result[i].notes :'';
                                                eventData.spaces.space_type = result[i].space_type ? result[i].space_type : '';
                                                eventData.spaces.size = result[i].size ? result[i].size : '';
                                                eventData.spaces.building_id = parseInt(result[i].buldingId) ? parseInt(result[i].buldingId) : 0 ;
                                                eventData.spaces.building_name = result[i].buldingName ? result[i].buldingName : '';
                                                eventData.spaces.floor_id = parseInt(result[i].floorId) ? parseInt(result[i].floorId) : 0 ;
                                                eventData.spaces.floor_name = result[i].floorName ? result[i].floorName : '';
                                                eventData.spaces.organizerName = result[i].organizer_name ? result[i].organizer_name : '';                    
                                                eventData.spaces.booked_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                                                eventData.spaces.organizerName = result[i].organizer_name ? result[i].organizer_name : '';
                                                eventData.spaces.start_time = eventData.start_time ? eventData.start_time : '';
                                                eventData.spaces.end_time = eventData.end_time ? eventData.end_time : '';
                                                eventData.spaces.start_time_timestamp = eventData.start_time_timestamp ? eventData.start_time_timestamp : '';
                                                eventData.spaces.end_time_timestamp = eventData.end_time_timestamp ? eventData.end_time_timestamp : '';
                                                eventData.spaces.duration = parseInt(eventData.duration) ? parseInt(eventData.duration) :parseInt(0);
                                                eventData.spaces.available_start_time = '';
                                                eventData.spaces.available_end_time = '';
                                                eventData.spaces.available_start_time_timestamp = '';
                                                eventData.spaces.available_end_time_timestamp = '';
                                                eventData.spaces.purpose = result[i].event_purpose ? result[i].event_purpose : '';
                                                eventData.spaces.attendees = [];
                                                eventData.spaces.beaconData = [];
                                                eventData.spaces.amenities = result[i].amenities ? result[i].amenities.split(",") : [];;

                                                try {
                                                    result[i].event_attendies = JSON.parse(result[i].event_attendies);
                                                    if (result[i].event_attendies && result[i].event_attendies.length) {
                                                        for(var c = 0; c < result[i].event_attendies.length; c++) {
                                                            eventData.spaces.attendees.push({email : result[i].event_attendies[c].attendees});
                                                        }
                                                    }
                                                }
                                                catch (e) { }

                                                if (parseInt(result[i].device_id)) {
                                                    var dev = {};
                                                    dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                                    dev.device_name = result[i].device_name ? result[i].device_name : '';
                                                    dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                                    dev.device_major = result[i].device_major ? result[i].device_major : '';
                                                    dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                                    dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                                    dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                                    eventData.spaces.beaconData.push(dev);
                                                }
                                            }
                                        }

                                        if (eventData.spaces.amenities.length) {
                                            request.query("SELECT * FROM so_amenities where am_status = 1")
                                            .then(function (amenitiesResult) {
                                                if (eventData && amenitiesResult.length) {
                                                    var amenities = eventData.spaces.amenities;
                                                    eventData.spaces.amenities = [];
                                                    for (var j = 0; j < amenities.length; j++) {
                                                        for (var k = 0; k < amenitiesResult.length; k++) {
                                                            if (amenities[j] == amenitiesResult[k].am_guid) {
                                                                var ameni = {};
                                                                ameni.id = amenitiesResult[k].am_guid ? amenitiesResult[k].am_guid : '';
                                                                ameni.name = amenitiesResult[k].amenities ? amenitiesResult[k].amenities : '';
                                                                ameni.image = amenitiesResult[k].am_image ? amenitiesResult[k].am_image : '';
                                                                if (ameni.image) {
                                                                    ameni.image = baseUrl+'images/'+ameni.image;
                                                                }
                                                                eventData.spaces.amenities.push(ameni);
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    eventData.spaces.amenities = [];
                                                }
                                                res.json({"Status":true,"StatusCode":200,"data": eventData});
                                                dbConn.close();
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                                res.json({"Status":true,"StatusCode":200,"data": bookingData});
                                                dbConn.close();
                                            });
                                        }
                                        else {
                                            eventData.spaces.amenities = [];
                                            res.json({"Status":true,"StatusCode":200,"data": eventData});
                                            dbConn.close();
                                        }                                
                                    }
                                    else {
                                        res.json({"Status":true,"StatusCode":200,"data": eventData});
                                        dbConn.close();
                                    }                        
                                }).catch(function (error) {
                                    console.log(error);
                                    res.json({"Status":true,"StatusCode":200,"data": eventData});
                                    dbConn.close();
                                });
                            }).catch(function (err) {
                                res.json({"Status":false,"StatusCode":500,"failed": 0});
                                console.log(err);
                                dbConn.close();
                            });
                        }            
                    }).catch(function (err) {
                        res.json({"Status":false,"StatusCode":500,"failed": 0});
                        console.log(err);
                        dbConn.close();
                    });
                }                
            }
            else {
                res.json({"Status":false,"Error": "'room_id' is not valid."});
                dbConn.close();                    
            }            
        }).catch(function (err) {
            res.json({"Status":false,"StatusCode":500,"failed": 0});
            console.log(err);
            dbConn.close();
        });                
    }).catch(function (err) {
        console.log(err);
        dbConn.close();
    });    
});



/*  bookRoomWith Alexa Webservice By Softweb Solutions*/
/**
  * @webservice : bookRoomwithalexa
  * @desc : book room for event by Alexa echo
  * @author : Softweb solutions - Tarun Varma
*/
router.route('/bookroomwithalexa').post(function (req, res) {
    console.log(req.body)
    var userId     = req.body.user_id; 
    var locationId = req.body.room_id; 
    var purpose    = req.body.purpose;
    var startDate  = req.body.start_date;
    var endDate    = req.body.end_date;
    var attendees  = [];
    var detail     = req.body.note;
    var markAsPrivate = req.body.mark_as_private;


    attendees = [{"email" : "tarun@softwebsolutions.com"},{"email" : "rohan@softwebsolutions.com"}];

    console.log(attendees);

    if (userId == undefined) {
        res.json({"Status":false,"Error": "'user_id' is not set in request."});
        return false;
    }    
    else if (userId != parseInt(userId)) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }
    else if (userId <= 0) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }

    if (locationId == undefined) {
        res.json({"Status":false,"Error": "'room_id' is not set in request."});
        return false;
    }    
    else if (locationId != parseInt(locationId)) {
        res.json({"Status":false,"Error": "'room_id' is not valid."});
        return false;
    }
    else if (locationId <= 0) {
        res.json({"Status":false,"Error": "'room_id' is not valid."});
        return false;
    }

    if (purpose == undefined) {
        res.json({"Status":false,"Error": "'purpose' is not set in request."});
        return false;
    }    
    else if (purpose == '' || purpose == null || !purpose.trim()) {
        res.json({"Status":false,"Error": "'purpose' is not valid."});
        return false;
    }

    if (startDate == undefined) {
        res.json({"Status":false,"Error": "'start_date' is not set in request."});
        return false;
    }    
    else if (startDate == '' || startDate == null || !startDate.trim()) {
        res.json({"Status":false,"Error": "'start_date' is not valid."});
        return false;
    }    

    if (endDate == undefined) {
        res.json({"Status":false,"Error": "'end_date' is not set in request."});
        return false;
    }    
    else if (endDate == '' || endDate == null || !endDate.trim()) {
        res.json({"Status":false,"Error": "'end_date' is not valid."});
        return false;
    }    

    startDate = new Date(startDate*1000);
    endDate = new Date(endDate*1000);
    
    var currentDate = new Date();
    currentDate = new Date(currentDate.getTime() - parseInt(1) *60000);

    if (startDate >= endDate) {
        res.json({"Status":false,"Error": "'end_date' is not valid."});
        return false;
    }
    
    if (attendees == undefined) {
        res.json({"Status":false,"Error": "'attendees' is not set in request."});
        return false;
    }    
    else if (typeof(attendees) != 'object') {
        res.json({"Status":false,"Error": "'attendees' is must be array."});
        return false;
    }
    else if (!attendees.length) {
        res.json({"Status":false,"Error": "'attendees' is not valid."});
        return false;
    }

    if (detail == undefined) {
        detail = '';
    }

    if (markAsPrivate == undefined) {
        markAsPrivate = 0;
    }
    else if (markAsPrivate != 1) {
        markAsPrivate = 0;
    }

    var attend = [];    
    for (var j=0;j<attendees.length;++j) {
        if (attendees[j].email) {
            attend.push({attendees: attendees[j].email});    
        }        
    }

    if (!attend.length) {
        res.json({"Status":false,"Error": "'attendees' is not valid."});
        return false;
    }

    var timestamp =  Date.UTC(startDate.getUTCFullYear(),startDate.getUTCMonth(), startDate.getUTCDate(),startDate.getUTCHours(),startDate.getUTCMinutes(),startDate.getUTCSeconds(),startDate.getUTCMilliseconds());
    timestamp =  Math.round(timestamp/1000.0);
              
    var timeDiff = Math.abs(startDate - endDate);
    var dbDuration = parseInt(Math.floor((timeDiff/1000)/60));
    var dbEventId = '';

    if (dbDuration > 480) {
        res.json({"Status":false,"Error": "Maxium duration is 8 hour so please change the time."});
        return false;
    }
    
    var startDateISO = startDate.toISOString().replace('.000Z', '');
    var endDateISO = endDate.toISOString().replace('.000Z', '');

    purpose = purpose.replace(new RegExp("'", 'g'), "''");
    detail = detail.replace(new RegExp("'", 'g'), "''");

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        request.query("SELECT SL.* FROM so_location SL WHERE SL.id = "+parseInt(locationId))
        .then(function (spaceResult) {
            if (spaceResult.length > 0) {
                if (spaceResult[0].space_status != 1) {
                    res.json({"Status":false,"Error": "room is not available."});
                    dbConn.close();
                }
                else {
                    console.log("SELECT SRR.* FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) >= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) < '"+endDateISO+"')) AND SRR.locationid = "+parseInt(locationId)+" AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R'");
                    request.query("SELECT SRR.* FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) >= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) < '"+endDateISO+"')) AND SRR.locationid = "+parseInt(locationId)+" AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R'")
                    .then(function (result) {
                        if (result.length) {
                            res.json({"Status":false,"Error": "Room already booked for this timeslot."});
                            dbConn.close();
                        }
                        else {
                            console.log("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,endtime,timestamp,attendies,datastorevalue,mark_as_private,detail,action,duration,event_id,notification_action,initial_duration) VALUES ("+parseInt(locationId)+","+parseInt(userId)+",'"+purpose+"','"+startDate.toISOString()+"','"+endDate.toISOString()+"',"+timestamp+",'"+JSON.stringify(attend)+"',"+1+","+markAsPrivate+",'"+detail+"','BOOKNOW',"+parseInt(dbDuration)+",'"+dbEventId+"','B',"+parseInt(dbDuration)+")");                            
                            request.query("INSERT INTO so_room_reservation (locationid,peopleid,purpose,time,endtime,timestamp,attendies,datastorevalue,mark_as_private,detail,action,duration,event_id,notification_action,initial_duration) VALUES ("+parseInt(locationId)+","+parseInt(userId)+",'"+purpose+"','"+startDate.toISOString()+"','"+endDate.toISOString()+"',"+timestamp+",'"+JSON.stringify(attend)+"',"+1+","+markAsPrivate+",'"+detail+"','BOOKNOW',"+parseInt(dbDuration)+",'"+dbEventId+"','B',"+parseInt(dbDuration)+")")
                            .then(function (recordSet) {
                                var eventData = {};                    
                                var query = "SELECT SRR.id as event_id, SRR.purpose as event_purpose, SRR.time as event_start_time, SRR.endtime as event_end_time, SRR.attendies as event_attendies, SL.*,SP.name as organizer_name, SP.email as organizer_email, SD.id as device_id, SD.name as device_name, SD.uuid as device_uuid, SD.major as device_major, SD.minor as device_minor, SD.devicetype as device_devicetype, SD.boardid as device_boardid FROM so_room_reservation SRR LEFT JOIN so_location SL ON SL.id = SRR.locationid LEFT JOIN so_people SP ON SP.id = SRR.peopleid LEFT JOIN so_device SD ON SL.id = SD.locationid WHERE SRR.peopleid = "+parseInt(userId)+" AND SRR.locationid = "+parseInt(locationId)+" AND CONVERT(VARCHAR, SRR.time , 126) = '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) = '"+endDateISO+"' ";
                                console.log(query);
                                request.query(query)
                                .then(function (result) {
                                    if (result.length) {
                                        for (var i = 0; i < result.length; i++) {
                                            if (eventData && eventData.event_id &&  eventData.event_id == result[i].event_id) {
                                                if (parseInt(result[i].device_id)) {
                                                    var dev = {};
                                                    dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                                    dev.device_name = result[i].device_name ? result[i].device_name : '';
                                                    dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                                    dev.device_major = result[i].device_major ? result[i].device_major : '';
                                                    dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                                    dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                                    dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                                    eventData.room.beaconData.push(dev);
                                                }
                                            }
                                            else {
                                                if (result[i].image) {
                                                    result[i].image = baseUrl+'images/'+result[i].image;
                                                }
                                                eventData.event_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                                                eventData.start_time = new Date(result[i].event_start_time);
                                                eventData.end_time = new Date(result[i].event_end_time);
                                                eventData.duration = parseInt(0);

                                                if (eventData.start_time && eventData.end_time) {
                                                    var diff = Math.abs(eventData.start_time - eventData.end_time);
                                                    eventData.duration = parseInt(Math.floor((diff/1000)/60));

                                                    var sm = eventData.start_time.getUTCMonth() + 1;
                                                    var sd = eventData.start_time.getUTCDate();
                                                    var sh = eventData.start_time.getUTCHours();
                                                    var smi = eventData.start_time.getUTCMinutes();
                                                    var ss = eventData.start_time.getUTCSeconds();
                                                    var em = eventData.end_time.getUTCMonth() + 1;
                                                    var ed = eventData.end_time.getUTCDate();
                                                    var eh = eventData.end_time.getUTCHours();
                                                    var emi = eventData.end_time.getUTCMinutes();
                                                    var es = eventData.end_time.getUTCSeconds();
                                                                    
                                                    if (sm.toString().length == 1) {
                                                        sm = "0"+sm;
                                                    }
                                                    
                                                    if (sd.toString().length == 1) {
                                                        sd = "0"+sd;
                                                    }
                                                    
                                                    if (sh.toString().length == 1) {
                                                        sh = "0"+sh;
                                                    }
                                                    
                                                    if (smi.toString().length == 1) {
                                                        smi = "0"+smi;
                                                    }
                                                    
                                                    if (ss.toString().length == 1) {
                                                        ss = "0"+ss;
                                                    }

                                                    eventData.start_time_timestamp = Math.round(new Date(eventData.start_time).getTime()/1000.0)+'.0';
                                                    eventData.start_time = eventData.start_time.getUTCFullYear()+'-'+sm+'-'+sd+' '+sh+':'+smi+':'+ss;                                        
                                                    if (em.toString().length == 1) {
                                                        em = "0"+em;
                                                    }
                                                    
                                                    if (ed.toString().length == 1) {
                                                        ed = "0"+ed;
                                                    }
                                                    
                                                    if (eh.toString().length == 1) {
                                                        eh = "0"+eh;
                                                    }
                                                    
                                                    if (emi.toString().length == 1) {
                                                        emi = "0"+emi;
                                                    }
                                                    
                                                    if (es.toString().length == 1) {
                                                        es = "0"+es;
                                                    }
                                                    
                                                    eventData.end_time_timestamp = Math.round(new Date(eventData.end_time).getTime()/1000.0)+'.0';
                                                    eventData.end_time = eventData.end_time.getUTCFullYear()+'-'+em+'-'+ed+' '+eh+':'+emi+':'+es;
                                                }   

                                                eventData.room = {};
                                                eventData.room.id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                                                eventData.room.name = result[i].name ? result[i].name : '';
                                                eventData.room.status = parseInt(1);
                                                eventData.room.image = result[i].image ? result[i].image : '';
                                                eventData.room.capacity = parseInt(result[i].capacity) ? parseInt(result[i].capacity) : 0 ;
                                                eventData.room.notes = result[i].notes ? result[i].notes :'';
                                                eventData.room.space_type = result[i].space_type ? result[i].space_type : '';
                                                eventData.room.size = result[i].size ? result[i].size : '';
                                                eventData.room.building_id = parseInt(1);
                                                eventData.room.building_name = 'Universal wing A';
                                                eventData.room.floor_id = parseInt(1);
                                                eventData.room.floor_name = 'floor 3';
                                                eventData.room.organizerName = result[i].organizer_name ? result[i].organizer_name : '';                    
                                                eventData.room.booked_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                                                eventData.room.organizerName = result[i].organizer_name ? result[i].organizer_name : '';
                                                eventData.room.start_time = eventData.start_time ? eventData.start_time : '';
                                                eventData.room.end_time = eventData.end_time ? eventData.end_time : '';
                                                eventData.room.start_time_timestamp = eventData.start_time_timestamp ? eventData.start_time_timestamp : '';
                                                eventData.room.end_time_timestamp = eventData.end_time_timestamp ? eventData.end_time_timestamp : '';
                                                eventData.room.duration = parseInt(eventData.duration) ? parseInt(eventData.duration) :parseInt(0);
                                                eventData.room.available_start_time = '';
                                                eventData.room.available_end_time = '';
                                                eventData.room.available_start_time_timestamp = '';
                                                eventData.room.available_end_time_timestamp = '';
                                                eventData.room.purpose = result[i].event_purpose ? result[i].event_purpose : '';
                                                eventData.room.attendees = [];
                                                eventData.room.beaconData = [];
                                                eventData.room.amenities = result[i].amenities ? result[i].amenities.split(",") : [];;

                                                try {
                                                    result[i].event_attendies = JSON.parse(result[i].event_attendies);
                                                    if (result[i].event_attendies && result[i].event_attendies.length) {
                                                        for(var c = 0; c < result[i].event_attendies.length; c++) {
                                                            eventData.room.attendees.push({email : result[i].event_attendies[c].attendees});
                                                        }
                                                    }
                                                }
                                                catch (e) { }

                                                if (parseInt(result[i].device_id)) {
                                                    var dev = {};
                                                    dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                                    dev.device_name = result[i].device_name ? result[i].device_name : '';
                                                    dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                                    dev.device_major = result[i].device_major ? result[i].device_major : '';
                                                    dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                                    dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                                    dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                                    eventData.room.beaconData.push(dev);
                                                }
                                            }
                                        }

                                        if (eventData.room.amenities.length) {
                                            request.query("SELECT * FROm so_amenities where am_status = 1")
                                            .then(function (amenitiesResult) {
                                                if (eventData && amenitiesResult.length) {
                                                    var amenities = eventData.room.amenities;
                                                    eventData.room.amenities = [];
                                                    for (var j = 0; j < amenities.length; j++) {
                                                        for (var k = 0; k < amenitiesResult.length; k++) {
                                                            if (amenities[j] == amenitiesResult[k].am_guid) {
                                                                var ameni = {};
                                                                ameni.id = amenitiesResult[k].am_guid ? amenitiesResult[k].am_guid : '';
                                                                ameni.name = amenitiesResult[k].amenities ? amenitiesResult[k].amenities : '';
                                                                ameni.image = amenitiesResult[k].am_image ? amenitiesResult[k].am_image : '';
                                                                if (ameni.image) {
                                                                    ameni.image = baseUrl+'images/'+ameni.image;
                                                                }
                                                                eventData.room.amenities.push(ameni);
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    eventData.room.amenities = [];
                                                }
                                                res.json({"Status":true,"StatusCode":200,"data": eventData});
                                                dbConn.close();
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                                res.json({"Status":true,"StatusCode":200,"data": bookingData});
                                                dbConn.close();
                                            });
                                        }
                                        else {
                                            eventData.room.amenities = [];
                                            res.json({"Status":true,"StatusCode":200,"data": eventData});
                                            dbConn.close();
                                        }                                
                                    }
                                    else {
                                        res.json({"Status":true,"StatusCode":200,"data": eventData});
                                        dbConn.close();
                                    }                        
                                }).catch(function (error) {
                                    console.log(error);
                                    res.json({"Status":true,"StatusCode":200,"data": eventData});
                                    dbConn.close();
                                });
                            }).catch(function (err) {
                                res.json({"Status":false,"StatusCode":500,"failed": 0});
                                console.log(err);
                                dbConn.close();
                            });
                        }            
                    }).catch(function (err) {
                        res.json({"Status":false,"StatusCode":500,"failed": 0});
                        console.log(err);
                        dbConn.close();
                    });
                }                
            }
            else {
                res.json({"Status":false,"Error": "'room_id' is not valid."});
                dbConn.close();                    
            }            
        }).catch(function (err) {
            res.json({"Status":false,"StatusCode":500,"failed": 0});
            console.log(err);
            dbConn.close();
        });                
    }).catch(function (err) {
        console.log(err);
        dbConn.close();
    });    
});



/*code added by Dhaval Thaker <dhaval.thaker@softwebsolutions.com > save amenities into location*/
/**
  * @webservice  : attendees
  * @desc   : Get attendees
  * @author : Softweb solutions - Dhaval Thaker
*/
router.route('/attendees').post(function (req, res) {

    var userId = req.body.userId; 
    //4.
    var dbConn = new sql.Connection(dbconfigoffice);
    //5.
    dbConn.connect().then(function () {
        //6.
        var request = new sql.Request(dbConn);
        //7.
        request.query("select s.id,s.name,s.email from so_people as s WHERE id = '"+userId+"'").then(function (recordSet) {
            //var space = {list:recordSet};
            res.json({"Status":true,"StatusCode":200,"data": recordSet});
            console.log(recordSet);
            dbConn.close();
        }).catch(function (err) {
            //8.
            console.log(err);
            dbConn.close();
        });
    }).catch(function (err) {
        //9.
        console.log(err);
    });
});


/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > getMyBooking Webservice */
/**
  * @webservice : getMyBooking
  * @desc : get user booking data
  * @return : Return booking data
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/getMyBooking').post(function (req, res) {
    var userId = req.body.user_id;  
    var startDate = req.body.start_date;   
    var endDate = req.body.end_date;   

    if (userId == undefined) {
        res.json({"Status":false,"Error": "'user_id' is not set in request."});
        return false;
    }    
    else if (userId != parseInt(userId)) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }
    else if (userId <= 0) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }

    if (startDate == undefined || startDate == '' || startDate == null || !startDate.trim()) {
        startDate = new Date();
    }
    else {
        startDate = new Date(startDate*1000);
        //startDate = new Date(startDate);
        //startDate = new Date(startDate.getTime() - parseInt(startDate.getTimezoneOffset()) *60000);
    }

    if (endDate == undefined || endDate == '' || endDate == null || !endDate.trim()) {
        endDate = '';
    }
    else {
        endDate = new Date(endDate*1000);
        //endDate = new Date(endDate);
        //endDate = new Date(endDate.getTime() - parseInt(endDate.getTimezoneOffset()) *60000);
    }

    var startDateISO = startDate.toISOString().replace('.000Z', '');
    var endDateISO = endDate.toISOString().replace('.000Z', '');

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        var query = "SELECT SRR.id as event_id, SRR.purpose as event_purpose, SRR.time as event_start_time, SRR.endtime as event_end_time, SRR.attendies as event_attendies, SL.*,SP.name as organizer_name, SP.email as organizer_email, SD.id as device_id, SD.name as device_name, SD.uuid as device_uuid, SD.major as device_major, SD.minor as device_minor, SD.devicetype as device_devicetype, SD.boardid as device_boardid, SF.id as floorId, SF.floorname as floorName, SOL.id as buldingId, SOL.name as buldingName FROM so_room_reservation SRR LEFT JOIN so_location SL ON SL.id = SRR.locationid LEFT JOIN so_people SP ON SP.id = SRR.peopleid LEFT JOIN so_device SD ON SL.id = SD.locationid LEFT JOIN so_floor SF ON SL.floorid = SF.id LEFT JOIN so_officelocations SOL ON SL.location_id = SOL.id WHERE ( SRR.peopleid = "+parseInt(userId)+" OR SRR.attendies LIKE CONCAT('%',(SELECT SPP.email FROM so_people SPP WHERE SPP.id = "+parseInt(userId)+"), '%')) AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R' AND SL.space_status = 1  ";

        if(startDate && endDate) {
            query += " AND ((CONVERT(VARCHAR, SRR.time , 126) BETWEEN '"+startDateISO+"' AND '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) BETWEEN '"+startDateISO+"' AND '"+endDateISO+"'))";
        }
        else if(startDate) {
            query += " AND (CONVERT(VARCHAR, SRR.time , 126) >= '"+startDateISO+"' )";
        }

        query += " ORDER BY SRR.time";

        console.log(query);
        request.query(query).then(function (result) {
            var bookingData = {};
            bookingData.myMeetings = [];
            var eventData = {};
            var duration = parseInt(30);
            var onlyEventData = [];
            if (result.length) {
                for (var i = 0; i < result.length; i++) {
                    if (eventData.hasOwnProperty(result[i].event_id)) {
                        event = eventData[result[i].event_id];
                        if (parseInt(result[i].device_id)) {
                            var dev = {};
                            dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                            dev.device_name = result[i].device_name ? result[i].device_name : '';
                            dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                            dev.device_major = result[i].device_major ? result[i].device_major : '';
                            dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                            dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                            dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                            event.spaces.beaconData.push(dev);
                        }
                    }
                    else {
                        var event = {};

                        if (result[i].image) {
                            result[i].image = baseUrl+'images/'+result[i].image;
                        }
                        event.event_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                        event.start_time = new Date(result[i].event_start_time);
                        event.end_time = new Date(result[i].event_end_time);
                        event.duration = parseInt(0);

                        if (event.start_time && event.end_time) {
                            event.start_time_timestamp = Math.round(new Date(event.start_time).getTime()/1000.0)+'.0';
                            event.end_time_timestamp = Math.round(new Date(event.end_time).getTime()/1000.0)+'.0';
                            var diff = Math.abs(event.start_time - event.end_time);
                            event.duration = parseInt(Math.floor((diff/1000)/60));

                            var sm = event.start_time.getUTCMonth() + 1;
                            var sd = event.start_time.getUTCDate();
                            var sh = event.start_time.getUTCHours();
                            var smi = event.start_time.getUTCMinutes();
                            var ss = event.start_time.getUTCSeconds();
                            var em = event.end_time.getUTCMonth() + 1;
                            var ed = event.end_time.getUTCDate();
                            var eh = event.end_time.getUTCHours();
                            var emi = event.end_time.getUTCMinutes();
                            var es = event.end_time.getUTCSeconds();
                                            
                            if (sm.toString().length == 1) {
                                sm = "0"+sm;
                            }
                            
                            if (sd.toString().length == 1) {
                                sd = "0"+sd;
                            }
                            
                            if (sh.toString().length == 1) {
                                sh = "0"+sh;
                            }
                            
                            if (smi.toString().length == 1) {
                                smi = "0"+smi;
                            }
                            
                            if (ss.toString().length == 1) {
                                ss = "0"+ss;
                            }
                            event.start_time = event.start_time.getUTCFullYear()+'-'+sm+'-'+sd+' '+sh+':'+smi+':'+ss;
                            
                            if (em.toString().length == 1) {
                                em = "0"+em;
                            }
                            
                            if (ed.toString().length == 1) {
                                ed = "0"+ed;
                            }
                            
                            if (eh.toString().length == 1) {
                                eh = "0"+eh;
                            }
                            
                            if (emi.toString().length == 1) {
                                emi = "0"+emi;
                            }
                            
                            if (es.toString().length == 1) {
                                es = "0"+es;
                            }
                            event.end_time = event.end_time.getUTCFullYear()+'-'+em+'-'+ed+' '+eh+':'+emi+':'+es;                            
                        }

                        event.spaces = {};
                        event.spaces.id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                        event.spaces.name = result[i].name ? result[i].name : '';
                        event.spaces.status = parseInt(1);
                        event.spaces.image = result[i].image ? result[i].image : '';
                        event.spaces.capacity = parseInt(result[i].capacity) ? parseInt(result[i].capacity) : 0 ;
                        event.spaces.notes = result[i].notes ? result[i].notes :'';
                        event.spaces.space_type = result[i].space_type ? result[i].space_type : '';
                        event.spaces.size = result[i].size ? result[i].size : '';
                        event.spaces.building_id = parseInt(result[i].buldingId) ? parseInt(result[i].buldingId) : 0 ;
                        event.spaces.building_name = result[i].buldingName ? result[i].buldingName : '';
                        event.spaces.floor_id = parseInt(result[i].floorId) ? parseInt(result[i].floorId) : 0 ;
                        event.spaces.floor_name = result[i].floorName ? result[i].floorName : '';
                        event.spaces.organizerName = result[i].organizer_name ? result[i].organizer_name : '';
                        event.spaces.booked_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                        event.spaces.organizerName = result[i].organizer_name ? result[i].organizer_name : '';
                        event.spaces.start_time = event.start_time ? event.start_time : '';
                        event.spaces.end_time = event.end_time ? event.end_time : '';
                        event.spaces.start_time_timestamp = event.start_time_timestamp ? event.start_time_timestamp : '';
                        event.spaces.end_time_timestamp = event.end_time_timestamp ? event.end_time_timestamp : '';
                        event.spaces.duration = parseInt(event.duration) ? parseInt(event.duration) :parseInt(0);
                        event.spaces.available_start_time = new Date(result[i].event_end_time);
                        event.spaces.available_end_time = new Date(event.spaces.available_start_time.getTime() + parseInt(duration) *60000);
                        event.spaces.available_start_time_timestamp = ''; 
                        event.spaces.available_end_time_timestamp = ''; 
                        event.spaces.purpose = result[i].event_purpose ? result[i].event_purpose : '';
                        event.spaces.attendees = [];
                        event.spaces.beaconData = [];
                        event.spaces.amenities = result[i].amenities ? result[i].amenities.split(",") : [];;

                        try {
                            result[i].event_attendies = JSON.parse(result[i].event_attendies);
                            if (result[i].event_attendies && result[i].event_attendies.length) {
                                for(var c = 0; c < result[i].event_attendies.length; c++) {
                                    event.spaces.attendees.push({email : result[i].event_attendies[c].attendees});
                                }
                            }
                        }
                        catch (e) { }

                        if (parseInt(result[i].device_id)) {
                            var dev = {};
                            dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                            dev.device_name = result[i].device_name ? result[i].device_name : '';
                            dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                            dev.device_major = result[i].device_major ? result[i].device_major : '';
                            dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                            dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                            dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                            event.spaces.beaconData.push(dev);
                        }

                        var onlyEvent = {};
                        onlyEvent.event_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                        onlyEvent.start_time = result[i].event_start_time;
                        onlyEvent.end_time = result[i].event_end_time;
                        onlyEvent.purpose = result[i].event_purpose ? result[i].event_purpose : '';
                        onlyEvent.attendees = result[i].event_attendies ? result[i].event_attendies : '';
                        onlyEvent.location_id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                        onlyEventData.push(onlyEvent);


                        eventData[result[i].event_id] = event;
                    }
                }

                request.query("SELECT * FROM so_amenities where am_status = 1")
                .then(function (amenitiesResult) {
                    if (eventData) {
                        for (var eventid in eventData) {
                            if (eventData.hasOwnProperty(eventid)) {
                                if (amenitiesResult.length && eventData[eventid].spaces.amenities.length) {
                                    var amenities = eventData[eventid].spaces.amenities;
                                    eventData[eventid].spaces.amenities = [];
                                    for (var j = 0; j < amenities.length; j++) {
                                        for (var k = 0; k < amenitiesResult.length; k++) {
                                            if (amenities[j] == amenitiesResult[k].am_guid) {
                                                var ameni = {};
                                                ameni.id = amenitiesResult[k].am_guid ? amenitiesResult[k].am_guid : '';
                                                ameni.name = amenitiesResult[k].amenities ? amenitiesResult[k].amenities : '';
                                                ameni.image = amenitiesResult[k].am_image ? amenitiesResult[k].am_image : '';
                                                if (ameni.image) {
                                                    ameni.image = baseUrl+'images/'+ameni.image;
                                                }
                                                eventData[eventid].spaces.amenities.push(ameni);
                                            }
                                        }
                                    }
                                }
                                else {
                                    eventData[eventid].spaces.amenities = [];
                                }

                                if (onlyEventData.length) {
                                    for (var s = 0; s < onlyEventData.length; s++) {
                                        if (onlyEventData[s].location_id == eventData[eventid].spaces.id) {
                                            var dataStartDate = new Date(onlyEventData[s].start_time);
                                            var dataEndDate = new Date(onlyEventData[s].end_time);
                                                
                                            if (eventData[eventid].spaces.available_start_time <= dataStartDate && dataStartDate < eventData[eventid].spaces.available_end_time) {
                                                eventData[eventid].spaces.available_start_time = dataEndDate;
                                                eventData[eventid].spaces.available_end_time = new Date(eventData[eventid].spaces.available_start_time.getTime() + parseInt(duration) *60000);
                                            }
                                            else if (eventData[eventid].spaces.available_start_time < dataEndDate && dataEndDate < eventData[eventid].spaces.available_end_time) {
                                                eventData[eventid].spaces.available_start_time = dataEndDate;
                                                eventData[eventid].spaces.available_end_time = new Date(eventData[eventid].spaces.available_start_time.getTime() + parseInt(duration) *60000);
                                            }
                                        }
                                    }
                                }

                                if (eventData[eventid].spaces.available_start_time) {
                                    var asm = eventData[eventid].spaces.available_start_time.getUTCMonth() + 1;
                                    var asd = eventData[eventid].spaces.available_start_time.getUTCDate();
                                    var ash = eventData[eventid].spaces.available_start_time.getUTCHours();
                                    var asmi = eventData[eventid].spaces.available_start_time.getUTCMinutes();
                                    var ass = eventData[eventid].spaces.available_start_time.getUTCSeconds();

                                    if (asm.toString().length == 1) {
                                        asm = "0"+asm;
                                    }
                                    
                                    if (asd.toString().length == 1) {
                                        asd = "0"+asd;
                                    }
                                    
                                    if (ash.toString().length == 1) {
                                        ash = "0"+ash;
                                    }
                                    
                                    if (asmi.toString().length == 1) {
                                        asmi = "0"+asmi;
                                    }
                                    
                                    if (ass.toString().length == 1) {
                                        ass = "0"+ass;
                                    }
                                    eventData[eventid].spaces.available_start_time_timestamp = Math.round(new Date(eventData[eventid].spaces.available_start_time).getTime()/1000.0)+'.0';
                                    eventData[eventid].spaces.available_start_time = eventData[eventid].spaces.available_start_time.getUTCFullYear()+'-'+asm+'-'+asd+' '+ash+':'+asmi+':'+ass;
                                }

                                if (eventData[eventid].spaces.available_end_time) {
                                    var aem = eventData[eventid].spaces.available_end_time.getUTCMonth() + 1;
                                    var aed = eventData[eventid].spaces.available_end_time.getUTCDate();
                                    var aeh = eventData[eventid].spaces.available_end_time.getUTCHours();
                                    var aemi = eventData[eventid].spaces.available_end_time.getUTCMinutes();
                                    var aes = eventData[eventid].spaces.available_end_time.getUTCSeconds();

                                    if (aem.toString().length == 1) {
                                        aem = "0"+aem;
                                    }
                                    
                                    if (aed.toString().length == 1) {
                                        aed = "0"+aed;
                                    }
                                    
                                    if (aeh.toString().length == 1) {
                                        aeh = "0"+aeh;
                                    }
                                    
                                    if (aemi.toString().length == 1) {
                                        aemi = "0"+aemi;
                                    }
                                    
                                    if (aes.toString().length == 1) {
                                        aes = "0"+aes;
                                    }
                                    eventData[eventid].spaces.available_end_time_timestamp = Math.round(new Date(eventData[eventid].spaces.available_end_time).getTime()/1000.0)+'.0';
                                    eventData[eventid].spaces.available_end_time = eventData[eventid].spaces.available_end_time.getUTCFullYear()+'-'+aem+'-'+aed+' '+aeh+':'+aemi+':'+aes;                                    
                                }
                                bookingData.myMeetings.push(eventData[eventid]);
                            }
                        }
                        res.json({"Status":true,"StatusCode":200,"data": bookingData});
                    }
                    else {
                        res.json({"Status":true,"StatusCode":200,"data": bookingData});
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    res.json({"Status":true,"StatusCode":200,"data": bookingData});
                });
            }
            else {
                res.json({"Status":true,"StatusCode":200,"data": bookingData});
            }        
            dbConn.close();
        }).catch(function (error) {
            console.log(error);
            dbConn.close();
        });
    }).catch(function (error) {
        console.log(error);
    });
})

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > getRoomMeetingDetails Webservice */
/**
  * @webservice : getRoomMeetingDetails
  * @desc : get room booking data
  * @return : Return booking data
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/getRoomMeetingDetails').post(function (req, res) {
    var userId = req.body.user_id;  
    var roomId = req.body.room_id;  
    var selectedDate = req.body.selected_date;

    if (userId == undefined) {
        userId = 0;
    }    
    else if (userId != parseInt(userId)) {
        userId = 0;
    }

    userId = parseInt(userId);

    if (roomId == undefined) {
        res.json({"Status":false,"Error": "'room_id' is not set in request."});
        return false;
    }    
    else if (roomId != parseInt(roomId)) {
        res.json({"Status":false,"Error": "'room_id' is not valid."});
        return false;
    }
    else if (roomId <= 0) {
        res.json({"Status":false,"Error": "'event_id' is not valid."});
        return false;
    }

    if (selectedDate == undefined) {
        res.json({"Status":false,"Error": "'selected_date' is not set in request."});
        return false;
    }
    else if (selectedDate == '' || selectedDate == null || !selectedDate.trim()) {
        res.json({"Status":false,"Error": "'selected_date' is not set in request."});
        return false;
    }
    selectedDate = new Date(selectedDate*1000);
    //selectedDate = new Date(selectedDate);
    //selectedDate = new Date(selectedDate.getTime() - parseInt(selectedDate.getTimezoneOffset()) *60000);
    selectedDateISO = selectedDate.toISOString().replace('.000Z', '');

    var selMonth = selectedDate.getUTCMonth() + 1;
    var selDay = selectedDate.getUTCDate();

    if (selMonth.toString().length == 1) {
        selMonth = "0"+selMonth;
    }
    
    if (selDay.toString().length == 1) {
        selDay = "0"+selDay;
    }
    var date = selectedDate.getUTCFullYear()+"-"+selMonth+"-"+selDay;

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        var query = "SELECT SRR.id as event_id, SRR.purpose as event_purpose, SRR.time as event_start_time, SRR.endtime as event_end_time, SRR.attendies as event_attendies, SL.*,SP.name as organizer_name, SP.email as organizer_email, SD.id as device_id, SD.name as device_name, SD.uuid as device_uuid, SD.major as device_major, SD.minor as device_minor, SD.devicetype as device_devicetype, SD.boardid as device_boardid, SF.id as floorId, SF.floorname as floorName, SOL.id as buldingId, SOL.name as buldingName FROM so_room_reservation SRR LEFT JOIN so_location SL ON SL.id = SRR.locationid LEFT JOIN so_people SP ON SP.id = SRR.peopleid LEFT JOIN so_device SD ON SL.id = SD.locationid LEFT JOIN so_floor SF ON SL.floorid = SF.id LEFT JOIN so_officelocations SOL ON SL.location_id = SOL.id WHERE SRR.locationid = "+parseInt(roomId)+" AND (CONVERT(VARCHAR, SRR.time , 126) LIKE '%"+date+"%' ) AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R' AND SL.space_status = 1   ";

        if (userId > 0) {
            query += " AND SRR.peopleid = "+parseInt(userId);
        }

        query += " ORDER BY SRR.time";
        
        console.log(query);

        request.query(query).then(function (result) {            
            var bookingData = {};
            bookingData.myMeetings = [];
            var eventData = {};
            var duration = parseInt(15);
            var onlyEventData = [];
            if (result.length) {
                for (var i = 0; i < result.length; i++) {
                    if (eventData.hasOwnProperty(result[i].event_id)) {
                        event = eventData[result[i].event_id];
                        if (parseInt(result[i].device_id)) {
                            var dev = {};
                            dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                            dev.device_name = result[i].device_name ? result[i].device_name : '';
                            dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                            dev.device_major = result[i].device_major ? result[i].device_major : '';
                            dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                            dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                            dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                            event.spaces.beaconData.push(dev);
                        }
                    }
                    else {
                        var event = {};

                        if (result[i].image) {
                            result[i].image = baseUrl+'images/'+result[i].image;
                        }
                        event.event_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                        event.start_time = new Date(result[i].event_start_time);
                        event.end_time = new Date(result[i].event_end_time);
                        event.duration = parseInt(0);

                        if (event.start_time && event.end_time) {
                            var diff = Math.abs(event.start_time - event.end_time);
                            event.duration = parseInt(Math.floor((diff/1000)/60));

                            var sm = event.start_time.getUTCMonth() + 1;
                            var sd = event.start_time.getUTCDate();
                            var sh = event.start_time.getUTCHours();
                            var smi = event.start_time.getUTCMinutes();
                            var ss = event.start_time.getUTCSeconds();
                            var em = event.end_time.getUTCMonth() + 1;
                            var ed = event.end_time.getUTCDate();
                            var eh = event.end_time.getUTCHours();
                            var emi = event.end_time.getUTCMinutes();
                            var es = event.end_time.getUTCSeconds();
                                            
                            if (sm.toString().length == 1) {
                                sm = "0"+sm;
                            }
                            
                            if (sd.toString().length == 1) {
                                sd = "0"+sd;
                            }
                            
                            if (sh.toString().length == 1) {
                                sh = "0"+sh;
                            }
                            
                            if (smi.toString().length == 1) {
                                smi = "0"+smi;
                            }
                            
                            if (ss.toString().length == 1) {
                                ss = "0"+ss;
                            }
                            event.start_time_timestamp = Math.round(new Date(event.start_time).getTime()/1000.0)+'.0';
                            event.start_time = event.start_time.getUTCFullYear()+'-'+sm+'-'+sd+' '+sh+':'+smi+':'+ss;
                            if (em.toString().length == 1) {
                                em = "0"+em;
                            }
                            
                            if (ed.toString().length == 1) {
                                ed = "0"+ed;
                            }
                            
                            if (eh.toString().length == 1) {
                                eh = "0"+eh;
                            }
                            
                            if (emi.toString().length == 1) {
                                emi = "0"+emi;
                            }
                            
                            if (es.toString().length == 1) {
                                es = "0"+es;
                            }
                            event.end_time_timestamp = Math.round(new Date(event.end_time).getTime()/1000.0)+'.0';
                            event.end_time = event.end_time.getUTCFullYear()+'-'+em+'-'+ed+' '+eh+':'+emi+':'+es;
                        }

                        event.spaces = {};
                        event.spaces.id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                        event.spaces.name = result[i].name ? result[i].name : '';
                        event.spaces.status = parseInt(1);
                        event.spaces.image = result[i].image ? result[i].image : '';
                        event.spaces.capacity = parseInt(result[i].capacity) ? parseInt(result[i].capacity) : 0 ;
                        event.spaces.notes = result[i].notes ? result[i].notes :'';
                        event.spaces.space_type = result[i].space_type ? result[i].space_type : '';
                        event.spaces.size = result[i].size ? result[i].size : '';
                        event.spaces.building_id = parseInt(result[i].buldingId) ? parseInt(result[i].buldingId) : 0 ;
                        event.spaces.building_name = result[i].buldingName ? result[i].buldingName : '';
                        event.spaces.floor_id = parseInt(result[i].floorId) ? parseInt(result[i].floorId) : 0 ;
                        event.spaces.floor_name = result[i].floorName ? result[i].floorName : '';
                        event.spaces.organizerName = result[i].organizer_name ? result[i].organizer_name : '';
                        event.spaces.booked_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                        event.spaces.organizerName = result[i].organizer_name ? result[i].organizer_name : '';
                        event.spaces.start_time = event.start_time ? event.start_time : '';
                        event.spaces.end_time = event.end_time ? event.end_time : '';
                        event.spaces.start_time_timestamp = event.start_time_timestamp ? event.start_time_timestamp : '';
                        event.spaces.end_time_timestamp = event.end_time_timestamp ? event.end_time_timestamp : '';
                        event.spaces.duration = parseInt(event.duration) ? parseInt(event.duration) :parseInt(0);
                        event.spaces.available_start_time = new Date(result[i].event_end_time);
                        event.spaces.available_end_time = new Date(event.spaces.available_start_time.getTime() + parseInt(duration) *60000);
                        event.spaces.available_start_time_timestamp = Math.round(new Date(event.spaces.available_start_time).getTime()/1000.0)+'.0'; 
                        event.spaces.available_end_time_timestamp = Math.round(new Date(event.spaces.available_end_time).getTime()/1000.0)+'.0'; 
                        event.spaces.purpose = result[i].event_purpose ? result[i].event_purpose : '';
                        event.spaces.attendees = [];
                        event.spaces.beaconData = [];
                        event.spaces.amenities = result[i].amenities ? result[i].amenities.split(",") : [];;

                        try {
                            result[i].event_attendies = JSON.parse(result[i].event_attendies);
                            if (result[i].event_attendies && result[i].event_attendies.length) {
                                for(var c = 0; c < result[i].event_attendies.length; c++) {
                                    event.spaces.attendees.push({email : result[i].event_attendies[c].attendees});
                                }
                            }
                        }
                        catch (e) { }

                        if (parseInt(result[i].device_id)) {
                            var dev = {};
                            dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                            dev.device_name = result[i].device_name ? result[i].device_name : '';
                            dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                            dev.device_major = result[i].device_major ? result[i].device_major : '';
                            dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                            dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                            dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                            event.spaces.beaconData.push(dev);
                        }

                        var onlyEvent = {};
                        onlyEvent.event_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                        onlyEvent.start_time = result[i].event_start_time;
                        onlyEvent.end_time = result[i].event_end_time;
                        onlyEvent.purpose = result[i].event_purpose ? result[i].event_purpose : '';
                        onlyEvent.attendees = result[i].event_attendies ? result[i].event_attendies : '';
                        onlyEvent.location_id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                        onlyEventData.push(onlyEvent);


                        eventData[result[i].event_id] = event;
                    }
                }

                request.query("SELECT * FROM so_amenities where am_status = 1")
                .then(function (amenitiesResult) {
                    if (eventData) {
                        for (var eventid in eventData) {
                            if (eventData.hasOwnProperty(eventid)) {
                                if (amenitiesResult.length && eventData[eventid].spaces.amenities.length) {
                                    var amenities = eventData[eventid].spaces.amenities;
                                    eventData[eventid].spaces.amenities = [];
                                    for (var j = 0; j < amenities.length; j++) {
                                        for (var k = 0; k < amenitiesResult.length; k++) {
                                            if (amenities[j] == amenitiesResult[k].am_guid) {
                                                var ameni = {};
                                                ameni.id = amenitiesResult[k].am_guid ? amenitiesResult[k].am_guid : '';
                                                ameni.name = amenitiesResult[k].amenities ? amenitiesResult[k].amenities : '';
                                                ameni.image = amenitiesResult[k].am_image ? amenitiesResult[k].am_image : '';
                                                if (ameni.image) {
                                                    ameni.image = baseUrl+'images/'+ameni.image;
                                                }
                                                eventData[eventid].spaces.amenities.push(ameni);
                                            }
                                        }
                                    }
                                }
                                else {
                                    eventData[eventid].spaces.amenities = [];
                                }

                                if (onlyEventData.length) {
                                    for (var s = 0; s < onlyEventData.length; s++) {
                                        var dataStartDate = new Date(onlyEventData[s].start_time);
                                        var dataEndDate = new Date(onlyEventData[s].end_time);

                                        if (eventData[eventid].spaces.available_start_time <= dataStartDate && dataStartDate < eventData[eventid].spaces.available_end_time) {
                                            eventData[eventid].spaces.available_start_time = dataEndDate;
                                            eventData[eventid].spaces.available_end_time = new Date(eventData[eventid].spaces.available_start_time.getTime() + parseInt(duration) *60000);
                                        }
                                        else if (eventData[eventid].spaces.available_start_time < dataEndDate && dataEndDate < eventData[eventid].spaces.available_end_time) {
                                            eventData[eventid].spaces.available_start_time = dataEndDate;
                                            eventData[eventid].spaces.available_end_time = new Date(eventData[eventid].spaces.available_start_time.getTime() + parseInt(duration) *60000);
                                        }
                                    }
                               }

                                if (eventData[eventid].spaces.available_start_time) {
                                    var asm = eventData[eventid].spaces.available_start_time.getUTCMonth() + 1;
                                    var asd = eventData[eventid].spaces.available_start_time.getUTCDate();
                                    var ash = eventData[eventid].spaces.available_start_time.getUTCHours();
                                    var asmi = eventData[eventid].spaces.available_start_time.getUTCMinutes();
                                    var ass = eventData[eventid].spaces.available_start_time.getUTCSeconds();

                                    if (asm.toString().length == 1) {
                                        asm = "0"+asm;
                                    }
                                    
                                    if (asd.toString().length == 1) {
                                        asd = "0"+asd;
                                    }
                                    
                                    if (ash.toString().length == 1) {
                                        ash = "0"+ash;
                                    }
                                    
                                    if (asmi.toString().length == 1) {
                                        asmi = "0"+asmi;
                                    }
                                    
                                    if (ass.toString().length == 1) {
                                        ass = "0"+ass;
                                    }
                                    eventData[eventid].spaces.available_start_time_timestamp = Math.round(new Date(eventData[eventid].spaces.available_start_time).getTime()/1000.0)+'.0';
                                    eventData[eventid].spaces.available_start_time = eventData[eventid].spaces.available_start_time.getUTCFullYear()+'-'+asm+'-'+asd+' '+ash+':'+asmi+':'+ass;                                    
                                }

                                if (eventData[eventid].spaces.available_end_time) {
                                    var aem = eventData[eventid].spaces.available_end_time.getUTCMonth() + 1;
                                    var aed = eventData[eventid].spaces.available_end_time.getUTCDate();
                                    var aeh = eventData[eventid].spaces.available_end_time.getUTCHours();
                                    var aemi = eventData[eventid].spaces.available_end_time.getUTCMinutes();
                                    var aes = eventData[eventid].spaces.available_end_time.getUTCSeconds();

                                    if (aem.toString().length == 1) {
                                        aem = "0"+aem;
                                    }
                                    
                                    if (aed.toString().length == 1) {
                                        aed = "0"+aed;
                                    }
                                    
                                    if (aeh.toString().length == 1) {
                                        aeh = "0"+aeh;
                                    }
                                    
                                    if (aemi.toString().length == 1) {
                                        aemi = "0"+aemi;
                                    }
                                    
                                    if (aes.toString().length == 1) {
                                        aes = "0"+aes;
                                    }
                                    eventData[eventid].spaces.available_end_time_timestamp = Math.round(new Date(eventData[eventid].spaces.available_end_time).getTime()/1000.0)+'.0';
                                    eventData[eventid].spaces.available_end_time = eventData[eventid].spaces.available_end_time.getUTCFullYear()+'-'+aem+'-'+aed+' '+aeh+':'+aemi+':'+aes;                                    
                                }
                                bookingData.myMeetings.push(eventData[eventid]);
                            }
                        }
                        res.json({"Status":true,"StatusCode":200,"data": bookingData});
                    }
                    else {
                        res.json({"Status":true,"StatusCode":200,"data": bookingData});
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    res.json({"Status":true,"StatusCode":200,"data": bookingData});
                });
            }
            else {
                res.json({"Status":true,"StatusCode":200,"data": bookingData});
            }        
            dbConn.close();
        }).catch(function (error) {
            console.log(error);
            dbConn.close();
        });
    }).catch(function (error) {
        console.log(error);
    });
})

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > holdMeeting Webservice */
/**
  * @webservice : holdMeeting
  * @desc : hold room booking
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/holdMeeting').post(function (req, res) {
    var timestamp   =  req.body.timestamp; 
    var status      =  req.body.status; 
    var userid      =  req.body.user_id; 
    var eventid     =  req.body.event_id;

    if (timestamp == undefined) {
        res.json({"Status":false,"Error": "'timestamp' is not set in request."});
        return false;
    }
    else if (timestamp == '' || timestamp == null || !timestamp.trim()) {
        res.json({"Status":false,"Error": "'timestamp' is not valid."});
        return false;
    }

    if (status == undefined) {
        res.json({"Status":false,"Error": "'status' is not set in request."});
        return false;
    }
    else if (status == '' || status == null || !status.trim()) {
        res.json({"Status":false,"Error": "'status' is not valid."});
        return false;
    }

    if (userid == undefined) {
        res.json({"Status":false,"Error": "'user_id' is not set in request."});
        return false;
    }    
    else if (userid != parseInt(userid)) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }
    else if (userid <= 0) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }

    if (eventid == undefined) {
        res.json({"Status":false,"Error": "'event_id' is not set in request."});
        return false;
    }    
    else if (eventid != parseInt(eventid)) {
        res.json({"Status":false,"Error": "'event_id' is not valid."});
        return false;
    }
    else if (eventid <= 0) {
        res.json({"Status":false,"Error": "'event_id' is not valid."});
        return false;
    }
  
    var request =  new sql.Request(cp);
    
    request.query("SELECT * FROM so_room_reservation  where id = "+parseInt(eventid)+" AND peopleid = "+parseInt(userid),
    function(error, eventResult) {
        if (error) {
            res.json({"Status":false,"Error":error.message});
        }
        else {
            if (eventResult[0]!=undefined) {
                var location_id = eventResult[0].locationid;
                
                commonConfig.checkEventExistance(request,eventid)
                .then(function(promptDetail) {
                    if (promptDetail.length > 0) {
                        console.log("------Mobile update-----");
                        console.log("UPDATE so_prompt SET locationid = "+parseInt(location_id)+", timestamp = '"+timestamp+"', status = '"+status+"', userid = "+parseInt(userid)+" WHERE eventid = "+parseInt(eventid));
                        console.log("------Mobile update-----");

                        request.query("UPDATE so_prompt SET locationid = "+parseInt(location_id)+", timestamp = '"+timestamp+"', status = '"+status+"', userid = "+parseInt(userid)+" WHERE eventid = "+parseInt(eventid), function(error, result) {
                            if (error) {
                                res.json({"Status":false,"Error":error.message});
                            }
                            else {
                                res.json({"Status":true,"StatusCode":200,"message":"Status updated successfully.","data": {event_id:parseInt(eventid)}});
                            }
                        });
                    }
                    else {
                        console.log("------Mobile insert-----");
                        console.log("INSERT INTO so_prompt(locationid,timestamp,status,userid,eventid) VALUES("+parseInt(location_id)+",'"+timestamp+"','"+status+"',"+parseInt(userid)+","+parseInt(eventid)+")");
                        console.log("------Mobile insert-----");

                        request.query("INSERT INTO so_prompt(locationid,timestamp,status,userid,eventid) VALUES("+parseInt(location_id)+",'"+timestamp+"','"+status+"',"+parseInt(userid)+","+parseInt(eventid)+")", function(error, result) {
                            if (error) {
                                res.json({"Status":false,"Error":error.message});
                            }
                            else {
                                res.json({"Status":true,"StatusCode":200,"message":"Status inserted successfully.","data": {event_id:parseInt(eventid)}});
                            }
                        });
                    }  
                });
            }
            else {
                res.json({"Status":false,"Error": "Event is not found."});
            }
        }
    });
})

/* code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Check Room Availability Webservice */
/**
  * @webservice : checkRoomAvailability
  * @desc   : Check Room Availability
  * @return : Return Room Availability
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.post('/checkRoomAvailability', function (req, res) {

    var eventId = req.body.event_id;
    var locationId = req.body.room_id;
    var startTime = req.body.start_time;
    var endTime = req.body.end_time;

    if (locationId == undefined) {
        res.json({"Status":false,"Error": "'room_id' is not set in request."});
        return false;
    }    
    else if (locationId != parseInt(locationId)) {
        res.json({"Status":false,"Error": "'room_id' is not valid."});
        return false;
    }
    else if (locationId <= 0) {
        res.json({"Status":false,"Error": "'room_id' is not valid."});
        return false;
    }

    if (eventId == undefined) {
        eventId = parseInt(0);
    }    
    else if (eventId != parseInt(eventId)) {
        eventId = parseInt(0);
    }
    else if (eventId <= 0) {
        eventId = parseInt(0);
    }

    if (startTime == undefined) {
        res.json({"Status":false,"Error": "'start_time' is not set in request."});
        return false;
    }    
    else if (startTime == '' || startTime == null || !startTime.trim()) {
        res.json({"Status":false,"Error": "'start_time' is not valid."});
        return false;
    }    

    if (endTime == undefined) {
        res.json({"Status":false,"Error": "'end_time' is not set in request."});
        return false;
    }    
    else if (endTime == '' || endTime == null || !endTime.trim()) {
        res.json({"Status":false,"Error": "'end_time' is not valid."});
        return false;
    }

    startTime = new Date(startTime*1000);
    endTime = new Date(endTime*1000);
    //startTime = new Date(startTime);
    //endTime = new Date(endTime);

    //startTime = new Date(startTime.getTime() - parseInt(startTime.getTimezoneOffset()) *60000);
    //endTime = new Date(endTime.getTime() - parseInt(endTime.getTimezoneOffset()) *60000);

    startTimeISO = startTime.toISOString().replace('.000Z', '');
    endTimeISO = endTime.toISOString().replace('.000Z', '');
    
    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        var query = "SELECT SRR.* FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startTimeISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startTimeISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endTimeISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endTimeISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) >= '"+startTimeISO+"' AND CONVERT(VARCHAR, SRR.time , 126) < '"+endTimeISO+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) > '"+startTimeISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) < '"+endTimeISO+"')) AND SRR.locationid = "+parseInt(locationId)+" AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R'";

        if (eventId > 0) {
            query += " AND SRR.id != "+eventId;
        }
        
        console.log(query);
        request.query(query)
        .then(function (eventResult) {
            if (eventResult.length > 0) {
                res.json({"Status":false,"Error": "Time slot is not available."});
            }
            else {
                res.json({"Status":true,"StatusCode":200,"Message": "Time slot is available."});
            }            
        }).catch(function (eventError) {
            console.log(eventError);
            res.json({"Status":false,"Error": eventError});
            dbConn.close();
        });
    }).catch(function (error) {
        console.log(error);
    });
});



/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > extendMeeting Webservice */
/**
  * @webservice : extendMeeting
  * @desc : Extend Meeting 
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/extendMeeting').post(function (req, res) {
    var eventId = req.body.event_id;
    var duration = req.body.duration;

    if (eventId == undefined) {
        res.json({"Status":false,"Error": "'event_id' is not set in request."});
        return false;
    }    
    else if (eventId != parseInt(eventId)) {
        res.json({"Status":false,"Error": "'event_id' is not valid."});
        return false;
    }
    else if (eventId <= 0) {
        res.json({"Status":false,"Error": "'event_id' is not valid."});
        return false;
    }

    if (duration == undefined) {
        res.json({"Status":false,"Error": "'duration' is not set in request."});
        return false;
    }    
    else if (duration != parseInt(duration)) {
        res.json({"Status":false,"Error": "'duration' is not valid."});
        return false;
    }
    else if (duration <= 0) {
        res.json({"Status":false,"Error": "'duration' is not valid."});
        return false;
    }

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        request.query("SELECT * FROM so_room_reservation WHERE id = "+parseInt(eventId))
        .then(function (eventResult) {
            if (eventResult[0] != undefined) {
                var eventStartTime = eventResult[0].time;
                var eventEndTime = eventResult[0].endtime
                var newEndTime = new Date(eventEndTime.getTime() + parseInt(duration)*60000);
                var startDateISO = eventStartTime.toISOString().replace('.000Z', '');
                var endDateISO = newEndTime.toISOString().replace('.000Z', '');
                var eventDuration = parseInt(parseInt(eventResult[0].duration) + parseInt(duration));

                request.query("SELECT SRR.* FROM so_room_reservation SRR WHERE ((CONVERT(VARCHAR, SRR.time , 126) <= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) > '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.time , 126) >= '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.time , 126) < '"+endDateISO+"') OR (CONVERT(VARCHAR, SRR.endtime , 126) > '"+startDateISO+"' AND CONVERT(VARCHAR, SRR.endtime , 126) < '"+endDateISO+"')) AND SRR.locationid = "+parseInt(eventResult[0].locationid)+" AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R' AND SRR.id != "+parseInt(eventResult[0].id))
                .then(function (eventCheckResult) {
                    if (eventCheckResult[0] != undefined) {
                        res.json({"Status":false,"Error": "Room already booked for this timeslot.",data:eventResult[0],event:eventCheckResult,eventStartTime:eventStartTime,eventEndTime:eventEndTime,newEndTime:newEndTime,startDateISO:startDateISO,endDateISO:endDateISO});
                        dbConn.close();
                    }
                    else {
                        console.log("UPDATE so_room_reservation SET endtime = '"+newEndTime.toISOString()+"', duration = "+parseInt(eventDuration)+", notification_action = 'E' WHERE id = "+parseInt(eventResult[0].id));
                        request.query("UPDATE so_room_reservation SET endtime = '"+newEndTime.toISOString()+"', duration = "+parseInt(eventDuration)+", notification_action = 'E' WHERE id = "+parseInt(eventResult[0].id))
                        .then(function (eventUpdateResult) {
                            var eventData = {};
                            var query = "SELECT SRR.id as event_id, SRR.purpose as event_purpose, SRR.time as event_start_time, SRR.endtime as event_end_time, SRR.attendies as event_attendies, SL.*,SP.name as organizer_name, SP.email as organizer_email, SD.id as device_id, SD.name as device_name, SD.uuid as device_uuid, SD.major as device_major, SD.minor as device_minor, SD.devicetype as device_devicetype, SD.boardid as device_boardid, SF.id as floorId, SF.floorname as floorName, SOL.id as buldingId, SOL.name as buldingName FROM so_room_reservation SRR LEFT JOIN so_location SL ON SL.id = SRR.locationid LEFT JOIN so_people SP ON SP.id = SRR.peopleid LEFT JOIN so_device SD ON SL.id = SD.locationid LEFT JOIN so_floor SF ON SL.floorid = SF.id LEFT JOIN so_officelocations SOL ON SL.location_id = SOL.id WHERE SRR.id = "+parseInt(eventResult[0].id);
                            console.log(query);
                            request.query(query)
                            .then(function (result) {
                                if (result.length) {
                                    for (var i = 0; i < result.length; i++) {
                                        if (eventData && eventData.event_id &&  eventData.event_id == result[i].event_id) {
                                            if (parseInt(result[i].device_id)) {
                                                var dev = {};
                                                dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                                dev.device_name = result[i].device_name ? result[i].device_name : '';
                                                dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                                dev.device_major = result[i].device_major ? result[i].device_major : '';
                                                dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                                dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                                dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                                eventData.spaces.beaconData.push(dev);
                                            }
                                        }
                                        else {
                                            if (result[i].image) {
                                                result[i].image = baseUrl+'images/'+result[i].image;
                                            }
                                            eventData.event_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                                            eventData.start_time = new Date(result[i].event_start_time);
                                            eventData.end_time = new Date(result[i].event_end_time);
                                            eventData.duration = parseInt(0);

                                            if (eventData.start_time && eventData.end_time) {
                                                var diff = Math.abs(eventData.start_time - eventData.end_time);
                                                eventData.duration = parseInt(Math.floor((diff/1000)/60));

                                                var sm = eventData.start_time.getUTCMonth() + 1;
                                                var sd = eventData.start_time.getUTCDate();
                                                var sh = eventData.start_time.getUTCHours();
                                                var smi = eventData.start_time.getUTCMinutes();
                                                var ss = eventData.start_time.getUTCSeconds();
                                                var em = eventData.end_time.getUTCMonth() + 1;
                                                var ed = eventData.end_time.getUTCDate();
                                                var eh = eventData.end_time.getUTCHours();
                                                var emi = eventData.end_time.getUTCMinutes();
                                                var es = eventData.end_time.getUTCSeconds();
                                                                
                                                if (sm.toString().length == 1) {
                                                    sm = "0"+sm;
                                                }
                                                
                                                if (sd.toString().length == 1) {
                                                    sd = "0"+sd;
                                                }
                                                
                                                if (sh.toString().length == 1) {
                                                    sh = "0"+sh;
                                                }
                                                
                                                if (smi.toString().length == 1) {
                                                    smi = "0"+smi;
                                                }
                                                
                                                if (ss.toString().length == 1) {
                                                    ss = "0"+ss;
                                                }
                                                eventData.start_time_timestamp = Math.round(new Date(eventData.start_time).getTime()/1000.0)+'.0';
                                                eventData.start_time = eventData.start_time.getUTCFullYear()+'-'+sm+'-'+sd+' '+sh+':'+smi+':'+ss;
                                                if (em.toString().length == 1) {
                                                    em = "0"+em;
                                                }
                                                
                                                if (ed.toString().length == 1) {
                                                    ed = "0"+ed;
                                                }
                                                
                                                if (eh.toString().length == 1) {
                                                    eh = "0"+eh;
                                                }
                                                
                                                if (emi.toString().length == 1) {
                                                    emi = "0"+emi;
                                                }
                                                
                                                if (es.toString().length == 1) {
                                                    es = "0"+es;
                                                }
                                                eventData.end_time_timestamp = Math.round(new Date(eventData.end_time).getTime()/1000.0)+'.0';
                                                eventData.end_time = eventData.end_time.getUTCFullYear()+'-'+em+'-'+ed+' '+eh+':'+emi+':'+es;
                                            }   

                                            eventData.spaces = {};
                                            eventData.spaces.id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                                            eventData.spaces.name = result[i].name ? result[i].name : '';
                                            eventData.spaces.status = parseInt(1);
                                            eventData.spaces.image = result[i].image ? result[i].image : '';
                                            eventData.spaces.capacity = parseInt(result[i].capacity) ? parseInt(result[i].capacity) : 0 ;
                                            eventData.spaces.notes = result[i].notes ? result[i].notes :'';
                                            eventData.spaces.space_type = result[i].space_type ? result[i].space_type : '';
                                            eventData.spaces.size = result[i].size ? result[i].size : '';
                                            eventData.spaces.building_id = parseInt(result[i].buldingId) ? parseInt(result[i].buldingId) : 0 ;
                                            eventData.spaces.building_name = result[i].buldingName ? result[i].buldingName : ''; 
                                            eventData.spaces.floor_id = parseInt(result[i].floorId) ? parseInt(result[i].floorId) : 0 ;
                                            eventData.spaces.floor_name = result[i].floorName ? result[i].floorName : ''; 
                                            eventData.spaces.organizerName = result[i].organizer_name ? result[i].organizer_name : '';                    
                                            eventData.spaces.booked_id = parseInt(result[i].event_id) ? parseInt(result[i].event_id) : 0 ;
                                            eventData.spaces.organizerName = result[i].organizer_name ? result[i].organizer_name : '';
                                            eventData.spaces.start_time = eventData.start_time ? eventData.start_time : '';
                                            eventData.spaces.end_time = eventData.end_time ? eventData.end_time : '';
                                            eventData.spaces.start_time_timestamp = eventData.start_time_timestamp ? eventData.start_time_timestamp : '';
                                            eventData.spaces.end_time_timestamp = eventData.end_time_timestamp ? eventData.end_time_timestamp : '';
                                            eventData.spaces.duration = parseInt(eventData.duration) ? parseInt(eventData.duration) :parseInt(0);
                                            eventData.spaces.available_start_time = '';
                                            eventData.spaces.available_end_time = '';
                                            eventData.spaces.available_start_time_timestamp = '';
                                            eventData.spaces.available_end_time_timestamp = '';
                                            eventData.spaces.purpose = result[i].event_purpose ? result[i].event_purpose : '';
                                            eventData.spaces.attendees = [];
                                            eventData.spaces.beaconData = [];
                                            eventData.spaces.amenities = result[i].amenities ? result[i].amenities.split(",") : [];;

                                            try {
                                                result[i].event_attendies = JSON.parse(result[i].event_attendies);
                                                if (result[i].event_attendies && result[i].event_attendies.length) {
                                                    for(var c = 0; c < result[i].event_attendies.length; c++) {
                                                        eventData.spaces.attendees.push({email : result[i].event_attendies[c].attendees});
                                                    }
                                                }
                                            }
                                            catch (e) { }

                                            if (parseInt(result[i].device_id)) {
                                                var dev = {};
                                                dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                                dev.device_name = result[i].device_name ? result[i].device_name : '';
                                                dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                                dev.device_major = result[i].device_major ? result[i].device_major : '';
                                                dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                                dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                                dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                                eventData.spaces.beaconData.push(dev);
                                            }
                                        }
                                    }

                                    if (eventData.spaces.amenities.length) {
                                        request.query("SELECT * FROM so_amenities where am_status = 1")
                                        .then(function (amenitiesResult) {
                                            if (eventData && amenitiesResult.length) {
                                                var amenities = eventData.spaces.amenities;
                                                eventData.spaces.amenities = [];
                                                for (var j = 0; j < amenities.length; j++) {
                                                    for (var k = 0; k < amenitiesResult.length; k++) {
                                                        if (amenities[j] == amenitiesResult[k].am_guid) {
                                                            var ameni = {};
                                                            ameni.id = amenitiesResult[k].am_guid ? amenitiesResult[k].am_guid : '';
                                                            ameni.name = amenitiesResult[k].amenities ? amenitiesResult[k].amenities : '';
                                                            ameni.image = amenitiesResult[k].am_image ? amenitiesResult[k].am_image : '';
                                                            if (ameni.image) {
                                                                ameni.image = baseUrl+'images/'+ameni.image;
                                                            }
                                                            eventData.spaces.amenities.push(ameni);
                                                        }
                                                    }
                                                }
                                            }
                                            else {
                                                eventData.spaces.amenities = [];
                                            }
                                            res.json({"Status":true,"StatusCode":200,"data": eventData});
                                            dbConn.close();
                                        })
                                        .catch(function (error) {
                                            console.log(error);
                                            res.json({"Status":true,"StatusCode":200,"data": eventData});
                                            dbConn.close();
                                        });
                                    }
                                    else {
                                        eventData.spaces.amenities = [];
                                        res.json({"Status":true,"StatusCode":200,"data": eventData});
                                        dbConn.close();
                                    }                                
                                }
                                else {
                                    res.json({"Status":true,"StatusCode":200,"data": eventData});
                                    dbConn.close();
                                }                        
                            }).catch(function (error) {
                                console.log(error);
                                res.json({"Status":true,"StatusCode":200,"data": eventData});
                                dbConn.close();
                            });
                        }).catch(function (eventUpdateError) {
                            console.log(eventUpdateError);
                            res.json({"Status":false,"Error": eventUpdateError});
                            dbConn.close();
                        });
                    }
                }).catch(function (eventCheckError) {
                    console.log(eventCheckError);
                    res.json({"Status":false,"Error": eventCheckError});
                    dbConn.close();
                });                
            }
            else {
                res.json({"Status":false,"Error": "Event is not found."});
            }
        }).catch(function (eventError) {
            console.log(eventError);
            res.json({"Status":false,"Error": eventError});
            dbConn.close();
        });
    }).catch(function (error) {
        console.log(error);
    });
})



/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > cancelMeeting Webservice */
/**
  * @webservice : cancelMeeting
  * @desc : cancel room booking
  * @return : -
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/cancelMeeting').post(function (req, res) {
    var eventId = req.body.event_id;

    if (eventId == undefined) {
        res.json({"Status":false,"Error": "'event_id' is not set in request."});
        return false;
    }    
    else if (eventId != parseInt(eventId)) {
        res.json({"Status":false,"Error": "'event_id' is not valid."});
        return false;
    }
    else if (eventId <= 0) {
        res.json({"Status":false,"Error": "'event_id' is not valid."});
        return false;
    }

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        var query = "UPDATE so_room_reservation SET action = 'CANCELED' where id = "+parseInt(eventId)+" ";
        console.log(query);
        request.query(query).then(function (result) {            
            res.json({"Status":true,"StatusCode":200});
            dbConn.close();
        }).catch(function (error) {
            console.log(error);
            res.json({"Status":false,"Error": error});
            dbConn.close();
        });
    }).catch(function (error) {
        console.log(error);
    });
})

/**
  * @module : Device checkin/check out  Management 
  * @desc   : set device event log
  * @return : return maintain device log
  * @author : Softweb solutions
*/
router.route('/logDeviceEvents').post(function (req, res) {

      
  var deviceuuid  = req.body.deviceuuid;
  var devicemajor = req.body.devicemajor;
  var deviceminor = req.body.deviceminor;
  var timestamp   = req.body.timestamp;
  var status      = req.body.status;
  var emailid     = req.body.emailaddress;
  var peopleid    = req.body.userid;
  
  var locationStatus;
  var isin;

  if(status == "in")
  {
    locationStatus = 1;
    isin = 1;
  }
  else if(status == "out")
  {
    locationStatus = 0;
    isin = 0;
  }
  
  var request = new sql.Request(cp);  
  request.query("SELECT * FROM so_device where major = '"+devicemajor+"' AND minor = '"+deviceminor+"'",
  function(err, result) {
    if(err)
    {
      res.json(err);
    }
    else
    {
      if(result.length == 0)
      {
        res.json({"Status":false,"Error":"Sorry, we cannot find that!"});        
      }
      else
      {
        var beacon_id = result[0].id;
        var request = new sql.Request(cp);
        request.query("UPDATE so_device_locator SET isin=0 WHERE loginid='"+peopleid+"'", function(error, response) {
          if(error)
          {
            res.json({"Status":false,"Error":error});            
          }
          else
          {
            request.query("INSERT INTO so_device_locator (beaconid,loginid,status,timestamp,isin,emailid) VALUES ('"+beacon_id+"','"+peopleid+"','"+status+"','"+timestamp+"', "+isin+",'"+emailid+"')", function(err, result) {
              if(err)
              {
                res.json({"Status":false,"Error":error});
              }
              else
              {
                request.query("SELECT TOP 1 l.address,dl.emailid, l.id,l.name,l.notes,dl.status, CONVERT(VARCHAR(50), dl.timestamp, 121) as timestamp FROM so_device_locator as dl, so_device as d INNER JOIN so_location as l ON l.id=d.locationid WHERE d.major='"+devicemajor+"' AND d.minor='"+deviceminor+"' AND dl.beaconid = d.id  GROUP BY l.address,dl.emailid,l.id,l.image,l.name,l.notes,dl.status, dl.timestamp ORDER BY dl.timestamp DESC",
                function(err1, result1) {
                  if(err1)
                  {
                    res.json({"Status":false,"Error":error1});
                  }
                  else
                  {
                    if(locationStatus == 1)
                    {                        
                      request.query("SELECT  l.id, l.name FROM so_location as l  INNER JOIN so_device as d ON l.id=d.locationid  INNER JOIN so_device_locator as dl ON d.id=dl.beaconid  WHERE dl.loginid = '"+peopleid+"'  AND dl.status='in' AND dl.isin=1  ORDER BY dl.timestamp DESC", function(error, response) {
                        if(error)
                        {
                          res.json({"Status":false,"Error":error});
                        }
                        else
                        {
                          if(response.length > 0)
                          {
                            request.query("UPDATE so_location set status=1 where id="+response[0].id, function(err2, result2) {
                              if(err2)
                              {
                                res.json({"Status":false,"Error":err2});
                              }
                              else
                              {                                
                                request.query("UPDATE so_location set status='"+locationStatus+"' where id="+result1[0].id, function(err2, result2) {
                                  if(err2)
                                  {
                                    res.json({"Status":false,"Error":err2});
                                  }
                                  else
                                  {
                                    io.sockets.emit('locationStatusChange', {
                                      status: locationStatus,
                                      id: result1[0].id
                                    });
                                    result1[0].major = devicemajor;
                                    result1[0].minor = deviceminor;
                                    result1[0].status = status;
                                    
                                    var data_device = {
                                      "room_address": result1[0].address,
                                      "room_name": result1[0].name,
                                      "room_id": result1[0].id,
                                      "user_email":result1[0].emailid,
                                      "beacon_major": devicemajor,
                                      "beacon_minor": deviceminor,
                                      "status":status,
                                      "timestamp":timestamp,
                                    };
                  
                                    res.json({"data": data_device, "message": "Successfully checked in","Status": true})
                                  }
                                });
                              }
                            });
                          }
                          else
                          {
                            
                            if(result1[0] != undefined){
                               
                            request.query("UPDATE so_location set status='"+locationStatus+"' where id="+result1[0].id, function(err2, result2) {
                              if(err2)
                              {
                                res.json(err2);
                              }
                              else
                              {
                                io.sockets.emit('locationStatusChange', {
                                  status: locationStatus,
                                  id: result1[0].id
                                });
                                result1[0].major = devicemajor;
                                result1[0].minor = deviceminor;
                                result1[0].status = status;
                                var data = {
                                  "room_address": result1[0].address,
                                  "room_name": result1[0].name,
                                  "room_id": result1[0].id,
                                  "user_email":result1[0].emailid,
                                  "beacon_major": devicemajor,
                                  "beacon_minor": deviceminor,
                                  "status":status,
                                  "timestamp":timestamp
                                };
                  
                                
                                  res.json({"data": data, "message": "Successfully checked in user.","Status": true})
                                }
                              });
                            }
                          }
                        }
                      });
                    }
                    else
                    {
                        
                      if(result1[0]!=undefined)
                      {
                       
                        request.query("SELECT count(p.id) as people_count FROM so_people as p INNER JOIN so_device_locator as dl ON p.id=dl.loginid INNER JOIN so_device as d ON d.id = dl.beaconid INNER JOIN so_location as l ON l.id=d.locationid WHERE d.uuid='"+deviceuuid+"' AND d.major="+devicemajor+" AND d.minor="+deviceminor+" AND dl.isin=1 AND l.id="+result1[0].id, function(err3, result3) {
                          if(err3)
                          {
                            res.json({"Status":false,"Error":err3});
                          }
                          else
                          {
                            if(result3[0].people_count > 0)
                            {
                              result1[0].major = devicemajor;
                              result1[0].minor = deviceminor;
                              result1[0].status = status;
                              result1[0].timestamp = timestamp;
                                            
                              var data = {
                                "room_address": result1[0].address,
                                "room_name": result1[0].name,
                                "room_id": result1[0].id,
                                "user_email":result1[0].emailid,
                                "beacon_major": devicemajor,
                                "beacon_minor": deviceminor,
                                "status":status,
                                "timestamp":timestamp
                              };
                          
                            
                              res.json({"data": data, "message": "Success1","Status": true})
                            }
                            else
                            {
                                
                              request.query("UPDATE so_location set status='"+locationStatus+"' where id="+result1[0].id, function(err2, result2) {
                                if(err2)
                                {
                                  res.json(err2);
                                }
                                else
                                {
                                  io.sockets.emit('locationStatusChange', {
                                    status: locationStatus,
                                    id: result1[0].id
                                  });

                                  result1[0].major = devicemajor;
                                  result1[0].minor = deviceminor;
                                  result1[0].status = status;
                                  result1[0].timestamp = timestamp;
                                    
                                  var data = {
                                    "room_address": result1[0].address,
                                    "room_name": result1[0].name,
                                    "room_id": result1[0].id,
                                    "user_email":result1[0].emailid,
                                    "beacon_major": devicemajor,
                                    "beacon_minor": deviceminor,
                                    "status":status,
                                    "timestamp":timestamp
                                  };

                                  res.json({"data": data, "message": "Successfully checked out user.","Status": true})
                                }
                              });
                            }
                          }
                        });
                      }
                    }
                  }
                });
              }
            });
          }
        });
      }
    }
  });
});

/**
  * @module : People (Web Service)
  * @desc   : Get list of all notification for selected user
  * @return : Return list of notification
  * @author : Softweb solutions
*/
router.route('/getnotification').post(function (req, res) {
  var user_emailaddress = req.body.email;
  var offset ="";
  var total ="";
  var result2 = [];
  var resultMaintenanceRoom = [];
  var finalResult = [];

  if(req.body.offset=='')
  {
    offset = "0";  
  }else
  {
    offset = req.body.offset;
  }
  
  if(req.body.count=='')
  {
    total = "10";  
  }else
  {
    total = req.body.count;
  }

  var request = new sql.Request(cp);
  request.query("SELECT id FROM so_people where email = '"+user_emailaddress+"'",
  function(err, result)
  {
    if(err)
    {
      res.json({"status":false,"data":null, "message":err.message});
    }
    else
    {
      if(result[0]!=undefined)
      {
        var userid = result[0].id;
        var request = new sql.Request(cp);
        function doSomething() {
          return new Promise(function(resolve) {
            var request = new sql.Request(cp);
            request.query("SELECT sp.name,sp.email,sn.status,sn.type,sn.timestamp,CAST(sn.title AS NVARCHAR(max)) as title, CAST(sn.message AS NVARCHAR(max)) as 'message',sn.flag,sn.readnotify, sn.roomID, sl.name as roomName, sn.startTime, sn.endTime FROM so_people as sp  LEFT JOIN so_notification as sn ON sp.id = sn.peopleid LEFT JOIN so_location as sl ON sl.id = sn.roomID  where sn.status='true' and sn.peopleid = '"+result[0].id+"' and sn.type = 1 group by sn.timestamp,sp.name,sp.email,sn.status,sn.type, CAST(sn.title AS NVARCHAR(max)), CAST(sn.message AS NVARCHAR(max)),sn.flag,sn.readnotify, sn.roomID, sl.name, sn.startTime, sn.endTime order by sn.timestamp desc",
            function(err, maintenanceResult)
            {
              if(err)
              {
                res.json({"Status":false,"data":null, "message":err.message});
              }
              else
              {
                resolve(maintenanceResult);
              }
            });
          });
        }

        doSomething().then(function(value) {
          async.forEachSeries(value, function(maintainanceResult, callback){
            request.query("UPDATE so_notification SET flag=1 WHERE peopleid='"+userid+"' AND timestamp='"+maintainanceResult.timestamp+"'",
            function(err, result)
            {
              if(err)
              {
                res.json({"Status":false,"data":null, "message":err.message});
              }  
            });
              
            request.query("SELECT TOP(1) ID FROM so_notification WHERE  peopleid='"+userid+"' AND timestamp='"+maintainanceResult.timestamp+"'",
            function(err, result3)
            {
              if(err)
              {
                res.json({"Status":false,"data":null, "message":err.message});
              }
              else
              {
                if(offset == "0")
                {
                  resultMaintenanceRoom.push({
                    "ID"        :   result3[0].ID,
                    "name"      :   maintainanceResult.name,
                    "email"     :   maintainanceResult.email,
                    "status"    :   maintainanceResult.status,
                    "type"      :   maintainanceResult.type,
                    "timestamp" :   maintainanceResult.timestamp,
                    "title"     :   maintainanceResult.title,
                    "message"   :   maintainanceResult.message,
                    "flag"      :   maintainanceResult.flag,
                    "readnotify":   maintainanceResult.readnotify,
                    "roomName"  :   maintainanceResult.roomName,
                    "startTime" :   maintainanceResult.startTime,
                    "endTime"   :   maintainanceResult.endTime
                  });
                }  
              }
              callback();
            });
          },function(err){
            if(err)
            {
              res.json({"Status":false,"data":null, "message":err.message});
            }
            request.query("SELECT sp.name,sp.email,sn.status,sn.type,sn.timestamp,CAST(sn.title AS NVARCHAR(max)) as title, CAST(sn.message AS NVARCHAR(max)) as 'message',sn.flag,sn.readnotify FROM so_people as sp  LEFT JOIN so_notification as sn ON sp.id = sn.peopleid  where sn.status='true' and sn.peopleid = '"+result[0].id+"' and sn.type = 0 group by sn.timestamp,sp.name,sp.email,sn.status,sn.type, CAST(sn.title AS NVARCHAR(max)), CAST(sn.message AS NVARCHAR(max)),sn.flag,sn.readnotify order by sn.timestamp desc  OFFSET "+offset+" ROWS FETCH NEXT "+total+" ROWS ONLY",
            function(err, result1)
            {
              if(err)
              {
                res.json({"Status":false,"data":null, "message":err.message});
              }
              else
              {
                async.forEachSeries(result1, function(result1, callback){
                  request.query("UPDATE so_notification SET flag=1 WHERE peopleid='"+userid+"' AND timestamp='"+result1.timestamp+"'",
                  function(err, result)
                  {
                    if(err)
                    {
                      res.json({"Status":false,"data":null, "message":err.message});
                    }  
                  });
                  
                  request.query("SELECT TOP(1) ID FROM so_notification WHERE  peopleid='"+userid+"' AND timestamp='"+result1.timestamp+"'",
                  function(err, result3)
                  {
                    if(err)
                    {
                      res.json({"Status":false,"data":null, "message":err.message});
                    }
                    else
                    {
                      result2.push({
                        "ID"        :   result3[0].ID,
                        "name"      :   result1.name,
                        "email"     :   result1.email,
                        "status"    :   result1.status,
                        "type"      :   result1.type,
                        "timestamp" :   result1.timestamp,
                        "title"     :   result1.title,
                        "message"   :   result1.message,
                        "flag"      :   result1.flag,
                        "readnotify":   result1.readnotify
                      }); 
                    }
                    callback();
                  });
                },function(err){
                  if(err)
                  {
                    res.json({"Status":false,"data":null, "message":err.message});
                  } 
                  if(result2.length>0 || resultMaintenanceRoom.length>0)
                  {
                    res.json({
                      "Status" : true, 
                      "data":{
                          //"notification" : {
                            "roomMaintenance" : resultMaintenanceRoom,
                            "roomNormal"      : result2,
                          //}
                        },
                      "message":"Success"
                    });
                  }
                  else
                  {
                    res.json({"Status":true,"data":null, "message":"Record not found."});
                  }  
                });  
              }
            }); 
          });
        });
      }
      else
      {
        res.json({"Status":false,"data":null, "message":"People not found"});
      }   
    }
  });
});

 /*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > Get Spaces With Events Webservice */
/**
  * @webservice : getSpaces
  * @desc : get spaces with Events
  * @return : Return spaces
  * @author : Softweb solutions - Alpeshsinh Solnaki
*/
router.route('/getSpacesWithEvents').post(function (req, res) {
    var userId = req.body.user_id;
    var selectedDate = req.body.selected_date;

    if (userId == undefined) {
        res.json({"Status":false,"Error": "'user_id' is not set in request."});
        return false;
    }    
    else if (userId != parseInt(userId)) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }
    else if (userId <= 0) {
        res.json({"Status":false,"Error": "'user_id' is not valid."});
        return false;
    }

    if (selectedDate == undefined) {
        res.json({"Status":false,"Error": "'selected_date' is not set in request."});
        return false;
    }
    else if (selectedDate == '' || selectedDate == null || !selectedDate.trim()) {
        res.json({"Status":false,"Error": "'selected_date' is not valid."});
        return false;
    }

    selectedDate = new Date(selectedDate*1000);
    //selectedDate = new Date(selectedDate.getTime() - parseInt(selectedDate.getTimezoneOffset()) *60000);
    
    var startMonth = selectedDate.getMonth() + 1;
    if (startMonth.toString().length == 1) {
        startMonth = "0"+startMonth;
    }

    var startDay = selectedDate.getDate();
    if (startDay.toString().length == 1) {
        startDay = "0"+startDay;
    }

    var startDate = selectedDate.getFullYear()+'-'+startMonth+'-'+startDay;

    var dbConn = new sql.Connection(dbconfigoffice);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        var amenitiesData = [];
        request.query("SELECT * FROm so_amenities where am_status = 1")
        .then(function (amenitiesResult) {
            if (amenitiesResult.length) {
                amenitiesData = amenitiesResult;
            }
        })
        .catch(function (error) {
            console.log(error);
        });

        var resultData = {};
        resultData.spaces = [];

        setTimeout(function(){ 
            var query = "SELECT SL.*, SD.id as device_id, SD.name as device_name, SD.uuid as device_uuid, SD.major as device_major, SD.minor as device_minor, SD.devicetype as device_devicetype, SD.boardid as device_boardid, SF.id as floorId, SF.floorname as floorName, SOL.id as buldingId, SOL.name as buldingName FROM so_location SL INNER JOIN so_people SP ON SL.officeid = SP.officeid LEFT JOIN so_device SD ON SL.id = SD.locationid LEFT JOIN so_floor SF ON SL.floorid = SF.id LEFT JOIN so_officelocations SOL ON SL.location_id = SOL.id WHERE SL.rooms_from = 1  AND SL.space_status = 1 AND SP.id = "+parseInt(userId)+" ";

            console.log(query);
            request.query(query).then(function (result) {
                var spaceData = {};
                var spaceIds = [];
                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        if (spaceData.hasOwnProperty(result[i].id)) {
                            space = spaceData[result[i].id];
                            if (parseInt(result[i].device_id)) {
                                var dev = {};
                                dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                dev.device_name = result[i].device_name ? result[i].device_name : '';
                                dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                dev.device_major = result[i].device_major ? result[i].device_major : '';
                                dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                space.beaconData.push(dev);
                            }
                        }
                        else {
                            var space = {};
                            if (result[i].image) {
                                result[i].image = baseUrl+'images/'+result[i].image;
                            }

                            if (parseInt(result[i].id)) {
                                spaceIds.push(parseInt(result[i].id));
                            }

                            space.id = parseInt(result[i].id) ? parseInt(result[i].id) : 0 ;
                            space.name = result[i].name ? result[i].name : '';
                            space.status = (result[i].booked_id == result[i].id) ? parseInt(1) : 0;
                            space.image = result[i].image ? result[i].image : '';
                            space.capacity = parseInt(result[i].capacity) ? parseInt(result[i].capacity) : 0 ;
                            space.notes = result[i].notes ? result[i].notes :'';
                            space.space_type = result[i].space_type ? result[i].space_type : '';
                            space.size = result[i].size ? result[i].size : '';
                            space.booked_id = parseInt(0);
                            space.organizerName = '';
                            space.attendees = [];
                            space.start_time = '';
                            space.end_time = '';
                            space.start_time_timestamp = '';
                            space.end_time_timestamp = '';
                            space.duration = parseInt(0);
                            space.available_start_time = '';
                            space.available_end_time = '';
                            space.available_start_time_timestamp = '';
                            space.available_end_time_timestamp = '';
                            space.purpose = '';
                            space.building_id = parseInt(result[i].buldingId) ? parseInt(result[i].buldingId) : 0 ;
                            space.building_name = result[i].buldingName ? result[i].buldingName : '';
                            space.floor_id = parseInt(result[i].floorId) ? parseInt(result[i].floorId) : 0 ;
                            space.floor_name = result[i].floorName ? result[i].floorName : '';
                            space.beaconData = [];
                            space.amenities = [];
                            space.eventsData = [];
                            

                            if (amenitiesData.length && result[i].amenities) {
                                result[i].amenities = result[i].amenities.split(",");
                                if (result[i].amenities.length) {
                                    for (var j = 0; j < result[i].amenities.length; j++) {
                                        for (var k = 0; k < amenitiesData.length; k++) {
                                            if (result[i].amenities[j] == amenitiesData[k].am_guid) {
                                                var ameni = {};
                                                ameni.id = amenitiesData[k].am_guid ? amenitiesData[k].am_guid : '';
                                                ameni.name = amenitiesData[k].amenities ? amenitiesData[k].amenities : '';
                                                ameni.image = amenitiesData[k].am_image ? amenitiesData[k].am_image : '';
                                                if (ameni.image) {
                                                    ameni.image = baseUrl+'images/'+ameni.image;
                                                }
                                                space.amenities.push(ameni);
                                            }
                                        }
                                    }
                                }
                            }

                            if (parseInt(result[i].device_id)) {
                                var dev = {};
                                dev.device_id = parseInt(result[i].device_id) ? parseInt(result[i].device_id) : 0;
                                dev.device_name = result[i].device_name ? result[i].device_name : '';
                                dev.device_uuid = result[i].device_uuid ? result[i].device_uuid : '';
                                dev.device_major = result[i].device_major ? result[i].device_major : '';
                                dev.device_minor = result[i].device_minor ? result[i].device_minor : '';
                                dev.device_devicetype = result[i].device_devicetype ? result[i].device_devicetype : '';
                                dev.device_boardid = result[i].device_boardid ? result[i].device_boardid : '';
                                space.beaconData.push(dev);
                            }

                            spaceData[result[i].id] = space;
                        }
                    }
                }                
                
                if (spaceIds.length && spaceData) {
                    console.log("SELECT SRR.*,SP.name as organizer_name, SP.email as organizer_email FROM so_room_reservation SRR LEFT JOIN so_people SP ON SP.id = SRR.peopleid WHERE ((CONVERT(VARCHAR, SRR.time , 126) LIKE '%"+startDate+"%')) AND SRR.locationid IN ("+spaceIds.join()+") AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R' ORDER BY SRR.time ASC");
                    request.query("SELECT SRR.*,SP.name as organizer_name, SP.email as organizer_email FROM so_room_reservation SRR LEFT JOIN so_people SP ON SP.id = SRR.peopleid WHERE ((CONVERT(VARCHAR, SRR.time , 126) LIKE '%"+startDate+"%')) AND SRR.locationid IN ("+spaceIds.join()+") AND SRR.action != 'CANCELED' AND SRR.notification_action != 'R' ORDER BY SRR.time ASC")
                    .then(function (eventResult) {
                        if (eventResult.length) {
                            for (var a = 0; a < eventResult.length; a++) {
                                if (spaceData.hasOwnProperty(eventResult[a].locationid)) {
                                    var dataStartDate = new Date(eventResult[a].time);
                                    var dataEndDate = new Date(eventResult[a].endtime);
                                    var spaceEvent = {};
                                    
                                    spaceEvent.event_id = parseInt(eventResult[a].id) ? parseInt(eventResult[a].id) : parseInt(0);
                                    spaceEvent.purpose = eventResult[a].purpose ? eventResult[a].purpose : "";
                                    spaceEvent.organizerName = eventResult[a].organizer_name ? eventResult[a].organizer_name : "";
                                    spaceEvent.organizerEmail = eventResult[a].organizer_email ? eventResult[a].organizer_email : "";
                                    spaceEvent.start_time = dataStartDate ? dataStartDate : "";
                                    spaceEvent.end_time = dataEndDate ? dataEndDate : "";
                                    spaceEvent.duration = parseInt(eventResult[a].duration) ? parseInt(eventResult[a].duration) : parseInt(0);
                                    spaceEvent.attendies = [];
                                    spaceEvent.note = eventResult[a].detail ? eventResult[a].detail : "";
                                    try {
                                        eventResult[a].attendies = JSON.parse(eventResult[a].attendies);
                                        if (eventResult[a].attendies && eventResult[a].attendies.length) {
                                            for(var c = 0; c < eventResult[a].attendies.length; c++) {
                                                spaceEvent.attendies.push({email : eventResult[a].attendies[c].attendees});
                                            }
                                        }
                                    }
                                    catch (e) { }

                                    var sm = dataStartDate.getUTCMonth() + 1;
                                    var sd = dataStartDate.getUTCDate();
                                    var sh = dataStartDate.getUTCHours();
                                    var smi = dataStartDate.getUTCMinutes();
                                    var ss = dataStartDate.getUTCSeconds();

                                    if (sm.toString().length == 1) {
                                        sm = "0"+sm;
                                    }
                                        
                                    if (sd.toString().length == 1) {
                                        sd = "0"+sd;
                                    }
                                        
                                    if (sh.toString().length == 1) {
                                        sh = "0"+sh;
                                    }
                                        
                                    if (smi.toString().length == 1) {
                                        smi = "0"+smi;
                                    }
                                        
                                    if (ss.toString().length == 1) {
                                        ss = "0"+ss;
                                    }
                                    spaceEvent.start_time_timestamp = Math.round(new Date(spaceEvent.start_time).getTime()/1000.0)+'.0';
                                    spaceEvent.start_time = dataStartDate.getUTCFullYear()+'-'+sm+'-'+sd+' '+sh+':'+smi+':'+ss;
                                    var em = dataEndDate.getUTCMonth() + 1;
                                    var ed = dataEndDate.getUTCDate();
                                    var eh = dataEndDate.getUTCHours();
                                    var emi = dataEndDate.getUTCMinutes();
                                    var es = dataEndDate.getUTCSeconds();

                                    if (em.toString().length == 1) {
                                        em = "0"+em;
                                    }
                                    
                                    if (ed.toString().length == 1) {
                                        ed = "0"+ed;
                                    }
                                    
                                    if (eh.toString().length == 1) {
                                        eh = "0"+eh;
                                    }
                                    
                                    if (emi.toString().length == 1) {
                                        emi = "0"+emi;
                                    }
                                    
                                    if (es.toString().length == 1) {
                                        es = "0"+es;
                                    }
                                    spaceEvent.end_time_timestamp = Math.round(new Date(spaceEvent.end_time).getTime()/1000.0)+'.0';
                                    spaceEvent.end_time = dataEndDate.getUTCFullYear()+'-'+em+'-'+ed+' '+eh+':'+emi+':'+es;
                                    spaceData[eventResult[a].locationid].eventsData.push(spaceEvent);
                                }
                            }
                        }
                        
                        if (spaceData) {
                            for (var spaceid in spaceData) {
                                if (spaceData.hasOwnProperty(spaceid)) {
                                    resultData.spaces.push(spaceData[spaceid]);
                                }
                            }
                        }
                        res.json({"Status":true,"StatusCode":200,"data": resultData});
                    })
                    .catch(function (error) {
                        res.json({"Status":true,"StatusCode":200,"data": resultData});
                    });
                }
                else {                    
                    res.json({"Status":true,"StatusCode":200,"data": resultData});
                }

                dbConn.close();
            }).catch(function (err) {
                console.log(err);
                dbConn.close();
            });
        }, 500);
    }).catch(function (err) {
        console.log(err);
    });
});

/*code added by Alpeshsinh Solanki <alpesh.solanki@softwebsolutions.com > getLoginUrlForBot */
/**
  * @webservice  : getLoginUrlForBot
  * @desc   : Get Login Url For Bot
  * @author : Softweb solutions - Alpeshsinh Solanki
*/
router.route('/getLoginUrlForBot').get(function (req, res) {
    var response = {};
    response.url = "http://smartoffice.softwebopensource.com/botlogin#/botlogin";
    res.json({"Status":true,"StatusCode":200,"data": response});
})

router.use(function(req, res, next) {
    // do logging

    console.log('Something is happening.');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function validateEmail(mail) {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (mail.match(mailformat)) {
        return true;
    }
    return false;  
}

module.exports = router;