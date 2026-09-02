import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const app = express();
app.use(express.json());

const server = createServer(app);
const PORT = process.env.SOCKET_PORT || 6001;
const SOCKET_SECRET = process.env.SOCKET_SECRET || 'crm_socket_secret_123';
const LARAVEL_API_URL = process.env.APP_URL || 'http://127.0.0.1:8000';

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Authenticated Socket.IO Connection Middleware
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization;

    if (!token) {
      console.warn('[Socket Auth] Rejected: Missing authorization token');
      return next(new Error('Authentication error: Missing token'));
    }

    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    // Verify token against Laravel authentication API
    const response = await axios.get(`${LARAVEL_API_URL}/api/auth/user`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
      timeout: 3000,
    });

    const userData = response.data?.user || response.data;
    if (!userData || !userData.id) {
      return next(new Error('Authentication error: Invalid user data'));
    }

    if (userData.is_active === false) {
      return next(new Error('Authentication error: Account deactivated'));
    }

    socket.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    };

    return next();
  } catch (err) {
    console.error('[Socket Auth Failure]:', err.message);
    return next(new Error('Authentication error: Token verification failed'));
  }
});

io.on('connection', (socket) => {
  const user = socket.user;
  const roomName = `user:${user.id}`;
  socket.join(roomName);

  console.log(`[Socket Connected] User ID ${user.id} (${user.role}) joined room: ${roomName}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket Disconnected] User ID ${user.id} left room: ${roomName} (${reason})`);
  });

  socket.on('error', (err) => {
    console.error(`[Socket Error] User ID ${user.id}:`, err);
  });
});

// Internal HTTP POST Endpoint for Laravel NotificationService Broadcasts
app.post('/broadcast', (req, res) => {
  const { secret, userId, userIds, notification } = req.body;

  if (secret !== SOCKET_SECRET) {
    console.warn('[Socket Broadcast Warning] Unauthorized secret attempt');
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid secret' });
  }

  if (!notification) {
    return res.status(400).json({ success: false, message: 'Missing notification payload' });
  }

  let deliveredCount = 0;

  if (userId) {
    const room = `user:${userId}`;
    io.to(room).emit('notification:new', notification);
    deliveredCount++;
    console.log(`[Socket Broadcast] Event ${notification.type} sent to room ${room}`);
  }

  if (Array.isArray(userIds)) {
    userIds.forEach((id) => {
      const room = `user:${id}`;
      io.to(room).emit('notification:new', notification);
      deliveredCount++;
    });
    console.log(`[Socket Broadcast] Event ${notification.type} sent to ${userIds.length} users`);
  }

  return res.json({
    success: true,
    delivered: deliveredCount > 0,
    count: deliveredCount,
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    socket_clients: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO Server running on http://127.0.0.1:${PORT}`);
});

