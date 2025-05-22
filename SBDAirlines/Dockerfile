FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY .env ./
COPY . .

ARG SHARD_ID
ENV SHARD_ID=${SHARD_ID}

EXPOSE 3000

CMD ["node", "index.js"]
