var express = require('express');

//App setup
var app = express();
var server = app.listen(2121, function() {
    console.log("server listening on 2121");
})