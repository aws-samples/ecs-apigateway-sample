# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT

FROM amazonlinux

# set environmental variables for node
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 14.9.0

# install dependencies
RUN yum -y update && \
  yum -y install wget && \
  yum -y install tar.x86_64 && \
  yum -y install gzip && \
  yum -y install which && \
  yum -y install make gcc* && \
  yum -y install zip && \
  yum -y install shadow-utils && \
  yum clean all

# add non-root user, install node
RUN useradd -u 1000 node && \
  mkdir -p /usr/local/nvm && \
  curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash && \
  source $NVM_DIR/nvm.sh && \
  nvm install $NODE_VERSION && \
  nvm alias default $NODE_VERSION && \
  nvm use default

# export node path
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# run as non-root
USER node

# expose node server on a port
EXPOSE 8080
CMD [ "node", "server.js" ]