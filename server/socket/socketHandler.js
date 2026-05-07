const socketHandler = (io) => {
  const rooms = {}; // Store room data

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join-room', ({ roomId, username, userId }) => {
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!rooms[roomId]) {
        rooms[roomId] = {
          users: [],
          canvasData: ''
        };
      }

      // Add user to room
      const user = {
        id: socket.id,
        username,
        userId,
        cursor: { x: 0, y: 0 }
      };
      
      // Remove user if already exists (reconnection)
      rooms[roomId].users = rooms[roomId].users.filter(u => u.userId !== userId);
      rooms[roomId].users.push(user);

      // Notify others in the room
      socket.to(roomId).emit('user-connected', user);
      
      // Send current room data to the user
      socket.emit('room-data', {
        users: rooms[roomId].users,
        canvasData: rooms[roomId].canvasData
      });

      console.log(`User ${username} joined room ${roomId}`);
    });

    // Handle drawing
    socket.on('draw', ({ roomId, drawingData }) => {
      socket.to(roomId).emit('draw', drawingData);
      
      // Store canvas data
      if (rooms[roomId]) {
        rooms[roomId].canvasData = drawingData.canvasData;
      }
    });

    // Handle cursor movement
    socket.on('cursor-move', ({ roomId, x, y }) => {
      if (rooms[roomId]) {
        const user = rooms[roomId].users.find(u => u.id === socket.id);
        if (user) {
          user.cursor = { x, y };
          socket.to(roomId).emit('cursor-move', {
            userId: user.userId,
            username: user.username,
            x,
            y
          });
        }
      }
    });

    // Handle chat messages
    socket.on('chat-message', ({ roomId, message, username, timestamp }) => {
      const messageData = {
        id: Date.now(),
        username,
        message,
        timestamp
      };
      
      io.to(roomId).emit('chat-message', messageData);
    });

    // Handle clear board
    socket.on('clear-board', ({ roomId }) => {
      if (rooms[roomId]) {
        rooms[roomId].canvasData = '';
      }
      socket.to(roomId).emit('clear-board');
    });

    // Handle undo
    socket.on('undo', ({ roomId, canvasData }) => {
      if (rooms[roomId]) {
        rooms[roomId].canvasData = canvasData;
      }
      socket.to(roomId).emit('undo', { canvasData });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove user from all rooms
      Object.keys(rooms).forEach(roomId => {
        const userIndex = rooms[roomId].users.findIndex(u => u.id === socket.id);
        if (userIndex !== -1) {
          const user = rooms[roomId].users[userIndex];
          rooms[roomId].users.splice(userIndex, 1);
          
          // Notify others in the room
          socket.to(roomId).emit('user-disconnected', {
            userId: user.userId,
            username: user.username
          });

          // Clean up empty rooms
          if (rooms[roomId].users.length === 0) {
            delete rooms[roomId];
          }
        }
      });
    });
  });

  return io;
};

module.exports = socketHandler;
