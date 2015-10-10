var express = require('express');
var apiRoute = require("./apiRoute.js");

var router = express.Router();

router.get('/', function(res, res, next) {
    res.render("form.ejs");
});

router.post('/cars', apiRoute.route);

module.exports = router;
