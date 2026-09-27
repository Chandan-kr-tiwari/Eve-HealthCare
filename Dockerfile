FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./

ENV DATABASE_URL="postgresql://eve_user:REDACTED@db:5432/eve_healthcare"

RUN npx prisma generate

COPY src ./src

EXPOSE 5000

CMD ["npm", "start"]