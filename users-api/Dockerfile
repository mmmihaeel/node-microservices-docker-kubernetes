FROM node:19.4.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV prod

EXPOSE 1778

CMD ["node", "users-app.js"]