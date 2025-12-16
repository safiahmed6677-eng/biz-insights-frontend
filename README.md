<div align="center">

# 📌 Biz Insights Frontend
A modern React-based dashboard for uploading CSV datasets, exploring insights, and visualizing data through interactive charts.

---

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Charts-0088FE?style=for-the-badge)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Status](https://img.shields.io/badge/Status-ACTIVE--DEVELOPMENT-blueviolet?style=for-the-badge&logo=github)

---

## 📑 Table of Contents

✨ [Features](#-features)
🧰 [Tech Stack](#-tech-stack)
🗂️ [Project Structure](#-project-structure)
📸 [Screenshots](#-screenshots) 
▶️ [Running Locally](#-running-locally)
🚀 [Future Improvements](#-future-improvements)
👤 [Author](#-author)

---

## ✨ Features

- Secure JWT-based authentication
- CSV file upload interface
- Dataset listing and management
- Automatic column type detection (numeric vs categorical)
- Interactive charts with dynamic column selection
- Dataset preview and summary insights
- Logout and session handling

---

## 🧰 Tech Stack

- **React 18**
- **Vite**
- **Recharts**
- **Axios**
- **React Router**
- **JWT Authentication**
- **REST API (Node.js + Express backend)**

---

## 🗂️ Project Structure
src/
├── api/ # Axios instance & API helpers
├── pages/ # Route-level pages (Login, Dashboard)
├── components/ # Reusable UI components
├── screenshots/ # README screenshots
├── App.jsx # App routes
├── main.jsx # React entry point

---

## 📸 Screenshots

### Login
![Login](screenshots/login.png)

### Dashboard
Upload CSV files and manage datasets.
![Dashboard](screenshots/dashboard.png)

### Dataset Insights
Automatic detection of column types and data preview.
![Insights](screenshots/insights.png)

### Charts
Interactive charts with dynamic column selection.
![Charts](screenshots/charts.png)

---

## ▶️ Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- Backend running locally (see backend repo)

### Installation

npm install

## Start Development Server

npm run dev

## Frontend will run at

http://localhost:5173

---

### 🚀 Future Improvements
- UI styling & theme improvements
- Multiple chart types (bar, pie)
- Pagination for large datasets
- Dataset deletion & editing
- Deployment (Vercel / Netlify)

---