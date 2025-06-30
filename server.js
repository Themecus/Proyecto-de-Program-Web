
/*const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Asegúrate de que tu index.html está en /public

// 👇 Todo esto es correcto y debe ir junto
io.on('connection', socket => {
  console.log('Usuario conectado:', socket.id);

  socket.on('mensaje', data => {
    socket.broadcast.emit('mensaje', data);
  });

  socket.on('propuesta-intercambio', data => {
    socket.broadcast.emit('propuesta-recibida', data);
  });

  socket.on('intercambio-confirmado', data => {
  socket.broadcast.emit('intercambio-recibido', data);
});

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});*/


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
  console.log('Un usuario se conectó');

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
http.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
