'use strict';
process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');
let querystring = require('querystring');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const NAME_ACTION = 'searchitem';
const COLOR_ARGUMENT = 'color';
const NUMBER_ARGUMENT = 'number';
const TYPE_ARGUMENT = 'type';
const BRANDS_ARGUMENT = 'brands';
const SPACE = ' ';

// [START SillyNameMaker]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));
  var query = '';
  function searchitem (assistant) {
    addToQueryString(assistant.getArgument(COLOR_ARGUMENT));
    addToQueryString(assistant.getArgument(BRANDS_ARGUMENT));
    addToQueryString(assistant.getArgument(TYPE_ARGUMENT));
    processResponse (assistant,query);
  }
  function addToQueryString( val) {
    val = val ==null?'':val;
    query = query+ val+SPACE;
 }

  let actionMap = new Map();
  actionMap.set(NAME_ACTION, searchitem);

  assistant.handleRequest(actionMap);
});

function processResponse (assistant,query) {
//    assistant.tell(queryString);
    let msgStr = 'Sorry I did not find a match';

     request('https://idauth.ebay.com/idauth/site/token?client_id=urn:ebay-marketplace-consumerid:39bf2358-9c0e-483b-9dd9-2492da57e435&client_secret=587dd99e-73f9-46f3-b3b7-714c97d48a0e&grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope', function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); 
  
        var headers = {
            'Authorization':'Bearer '+JSON.parse(body).access_token,
            'Accept':'application/JSON'
        }
 // console.log(JSON.parse(body).access_token)
 var searchQuery = querystring.stringify({q:query});
  request({url:'https://api.ebay.com/buy/browse/v1/item_summary/search?limit=1&'+searchQuery,headers:headers }, function (error, response, body){
  //console.log('body:', body);  
    var responseJson = JSON.parse(body);
    var obj = responseJson.itemSummaries;
    console.log("QueryString"+query);
    msgStr = "found a great "+obj[0].title +" for price "+obj[0].price.value;
    console.log(msgStr);  
    var strInputs = ["Would you like anything else?"];
    assistant.ask(msgStr,strInputs);
    
  })
});
}


if (module === require.main) {
  // [START server]
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;
