var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var rp = require('request-promise');

var Q = require('q');
var dbase = require('./../helpers/db-update.js');


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
     * This function handles the GET requests to the /watch route.
     * It will take the <code>camIds</code> value send in the request PARAMS
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

        var splittedCams = cams.split(",");
        var groups = [];
        while (splittedCams.length > 0) {
            groups.push(splittedCams.splice(0, 3));
        }
        splittedCams = groups;


        //For every chunk in the object
        for (part in splittedCams) {
            // Transforming the chunk object back into an Array.
            var joined = Object.keys(splittedCams[part]).map(function (k) {
                return splittedCams[part][k];
            });
            joined = joined.join(","); //Transforming the array in a comma separated string

            splittedCams[part] = joined; //Adding it to the parent array
        }

        var backendDataPromises = [];
        //Creating an array of promisses to dinamically call all the functions asynchronously
        for (i = 0; i < splittedCams.length; i++) {
            backendDataPromises.push(requestBackendData(splittedCams[i]));
        }
        var camDetails = [];

        getCamsJson().then(function (details) {
                camDetails = details;
            })
            .catch(function () {
                res.send({
                    message: "It wasn't possible to retrieve the cams details now. Please try again in a few minutes."
                });
            })
            //Requests data from all of them
        var finalJSON = {};

        Q.all(backendDataPromises)
            .then(function (data) {
                for (block in data) { //For each block of cams
                    for (cam in data[block]) { //We run through every cam
                        finalJSON[cam] = camDetails[cam];
                        finalJSON[cam]["num_cars"] = data[block][cam];
                    }
                }

                //res.json(finalJSON);
                res.render('details', {
                    cam: finalJSON
                })
            })
            .fail(function (err) {
                res.json({
                    message: "Error:" + err
                })
            });

    });


router.get('/watcha',
    /**
     * This function handles the GET requests to the /watch route.
     * It will take the <code>camIds</code> value send in the request PARAMS
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

            if (err || response.statusCode != 200 || !body) {

                var msg = "An internal error has happened. Please try again in a few minutes.";
                if (err) msg += err;
                else if (response.statusCode) msg += response.statusCode;
                else if (!body) msg += " Body null";

                res.status(500).send({
                    "message": msg
                });
            } else {

                console.log(body);
                body = JSON.parse(body);

                var targetCams = [];

                // Creating a list of cams to be watched.
                for (cam in body) {
                    targetCams.push(cam);
                    var camId = String(cam).replace("cam", ""); //Removing the keyword 'cam' from the ID first
                    //And then updating the view count in the data base.
                    dbase.updateAccess_promise(camId)
                        .then(function () {
                            console.log(cam + " Updated.");
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }



                getCamInfo(targetCams)
                    .then(function (camsInfo) {
                        // the data returned to the client
                        var data = {}

                        //Adding the number of detected cars to the array
                        for (cam in camsInfo) {
                            data[cam] = camsInfo[cam];
                            data[cam].num_cars = body[cam].valueOf();
                        }


                        //res.status(200).json(data);
                        res.render('details', {
                            cam: data
                        });
                    })
                    // Error Handling
                    .catch(function (err) {
                        res.status(500).send({
                            "message": "an internal error has happened. (Is this cam id < 452?)"
                        });
                    });
            }
        });

    });


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
            } else
                deferred.reject(err);
        });

    return deferred.promise;
}
/**
 * This function requests data from the backend.
 * Should be used with smaller sets of (around 3) camIds instead of huge ones.
 *
 * @param {String} the camera Ids which data should be requested.
 * @returns {Promise} A promise with the data or with an error message
 */
function requestBackendData(camIds) {
    var deferred = Q.defer();
    rp.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: backendRoutes.cars_detection,
            form: {
                camIds: camIds,
                api: keys.backend_server
            }
        })
        .then(function (data) {


            deferred.resolve(JSON.parse(data));
        })
        .catch(function (error) {

            deferred.reject(error);
        })
    return deferred.promise;
}

module.exports = router;
