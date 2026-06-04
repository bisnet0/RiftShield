FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /usr/src/app

COPY package.json yarn.lock* package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
