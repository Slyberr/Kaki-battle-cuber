import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Nouvel utilisateur !" ,socket.id);

  socket.on("disconnect", () => {
    console.log("l'utilisateur ", socket.id, " a été déconnecté")
  } )

  socket.on("hello", (arg) => {
    console.log(arg)
  })

  socket.on("sendmessage", (id,data,date) => {
    
    io.emit("receivemessage", {id,data,date})
  })

});

httpServer.listen(3001, () => {
  console.log("Realtime server listening on :3001");
});