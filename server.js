const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Updated Socket.IO configuration
  const io = new Server(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"]
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('vote', async (data) => {
      try {
        console.log('Vote received:', data);
        io.emit('vote-update', data);
      } catch (error) {
        console.error('Error in vote handler:', error);
      }
    });

    socket.on('show-results', () => {
      io.emit('show-results-update');
    });

    socket.on('next-question', (index) => {
      io.emit('next-question-update', index);
    });

    socket.on('reset-session', (data) => {
      io.emit('reset-session-update', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});