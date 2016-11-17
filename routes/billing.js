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
var commonConfig  = require("../commonConfig");
var brainTree  = require("./braintreeFunctions");
var util = require('util'),
braintree = require('braintree');
var gateway = braintree.connect(commonConfig.brainTreeConfig.config);


/*var obj =  [{
             id: 'az9c8cn8',
             status: 'settled',
            },
            {
             id: '25z4dfaz',
             status: 'settled',
            }];
obj.forEach(function (item) {
  console.log(item);
  //someFn(item);
});*/
/*for (var property in object) {
    console.log(property);
    if (object.hasOwnProperty(property)) {
        // do stuff
    }
}*/

/*var stream = gateway.subscription.search(function (search) {
  search.id().is("cxxv3r");
}, function (err, response) {
    console.log(response);
  response.each(function (err, subscription) {
    console.log(subscription);
  });
});*/

/*gateway.subscription.find("cxxv3r", function (err, result) {
  console.log("----err----");
    console.log(err);
    console.log("----result----");
    console.log(result);
});*/
/*gateway.transaction.search(function (search) {
  search.customerId().is("37911741");//37911741
}, function (err, response) {
  console.log(response);
  
  response.each(function (err, transaction) {
    console.log("transaction");

  });
});*/

/*gateway.transaction.search(function (search) {
  search.customerEmail().is("imran@softwebsolutions.com");
}, function (err, response) {
  console.log(response);
});*/

/* GET home page. */
router.get('/getToken', function (req, res, next) {

  brainTree.getClientToken(function (token) {
    console.log("1111111111111111-------"+token);
    if (token) {
      brainTree.getPlansAvailable(function (plans) {
        if (plans) {
          res.json({"status":true,"data":{'token' : token, 'plans':plans}, "message":"Token get successfully"});
        }
        else
        {
          res.json({"status":false,"data":null, "message":"Failed to get plan successfully"});
        }
      });
    }
    else
    {
      res.json({"status":false,"data":null, "message":"Failed to get token successfully"});
    }
  });
});

/* POST Value for subscription */
router.post('/subscribe', function (req, res) {

  console.log("---- server call for /subscribe ------");
  console.log(req.body);
  console.log("---- server call for /subscribe ------");

  var nonce = req.body.payment_method_nonce;
  var plan = req.body.plan;

  var objData = {
    userId    : req.body.userid,
    firstName : req.body.name,
    lastName  : req.body.lastName,
    company   : req.body.company,
    email     : req.body.email,
    phone     : req.body.phone,
    website   : req.body.website,
    price     : req.body.price,
    //paymentMethod : nonce,
  };

  if (nonce && plan && req.body.price && req.body.email) 
  {
    brainTree.createSubscription(plan, nonce, objData, function (subscribed) {
      console.log("---subscribed---");
      console.log(subscribed);
      console.log("---subscribed---");
      if (subscribed.status == true) {
        var result =  subscribed;
        setTimeout(function() {
          req.session.paymentResponse = result;

          console.log("===session Now redirect on client===");
          console.log(req.session);
          console.log("===session Now redirect on client===");

          setTimeout(function(){
            console.log("----Now redirect----");
            res.redirect('/index');
          },1000);
        }, 500);
      } else {

        var result =  subscribed;
       setTimeout(function() {
          req.session.paymentResponse = result;

          console.log("===session Now redirect on client===");
          console.log(req.session);
          console.log("===session Now redirect on client===");

          setTimeout(function(){
            console.log("----Now redirect----");
            res.redirect('/index');
          },1000);
        }, 500);
      }
    });
  } else {
    var result =  {
                    'type' : 'payment', 
                    'status' : false, 
                    'data': null, 
                    'message':'Unauthorised..!' };

    setTimeout(function() {
      req.session.paymentResponse = result;

      console.log("===session Now redirect on client===");
      console.log(req.session);
      console.log("===session Now redirect on client===");

      setTimeout(function(){
        console.log("----Now redirect----");
        res.redirect('/index');
      },1000);
    }, 500);
  }
});

