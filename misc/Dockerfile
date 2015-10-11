FROM lzfelix/cab432:latest
MAINTAINER lzfelix

# wow
RUN sudo ln /dev/null /dev/raw1394

# Pushing the private key on root. This is going to overwrite the previous PK,
# which is not a problem, since it was never used. The key is already protected,
# no need to run chmod on it
ADD guestkey /root/.ssh/id_rsa

# Create known_hosts
RUN touch /root/.ssh/known_hosts

# Add bitbucket as a trusted host
RUN ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

# clone the repo here
RUN git clone git@bitbucket.org:lzfelix/eyethatallsee.git

# Change the current directory to the app root
WORKDIR /eyethatallsee/motion_server

CMD nvm alias default 0.12.7
RUN node --version

# Resolve dependencies
RUN npm install

# Exposing the port 3000. If you want the user to access the app through the standard
# HTTP port 80, then when launching the container, map the Docker port 3000 to the
# real port 80.
EXPOSE 3000

# Running the app
CMD ./bin/www
