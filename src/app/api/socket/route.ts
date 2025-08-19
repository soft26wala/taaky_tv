// import { NextRequest } from "next/server";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io";
import { createServer } from "http";

const ioHandler = () => {
  return new Response("Socket server running", { status: 200 });
};

export const GET = ioHandler;

// const ioMap = new Map();

declare global {
  var io: SocketIOServer | undefined;
}

if (!global.io) {
  // const httpServer: NetServer = (require("http").createServer());
  const httpServer: NetServer = createServer();
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  let waitingUser: Socket | null = null;

  io.on("connection", (socket: Socket) => {
    console.log("User connected", socket.id);

    if (waitingUser) {
      // Match users
      socket.emit("match", waitingUser.id);
      waitingUser.emit("match", socket.id);
      waitingUser = null;
    } else {
      waitingUser = socket;
    } 

    socket.on("offer", (data) => {
      io.to(data.to).emit("offer", { sdp: data.sdp, from: socket.id });
    });

    socket.on("answer", (data) => {
      io.to(data.to).emit("answer", { sdp: data.sdp, from: socket.id });
    });

    socket.on("ice-candidate", (data) => {
      io.to(data.to).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
    });

    socket.on("skip", () => {
      if (waitingUser) {
        waitingUser.emit("partner-left");
        waitingUser = null;
      }
      waitingUser = socket;
    });

    socket.on("disconnect", () => {
      if (waitingUser?.id === socket.id) waitingUser = null;
    });
  });

  httpServer.listen(3001, () => console.log("Socket.io server on :3001"));
  global.io = io;
}
