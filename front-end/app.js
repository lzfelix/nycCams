var express = require('express');
var cons = require("consolidate");
var hs = require("handlebars");
var path = require("path");
var fs = require("fs");

var app = express();

app.engine("html", cons.handlebars);
app.set("view engine", "html");
app.set("views", __dirname + "/views");

// Setting the app router and static folder
app.use(express.static(path.resolve('./public')));


var partials = "./views/partials/";
fs.readdirSync(partials).forEach(function (file) {
    var source = fs.readFileSync(partials + file, "utf8"),
        partial = /(.+)\.html/.exec(file).pop();

    hs.registerPartial(partial, source);
});

app.get('/', function (req, res) {
    res.render("homepage",{
        "keys":{
            "maps":"AIzaSyCjLh-W3bXne1aPceB6H9mJEYKsZQDZ8tY"
        },
        "style":[
            "/css/home.css"
        ]


    });
});

/*
 * SERVER SETUP DETAILS
 */
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
