# ThumbForge AI 🚀

A premium YouTube Thumbnail management and storage platform built with **Fastify (Backend)** and **React + Vite + Shadcn UI (Frontend)**.

## ✨ Features
- **AI-Powered Aesthetic**: Clean, premium white minimalist design.
- **Authentication**: Secure JWT-based registration and login system.
- **Thumbnail Management**: Upload, preview, update, and delete YouTube thumbnails.
- **Bulk Operations**: Delete multiple thumbnails at once.
- **Responsive**: Fully optimized for mobile and desktop creators.

## 🛠️ Tech Stack
- **Backend**: Fastify, MongoDB (Mongoose), JWT, Bcrypt, Multer (Fastify-Multipart).
- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Axios.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Backend Setup
1. Open the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from `.env.example` (or use existing one) and add your:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (Default: 4000)
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure
```text
├── controllers/      # Backend API logic
├── models/           # Mongoose schemas
├── routes/           # Fastify API routes
├── plugins/          # Fastify plugins (JWT, DB)
├── frontend/         # React Application (Vite)
│   ├── src/          # Source code
│   └── public/       # Static assets (Place logo.png here)
└── uploads/          # User-uploaded thumbnail storage
```

## 📝 License
ISC
