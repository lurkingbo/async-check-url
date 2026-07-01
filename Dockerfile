FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine as final

WORKDIR /app

COPY --from=build /app .

EXPOSE 8080

CMD ["npm", "run", "start:dev"]
