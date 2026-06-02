# 🚀 React Vite Frontend - Docker + CI/CD

A modern **React (Vite)** frontend application with Docker containerization and automated CI/CD pipeline using GitHub Actions. The project is designed for production-ready deployment using Docker and Docker Hub.

---

## 📌 Tech Stack

- ⚛️ React (Vite)
- 📦 Node.js
- 🐳 Docker
- ⚙️ GitHub Actions CI/CD
- 🌐 Serve (for production static hosting)

---

## 📁 Project Structure

client/
│── public/
│── src/
│── index.html
│── package.json
│── vite.config.js
│── Dockerfile
│── .github/
│   └── workflows/
│       └── frontend-ci.yml

---

## 🚀 Getting Started

### Install dependencies

npm install

---

### Run development server

npm run dev

App runs at:
http://localhost:5173

---

## 🏗️ Production Build

Generate optimized build:

npm run build

Preview production build locally:

npm run preview

---

## 🐳 Docker Setup

### Dockerfile (Production Ready)

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]

---

### Build Docker Image

docker build -t react-frontend .

---

### Run Docker Container

docker run -p 5173:5173 react-frontend

Open:
http://localhost:5173

---

## ⚙️ CI/CD Pipeline (GitHub Actions)

This project includes automated CI/CD using GitHub Actions.

### Trigger

- Runs on push to:
client/**

- Manual trigger supported:
workflow_dispatch

---

### Pipeline Steps

1. Checkout repository
2. Setup Node.js
3. Install dependencies (npm ci)
4. Build project (npm run build)
5. Create Docker image
6. Push image to Docker Hub

---

## 🐳 Docker Hub Image

After successful pipeline:

docker pull <your-docker-username>/react-frontend:latest

---

## 🔐 GitHub Secrets Required

Add these in GitHub repository settings:

DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password

---

## ⚠️ Important Notes

- Do NOT use npm run dev in production Docker
- Always use npm run build for production
- Vite dev server is only for development
- Use Docker + Nginx for best production performance

---

## 🚀 Recommended Production Docker (Nginx)

Better performance version:

FROM node:20-alpine as build

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

---

## 👨‍💻 Author

Saranga Samarakoon

---

## 📜 License

This project is open-source and free to use.

---

## ⭐ Support

If you like this project:
- Star the repo ⭐
- Share with others 🚀
- Contribute improvements 🛠