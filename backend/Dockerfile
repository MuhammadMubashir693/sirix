FROM node:lts

RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production=false

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
