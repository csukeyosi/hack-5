var express = require("express");
var Yelp = require('node-yelp-fusion');

var yelp = new Yelp({ id:'Yj0h4DEGPFXbWH5beUtvvA',
		secret:'kfY8mEL81fDbDzjoPjdEU06vKf2N800HLtJXgGmsYhDGVVrjNebGpxpA7tULRwUp'});

var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname ));

app.listen(port, function() {
  console.log("Listening on " + port);
});

app.get('/', function(req, res){
    res.sendFile(__dirname  + '/static/public/index.html');
});

app.get('/yelp_search', function(req, res){
	var params = "term=" + removeAccents(req.query.term) +
		"&latitude=" + req.query.latitude +
		"&longitude=" + req.query.longitude + "&limit=1";
	yelp.search(params)
    	.then(function(result){
    		res.json(result);
    	});
});

/**
* @description Replace the accented chars.
* @params {string} str
*/
function removeAccents(str) {
	var accents    = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
 	var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
	str = str.split('');
	var strLen = str.length;
	var i, x;
	for (i = 0; i < strLen; i++) {
    	if ((x = accents.indexOf(str[i])) != -1) {
      		str[i] = accentsOut[x];
    	}
  	}
  	return str.join('');
}