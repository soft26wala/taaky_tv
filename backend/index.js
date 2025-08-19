#!/usr/bin/env node
'use strict';

const port = 8001;
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

server.listen(port, () => {
  console.log(`epsile server listening at port ${port}`);
});

app.use(express.static(__dirname + '/'));

// Global vars
let sockets = {};
let users = {};
let strangerQueue = false;
let peopleActive = 0;
let peopleTotal = 0;

function fillZero(val) {
  return val > 9 ? "" + val : "0" + val;
}
function timestamp() {
  const now = new Date();
  return `[${fillZero(now.getHours())}:${fillZero(now.getMinutes())}:${fillZero(now.getSeconds())}]`;
}

io.on('connection', (socket) => {
  sockets[socket.id] = socket;
  users[socket.id] = { connectedTo: -1, isTyping: false };

  // Pairing logic
  if (strangerQueue !== false) {
    users[socket.id].connectedTo = strangerQueue;
    users[strangerQueue].connectedTo = socket.id;
    users[socket.id].isTyping = false;
    users[strangerQueue].isTyping = false;
    socket.emit('conn');
    sockets[strangerQueue].emit('conn');
    strangerQueue = false;
  } else {
    strangerQueue = socket.id;
  }

  peopleActive++;
  peopleTotal++;
  console.log(timestamp(), peopleTotal, "connect");
  io.emit('stats', { people: peopleActive });

  // --- Chat events ---
  socket.on("new", () => {
    if (strangerQueue !== false) {
      users[socket.id].connectedTo = strangerQueue;
      users[strangerQueue].connectedTo = socket.id;
      users[socket.id].isTyping = false;
      users[strangerQueue].isTyping = false;
      socket.emit('conn');
      sockets[strangerQueue].emit('conn');
      strangerQueue = false;
    } else {
      strangerQueue = socket.id;
    }
    peopleActive++;
    io.emit('stats', { people: peopleActive });
  });

  socket.on("disconn", () => {
    const connTo = users[socket.id].connectedTo;
    if (strangerQueue === socket.id || strangerQueue === connTo) {
      strangerQueue = false;
    }
    users[socket.id].connectedTo = -1;
    users[socket.id].isTyping = false;
    if (sockets[connTo]) {
      users[connTo].connectedTo = -1;
      users[connTo].isTyping = false;
      sockets[connTo].emit("disconn", { who: 2 });
    }
    socket.emit("disconn", { who: 1 });
    peopleActive -= 2;
    io.emit('stats', { people: peopleActive });
  });

  socket.on('chat', (message) => {
    if (users[socket.id].connectedTo !== -1 && sockets[users[socket.id].connectedTo]) {
      sockets[users[socket.id].connectedTo].emit('chat', message);
    }
  });

  socket.on('typing', (isTyping) => {
    if (users[socket.id].connectedTo !== -1 &&
        sockets[users[socket.id].connectedTo] &&
        users[socket.id].isTyping !== isTyping) {
      users[socket.id].isTyping = isTyping;
      sockets[users[socket.id].connectedTo].emit('typing', isTyping);
    }
  });

  // --- Video call signaling ---
  socket.on('video-offer', (data) => {
    const connTo = users[socket.id].connectedTo;
    if (connTo !== -1 && sockets[connTo]) {
      sockets[connTo].emit('video-offer', data);
    }
  });

  socket.on('video-answer', (data) => {
    const connTo = users[socket.id].connectedTo;
    if (connTo !== -1 && sockets[connTo]) {
      sockets[connTo].emit('video-answer', data);
    }
  });

  socket.on('ice-candidate', (candidate) => {
    const connTo = users[socket.id].connectedTo;
    if (connTo !== -1 && sockets[connTo]) {
      sockets[connTo].emit('ice-candidate', candidate);
    }
  });


socket.on("skip", function () {
    console.log("User skipped:", socket.id);

    const connTo = users[socket.id].connectedTo;

    if (connTo !== -1 && sockets[connTo]) {
        // दोनों को reset करो
        users[connTo].connectedTo = -1;
        users[socket.id].connectedTo = -1;

        // दोनों को skip event भेजो ताकि frontend भी handle करे
        sockets[connTo].emit("skip");
        sockets[socket.id].emit("skip");

        // अब दोनों को नए stranger से जोड़ो
        matchUser(socket);        // function नीचे define है
        matchUser(sockets[connTo]);
    } else {
        // अगर कोई connect ही नहीं था तो सिर्फ current को queue में डाल दो
        matchUser(socket);
    }
});

function matchUser(socket) {
    if (!socket) return;

    if (strangerQueue !== false && strangerQueue !== socket.id) {
        // connect with waiting stranger
        users[socket.id].connectedTo = strangerQueue;
        users[strangerQueue].connectedTo = socket.id;

        sockets[socket.id].emit("conn");
        sockets[strangerQueue].emit("conn");

        strangerQueue = false;
    } else {
        strangerQueue = socket.id;
    }
}






  socket.on("disconnect", (reason) => {
    let connTo = (users[socket.id] && users[socket.id].connectedTo) ?? -1;
    if (connTo !== -1 && sockets[connTo]) {
      sockets[connTo].emit("disconn", { who: 2, reason });
      users[connTo].connectedTo = -1;
      users[connTo].isTyping = false;
      peopleActive -= 2;
    }

    delete sockets[socket.id];
    delete users[socket.id];

    if (strangerQueue === socket.id || strangerQueue === connTo) {
      strangerQueue = false;
      peopleActive--;
    }

    peopleTotal--;
    console.log(timestamp(), peopleTotal, "disconnect");
    io.emit('stats', { people: peopleActive });
  });
});
