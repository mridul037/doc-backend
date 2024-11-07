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

   io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Send the current document content to the new user
    socket.emit('document-update', documentContent); // Change newContent to documentContent
  
    // Handle document updates from clients
    socket.on('document-update', function(newContent) {
      console.log('Received document-update event'); // Add this line
      documentContent = newContent;
      console.log('Document content updated:', documentContent);
      io.emit('document-update', documentContent);
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

   server.listen(8080, () => {
     console.log('Server is listening on port 8080');
   });