/*

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('Usuario conectado:', socket.id);

  //socket.on('mensaje', data => {
    // Reenviar a todos menos al que lo envió
    //socket.broadcast.emit('mensaje', data);
  //});

  socket.on('propuesta-intercambio', data => {
  // Reenvía a todos menos al emisor
  socket.broadcast.emit('propuesta-recibida', data);
});

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});

//////////////////////////////////////////////////////////

//socket.on('mensaje', data => {
  // (esto era para texto libre, lo mantenemos si lo necesitas)
//});

*/

const express = require('express');
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

server.listen(3000, '0.0.0.0',() => {
  console.log('Servidor corriendo en http://localhost:3000');
});
