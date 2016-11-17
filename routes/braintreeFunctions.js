var braintree = require('braintree');
var commonConfig  = require("../commonConfig");
var gateway = braintree.connect(commonConfig.brainTreeConfig.config);
var request = require('request');
//var dbConn = commonConfig.dbConfigHOQ;


/*var stream = gateway.subscription.search(function (search) {
  search.planId().is("SOMONTHLY");
  search.id().is("g2q88b");
}, function (err, response) {
  response.each(function (err, subscription) {
    console.log(subscription);
  });
});*/
/*
gateway.subscription.find("g2q88b", function (err, result) {
	console.log(result);
});
*/
var controller = {
	getClientToken: function (callback) {
		gateway.clientToken.generate({}, function (err, response) {
			if (err) {
				callback(err)
			}
			if (response.clientToken) {
				callback(response.clientToken)
			} else {
				callback(response)
			}
		});

	},
	getPlansAvailable: function (callback) {
		gateway.plan.all(function (err, response) {
			if (err) {
				callback(err)
			}
			if (response.plans) {
				callback(response.plans)
			} else {
				callback(response)
			}
		});
	},
	createSubscription: function (plan, nonce, objData, callback) {

		console.log("---objData---");
		console.log(objData);
		console.log("---objData---");
		var userId = objData.userId;
		//var modifiedDate = new Date();
		var modifiedDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		var resultData = [];
		var CurrentDate = new Date();
		var customerID = '';
		if (plan == 'SOMONTHLY') {
			var end_date = CurrentDate.setMonth(CurrentDate.getMonth() + 1);
		} else {
			var end_date = CurrentDate.setMonth(CurrentDate.getMonth() + 12);
		}

		gateway.customer.create({
			firstName : objData.firstName,
		    lastName  : objData.lastName,
		    company   : objData.company,
		    email     : objData.email,
		    phone     : objData.phone,
		    website   : objData.website,
			paymentMethodNonce: nonce
		}, function (err, result) {

			console.log("---createSubscription---");
			console.log(err);
			console.log(result);

			//console.log(result.customer.creditCards[0]);
			//console.log(result.customer.paymentMethods[0].token);
			console.log("---createSubscription---");

			if (result.success == true) {

				console.log("----success----");
				var createdAt = new Date(result.customer.createdAt).toISOString().replace(/T/, ' ').replace(/\..+/, '');
				var endDate = new Date(end_date).toISOString().replace(/T/, ' ').replace(/\..+/, '');

				customerID = result.customer.id;
				//var s_sub_guid = req.body.s_sub_guid;
				var s_uc_appuserguid = userId;
				var s_customerid = result.customer.id;
				var s_paymentMethod = objData.paymentMethod;
				var s_paymentMethodToken = result.customer.paymentMethods[0].token;
				var s_planId = plan;
				//var s_profileStatus = 'Activate';
				var s_numofSpaces = commonConfig.freeTrialSpaces;
				var s_startDate = createdAt;
				var s_endDate = endDate;
				var s_com_createdby = userId;
				var s_com_createddate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
				var s_com_modifiedby = userId;
				var s_com_modifieddate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
				
				dbconfig = commonConfig.dbConfigHOQ
				var dbConn = new sql.Connection(dbconfig);

				dbConn.connect().then(function() { 
					var request = new sql.Request(dbConn);

					request.input("s_uc_appuserguid", s_uc_appuserguid);
					request.input("s_customerid", s_customerid);
					request.input("s_paymentMethod", s_paymentMethod);
					request.input("s_paymentMethodToken", s_paymentMethodToken);
					request.input("s_planId", s_planId);
					request.input("s_numofSpaces", s_numofSpaces);
					request.input("s_startDate", s_startDate);
					request.input("s_endDate", s_endDate);
					request.input("s_com_createdby", s_com_createdby);
					request.input("s_com_createddate", s_com_createddate);
					request.input("s_com_modifiedby", s_com_modifiedby);
					request.input("s_com_modifieddate", s_com_modifieddate);

		    		resultData.push(result);
		    		var token = result.customer.paymentMethods[0].token;
					gateway.subscription.create({
						paymentMethodToken: token,
						planId: plan,
						price: objData.price,
					}, function (err, resultSubscription) {
					
						console.log("---Get result----");
						console.log(resultSubscription);
						console.log("---Get result----");

						if(resultSubscription.success == true)
						{
							console.log("----success----");
							var s_subscriptionId = resultSubscription.subscription.id;
							var s_price = resultSubscription.subscription.price;
							var s_profileStatus = resultSubscription.subscription.status;
							request.input("s_subscriptionId", s_subscriptionId);
							request.input("s_price", s_price);
							request.input("s_profileStatus", s_profileStatus);

							request.execute('SoSubscriptionAdd', function(errLog, recordsetsLog, returnValueLog, affectedLog) {
							    console.log("----Get Subscription db info---");
							    console.log("----err subs log---");
							    console.log(errLog); // count of recordsets returned by the procedure 
							    console.log("----recordsets sub log---");
							    console.log(recordsetsLog); // count of recordsets returned by the procedure 
							    console.log(recordsetsLog[0][0].Status); // count of recordsets returned by the procedure 

							    if(recordsetsLog[0][0].Status == 1)
						    	{
						    		resultData.push(resultSubscription);
							    	var result = {'type' : 'payment', 'status' : true, 'data': resultData, 'message':'Subscribed suucessfully..!'};
							    	callback(resultData);
						    	}
						    	else
					    		{
					    			var result = {'type' : 'payment', 'status' : false, 'data': resultData, 'message':'Subscribed suucessfully..!'};
							    	callback(err);
					    		}
								dbConn.close();
		    					console.log("Sub LOG-> ----EEEEENDDDDDDDDDD");
							});
						}
						else {
			    			var result = {'type' : 'payment', 'status' : false, 'data': null, 'message':result.message};
							callback(result);
						}
					});
				});
			} else {
    			var result = {'type' : 'payment', 'status' : false, 'data': null, 'message':result.message};
				callback(result);
			}
		});
	}

}
module.exports = controller;
