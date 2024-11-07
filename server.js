   // server.js
   const express = require('express');
   const app = express();
   const server = require('http').createServer(app);
   const { Server } = require('socket.io');
   const cors = require('cors');

   
   
   app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));
  
  // Handle preflight requests
  app.options('*', cors());
  
  // Socket.io setup
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true
    },
    allowEIO3: true
  });
  

  let documentContent = '';
  let lastUpdateTime = Date.now();
  const UPDATE_THRESHOLD = 50;

   io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Send the current document content to the new user
    socket.emit('document-update', {
        content: documentContent,
        sender: 'server'
      }); // Change newContent to documentContent
  
    // Handle document updates from clients
    socket.on('document-update', function(data) {
        const currentTime = Date.now();
    
        // Throttle updates
        if (currentTime - lastUpdateTime > UPDATE_THRESHOLD) {
          documentContent = data.content;
          lastUpdateTime = currentTime;
    
          // Broadcast to others
          socket.broadcast.emit('document-update', {
            content: documentContent,
            sender: socket.id
          });
        }
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

   server.listen(8080, () => {
     console.log('Server is listening on port 8080');
   });