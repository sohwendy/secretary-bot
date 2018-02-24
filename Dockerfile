FROM node:9.6.1

WORKDIR /app/src

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 8080
CMD [ "yarn", "start" ]

