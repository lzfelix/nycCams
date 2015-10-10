var tracker   = require("../serverjs/src/motionTracker.js")
var validator = require("../serverjs/src/interfaceHandler.js");
var auth      = require("../serverjs/src/auth.js");

const BAD_REQUEST_HTML_CODE = validator.BAD_REQUEST_HTML_CODE;
const INTERAL_ERROR_HTML_CODE = 500;
const JSON_MESSAGE_FILED = "message";

function sendBadRequestResponse(res, msg) {
    res.json(BAD_REQUEST_HTML_CODE, {
        JSON_MESSAGE_FILED : msg
    });
}

function sendErrorRequestResponse(res, msg) {
    res.json(INTERAL_ERROR_HTML_CODE, {
        JSON_MESSAGE_FILED : msg
    });
}

function artistRoute(req, res, next) {
    var apiID = req.body.api;

    if (!auth.isValid(apiID))
        sendBadRequestResponse("Invalid API ID.");
    else {
        var validIds = validator.parseCameraNumbers(req.body.camIds)

        if (validIds[0] == validator.BAD_REQUEST_HTML_CODE)
            sendBadRequestResponse("Invalid API ID.");
        else {
            tracker.jsonMultipleStreets_promise(validIds)
            .then(function (json) {
                res.json(200, json);
            }).fail(function (err) {
                sendErrorRequestResponse("An internal error has happened.")
            }).done();
        }
    }
}

module.exports.route = artistRoute;
