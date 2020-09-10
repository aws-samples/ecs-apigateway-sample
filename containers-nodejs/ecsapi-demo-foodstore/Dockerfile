# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT

FROM amazonlinux

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

# set environmental variables for node
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 14.10.0

# add non-root user, install node
RUN useradd -u 1000 node && \
  mkdir -p $NVM_DIR && \
  curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash && \
  source $NVM_DIR/nvm.sh && \
  nvm install $NODE_VERSION && \
  nvm alias default $NODE_VERSION && \
  nvm use default

# export node path
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Set app directory
WORKDIR /home/node

# run as non-root
USER node

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node:node package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY --chown=node:node . .

# expose node server on a port
EXPOSE 8080
CMD [ "node", "server.js" ]