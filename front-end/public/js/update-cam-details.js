$(document).ready(function () {



    camIds = decodeURIComponent(getUrlVars()["camIds"]);

    //If so exists, removes the 'cam' keywords from it and removes the last comma before requesting from the server
    camIds = camIds.replace(/cam/g, '');

    // If the last character is a comma, removes it
    camIds = camIds.slice(-1) == "," ? camIds.substr(0, camIds.length - 1) : camIds;

    console.log("camIds:" + camIds);


    var splittedCams = camIds.split(",");
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

        splittedCams[part] = joined;
    }

    console.dir(splittedCams);


    getCamData(splittedCams);

    /* if (camData.indexOf("message") > 1) {
     console.log(camData["message"]);
 } else {
     console.dir(data);
 }*/


    /**
     * This function request the data from the backend about the cameras' current state
     *
     * @param {Array} camIds Array of CamIds split in smaller groups of 3 camIds each.
     */
    function getCamData(camIds) {

        /*
         * Creating dynamically an array of Ajax call promises, according to
         * the number of chunks in the Array.
         */
        var ajaxPromisesArray = [];


        var deferred = $.Deferred();

        // For each chunk
        for (potato in camIds) {

            // Array of Promises to be passed as an argument
            ajaxPromisesArray.push(
                $.ajax({
                    method: "POST",
                    url: 'http://52.64.254.156/cars',
                    //url: 'http://nyc-balancer-1920328868.ap-southeast-2.elb.amazonaws.com/cars',
                    data: {
                        camIds: camIds[potato],
                        api: "dc657b32097507ca7d98442fa52d2d85"
                    }
                })
            );
        }

        // Waits for all the chunks AJAX calls to finish
        $.when.apply($, ajaxPromisesArray)

        //  And then creates an object by concatenating them into one single
        .then(function () {

                var newJSON = {};
                if (arguments[1] == false) {

                    // Creates a new object to hold all the data from the server
                    for (data in arguments) {
                        var curr = arguments[data][0];
                        for (cam in curr) {
                            newJSON[cam] = curr[cam];
                        }
                    }
                } else {
                    newJSON = arguments[0];
                }



                for (cam in newJSON) {
                    $("#" + cam).html(newJSON[cam]);
                    console.log("Trocou. " + "#" + cam);
                }

            })
            .fail(function (data) {
                console.log("There was an error while updating the cams data.");
            }).done(function () {

            });
    }

    /**
     * Returns the Query String data from the URL.
     * @returns {Array} vars An associative array with the URL query parameters values
     */
    function getUrlVars() {
        var vars = [],
            hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }



});