/**
  * @module : Braintree Payment 
  * @desc   : Get payment response
  * @return : Return payment response
  * @author : Softweb solutions
*/
router.post('/getTransactions', function (req, res) {

  var s_uc_appuserguid = req.body.userID;
  console.log(req.body);
  dbconfig = commonConfig.dbConfigHOQ
  var dbConn = new sql.Connection(dbconfig);
  dbConn.connect().then(function() { 
    var request = new sql.Request(dbConn);
    request.input("s_uc_appuserguid", s_uc_appuserguid);

    request.execute('SoSubscriptionSELECT', function(err, recordsets, returnValue, affected) {
      console.log("---err----");
      console.log(err);
      console.log("---recordsets----");
      console.log(recordsets);
      console.log(recordsets[0].length);

      if(recordsets[0].length > 0)
      {
        var subscriptionId = recordsets[0][0].subscriptionId;
        gateway.subscription.find(subscriptionId, function (err, result) {//subscriptionId
          var data = [];
          var cnt = 0;
          var response = result.transactions;
          var responseLength = response.length;
          console.log("Response length-----"+responseLength);
          var subscriptionDetail = {
            status                  : result.status,
            billingPeriodEndDate    : result.billingPeriodEndDate,
            billingPeriodStartDate  : result.billingPeriodStartDate,
            addOns                  : result.addOns
          };
          //var subscriptionId = 
          //console.log(response);
          //console.log(subscriptionDetail);
          if(err || responseLength < 1)
          {
            if(err)
            {
              res.json({'status' : false, 'data': null, 'message':err.message});
            }
            else
            {
              res.json({'status' : false, 'data': null, 'message':'Transaction not found.'});
            }
          }
          else
          {
            async.series([
              function(cb) {
                console.log("-----001----");
                response.forEach(function (transaction) {
                  console.log(transaction.id);
                  var curData = {
                    id                    : transaction.id,
                    status                : transaction.status,
                    amount                : transaction.amount,
                    currencyIsoCode       : transaction.currencyIsoCode,
                    merchantAccountId     : transaction.merchantAccountId,
                    createdAt             : transaction.createdAt,
                    updatedAt             : transaction.updatedAt,
                    customer              : transaction.customer,
                    settlementBatchId     : transaction.settlementBatchId,
                    planId                : transaction.planId,
                    subscriptionId        : subscriptionId,
                    subscription          : subscriptionDetail,
                    addOns                : transaction.addOns,
                    discounts             : transaction.discounts,
                    recurring             : transaction.recurring,
                    paymentInstrumentType : transaction.paymentInstrumentType,
                  }
                  data.push(curData);
                  cnt++;
                  if(responseLength == cnt)
                  {
                    console.log("--Process done---");
                    cb();
                  }
                });
              },
              function(cb) {
                console.log("==================data");
                console.log(data);
                if(data.length > 0)
                {
                  res.json({'status' : true, 'data': data, 'message':'Transaction fetch successfully.'});
                }
                else
                {
                  res.json({'status' : false, 'data': null, 'message':'Transaction not found.'});
                }
                console.log("==================data");
              }
            ]);
          }
        });
      }
      else
      {
        res.json({'status' : false, 'data': null, 'message':'Subscribed user not found.'});
      }
    });
  });
});


/**
  * @module : Braintree Payment 
  * @desc   : Get payment response
  * @return : Return payment response
  * @author : Softweb solutions
*/
router.get('/getSeSession', function (req, res) {
  setTimeout(function(){
    //console.log("----Now redirect----");
    //res.redirect('/index');
    console.log("-----Get session here-----");
    console.log(req.session.paymentResponse);
    console.log("-----Get session here-----");
    res.json(req.session.paymentResponse);
  },1000);
});

