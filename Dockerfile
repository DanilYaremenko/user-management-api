FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Установить Prisma CLI
RUN npm install prisma --global

COPY . .

# Генерация Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start"]
