BAD_REQUEST_HTML_CODE = 400;
TEXT_INVALID_CAM = "Invalid camera id provided.";

MIN_ID = 0;
MAX_ID = 454;

/**
 * Validates a camera ID. A valid camID has the prefix "cam", followed by its
 * ID number, which must be on the interval [MIN_ID, MAX_ID].
 * @param  {string} camId The ID of the camera do be validated.
 * @return {boolean}      True if this is a valid ID, otherwise false.
 */
function validateCamName(camId) {
    // check if the format is cam000, 0 = number
    if (camId.match(/^cam\d+$/) == null)
        return false;

    var number = camId.substr(camId.match(/\d+/).index);
    if (number < MIN_ID || number > MAX_ID)
        return false;

    return true;
}

/**
 * Validates the camera number. If this one is valid, return it as a canonical
 * camera ID (cam<id_number>).
 * @param  {string} camId A number as a string.
 * @return {string}       If the ID is valid, a canonical cam id is returned,
 *                        null otherwise.
 */
function validateCamNumber(camId) {
    if (camId.match(/^\d+$/) == null)
        return null;

    var number = camId.substr(camId.match(/\d+/).index);
    if (number < MIN_ID || number > MAX_ID)
        return null;

    return "cam" + number;
}

/**
 * Given a string containing camera IDs, received from the client-side, validates
 * them. This function removes all the spaces, then split the camera IDs based on
 * the commas. Following, each camera is validates. If there's at least one invalid
 * camera, then the array [BAD_REQUEST_HTML_CODE, TEXT] is returned. otherwise
 * an array containing unique camera IDs is returned.
 * @param  {string} camIds A string of camera IDs comma separated.
 * @return {string array}  If there's at least one invalid camera, the first
 *                         element of the array is BAD_REQUEST_HTML_CODE. otherwise
 *                         it's just a collection of valid camera IDs.
 */
function parseCameraInput(camIds) {
    if (typeof(camIds) === "undefined" || camIds == null)
        return [BAD_REQUEST_HTML_CODE, TEXT_INVALID_CAM];

    // remove all spaces and break on commas
    var cameras = camIds.replace(/\s/g, '').split(",");
    var someInvalid = false;

    // verifying correct camera ids
    for (var i = 0; i < cameras.length; i++)
        if (!validateCamName(cameras[i])) {
            someInvalid = true;
            break;
        }

    if (someInvalid)
        return [BAD_REQUEST_HTML_CODE, TEXT_INVALID_CAM];

    //keeping just unique IDs
    var set = new Set();

    for (var cam of cameras)
        set.add(cam);

    var uniqueCameras = []
    for (var elem of set)
        uniqueCameras.push(elem);

    return uniqueCameras;
}

/**
 * Optional way to parse the incoming array of cameras. This function expects a
 * string of numbers (camera IDS) on the range [MIN_ID, MAX_ID] and if all the IDs
 * are valic, an array where each position contains the canonical camera ID (in
 * the form cam<id_number>) is returned.
 * @param  {string} camIds A string of comma separated ids.
 * @return {string array}  If all the cames are valid, an array with unique  canonical
 *                         camera IDs is returned. Otherwise a array on the form
 *                         [BAD_REQUEST_HTML_CODE, TEXT_INVALID_CAM] is returned.
 */
function parseCameraNumbers(camIds) {
    if (typeof(camIds) === "undefined" || camIds == null)
        return [BAD_REQUEST_HTML_CODE, TEXT_INVALID_CAM];

    // remove all spaces and break on commas
    var cameras = camIds.replace(/\s/g, '').split(",");
    var fullIDs = new Set();

    // verifying correct camera ids
    for (var i = 0; i < cameras.length; i++) {
        var newCam = validateCamNumber(cameras[i]);

        if (newCam == null)
            return [BAD_REQUEST_HTML_CODE, TEXT_INVALID_CAM];

        fullIDs.add(newCam);
    }

    var uniqueCameras = [];
    for (var elem of fullIDs)
        uniqueCameras.push(elem);

    return uniqueCameras;
}

module.exports.parseCameraInput = parseCameraInput;
module.exports.parseCameraNumbers = parseCameraNumbers;
module.exports.BAD_REQUEST_HTML_CODE = BAD_REQUEST_HTML_CODE;

// console.log(parseCameraInput("cam202, cam303, cam101, cam4, cam450, zicam450"));
// console.log(parseCameraInput(null));
// console.log(parseCameraInput(""));
// console.log(parseCameraNumbers("102, 204, 303, 99, 100"))
