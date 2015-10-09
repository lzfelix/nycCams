import re

LINE_ENDING = "font color=white>"
CONST_LEN = len(LINE_ENDING)

cams = {}

cam_name = ""

f = open("cams.html", "r")
for line in f:
    # Testing for a camera name
    match = re.search("class=\"TitleCam\"", line)
    if match:
        title_begin = line.index("e>") + 2
        title_end   = line.index("</font")

        cam_name = line[title_begin : title_end]
        print cam_name

    # Testing camera link
    else:
        try:
            link_begin = line.index("onload=\"LoadImage(this,'00')\" src=") + 35
            link_end   = line.index(" alt=") - 1

            cam_url = line[link_begin : link_end]
            print cam_url

            # cams[cam_name] = cam_url
        except:
            pass

# print cams
