var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var Q = require('q');


var keys = require('./../config/api-keys.json');
var backendRoutes = require('./../config/backend-routes.json');

var router = express.Router();

/* ROUTES SECTION */

router.get('/',
    /**
     * Function for handling the GET requests for the index route '/'
     * It renders the homepage, passing the relevant API keys and
     * references to the necessary CSS files to be added to the page.
     *
     * @param {[[Type]]} req The content of the request.
     * @param {[[Type]]} res The response body to be returned
     */
    function (req, res) {
        res.render("homepage", {
            "keys": {
                "maps": keys.maps
            },
            "style": [
            "/css/home.css"
        ]

        });
    });

router.get('/watch',
    /**
     * This function handles the POST requests to the /watch route.
     * It will take the <code>camIds</code> value send in the request body
     * and request data from the backend server.
     * After that, it renders a response page with the data.
     *
     * @param {Object} req The content of the request.
     * @param {Object} res The response body to be returned
     * @returns {Object} <code>res</code> The response to the client.
     */

    function (req, res) {
        //Handling requests with null body
        if (!req.query) {
            return res.sendStatus(400);
        }

        // Error handling if the camIds weren't passed.
        try {
            var cams = req.query.camIds;
        } catch (e) {
            return res.sendStatus(400);
        }
        //If so, removes the 'cam' keywords from it and removes the last comma before requesting from the server
        cams = cams.replace(/cam/g, '');

        // If the last character is a comma, removes it
        cams = cams.slice(-1) == "," ? cams.substr(0, cams.length - 1) : cams;

        /*
         * Posting the request to the backend server.
         * From its response, renders a detailed view (or an error one)
         * */
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: backendRoutes.cars_detection,
            form: {
                camIds: cams,
                api: keys.backend_server
            }
        }, function (err, response, body) {
            console.log(body);
            body = JSON.parse(body);


            var targetCams = [];

            // Creating a list of cams to be
            for (cam in body) {
                console.log("FE -> " + cam)
                targetCams.push(cam);
            }

            console.log("PARA -> " + targetCams)

            getCamInfo(targetCams)
                .then(function (camsInfo) {
                    // the data returned to the client
                    var data = {}

                    // Adding the number of cars from the backend to the info array
                    // needs to copy this data into an VALID JSON object, as camsInfo
                    // is a mysterious data structure. Seriously, you should take a look
                    // on how this DS is working, as it doesn't print anywhing on console.log
                    // (actually I know that it's a kinda JSON on the format
                    // [field : {innermost_json}]) and this is forbidden by JSON syntax. The
                    // correct for is:
                    // { field : {innermost_json}}, using curly braces and not square brackets.
                    for (cam in camsInfo) {
                        data[cam] = camsInfo[cam];
                        data[cam].num_cars = body[cam].valueOf();
                    }

                    res.status(200).json(data);
                })
                // Error Handling
                .catch(function (err) {
                    res.status(500).send({"message" : "an internal error has happened. (Is this cam id < 452?)"});
                });
        });

    });


router.post('/watch',
    /**
     * Serves and error if the route is accessed via GET,
     * since the necessary data has to be passed through the POST method.
     *
     * @param {[[Type]]} req The content of the request.
     * @param {[[Type]]} res The response body to be returned
     */
    function (req, res) {
        res.send("404");
    }
);

/* HELPER FUNCTIONS SECTION */

/**
 * Gets the cam(s) information from the JSON file and returns it in the form of a promise.
 * @param   {Array}   camIds The ID or IDs of the cams which data will be returned
 * @returns {Promise} A promise holding the Cam(s) information or an error message.
 */
function getCamInfo(camIds) {

    var deferred = Q.defer();

    if (!typeof (camIds) == "object" || camIds.length < 1) {
        return deferred.reject("Invalid Object");
    }

    var finalCamInfoObj = [];

    console.log("camIds -> " + camIds);

    getCamsJson()
        .then(function (camsJSON) {


            camIds.map(function (cam) {
                finalCamInfoObj[cam] = camsJSON[cam];
            });

            // console.log(finalCamInfoObj);
            deferred.resolve(finalCamInfoObj);
        })
        .catch(function (e) {
            deferred.reject(e);
        });

    return deferred.promise;
}

/**
 * Requests a JSON with camera information about the cameras,
 * and returns it as a promise (or rejects with the error message)
 *
 * @returns {Promise} The promise holding the data or an error message.
 */
function getCamsJson() {
    var deferred = Q.defer();
    request.get(backendRoutes.cams_json + keys.backend_server,
        function (err, resp, data) {
            if (!err && resp.statusCode == 200) {
                deferred.resolve(JSON.parse(data));
            }
            else
                deferred.reject(err);
        });

    return deferred.promise;
}


module.exports = router;
