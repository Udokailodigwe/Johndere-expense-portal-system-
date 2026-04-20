# build stage
FROM node:18 AS build

WORKDIR /app
COPY ./client .
COPY ./nginx/nginx.conf .
RUN npm install
RUN npm run build

# production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf
