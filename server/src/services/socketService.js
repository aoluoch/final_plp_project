const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.io authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user || !user.isActive) {
      return next(new Error('Authentication error: Invalid token or user inactive'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Setup socket handlers
const setupSocketHandlers = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} ${socket.user.lastName} (${socket.user.role}) connected`);

    // Join user to their personal room
    socket.join(`user:${socket.user._id}`);

    // Join role-based rooms
    socket.join(`role:${socket.user.role}`);

    // Join area-based room if user has address
    if (
      socket.user.address &&
      socket.user.address.coordinates &&
      typeof socket.user.address.coordinates.lat === "number" &&
      typeof socket.user.address.coordinates.lng === "number"
    ) {
      const lat = socket.user.address.coordinates.lat;
      const lng = socket.user.address.coordinates.lng;
      const areaRoom = `area:${lat.toFixed(2)},${lng.toFixed(2)}`;
      socket.join(areaRoom);
    } else {
      console.warn(
        `User ${socket.user.firstName} ${socket.user.lastName} has no valid coordinates, skipping area room join.`
      );
    }
    

    // Handle joining specific rooms
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      console.log(`User ${socket.user.firstName} joined room: ${roomName}`);
    });

    // Handle leaving rooms
    socket.on('leave_room', (roomName) => {
      socket.leave(roomName);
      console.log(`User ${socket.user.firstName} left room: ${roomName}`);
    });

    // Handle real-time chat messages
    socket.on('send_message', async (data) => {
      try {
        const { room, message, type = 'text' } = data;
        
        // Validate room access
        if (!socket.rooms.has(room)) {
          socket.emit('error', { message: 'Not authorized to send messages to this room' });
          return;
        }

        const messageData = {
          id: Date.now().toString(),
          sender: {
            id: socket.user._id,
            name: `${socket.user.firstName} ${socket.user.lastName}`,
            role: socket.user.role
          },
          message,
          type,
          timestamp: new Date().toISOString(),
          room
        };

        // Broadcast to room
        socket.to(room).emit('new_message', messageData);
        
        // Send confirmation back to sender
        socket.emit('message_sent', messageData);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { room } = data;
      if (socket.rooms.has(room)) {
        socket.to(room).emit('user_typing', {
          userId: socket.user._id,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
          room
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { room } = data;
      if (socket.rooms.has(room)) {
        socket.to(room).emit('user_stopped_typing', {
          userId: socket.user._id,
          room
        });
      }
    });

    // Handle location updates (for collectors)
    socket.on('location_update', (data) => {
      if (socket.user.role === 'collector') {
        const { latitude, longitude, accuracy } = data;
        
        // Broadcast location to admins
        socket.to('role:admin').emit('collector_location_update', {
          collectorId: socket.user._id,
          collectorName: `${socket.user.firstName} ${socket.user.lastName}`,
          location: { latitude, longitude, accuracy },
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle task status updates
    socket.on('task_status_update', (data) => {
      const { taskId, status, reportId } = data;
      
      // Broadcast to relevant users
      socket.to(`role:admin`).emit('task_status_changed', {
        taskId,
        status,
        reportId,
        updatedBy: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          role: socket.user.role
        },
        timestamp: new Date().toISOString()
      });
    });

    // Handle emergency alerts
    socket.on('emergency_alert', (data) => {
      if (socket.user.role === 'collector') {
        const { message, location, priority = 'high' } = data;
        
        // Broadcast to all admins
        socket.to('role:admin').emit('emergency_alert', {
          from: {
            id: socket.user._id,
            name: `${socket.user.firstName} ${socket.user.lastName}`,
            role: socket.user.role
          },
          message,
          location,
          priority,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user.firstName} ${socket.user.lastName} disconnected: ${reason}`);
      
      // Notify admins about collector going offline
      if (socket.user.role === 'collector') {
        socket.to('role:admin').emit('collector_offline', {
          collectorId: socket.user._id,
          collectorName: `${socket.user.firstName} ${socket.user.lastName}`,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Make io instance available to routes
  io.app = io;

  return io;
};

// Utility functions for emitting events from routes
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

const emitToRole = (io, role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

const emitToRoom = (io, room, event, data) => {
  io.to(room).emit(event, data);
};

const emitToAll = (io, event, data) => {
  io.emit(event, data);
};

module.exports = {
  setupSocketHandlers,
  authenticateSocket,
  emitToUser,
  emitToRole,
  emitToRoom,
  emitToAll
};
