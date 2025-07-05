/*
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Servir archivos estáticos desde la carpeta 'Proyecto'
app.use(express.static(path.join(__dirname, 'Proyecto')));

// Cuando el usuario visita la raíz, se carga automáticamente intercambiar.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Proyecto', 'intercambiar.html'));
});

// Lógica de sockets para intercambio de Pokémon
io.on('connection', socket => {
  //console.log('Un usuario se conectó');
  console.log('Usuario conectado:', socket.id);

  socket.on('propuesta-intercambio', data => {
    socket.broadcast.emit('propuesta-recibida', data);
  });

  socket.on('intercambio-confirmado', data => {
    socket.broadcast.emit('intercambio-recibido', data);
  });

  socket.on('disconnect', () => {
    console.log('Un usuario se desconectó');
  });
});

// Iniciar servidor
server.listen(3000, '0.0.0.0',() => {
  console.log('Servidor corriendo en http://localhost:3000');
});
*/