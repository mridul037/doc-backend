const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

let documentContent = '';
let lastUpdateTimestamp = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  lastUpdateTimestamp[socket.id] = Date.now();

  // Send initial content
  socket.emit('document-update', {
    content: documentContent,
    sender: 'server'
  });

  // Fixed the data parameter here
  socket.on('document-update', function({ content, sender }) {
    const now = Date.now();
    
    // Throttle updates from each client
    if (now - (lastUpdateTimestamp[socket.id] || 0) > 250) {
      // Use the content from the received data
      documentContent = content;
      lastUpdateTimestamp[socket.id] = now;

      // Broadcast to other clients
      socket.broadcast.emit('document-update', {
        content: documentContent,
        sender: socket.id
      });
    }
  });

  socket.on('disconnect', () => {
    delete lastUpdateTimestamp[socket.id];
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
io.on('error', (error) => {
  console.error('Socket.IO Error:', error);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server Error:', error);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Clean up old timestamps
setInterval(() => {
  const now = Date.now();
  Object.keys(lastUpdateTimestamp).forEach(id => {
    if (now - lastUpdateTimestamp[id] > 60000) {
      delete lastUpdateTimestamp[id];
    }
  });
}, 60000);