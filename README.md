# CollabBoard - Real-time Collaborative Whiteboard

A full-stack real-time collaborative whiteboard application built with React.js, Node.js, Express.js, MongoDB, Socket.IO, and Canvas API.

## Features

- **Authentication System**: JWT-based auth with register/login
- **Real-time Drawing**: Pencil and eraser tools with color picker and brush size
- **Undo/Redo**: Full drawing history management
- **Board Management**: Create, join, save, and delete whiteboards
- **Real-time Collaboration**: Multiple users drawing simultaneously
- **Live Chat**: Room-based chat with timestamps
- **Online Users**: See who's currently in your board
- **Dark Theme**: Modern glassmorphism UI with Tailwind CSS

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- React Router DOM
- Socket.IO Client
- Axios
- Vite

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- CORS
- dotenv

## Project Structure

```
CollabBoard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Toolbar.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   └── CanvasBoard.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── WhiteboardRoom.jsx
│   │   ├── context/        # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/       # API services
│   │   │   ├── api.js
│   │   │   └── boardService.js
│   │   ├── socket/         # Socket.IO setup
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Node.js backend
    ├── config/
    │   └── db.js           # MongoDB connection
    ├── controllers/
    │   ├── authController.js
    │   └── boardController.js
    ├── models/
    │   ├── User.js
    │   └── Board.js
    ├── routes/
    │   ├── auth.js
    │   └── boards.js
    ├── middleware/
    │   └── auth.js         # JWT middleware
    ├── socket/
    │   └── socketHandler.js
    ├── .env
    ├── package.json
    └── server.js
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance

### Step 1: Clone the repository
```bash
git clone <repository-url>
cd CollabBoard
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 4: Configure Environment Variables

The `.env` files are already configured in this project:

**Backend (`server/.env`)**:
```
PORT=5000
MONGO_URI=mongodb+srv://dinkart:dinkart@cluster0.psjhjvx.mongodb.net/collabboard
JWT_SECRET=mysecretkey
```

**Frontend (`client/.env`)**:
```
VITE_API_URL=http://localhost:5000
```

### Step 5: Run the Application

**Start the Backend Server** (from the `server` directory):
```bash
npm run dev
```

**Start the Frontend** (from the `client` directory in a new terminal):
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Boards
- `POST /api/boards` - Create new board (protected)
- `GET /api/boards` - Get all user boards (protected)
- `GET /api/boards/:id` - Get specific board (protected)
- `PUT /api/boards/:id` - Update board (protected)
- `DELETE /api/boards/:id` - Delete board (protected)
- `POST /api/boards/join/:roomId` - Join board by room ID (protected)

## Socket.IO Events

### Client → Server
- `join-room` - Join a collaboration room
- `draw` - Send drawing data
- `cursor-move` - Send cursor position
- `chat-message` - Send chat message
- `clear-board` - Clear the board
- `undo` - Undo last action

### Server → Client
- `user-connected` - New user joined
- `user-disconnected` - User left
- `draw` - Receive drawing data
- `chat-message` - Receive chat message
- `clear-board` - Board was cleared
- `undo` - Undo action
- `room-data` - Initial room state

## Usage

1. **Register/Login**: Create an account or login
2. **Dashboard**: View your boards and create new ones
3. **Create Board**: Click "New Board" and give it a name
4. **Join Board**: Use "Join Board" with a Room ID or click the copy icon to share
5. **Whiteboard**: Use the toolbar to draw, erase, change colors, and adjust brush size
6. **Chat**: Use the right panel to chat with collaborators
7. **Save**: Click the Save button to persist your board to MongoDB

## Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd client
npm run dev  # Uses Vite dev server
```

## Deployment

### Backend Deployment
1. Set up environment variables for production
2. Deploy to Heroku, Render, Railway, or similar
3. Update `CLIENT_URL` in server environment

### Frontend Deployment
1. Build the production bundle:
```bash
cd client
npm run build
```
2. Deploy the `dist` folder to Netlify, Vercel, or similar
3. Update `VITE_API_URL` to point to your deployed backend

## License

MIT License

## Author

CollabBoard Team
