import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";

const app = express()
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.get("/api/create/room", (req,res) => {
  res.send("hello")
})


io.on("connection", (socket) => {
  console.log("Nouvel utilisateur !" ,socket.id);

  socket.on("disconnect", () => {
    console.log("l'utilisateur ", socket.id, " a été déconnecté")
  } )

  socket.on("sendmessage", (id,data,date) => {
    
    io.emit("receivemessage", {id,data,date})
  })

});

httpServer.listen(3001, () => {
  console.log("Realtime server listening on :3001");
});