var express = require('express');
var apiRoute = require("./apiRoute.js");

var router = express.Router();

router.get('/debug', function(res, res, next) {
    res.render("form.ejs");
});

router.post('/cars', apiRoute.camRoute);
router.get('/json/:api', apiRoute.jsonRoute);

module.exports = router;
