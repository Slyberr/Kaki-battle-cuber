import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";


export type player = {
  id: String;
  pseudo: String;
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

const rooms: Map<string, {password: string; players: player[] }> =
  new Map();

io.on("connection", (socket) => {
  console.log("Nouvel utilisateur !", socket.id);

  //Envoie les noms de toutes les rooms existantes pour home.vue
  const roomsChoice = Array.from(rooms.keys());
  socket.emit("get-rooms", roomsChoice);

  socket.on("disconnect", () => {
    //On retire le joueur de toutes les rooms (normalement qu'une seule )
    //du serveur
    let indexToRemove = 0;
    rooms.forEach((value) => {
      //Ici ça ne fonctionne qu'une seule fois car un joueur = une seule room
      value.players.forEach((value, index) => {
        if (value.id === socket.id) {
          indexToRemove = index;
        }
      });
      value.players.splice(indexToRemove, 1);
    });
    console.log(socket.id, " a été déconnecté");
  });

  // socket.on("sendmessage", (id, data, date) => {
  //   io.emit("receivemessage", { id, data, date });
  // });

  //Création de room
  socket.on(
    "create-room",
    (room: { roomName: string; password: string; pseudo: string }) => {
      if (!rooms.get(room.roomName)) {

        //Rejoindre la room socket.io et créer en parallèle pour y attacher des infos
        socket.join(room.roomName);
        rooms.set(room.roomName, {
          password: room.password,
          players: [{ id: socket.id, pseudo: room.pseudo, owner: true }],
        });
        socket.emit("go-to-room", room.roomName);

        //Quand un nouveau joueur arrive (event que pour les joueurs déjà présents)
        io.to(room.roomName).emit("new-player", rooms.get(room.roomName)?.players );

      } else {
        socket.emit("error", "Une room de ce nom existe déjà !");
      }
    },
  );

  //Rejoindre une room
  socket.on(
    "join-room",
    (info: { roomName: string; password: string; pseudo: string }) => {
      const room = rooms.get(info.roomName);

      if (room && room.password !== info.password) {
        socket.emit("error", "mot de passe incorrect !");
      } else if (
        room &&
        room.players.some((player) => player.pseudo === info.pseudo)
      ) {
        socket.emit("error", "Le pseudo est déjà pris !");
      } else if (room) {
        room.players.push({
          id: socket.id,
          pseudo: info.pseudo,
          owner: false,
        });
        socket.join(info.roomName);

        //Redirection sur room/[id].vue
        socket.emit("go-to-room", info.roomName);

        //Quand un nouveau joueur arrive (event que pour les joueurs déjà présents)
        io.to(info.roomName).emit("new-player", room.players);
      }
    },
  );

  //A l'arrivé dans room/[id].vue, on demande les data directement
  socket.on("i-want-room-data", (roomName) => {
    const room = rooms.get(roomName);
    if (room) {
      //Joueurs, temps réalisés...
      socket.emit("send-all-room-data",room.players)
    }
  });
});

httpServer.listen(3001, () => {
  console.log("Realtime server listening on :3001");
});
