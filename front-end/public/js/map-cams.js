$(document).ready(function () {
    var map = new GMaps({
        div: '#map-canvas',
        lat: 40.7127,
        lng: -74.0059
    });

    var mapArray = [];

    /**
     * Adds or removes the camId from the form data, depending on selection.
     * @param {string} camId The camera ID to be toggled.
     */
    function toggleCam(camId) {
        var self = $("input[name='camIds']");

        if (self.val().indexOf(camId) >= 0) {
            self.val(self.val().replace(camId + ",", ""));
        } else {
            self.val(self.val() + camId + ",");
        }
    }


    $.getJSON("https://gist.githubusercontent.com/joaolucasl/703cc4293b8b1a59bdb2/raw/ed3b491d86d9d9c3f9adb3a8dd32b1f24983b2a3/all-seeing-eye.json",
        /**
         * This function gets the data from the JSON and creates the markers in the map,
         * with their respective functions, locations and callback functions.
         * @param {JSON} data JSON data from the request to be plotted on the map.
         */
        function (data) {

            var bounds = []; // Bounds value holder


            // Runs through the JSON response to add info to the map
            $.each(data, function (key, value) {

                // Creates new LatLng object to expand the view
                var coord = new google.maps.LatLng(value['lat'], value['long']);

                bounds.push(coord);

                //Adding marker to the map with respective values
                mapArray[key] = map.addMarker({
                    lat: coord.lat(),
                    lng: coord.lng(),
                    title: key,
                    icon: "/img/marker-normal.png", //Custom icon
                    infoWindow: {
                        //content: "<img src='" + value['URL'] + "' style='max-height:150px;'>"
                        content: "<h5>" + value['address'] + "</h5>"
                    },
                    click: function () {
                        toggleCam(this.title);

                        // Toggles icon state to match the selection or not of the camera
                        if (mapArray[key].getIcon() == "/img/marker-normal.png") {
                            mapArray[key].setIcon("/img/marker-active.png");
                        } else {
                            mapArray[key].setIcon("/img/marker-normal.png");
                        }
                    }
                });

            });
            //Expands view to show all the markers
            map.fitLatLngBounds(bounds);

            console.log(mapArray);
        });
});
