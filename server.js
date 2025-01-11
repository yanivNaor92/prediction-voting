const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Import database initialization from JS file
const { initializeDb } = require('./src/db/db');

// Initialize database
initializeDb();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('vote', async (data) => {
      try {
        console.log('Vote received:', data);
        io.emit('vote-update', data);
      } catch (error) {
        console.error('Error handling vote:', error);
        socket.emit('error', { message: 'Failed to process vote' });
      }
    });

    socket.on('show-results', () => {
      try {
        console.log('Showing results');
        io.emit('show-results-update');
      } catch (error) {
        console.error('Error showing results:', error);
        socket.emit('error', { message: 'Failed to show results' });
      }
    });

    socket.on('next-question', (index) => {
      try {
        console.log('Moving to next question:', index);
        io.emit('next-question-update', index);
      } catch (error) {
        console.error('Error changing question:', error);
        socket.emit('error', { message: 'Failed to change question' });
      }
    });

    socket.on('reset-session', async (data) => {
      try {
        console.log('Resetting session');
        io.emit('reset-session-update', data);
      } catch (error) {
        console.error('Error resetting session:', error);
        socket.emit('error', { message: 'Failed to reset session' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
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