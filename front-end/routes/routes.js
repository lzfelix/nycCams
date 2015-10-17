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

            body = JSON.parse(body);


            var targetCams = [];


            // Creating a list of cams to be
            for (cam in body) {
                targetCams.push(cam);
            }

            getCamInfo(targetCams)
                .then(function (camsInfo) {

                    // Adding the number of cars from the backend to the info array
                    for (cam in camsInfo) {
                        camsInfo[cam]['num_cars'] = body[cam].valueOf();
                    }
                    //Updating the data to be rendered
                    console.log(camsInfo); //Outputs normally

                    res.send(JSON.stringify(camsInfo)); //Simple response without view.
                })
                //Error Handling
                .catch(function (err) {
                    res.status(500).send(err);
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

    getCamsJson()
        .then(function (camsJSON) {
            camIds.map(function (cam) {
                finalCamInfoObj[cam] = camsJSON[cam];
            });

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
            deferred.reject(err);
        });
    return deferred.promise;
}


module.exports = router;
