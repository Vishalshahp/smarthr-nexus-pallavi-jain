const jwt = require('jsonwebtoken');
const logger = require('./logger');

const connectedUsers = new Map(); // userId -> socketId

const initSocketHandlers = (io) => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} [User: ${socket.userId}]`);

    // Register user
    connectedUsers.set(socket.userId, socket.id);
    socket.join(`user:${socket.userId}`);

    // Join role-based room
    socket.join(`role:${socket.userRole}`);

    // Broadcast online status
    io.emit('user:online', { userId: socket.userId });

    // Attendance events
    socket.on('attendance:checkin', (data) => {
      io.to('role:admin').to('role:senior_manager').emit('attendance:live', {
        userId: socket.userId,
        action: 'checkin',
        time: new Date(),
        ...data,
      });
    });

    socket.on('attendance:checkout', (data) => {
      io.to('role:admin').to('role:senior_manager').emit('attendance:live', {
        userId: socket.userId,
        action: 'checkout',
        time: new Date(),
        ...data,
      });
    });

    // Notification events
    socket.on('notification:read', (notificationId) => {
      socket.broadcast.to(`user:${socket.userId}`).emit('notification:updated', {
        id: notificationId,
        read: true,
      });
    });

    // Real-time chat (HR Assistant)
    socket.on('chat:message', async (data) => {
      socket.emit('chat:typing', { typing: true });
      // AI response handled via HTTP for simplicity
    });

    // Leave request notifications
    socket.on('leave:request', (data) => {
      io.to('role:hr_recruiter').to('role:senior_manager').emit('leave:pending', data);
    });

    // Payroll processing notification
    socket.on('payroll:process', (data) => {
      io.to('role:admin').emit('payroll:update', data);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.userId);
      io.emit('user:offline', { userId: socket.userId });
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return { connectedUsers };
};

// Emit to specific user (utility)
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Emit to role (utility)
const emitToRole = (io, role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

module.exports = { initSocketHandlers, emitToUser, emitToRole };
