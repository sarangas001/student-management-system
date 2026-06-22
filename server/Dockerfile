FROM node:24-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

FROM node:24-slim
WORKDIR /app
COPY --from=builder /app .
ENV PORT=3001
EXPOSE 3001
USER 1000
CMD ["npm", "start"]
