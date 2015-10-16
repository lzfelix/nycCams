var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var keys = require('./../config/api-keys.json');

var router = express.Router();



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
        console.log(cams);


        /*
         * Posting the request to the backend server.
         * From its response, renders a detailed view (or an error one)
         * */
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: 'http://nyc-balancer-1920328868.ap-southeast-2.elb.amazonaws.com/cars',
            form: {
                camIds: cams,
                api: keys.backend_server
            }
        }, function (err, response, body) {
            res.send(body);
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
    });

module.exports = router;
