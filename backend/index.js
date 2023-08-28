const express = require('express');

const app = express();

const http = require('http');

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const users = {}; // Store usernames

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));

io.on('connection', (socket) => {
  socket.on('set username', (username) => {
    users[socket.id] = username; // Store the username associated with the socket ID
    console.log(username + ' connected');
    io.emit('user joined', username); // Broadcast user join event
  });

  //socket.on('chat message', callback): This event listener on the client side waits for the "chat message" event from the client. When the client sends a "chat message" event, the associated callback function emits the same "chat message" event to all clients using io.emit('chat message', msg) to broadcast the message.

  socket.on('chat message', (msg) => {
    const username = users[socket.id];
    io.emit('chat message', `${username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      console.log(username + 'left the chat');
      io.emit('user left', username); // Broadcast user left event
      delete users[socket.id];
    }
  });
});
server.listen(3000, () => {
  console.log('server connected');
});
