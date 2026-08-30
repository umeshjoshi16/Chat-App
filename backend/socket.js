import { Server } from "socket.io";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // io.on("connection", (socket) => {
  //   console.log("Socket connected:", socket.id);

  //   socket.on("register", (userId) => {
  //     socket.join(`user:${userId}`);

  //     console.log(`User ${userId} joined socket room`);
  //   });

  //    socket.on("typing", ({ senderId, receiverId }) => {
  //   io.to(receiverId).emit("user_typing", {
  //     senderId,
  //   });
  // });

  // socket.on("stop_typing", ({ senderId, receiverId }) => {
  //   io.to(receiverId).emit("user_stop_typing", {
  //     senderId,
  //   });
  // });

  //   socket.on("disconnect", () => {
  //     console.log("Socket disconnected:", socket.id);
  //   });
  // });

io.on("connection", (socket) => {

  socket.on("register", (userId) => {
    socket.join(`user:${userId}`);

    console.log(
      `User ${userId} joined room ${userId}`
    );
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

});

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};