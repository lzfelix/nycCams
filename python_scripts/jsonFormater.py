def parseFile(filename):
    """
        Creates a dictionary of cameras based on a formated input file.
        @filename [string]: Path to the file containning
                            (<camera_addres>\n<camera_url>\n)*.
        @returns  [dict]: where the key is in the form "cam<id>", where <id>
                            starts in 0. Each camera contains the attributes
                            address, URL, lat and long. These two last contains
                            the temporary values "xxx" and "yyy".
    """
    cam_id = 0
    is_new = True

    new_camera = {}
    cameras = {}

    raw_file = open(filename, "r")

    for line in raw_file:
        line = line[:len(line)-1] # removing \n

        # first create a new camera. The first line is always its address
        if is_new:
            is_new = False
            new_camera["address"] = line
        else:
            # the second one contains the URL. Save this camera and go back
            # to initial stage

            new_camera["URL"] = line
            new_camera["lat"] = "xxx"
            new_camera["long"] = "yyy"

            key = "cam" + str(cam_id)
            cameras[key] = new_camera

            cam_id += 1
            new_camera = {}

            is_new = True

    return cameras


def getOnlyAddresses(cameras, outputfile):
    """
        Generates an output file containing each camera address, one by line,
        prefixed with 'New York'. This file contains a '-{11} 100 milestone\n'
        string, demarking every 100 cameras. This allows using this service:
        http://www.mapdevelopers.com/batch_geocode_tool.php to find the camera's
        location.

        @cameras    [dict]      the cameras dictionary created by [parseFile].
        @outputfile [string]    the path to the output file.
        @returns    [None]
    """

    out = open(outputfile, "w")
    counter = 0
    for (_, cam) in cameras.iteritems():
        out.write("NY New York " + cam["address"] + "\n")

        counter += 1
        if (counter == 100):
            counter = 0
            out.write("------------ 100 milestone\n")


def updateCameras(cameras, latlong_file):
    """
        Updates the camera dictionary by adding the real cameras lat long.
        @cameras        [dict]      a camera dictionary, created by the function [parseFile].
        @latlong_file   [string]    path to the file containing the lat_long of each.
                                    camera on the dictionary. Obtained from here:
                                    http://www.mapdevelopers.com/batch_geocode_tool.php
        @returns        [None]      ...but updates the @cameras dictionary.
    """
    new_cameras = {}

    locations = open(latlong_file, "r")

    for (key, _) in cameras.iteritems():
        # reading a latlong line from file and removing \n
        lat_long = locations.readline()
        lat_long = lat_long[:len(lat_long) - 1]

        # data[0] = original address, data[1] = lat, data[2] = long
        data = lat_long.split('\t')

        # updating cam data
        cameras[key]["lat"] = data[1]
        cameras[key]["long"] = data[2]


def outputJson(cameras, json_file):
    file = open(json_file, "w")

    there_was_previous = False

    for (key, camera) in cameras.iteritems():
        if there_was_previous:
            file.write("\t},\n")

        string_camera = "\t\"" + key + "\" : { \n"
        string_camera += "\t\t\"address\"\t: \"" + camera["address"] + "\",\n"
        string_camera += "\t\t\"URL\"\t\t: \""     + camera["URL"]     + "\",\n"
        string_camera += "\t\t\"lat\"\t\t: \""     + camera["lat"]     + "\",\n"
        string_camera += "\t\t\"long\"\t\t: \""     + camera["long"]     + "\"\n"

        file.write(string_camera)
        there_was_previous = True

    # write the last closing braces
    file.write("\t}\n}");


if __name__ == "__main__":
    cameras = parseFile("cameras.txt")

    getOnlyAddresses(cameras, "addresses.txt")
    updateCameras(cameras, "latlongs.txt")

    outputJson(cameras, "cameras.json")
