# Assignment 2 - Motion detector

In order to build this project, you are going to need:

- opencv 2.4.x
- node 4.x (on OSX) or 0.12.7 (on Ubuntu)

**Notice:** nvm doesn't work properly inside Docker containers

Just run ```npm install``` on ```motion_server``` on the root folder and
everything is going to be fine


## Tasks

| Task           | Status         |
|----------------|:----------------:|
|: **Back end**                      :|
| ~~Implementing motion detection algorithm~~     | Done |
| ~~Group cameras location on a single j​son​ file~~ | Done |
| ~~Creating a server which receives a camera request and counts the amount of cars~~ | Done |
| ~~Require authentication before serving API ~~ | Extra / Done |
| ~~Set up a load balancer to handle load on the processing server~~| Done |
| ~~Test manual scaling with this server~~ | Done |
| Configure automatic scale out/in using the load balancer| To do |
| Implement the presentation server    | To do|
| Implement database to keep track of most accessed cameras| To do |
|: **FRONT END** :|
| ~~Collect (lat,long) location of the cameras based on its address~~ | Done |
| Develop the first page, where the user can select which cameras he wants to monitor | To do |
| Embed Google Maps in this fist page |To do |
| Retrieve popular cameras from the Database | To do |
| Develop statistics page layout |To do |
| Embed jQuery on this page to keep statistics updated |To do |
