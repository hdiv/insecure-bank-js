FROM node:18.12-slim

EXPOSE 3000

ADD . .

RUN npm instal

ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["node", "./bin/www"]
