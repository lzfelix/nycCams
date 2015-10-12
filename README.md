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
| **~~Back end~~**                      |
| ~~Implementing motion detection algorithm~~     | Done |
| ~~Group cameras location on a single j​son​ file~~ | Done |
| ~~Creating a server which receives a camera request and counts the amount of cars~~ | Done |
| ~~Require authentication before serving API~~ | Extra / Done |
| ~~Set up a load balancer to handle load on the processing server~~| Done |
| ~~Test manual scaling with this server~~ | Done |
| ~~Configure automatic scale out/in using the load balancer~~ | Done |
| ~~Implement database to keep track of most accessed cameras~~ | Done |
| Remove / route from back server (only before submitting)| To do |
|: **FRONT END** :|
| ~~Collect (lat,long) location of the cameras based on its address~~ | Done |
| Develop the first page, where the user can select which cameras he wants to monitor | To do |
| Embed Google Maps in this fist page |To do |
| Retrieve popular cameras from the Database | To do |
| Develop statistics page layout |To do |
| Embed jQuery on this page to keep statistics updated |To do |

## DB Login details
```mssql -s zw9rn5s0y6.database.windows.net -u nyc_user -p v@c4jairo -d nycdb -e```

## AWS Service configuration

### 1. Creating a Virtual Private Cloud (VPC)

Dashboard > VPC > Start VPC Wizard.

**Specifications:**

+ *VPC name:* nyc_vpc
+ *Subnet name:* nyc_vpcx
+ *id (current):* vpc-f4e55a91
+ *Gateway id:* igw-c823f3
* *Route tables:* rtb-d8 (custom) / rtb-d930 (main)

### 2. Create security group

Dashboard > VPC > Security Groups > Create
Allows HTTP @ 80 and SSL @ 22 inbound connections

**Specifications**

+ *name:* nyc_secgroup
+ *auto assign IP:* **true**

### 3. EC2 instance details

+ *network:* nyc_vpc
+ *subnet:* nyc_vpcx
+ *security group:* nyc_secgroup
+ Use the Docker image in ```misc/Docker``` and ```guestkey``` here. Don't forget to login as ```lzfelix```
+ Modify crontab (```crontab -e``` from this machine)
+ Save it as a image. By default ```aim_nyc_backserver``` (aim is a typo for AMI)

### 4. Create load balancer

+ *Name:* nyc_balancer
+ *Forwarding:* port 80 (external) -> **port 80 internal (notice Docker container creation)**
+ *Subnet:* nyc_vpcx
+ *Security group:* nyc_balancer_secgroup (just allows inbound HTTP connections @ port 80)
+ *Ping path:* '/'

### 5. Create "Launch Configuration"

EC2 > Auto Scaling > Launch configuration > create

**Specifications**
+ *name:* aim_nyc_backserver
+ *AMI:* aim_nyc_backserver
+ *security group:* nyc_secgroup

### 6. Create auto scaling group

+ *name:* nyc_autoscale_group
+ *configuration:* aim_nyc_backserver
+ *initial size:* **2**
+ *max size:* **7**
+ *network:* nyc_vpc
+ *subnet:* nyc_vpcx
+ *Health check:* 300 (amount of time to consider a instance health to be mapped by the group, in seconds)
+ *Load balancer:* nyc_balancer
+ **Policies:**
    + *scale-in*: Σ(inbound_data) >= 200.000 bytes for 1 minute in a row
    + *scale-out*: Σ(inbound_data) <= 50.000 bytes for 1 minute, 3 times in a row