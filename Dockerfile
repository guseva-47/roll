# Официальный образ Node.js с указанием имени образа - development для многоступенчатой сборки
FROM node:14-alpine As development

# контекст
WORKDIR /usr/src/app

# копирование package.json и package-lock.json
COPY package*.json ./

# установка только пакетов в контексте
RUN npm install --only=development

COPY . .

# проверка, что приложение создано в папке /dist. Т.к. приложение использует TypeScript и другие build-time зависимости, нужно выполнить эту команду в образе development.
RUN npm run build

# создание нового образа production (несвязанного с предыдущим)
FROM node:14-alpine as production

# задание значения по умолчанию для .env файла
ARG NODE_ENV=production
# если есть пользовательское значение для .env, то устанавливается оно
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000
# команда выполняющаяся при запуске образа
CMD ["node", "dist/main"]
