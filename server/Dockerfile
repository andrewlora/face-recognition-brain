FROM node:20-alpine

# Create app directory
RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

# Install app dependencies
COPY package.json /usr/src/api
RUN npm install

# Bundle app source
COPY ./ /usr/src/api

# Build arguments
ARG NODE_VERSION=20.12.2

# Environment
ENV NODE_VERSION $NODE_VERSION