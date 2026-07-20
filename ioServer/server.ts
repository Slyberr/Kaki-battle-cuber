import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

export type player = {
  id: String;
  name: String;
  owner: Boolean;
};



const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

const httpServer = createServer(app);

const io: Server = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms: Map<string, { id: string,password: string; players: player[] }> = new Map();

io.on("connection", (socket) => {
  console.log("Nouvel utilisateur !", socket.id);
  const newarray = Array.from(rooms.keys())
  console.log(newarray)
  socket.emit("get-rooms",newarray)
  socket.on("disconnect", () => {
    console.log("l'utilisateur ", socket.id, " a été déconnecté");
  });

  socket.on("sendmessage", (id, data, date) => {
    io.emit("receivemessage", { id, data, date });
  });

  socket.on(
    "create-room",
    (room: { roomName: string; password: string; pseudo: string }) => {
      
      if (!rooms.get(room.roomName)) {
        const uuid = randomUUID()
        socket.join(room.roomName);
        rooms.set(room.roomName, {
          id : uuid,
          password: room.password,
          players: [{id: socket.id, name: room.pseudo, owner: true }],
        });
        socket.emit("go-to-room",uuid)
      } else {
        socket.emit("error", "Une room de ce nom existe déjà !");
      }
    },
  );

  socket.on(
    "join-room",
    (room: { roomName: string; password: string; pseudo: string }) => {
      const theRoom = rooms.get(room.roomName);
      if (theRoom && theRoom.password !== room.password) {
        socket.emit("error", "mot de passe incorrect !");
      } else if (
        theRoom &&
        theRoom.players.some((player) => player.name === room.pseudo)
      ) {
        socket.emit("error", "Le pseudo est déjà pris !");
      } else if (theRoom) {
        theRoom.players.push({
          id: socket.id,
          name: room.pseudo,
          owner: false,
        });
        socket.join(room.roomName);
        socket.emit("go-to-room",rooms.get(room.roomName)?.id)
      }
    },
  );
});

httpServer.listen(3001, () => {
  console.log("Realtime server listening on :3001");
});
