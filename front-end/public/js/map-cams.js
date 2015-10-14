$(document).ready(function () {
    var map = new GMaps({
        div: '#map-canvas',
        lat: 40.7127,
        lng: -74.0059
    });
    $.getJSON("https://gist.githubusercontent.com/joaolucasl/703cc4293b8b1a59bdb2/raw/ed3b491d86d9d9c3f9adb3a8dd32b1f24983b2a3/all-seeing-eye.json",
        function (data) {

            var bounds = []; // Bounds value holder


            // Runs through the JSON response to add info to the map
            $.each(data, function (key, value) {

                // Creates new LatLng object to expand the view
                var coord = new google.maps.LatLng(value['lat'], value['long']);

                bounds.push(coord);

                //Adding marker to the map
                map.addMarker({
                    lat: coord.lat(),
                    lng: coord.lng(),
                    title: value['address'],
                    infoWindow: {
                        content: "<img src='" + value['URL'] + "' style='max-height:150px;'>"
                    },
                    click: function () {

                    }
                });

            });

            //Expands view to show all the markers
            map.fitLatLngBounds(bounds);
        });
});
