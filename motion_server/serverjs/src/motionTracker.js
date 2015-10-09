var nyc = require("./NYChandler.js");
var fs  = require("fs");
var cv  = require("opencv");
var Q   = require("q");
Q.map   = require("q-map").map;

// some undocumented node OpenCV constants
COLOR_BGR2GRAY = "CV_BGR2GRAY";
BINARY_THRESHOLD = "Binary";

// any grayscale pixel with indensity less than this becomes black
// when thresholding.
SENSITIVITY_VALUE = 50

USE_GAUSIAN_BLUR = false;

// be careful, since these values may break node's OpenCV. This constant is only
// used if USE_GAUSIAN_BLUR is set to true
BLUR_VALUES = [3, 3]

// contours with area smaller than this value, in pixels, are ignored when counting cars
MIN_CAR_AREA = 400

// if this parameter is set to true, some intermediate images are stored on this
// and never erased, but updated on each new processing.
KEEP_INTERMEDIATE_IMAGES = true;

// these constants are only used then KEEP_INTERMEDIATE_IMAGES is set to true to
// save the intermediate images on disk.
MARKED_IMAGE_NAME = "marked.png";
MOTION_MAP_NAME   = "binary.png";

// amount of threads used to count cars in motion on multiple locations
AMOUNT_OF_THEADS = 1;

/**
 * Loads as many images as there are on the array <imagesPaths>.
 * @param  {string array} imagesPaths contains the paths to the images that are
 * @param  {threads}      optional parameter. If set, uses this maount of threads
                            * to load the images parallely.
 * @return {Q.promise}    a promise that is fulfilled when all the images
 *                          are loaded. This promise may be rejected if any
 *                          of the files doesn't exist or fails to load.
 */
function loadImages_promise(imagesPaths, threads) {
    var deferred = Q.defer()

    if (typeof(threads) === 'undefined')
        var threads = 1;
    else if (threads < 0)
        threads = 1;

    Q.map(imagesPaths, function(imagePath) {
        var innerDeferred = Q.defer();

        cv.readImage(imagePath, function(err, image) {
            if (err)
                innerDeferred.reject(err);
            else if  (image.size()[0] == 0 || image.size()[1] == 0)
                innerDeferred.reject(new Error("It seems that the image on disk" +
                "is corrupted, as one of its dimensions has 0 length."));

            innerDeferred.resolve(image);
        });

        return innerDeferred.promise;
    }, threads)
    .then(function(images) {
        deferred.resolve(images);
    })
    .catch(function(err) {
        deferred.reject(err);
    });

    return deferred.promise;
}

/**
 * Simple background subtraction technique. First subtract both images, then
 * threshold it. If USE_GAUSIAN_BLUR is set to true, this filter is applying
 * using BLUR_VALUES as the convolution matrix and the image is thresholded
 * again. The resulting frame is then returned.
 * @param  {opencv.Matrix} imageBefore A openCV image matrix.
 * @param  {opencv.Matrix} imageAfter  A openCV image matrix.
 * @return {opencv.Matrix}             A binary motion map.
 */
function generateMotionMap(imageBefore, imageAfter) {
    // convert images to gray

    imageBefore.cvtColor(COLOR_BGR2GRAY);
    imageAfter.cvtColor(COLOR_BGR2GRAY);

    var dim = imageBefore.size();

    // subtract the images
    var diff = new cv.Matrix(dim[0], dim[1]);
    diff.absDiff(imageBefore, imageAfter);

    // threshold it
    var binaryImage = diff.threshold(SENSITIVITY_VALUE, 255, BINARY_THRESHOLD);

    if (KEEP_INTERMEDIATE_IMAGES)
        binaryImage.save(MOTION_MAP_NAME);

    // apply gaussian blur to remove small "holes" withing contours
    if (USE_GAUSIAN_BLUR) {
        binaryImage.gaussianBlur(BLUR_VALUES);
        binaryImage = binaryImage.threshold(SENSITIVITY_VALUE, 255, BINARY_THRESHOLD);
    }

    return binaryImage;
}

