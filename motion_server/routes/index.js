var express = require('express');

var tracker = require("../serverjs/src/motionTracker.js")
var validator = require("../serverjs/src/interfaceHandler.js");

var router = express.Router();

router.get('/', function(res, res, next) {
    res.render("form.ejs");
});

router.post('/cars', function(req, res, next) {
    var validIds = validator.parseCameraNumbers(req.body.camIds)

    if (validIds[0] == validator.BAD_REQUEST_HTML_CODE)
        res.json(validIds[0], validIds[1]);
    else {
        console.log('identified istream');
        tracker.jsonMultipleStreets_promise(validIds)
        .then(function (json) {
            res.json(200, json);
        }).fail(function (err) {
            //TO DO
        });
    }
});

module.exports = router;
