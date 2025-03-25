FROM node:lts-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# Копирование кастомной nginx конфигурации
COPY default.conf /etc/nginx/conf.d/default.conf

# Копирование собранных файлов из build-stage
COPY --from=build-stage /app/dist /app

EXPOSE 82

CMD ["nginx", "-g", "daemon off;"]