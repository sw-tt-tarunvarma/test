// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.

/**
* @module : Authentication
* @desc   : Office 365 Application Credentials and authenticate with server and get token 
* @return : 
* @author : Softweb solutions
*/
var credentials = {
  clientID: "1ab43855-8623-4c7a-8b76-0d33b42d05af",
  clientSecret: "8lJGCY8brQDzW3H4tdr8wvjI7lyW2E/vhWTB/nYA2to=",
  site: "https://login.microsoftonline.com/common",
  authorizationPath: "/oauth2/authorize",
  tokenPath: "/oauth2/token"
}
//var redirectUri = "http://192.168.4.190:3000/index/authorize";
var redirectUri = "http://smartoffice.softwebopensource.com/index/authorize";
var oauth2 = require("simple-oauth2")(credentials)

/**
* @module : Authentication
* @desc   : Get url for login authentication
* @return : return url
* @author : Softweb solutions
*/
function getAuthUrl() {
  var returnVal = oauth2.authCode.authorizeURL({
    redirect_uri: redirectUri
  });
  console.log("Generated auth url: " + returnVal);
  return returnVal;
}

/**
* @module : Authentication
* @desc   : Get token 
* @return : Return token
* @author : Softweb solutions
*/
function getTokenFromCode(auth_code, resource, callback, response) {
  var token;
  oauth2.authCode.getToken({
    code: auth_code,
    redirect_uri: redirectUri,
    resource: resource
  }, function (error, result) {
    if (error) {
      console.log("Access token error: ", error.message);
      callback(response, error, null);
    }
    else {
      token = oauth2.accessToken.create(result);
      console.log("Token created: ", token.token);
      callback(response, null, token);
    }
  });
}

/**
* @module : Authentication
* @desc   : Get access token 
* @return : Return access token
* @author : Softweb solutions
*/
var outlook = require("node-outlook");
function getAccessToken(token) {
  var deferred = new outlook.Microsoft.Utility.Deferred();
  deferred.resolve(token);
  return deferred;
}

/**
* @module : Authentication
* @desc   : Get token funtion
* @return : 
* @author : Softweb solutions
*/
function getAccessTokenFn(token) {
  return function() {
    return getAccessToken(token);
  }
}

/**
* @module : Authentication
* @desc   : Get data from SOAP services and convert it into json format
* @return : Return SOAP data
* @author : Softweb solutions
*/
function soapResponseToJson(xml) {
  var json = xmlToJson(xml).Body;
    var response = {};
    for (var outterKey in json) {
      if (json.hasOwnProperty(outterKey)) {
        temp = json[outterKey];
        for (var innerKey in temp) {
          if (temp.hasOwnProperty(innerKey)) {
            response[innerKey] = temp[innerKey].text;
          }
        }
      }
    }
   return response;
 }

/**
* @module : Authentication
* @desc   : Changes XML to JSON
* @return : Return SOAP data
* @author : Softweb solutions
*/
function xmlToJson(xml) {
  // Create the return object
  var obj = {};
  if (xml.nodeType == 1) {// element
      // do attributes
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
  } else if (xml.nodeType == 3) {// text
    obj = xml.nodeValue;
  }

  // do children
  if (xml.childNodes!=undefined) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName.substring(item.nodeName.indexOf(":") + 1).replace('#', '');
      if ( typeof (obj[nodeName]) == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if ( typeof (obj[nodeName].push) == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
};

exports.soapResponseToJson = soapResponseToJson;
exports.xmlToJson = xmlToJson;
exports.getAuthUrl = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode;
exports.getAccessTokenFn = getAccessTokenFn;  

/*
  MIT License: 

  Permission is hereby granted, free of charge, to any person obtaining 
  a copy of this software and associated documentation files (the 
  ""Software""), to deal in the Software without restriction, including 
  without limitation the rights to use, copy, modify, merge, publish, 
  distribute, sublicense, and/or sell copies of the Software, and to 
  permit persons to whom the Software is furnished to do so, subject to 
  the following conditions: 

  The above copyright notice and this permission notice shall be 
  included in all copies or substantial portions of the Software. 

  THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND, 
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */
