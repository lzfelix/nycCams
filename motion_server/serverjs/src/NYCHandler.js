var cameras = require("./cameras.json");
var request = require('request');
var crypto  = require("crypto");
var path    = require("path");
var fs      = require('fs');

const IMAGES_TEMP_FOLDER = "temp";
const IMAGE_EXTENSION = ".png";

//This delay isn't very precise. Actually 200 ms makes a download delay of ~1 second
//due to node's scheduling and external network access.
const DELAY_BETWEEN_FRAMES = 200

/**
 * Returns an unique 64-hex character name.
 * @return {string} A 64-character random string
 */
function generateUniqueName() {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Returns a promise for downloading a frame from NYC servers
 * @param  {string} camURL   The camera's URL
 * @param  {string} filename The name under which the downloaded image is going to be stored
 * @return {Q.promise}       A Q promise that is fulfiled when the image is stored on disk.
 *                             This promise may be rejected due connection problems.
 */
function getImage(camURL, filename) {
    return new Promise((resolve, reject) => {
        request.head(camURL, function(err, res, body){
            if (!err && res.statusCode == 200) {
                request(camURL).pipe(fs.createWriteStream(filename)).on('close', function() {
                    return resolve();
                });
            }
            else
                return reject(new Error("Error while fetching image from NYC servers."));
        });
    }
}

/**
 * Retrieves two (almost) consecutive images from the same strret.
 * @param  {string} camId The ID of the camera. Usually on the form camX.
 * @return {Q.promise}    A promise that when fulfilled, contains the path to
 *                          the two retrieved images. The promise may be rejected
 *                          due to connection issues.
 */
exports.getStreetImages = function(camId) {
    var cameraURL = cameras[camId].URL;

    var frameName1 = path.join(__dirname, IMAGES_TEMP_FOLDER, generateUniqueName() + IMAGE_EXTENSION);
    var frameName2 = path.join(__dirname, IMAGES_TEMP_FOLDER, generateUniqueName() + IMAGE_EXTENSION);



    return getImage(cameraURL, frameName1)
        .then(() => new Promise((resolve, reject) => setTimeout(() => resolve(), DELAY_BETWEEN_FRAMES)))
        .then(() => getImage(cameraURL, frameName2))
        .then(() => [frameName1, frameName2]);
    });
}

module.exports = exports;
