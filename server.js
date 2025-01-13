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

  const io = new Server(server, {
    path: '/api/socket',
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('vote', (data) => {
      console.log('Vote received:', data);
      io.emit('vote-update', data);
    });

    socket.on('show-results', (data) => {
      console.log('Show results requested:', data);
      io.emit('show-results-update', data);
    });

    socket.on('next-question', (index) => {
      console.log('Next question requested:', index);
      io.emit('next-question-update', index);
    });

    socket.on('reset-session', (data) => {
      console.log('Reset session requested:', data);
      io.emit('reset-session-update', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});