/**
  * @module : Braintree Payment 
  * @desc   : Cancel subscription from brain tree
  * @return : return confirmation
  * @author : Softweb solutions
*/
router.post('/cancelSubscription', function (req, res) {
  console.log(req.body);
  var subscriptionID = req.body.subscriptionID; 
  gateway.subscription.cancel(subscriptionID, function (err, result) {
    
    console.log("----err----");
    console.log(err);
    console.log("----result----");
    console.log(result);
    if(err)
    {
      res.json({'status' : false, 'data': null, 'message':err.message});
    }
    else
    {
      if(result.success == true)
      {
        res.json({'status' : true, 'data': null, 'message':'Your customer account canceled successfully.'});
      }
      else
      {
        if(result.success == false)
        {
          res.json({'status' : false, 'data': null, 'message':result.message});
        }
        else
        {
          res.json({'status' : false, 'data': null, 'message':'Failed to cancele subscription with payment gateway.'});
        }  
      }
    }
  });
});


/**
  * @module : Braintree Payment 
  * @desc   : Get list of recurring plan
  * @return : Return plan list
  * @author : Softweb solutions
*/
router.get('/getRecurringPlan', function (req, res) {
  console.log("------Select Plan--------");
  gateway.plan.all(function(err, result) { 
    res.json({"status":true,"data":result, "message":"Plans get successfully"});
  });
});


/**
  * @module : Office 
  * @desc   : Get list of office
  * @return : Return office list
  * @author : Softweb solutions
*/
router.get('/paymentProcess', function (req, res) {
  console.log("------Hello billing--------");
  var plans = gateway.plan.all(function(err, result) { 
  //console.log(result)

  var nonce = 'nonce-from-the-client';
  var plan = 'SOMONTHLY';

  gateway.customer.create({
    firstName: "John",
    lastName: "Porter",
    paymentMethodNonce: nonce
  }, function (err, result) {
    //console.log(result)
    if (result.success) {
      
      var token = result.customer.paymentMethods[0].token;

      gateway.subscription.create({
        paymentMethodToken: token,
        planId: plan,
        addOns: {
          add: [
            { inheritedFromId: "SOMONTHLY", amount: "37.00" }
          ]
        }
      }, function (err, result) {
        
        console.log(result);

        console.log("----Payment process end-----");

        //res.render('processResult', {result: result});
        // res.json({ 
        //               "status": 200,
        //               "data" : result
        //             });
      });
    }
  });

    //res.render('index', { token : token, plans: result.plans });
  });
});


router.post("/checkout", function (req, res) {
  var nonceFromTheClient = req.body.payment_method_nonce;
  // Use payment method nonce here
});

router.post("/createCustomer", function (req, res) {
  gateway.customer.create({
    firstName: req.body.name,
    lastName: req.body.name,
    company: req.body.companyName,
    email: req.body.email,
    phone: req.body.phone,
    fax: req.body.fax,
    website: req.body.email
  }, function (err, result) {
    result.success;
    // true

    result.customer.id;
    // e.g. 494019
  });
});


/*gateway.subscription.create({
  paymentMethodToken: "the_token",
  planId: "silverPlan",
  trialPeriod: true,
  trialDuration: 3,
  trialDurationUnit: "month"
}, function (err, result) {
});


gateway.customer.create({
  firstName: "Jen",
  lastName: "Smith",
  company: "Braintree",
  email: "jen@example.com",
  phone: "312.555.1234",
  fax: "614.555.5678",
  website: "www.example.com"
}, function (err, result) {
  result.success;
  // true

  result.customer.id;
  // e.g. 494019
});

*/


/**
  * @module : Braintree Payment 
  * @desc   : Get Payment gateway token
  * @return : Return token
  * @author : Softweb solutions
*/
/*router.get('/getToken', function (req, res) {
  console.log("------Hello billing--------");
  gateway.clientToken.generate({}, function (err, response) {
    var token = response.clientToken;
    console.log(token);


    gateway.customer.create({
      firstName: "Jen",
      lastName: "Smith",
      company: "Braintree",
      email: "jen@example.com",
      phone: "312.555.1234",
      fax: "614.555.5678",
      website: "www.example.com"
    }, function (err, result) {
      console.log("----In result---");
      result.success;
      // true
      console.log(result.success);
      result.customer.id;
      console.log(result.customer);
      // e.g. 494019
    });

    res.json({"status":true,"data":{'token' : token}, "message":"Token get successfully"});
  });
});*/


module.exports = router;