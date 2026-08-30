import { Server } from "socket.io";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

 const onlineUsers = new Map();
io.on("connection", (socket) => {

  socket.on("register", (userId) => {
    socket.join(`user:${userId}`);

    console.log(
      `User ${userId} joined room ${userId}`
    );
    onlineUsers.set(userId.toString(), socket.id);

    io.emit("get_online_users", Array.from(onlineUsers.keys()));
  });

 socket.on("typing", ({ senderId, receiverId }) => {
    socket.to(`user:${receiverId}`).emit("user_typing", {
      senderId,
    });
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    socket.to(`user:${receiverId}`).emit("user_stop_typing", {
      senderId,
    });
  });

   socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("get_online_users", Array.from(onlineUsers.keys()));
  });

});

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};