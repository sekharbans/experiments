var express = require('express')
var request = require('request');
var querystring = require('querystring');

var app = express()

app.all('/search', function (req, res) {
    console.log('search called *************');
    var qryStr = req.query.q;
//    res.send('hello world ' + qryStr);

    request('https://idauth.ebay.com/idauth/site/token?client_id=urn:ebay-marketplace-consumerid:39bf2358-9c0e-483b-9dd9-2492da57e435&client_secret=587dd99e-73f9-46f3-b3b7-714c97d48a0e&grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('body:', body); // Print the HTML for the Google homepage.
    var searchQuery = querystring.stringify({q:qryStr});
    //console.log("This is"+searchQuery)
    var headers = {
    'Authorization':'Bearer '+JSON.parse(body).access_token,
    'Accept':'application/JSON'
    }
    // console.log(JSON.parse(body).access_token)
    request({url:'https://api.ebay.com/buy/browse/v1/item_summary/search?limit=1&'+searchQuery,headers:headers }, function (error, response, body){
    //console.log('body:', body);  
    var responseJson = JSON.parse(body);
    var obj = responseJson.itemSummaries;
    var msgStr = "found "+obj[0].title +" for price "+obj[0].price.value;
    console.log(msgStr);  
    var jsonInstance = new JSONResponse();
    jsonInstance.speech = "I found a great "+obj[0].title + " for you at  " + obj[0].price.currency +obj[0].price.value
    jsonInstance.displayText = "I found a great "+obj[0].title + " for you at  " + obj[0].price.currency +obj[0].price.value
    res.send(JSON.stringify(jsonInstance));
    ;
    })
    });
})

app.listen((process.env.PORT || 5000), function () {
    console.log('Example6 app listening on port !' + process.env.PORT)
})

function JSONResponse () {
    var speech
    var displayText
}
