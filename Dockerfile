FROM node:10.15.3-slim

LABEL version="0.3"
LABEL description="Image for secretary-bot"
LABEL maintainer="Wendy <wencodes@gmail.com>"

# Set the time zone
ENV TZ=Asia/Singapore
RUN echo "Asia/Singapore" > /etc/timezone && \
  dpkg-reconfigure -f noninteractive tzdata

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY ["package.json", "./"]

RUN cd /usr/app && \
  npm install --production

COPY . .

# add to the same group as file owner
RUN groupadd -r nodejs -g 1001 \
  && useradd -m -r -g nodejs nodejs \
  && chown -R nodejs:nodejs /usr/app


USER nodejs
CMD [ "npm", "run", "live" ]
