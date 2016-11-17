'use strict';

angular.module('myApp.controllers')
.controller('billingController', ["$scope", "$location", "$rootScope", "$http","$timeout", "getBaseUrl","socket", "$filter","ngDialog","$state","$stateParams", "filterFilter", function($scope, $location, $rootScope, $http, $timeout, getBaseUrl, socket, $filter, ngDialog, $state,$stateParams, filterFilter) {

	console.log("----Welcome to Billing controller ------");
	$rootScope.activeStateParam = $state.current.name;
	$scope.planBtnIsEnable = 0;
	$scope.filteredtransaction = '';
	$scope.transaction = '';
	$scope.currentPage = 1;
    $scope.numPerPage = 2;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 5;
    $scope.sortType     = 'createdAt'; // set the default sort type
    $scope.sortReverse  = true;  // set the default sort order

    $scope.isCSClicked = 0;

	$scope.planAddons = [
		{
			'id'		: 1,
			'name'	: 'Basic',
			'price'		: '149',
			'duration'	: 'per month',
			'services'	: [ {'id' : 1, 'name' : 'Up to 5 bookable spaces'},
							{'id' : 2, 'name' : 'Single location'}
						],
		},
		{
			'id'		: 2,
			'name'	: 'Premium',
			'price'		: '499',
			'duration'	: 'per month',
			'services'	: [ {'id' : 1, 'name' : 'Up to 30 bookable spaces'},
							{'id' : 2, 'name' : 'Unlimited locations'},
							{'id' : 2, 'name' : 'Amenities'},
							{'id' : 2, 'name' : 'Issue reporting'},
							{'id' : 2, 'name' : 'Require admin for booking'}
						],
		},
		{
			'id'		: 3,
			'name'	: 'Enterprise',
			'price'		: '999',
			'duration'	: 'per month',
			'services'	: [ {'id' : 1, 'name' : 'Unlimited bookable spaces'},
							{'id' : 2, 'name' : 'Unlimited locations'},
							{'id' : 2, 'name' : 'Amenities'},
							{'id' : 2, 'name' : 'Issue reporting'},
							{'id' : 2, 'name' : 'Meeting services (e.g. catering)'},
							{'id' : 2, 'name' : 'Require admin for booking'},
							{'id' : 2, 'name' : 'Indoor wayfinding'},
							{'id' : 2, 'name' : 'SAML single sign-on'}
						],
		}
	];	
	
	
	/**
    * @module : Billing
    * @desc   : Payment pre filled data
    * @return : Return data as per selected plan
    * @author : Softweb solutions
    */
    $scope.getPreFilledData = function()
    {

    	console.log("-----Billing plan page----");
    	/* Brain tree API CAll */
		$http.get("/billing/getToken").success(function(response) {

			console.log(response);
			if(response.data.token != '')
			{
				if(response.data.plans != '')
				{
					var planArray = [];
					for (var i = 0; i < response.data.plans.length; i++) {
						if(response.data.plans[i].id == 'SOMONTHLY' || response.data.plans[i].id == 'SOYEARLY')
						{
							planArray.push(response.data.plans[i]);
						}
					}
					$scope.paymentPlans = planArray;
					$scope.planBtnIsEnable = 1;
					console.log($scope.paymentPlans);
					$scope.paymentMethod = planArray[0].id;
					$rootScope.tokenStr = response.data.token;
					console.log($rootScope.tokenStr);
				}
				else
				{
					$scope.isDisable = 0;
					$scope.error = [{ "msg" : "Failed to get recurring billing plans." }];
					$scope.success = "" ;	
				}
				
			}
			else
			{
				$scope.isDisable = 0;
				$scope.error = [{ "msg" : "Failed to get payment gateway token." }];
				$scope.success = "" ;	
			}
		}).error(function(response) {
			$scope.isDisable = 0;
			$scope.error = [{ "msg" : response.message }];
			$scope.success = "" ;	
		});
	}


	/**
    * @module : Billing
    * @desc   : Get selected plan 
    * @return : set selected plan in url
    * @author : Softweb solutions
    */
	$scope.getSelectedPlan = function(setPlanMethod)
    {
    	$scope.paymentMethod = setPlanMethod;
	}
	

	/**
    * @module : Billing
    * @desc   : Payment pre filled data
    * @return : Return data as per selected plan
    * @author : Softweb solutions
    */
    $scope.getPlan = function()
    {
    	console.log("-----Get plan data----");
    	console.log($stateParams);

      	$scope.userAuthenticated = {};
      	$scope.isDisable = 0;
    	$scope.planId = $stateParams.id;

    	/*--- To auto open BrainTree Form ---*/
    	var token = $rootScope.tokenStr;
    	console.log(token);
	    if (braintree) {
	        braintree.setup(token, 'dropin', {
	            container: 'dropin'
	        });
	    } else {
	        // TODO: Catch if we cant load the script
	    }

		var id = parseInt($scope.planId)-parseInt(1);
		$scope.selectedPlan = $scope.planAddons[id];
		$scope.planType = $stateParams.type;
		$scope.selectedPlan.type = $scope.planType;
        $scope.companyName = $rootScope.officename;
    	console.log($scope.companyName);
    	
    	/**
		* @module : User profile
		* @desc   : Get User detail by session variable
		* @return : Return user detail
		* @author : Softweb solutions - JJ <jeel.joshi@softwebsolutions.com>
		*/
		$scope.getUserUrl = $scope.baseurl+"/people/getUserUsingGuid/"+localStorage.getItem("uc_guid");
		$http.get($scope.getUserUrl)
		.success(function(data, status, headers, config) {
		  	$scope.getprofileLogo();
		  	console.log(data.data[0]);
		  	$scope.userAuthenticated = data.data[0];
	  	})
		.error(function(data, status, headers, config) {
		  	Notifier.error('Something went wrong!. Please try again..');
		});

    	var fullYear = [];
		var curYear = new Date().getFullYear();
		var startYear = curYear;
		var crYear = curYear+25;
		$scope.amt = "";
		
		for (var i=startYear; i<=crYear; i++) {
	    	var newarray = {
	    		'value' : i,
	    		'year' : i 
	    	};
			fullYear.push(newarray);
		}
		$scope.creaditcardYear = fullYear;
		$scope.cc_month = '01';
		$scope.cc_Year = curYear;
		$scope.cardtype = 'visa';
		$scope.terms_c = false;
    }

    /* redirect back to Subscription Plan page */
	$scope.cancelSubscription = function () {
		$location.path("/billing");
	};

	/**
    * @module : Billing
    * @desc   : Get billling transactions
    * @return : list of transactions
    * @author : Softweb solutions
    */
	$scope.getTransactions = function () {
		var email = localStorage.getItem("au_email");
		var userid = localStorage.getItem("uc_guid");
		var dataObj = {'emailID' : email, 'userID' : userid };

		$http.post("/billing/getTransactions", dataObj).success(function(response){
			console.log(response);
			if(response.status == true)
			{
				$scope.billingEndDate = response.data[0].subscription.billingPeriodEndDate;
				$scope.subscriptionID = response.data[0].subscriptionId;
				$scope.subscriptionStatus = response.data[0].subscription.status;



				var endDateTimestamp = new Date($scope.billingEndDate).getTime();
				console.log(endDateTimestamp);
				var todayTimestamp = new Date().getTime();
				console.log($scope.subscriptionStatus);

				if(endDateTimestamp > todayTimestamp && $scope.subscriptionStatus == 'Active')
				{
					$scope.displayCancelBtn = 1;
				}
				else
				{
					$scope.displayCancelBtn = 0;
				}

				console.log($scope.displayCancelBtn);
			  	$scope.transaction = response.data;
			  	var begin = parseInt(($scope.currentPage - 1) * $scope.numPerPage);
				var end = parseInt(begin + $scope.numPerPage);
				$scope.filteredtransaction = $scope.transaction.slice(begin, end);
				Notifier.success(response.message);	
				$scope.success = [{ "msg" : response.message }];
				$scope.error = "" ;	
			}
			else
			{
				Notifier.error(response.message);	
				$scope.error = [{ "msg" : response.message }];
				$scope.success = "" ;	
			}
		})
		.error(function(data, status, headers, config) {
		  	Notifier.error('Something went wrong!. Please try again..');
		  	$scope.error = [{ "msg" : "Something went wrong!. Please try again.." }];
			$scope.success = "" ;
		});
	};


	$scope.$watch('currentPage + numPerPage', function() {
      var begin = parseInt(($scope.currentPage - 1) * $scope.numPerPage);
      var end = parseInt(begin + $scope.numPerPage);
      $scope.filteredtransaction = $scope.transaction.slice(begin, end);
  	});

    $scope.pageChanged = function() {
      console.log('Page changed to: ' + $scope.currentPage);
    };


	/**
    * @module : Billing
    * @desc   : Send subscription id to stop recurring account
    * @return : return confirmation for subscription
    * @author : Softweb solutions
    */
	$scope.cancelCustomerSubscription = function () {
		console.log("---cancelCustomerSubscription----");
		$scope.isCSClicked = 1;

		var subscriptionID = $scope.subscriptionID;
		var dataObj = {'subscriptionID' : subscriptionID };
		$http.post("/billing/cancelSubscription", dataObj).success(function(response){
			
			console.log(response);

			if(response.status == true)
			{
				$scope.displayCancelBtn = 0;
				Notifier.success(response.message);	
				$scope.success = [{ "msg" : response.message }];
				$scope.error = "" ;	
			}
			else
			{
				$scope.displayCancelBtn = 1;
				$scope.isCSClicked = 0;
				Notifier.error(response.message);	
				$scope.error = [{ "msg" : response.message }];
				$scope.success = "" ;	
			}
		})
		.error(function(data, status, headers, config) {
			$scope.displayCancelBtn = 1;
			$scope.isCSClicked = 0;
		  	Notifier.error('Something went wrong!. Please try again..');
		  	$scope.error = [{ "msg" : "Something went wrong!. Please try again.." }];
			$scope.success = "" ;
		});

	};

	
}])