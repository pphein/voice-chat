var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(80, function () {
  console.log('listening for requests on port 80, https://voice-chat-k7qb.onrender.com');
});

// Static files
app.use(express.static('public'));

//To holding users information 
const socketsStatus = {};

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {
  console.log('made socket connection', socket.id);

  const socketId = socket.id;
  socketsStatus[socket.id] = {};

  socket.on("voice", function (data) {

    var newData = data.split(";");
    newData[0] = "data:audio/ogg;";
    newData = newData[0] + newData[1];

    for (const id in socketsStatus) {

      if (id != socketId && !socketsStatus[id].mute && socketsStatus[id].online)
        socket.broadcast.to(id).emit("send", newData);
    }

  });

  socket.on("userInformation", function (data) {
    socketsStatus[socketId] = data;

    io.sockets.emit("usersUpdate", socketsStatus);
  });


  socket.on("disconnect", function () {
    delete socketsStatus[socketId];
  });
});