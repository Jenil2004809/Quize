const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitToUser = (userId, event, payload) => {
  if (io) {
    if (userId) {
      io.to(`user_${userId}`).emit(event, payload);
    }
    // Broadcast for real-time navbar & policy updates
    io.emit(event, { userId, ...payload });
  }
};

module.exports = { initSocket, getIO, emitToUser };
