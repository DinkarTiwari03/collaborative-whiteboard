import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomId, username, userId) => {
  const s = initSocket();
  s.emit('join-room', { roomId, username, userId });
};

export const sendDraw = (roomId, drawingData) => {
  const s = getSocket();
  if (s) {
    s.emit('draw', { roomId, drawingData });
  }
};

export const sendCursorMove = (roomId, x, y) => {
  const s = getSocket();
  if (s) {
    s.emit('cursor-move', { roomId, x, y });
  }
};

export const sendChatMessage = (roomId, message, username, timestamp) => {
  const s = getSocket();
  if (s) {
    s.emit('chat-message', { roomId, message, username, timestamp });
  }
};

export const sendClearBoard = (roomId) => {
  const s = getSocket();
  if (s) {
    s.emit('clear-board', { roomId });
  }
};

export const sendUndo = (roomId, canvasData) => {
  const s = getSocket();
  if (s) {
    s.emit('undo', { roomId, canvasData });
  }
};
