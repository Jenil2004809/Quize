const { Server } = require('socket.io');

let io = null;
const onlineUsers = new Map(); // socketId -> userId (or null)

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.id, null);
    broadcastActiveUsers();

    socket.on('join_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        socket.userId = userId;
        onlineUsers.set(socket.id, userId);
      }
      broadcastActiveUsers();
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      broadcastActiveUsers();
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const getActiveUsersCount = () => {
  if (!io) return 0;
  const loggedInUsers = new Set();
  let guestCount = 0;

  for (const userId of onlineUsers.values()) {
    if (userId) {
      loggedInUsers.add(userId);
    } else {
      guestCount++;
    }
  }

  const uniqueTotal = loggedInUsers.size + guestCount;
  const socketCount = io.engine?.clientsCount || 0;
  return Math.max(uniqueTotal, socketCount, 1);
};

const broadcastActiveUsers = () => {
  if (io) {
    const count = getActiveUsersCount();
    io.emit('active_users_count', count);
  }
};

const notifyAnalyticsUpdate = () => {
  if (io) {
    io.emit('analytics_updated');
    broadcastActiveUsers();
  }
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

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  getActiveUsersCount,
  broadcastActiveUsers,
  notifyAnalyticsUpdate
};

