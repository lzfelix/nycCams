var express = require('express');
var cons = require("consolidate");
var hs = require("handlebars");
var path = require("path");
var fs = require("fs");
var bodyParser = require('body-parser');

var routes = require("./routes/routes"); //Requiring the routes file

var app = express();

// View rendering settings
app.engine("html", cons.handlebars);
app.set("view engine", "html");
app.set("views", __dirname + "/views");

// Request parsing settings
app.use(bodyParser.urlencoded({
    extended: false
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// Routing for the static files folder
app.use(express.static(path.resolve('./public')));


// Setting the <code>routes.js</code> file as the responsible for the main routes.
app.use('/', routes);

/* This code block defines the folder for partials,
 * to be used with the views and avoid repetition in the headers/footers.
 * It looks for <code>.html</code> files in the directory and
 * registers them to be used by Handlebars.
 *
 * */
var partials = "./views/partials/";
fs.readdirSync(partials).forEach(function (file) {
    var source = fs.readFileSync(partials + file, "utf8"),
        partial = /(.+)\.html/.exec(file).pop();

    hs.registerPartial(partial, source);
});



/*
 * SERVER SETUP DETAILS
 */
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
