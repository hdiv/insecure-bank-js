FROM node:18.12-slim

EXPOSE 3000

ADD . .

RUN npm install

CMD ["node", "./bin/www"]