/**
 * Given the motion map, counts how many cars there are on the current map.
 * @param  {opencv.Matrix} motionMap A binary image.
 * @return {int}           The amount of detected cars in motion on the map.
 */
function countCars(motionMap) {
    var contours = motionMap.findContours();
    var amountOfCars = 0;

    //removing small contaours
    for (var i = 0; i < contours.size(); i++) {
        if (contours.area(i) >= MIN_CAR_AREA)
            amountOfCars++;
    }

    return amountOfCars;
}

/**
 * Given the motion map, counts how many cars there are on the current map.
 * @param  {opencv.Matrix} motionMap A binary image.
 * @param  {opencv.Matrix} an original image without thresholding. This image is
 *                            going to have the cars in motion marked in it and
 *                            saved on the same folder as this script under the
 *                            name MARKED_IMAGE_NAME. This parameter is optional.
 * @return {int}           The amount of detected cars in motion on the map.
 */
function countCars(motionMap, originalImage) {
    var contours = motionMap.findContours();
    var amountOfCars = 0;

    var mark = false;
    if (typeof(originalImage) !== "undefined")
        mark = true;

    //removing small contaours
    for (var i = 0; i < contours.size(); i++) {
        if (contours.area(i) >= MIN_CAR_AREA) {
            amountOfCars++;


            if (mark)   // it doesn't matter the color, it's always red.
                originalImage.drawContour(contours, i, "green");
        }
    }

    if (mark)
        originalImage.save(MARKED_IMAGE_NAME);

    return amountOfCars;
}

/**
 * Downloads two images from the camId using NYC feed. Generates the motion map
 * by using background subtraction and count cars by selecting contours with area
 * bigger than MIN_CAR_AREA.
 * @param  {string} camId The ID of a camera. Tipically on the form cam[ID]
 * @return {Q.promise}       Returns a promise that when fulfilled contains the
 *                           amount of cars in motion on camId's location. This
 *                           promise may be rejected due storage or network problems.
 */
function countCarsInMovment_promise(camId) {
    var deferred = Q.defer();

    var downloadedImages = []

    nyc.getStreetImages(camId)
    // Q(["./streetA1.png", "./streetA2.png"])
    .then(function(imagesPath) {

        //storing the path to the downloaded images
        downloadedImages = imagesPath;
        return loadImages_promise(imagesPath);
    }).then(function(images) {
        copy = images[1].copy();

        //prepares the motion map and count cars
        motionMap = generateMotionMap(images[0], images[1]);

        //this is a overloaded function for debugging purposes. On production,
        //remove the copy parameter.

        var carsInMotion = 0;
        if (KEEP_INTERMEDIATE_IMAGES)
            carsInMotion = countCars(motionMap, copy);
        else
            carsInMotion = countCars(motionMap);

        console.log("here");

        //async deleting the downloaded frames
        for (var i = 0; i < downloadedImages.length; i++)
            fs.unlink(downloadedImages[i]);

        console.log("here...")
        deferred.resolve(carsInMotion);
    });

    return deferred.promise;
}

/**
 * Counts how many car there are in motion on each location represented by a camId.
 * @param  {string array} camIds  An array containing the camera IDs of the places
 *                                to monitor. Typically cam[ID].
 * @param  {int} threads          Optional parameter containing the amount of threads
 *                                used to count the cars in parallel. If not used,
 *                                the default is AMOUNT_OF_THEADS.
 * @return {Q.promise}            A promise that when fulfilled contains an array
 *                                with the amount of cars on each location. This
 *                                promise may be rejectec either due network or disk
 *                                IO problems.
 */
function countMultipleStreets_promise(camIds, threads) {
    var threads = (typeof(threads) === "undefined" || threads < 1) ? AMOUNT_OF_THEADS : threads;
    console.log(">>>" + threads);

    return Q.map(camIds, countCarsInMovment_promise, threads)
}

module.exports.countCarsInMovment_promise = countCarsInMovment_promise;
module.exports.countMultipleStreets_promise = countMultipleStreets_promise;


// countCarsInMovment_promise("cam7").done(console.log);
// countMotionOnMultipleStreets(["cam10", "cam20"], 2).done(console.log);
