FROM node:9.10.0-slim

LABEL version="0.3"
LABEL description="Image for telegram-bot-secretary"
LABEL maintainer="Wendy <wencodes@gmail.com>"

# Set the time zone
ENV TZ=Asia/Singapore
RUN echo "Asia/Singapore" > /etc/timezone && \
  dpkg-reconfigure -f noninteractive tzdata

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY ["package.json", "yarn.lock", "./"]

RUN cd /usr/app && \
  yarn install --production

COPY . .

RUN groupadd -r nodejs \
  && useradd -m -r -g nodejs nodejs \
  && chown -R nodejs:nodejs /usr/app

CMD [ "yarn", "live" ]

USER nodejs
