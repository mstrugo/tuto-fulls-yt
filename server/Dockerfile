FROM node:14

# Create app directory
WORKDIR /user/src/app

# Install dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn

# Bundle source
COPY . .
COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 8080
CMD ["node", "dist/index.js"]
USER node
