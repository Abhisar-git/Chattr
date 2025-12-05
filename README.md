# Chatty - Mini Team Chat Application

A real-time team chat application built with the MERN stack, featuring live messaging, channel management, and online status tracking.

## 🚀 Live Demo

- **Frontend:** [https://chattr-13x3.vercel.app](https://chattr-13x3.vercel.app)
- **Backend API:** [https://chattr-itmd.onrender.com](https://chattr-itmd.onrender.com)

## ✅ Core Features Implemented

All mandatory features have been successfully completed:

- **User Account Management** - Registration, login, and JWT-based authentication
- **Channel Operations** - Create, view, join, and leave channels
- **Real-Time Messaging** - Instant message delivery using WebSocket connections
- **Online Status Tracking** - Real-time display of online/offline users with multi-tab support
- **Message History & Pagination** - Complete message history with efficient lazy loading

## 🎯 Optional Features

- **Image Upload via Cloudinary** - Drag-and-drop image uploads with automatic optimization

## 🏗️ Key Design Decisions

### 1. Deployment Architecture
Separate hosting for frontend (Vercel) and backend (Render) to ensure stable WebSocket connections. Vercel's serverless architecture doesn't support persistent Socket.IO connections, while Render provides always-on server instances.

### 2. Real-Time Message Reliability
State updates rely exclusively on Socket.IO `newMessage` events rather than REST API responses. This prevents message duplication and ensures consistent ordering across all clients.

### 3. Pagination with Intersection Observer
Uses the Intersection Observer API to detect when users scroll to the top of the chat, automatically triggering the `loadOlderMessages` API call for better performance than scroll event listeners.

### 4. Message Display Order
Client-side sorting ensures messages display with oldest at top and newest at bottom, maintaining consistent UX even though the database returns newest messages first for pagination efficiency.

### 5. Cross-Origin Cookie Management
Configured with `sameSite: "none"` and `secure: true` to enable cookie transmission between different domains (Vercel ↔ Render), as `sameSite: "strict"` would block cross-origin cookies entirely.

## 🛠️ Technology Stack

**Frontend:** React, Vite, Zustand, Tailwind CSS, DaisyUI, Socket.IO Client, Axios  
**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, Bcrypt, Cloudinary

## 🚀 Setup Instructions

### Backend Setup

1. Navigate to backend and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5000
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 🌐 Deployment

**Backend (Render):**
- Build Command: `npm install`
- Start Command: `npm start`
- Add all environment variables from `.env`

**Frontend (Vercel):**
- Framework: Vite
- Build Command: `npm run build`
- Add `VITE_BACKEND_URL` environment variable with your Render backend URL

**Important:** Update CORS configuration in both backend files to include your deployed frontend URL:
```javascript
// index.js and socket.js
origin: "https://your-frontend.vercel.app"
```

## 🔐 Security Features

- JWT authentication with HTTP-only cookies
- Bcrypt password hashing
- CORS configuration for API protection
- Server-side input validation

## 📝 API Endpoints

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/channels` - Get all channels
- `POST /api/channels/create` - Create channel
- `GET /api/messages/:channelId` - Get messages (paginated)
- `POST /api/messages/send` - Send message

## 🔌 Socket.IO Events

**Client → Server:** `joinChannel`, `leaveChannel`  
**Server → Client:** `newMessage`, `onlineUsers`

---

**Built with ❤️ using the MERN Stack**
