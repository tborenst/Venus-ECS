var express = require("express");
var sockets = require("socket.io");

var app     = express();              // web server
var io      = sockets.listen(3000);   // socket server

app.use(express.bodyParser());

app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

app.get("/static/js/:staticFilename", function (request, response) {
    response.sendfile("static/js/" + request.params.staticFilename);
});

app.get("/static/css/:staticFilename", function (request, response) {
    response.sendfile("static/css/" + request.params.staticFilename);
});

app.listen(8888);