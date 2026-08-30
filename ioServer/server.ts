import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { randomScrambleForEvent } from "cubing/scramble";
import { Player, Room } from "./types/types.js";
import { leaveRoom } from "./utils/leaveRoom.js";
import { displayRoomsForHomePage } from "./utils/displayRoomsForHomePage.js";
import { saveTime } from "./utils/saveTime.js";

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

const rooms: Map<string, Room> = new Map();

io.on("connection", (socket) => {
  console.log("new user :", socket.id);

  //Instantly send rooms (name and nbr of player) for home.vue
  socket.emit("get-rooms", displayRoomsForHomePage(rooms));

  //Player disconnected
  socket.on("disconnect", () => {
    //remove player from his room
    let indexToRemove: number | null = null;
    let roomName = "";
    rooms.forEach((room, roomKey) => {
      //a player have 0 or 1 room
      room.players.some((value, index) => {
        if (value.id === socket.id) {
          indexToRemove = index;
          roomName = roomKey;
          return true;
        } else {
          return false;
        }
      });
    });

    if (indexToRemove !== null) {
      leaveRoom(socket, roomName, rooms, io, socket.id, true);
      //Emit to EVERYONE rooms updated
      io.emit("get-rooms", displayRoomsForHomePage(rooms));
    }

    console.log("Bye", socket.id);
  });

  //Create room
  socket.on(
    "create-room",
    async (room: { roomName: string; password: string; pseudo: string }) => {
      if (!rooms.get(room.roomName)) {
        //Create socket.io Room and a room
        socket.join(room.roomName);
        rooms.set(room.roomName, {
          password: room.password,
          players: [
            { id: socket.id, pseudo: room.pseudo, owner: true, state: "READY" },
          ],
          currentSolve: { solveId: -1 },
          allSolves: [],
          actualSolveId: 1,
          nbrPlayers: 1,
          event: "333",
          actualScramble: (await randomScrambleForEvent("333")).toString(),
        });
        socket.emit("go-to-room", room.roomName);

        //when a new player come (event for players already in room)
        io.to(room.roomName).emit(
          "new-player",
          rooms.get(room.roomName)?.players,
        );

        //Emit to EVERYONE rooms updated
        io.emit("get-rooms", displayRoomsForHomePage(rooms));
      } else {
        socket.emit("error", "Une room de ce nom existe déjà !");
      }
    },
  );

  //Join a room
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
          state: "READY",
        });

        socket.join(info.roomName);
        room.nbrPlayers++;
        rooms.set(info.roomName, room);
        //redirect on room/[id].vue
        socket.emit("go-to-room", info.roomName);

        //Emit to EVERYONE rooms updated
        io.emit("get-rooms", displayRoomsForHomePage(rooms));

        //when a new player come (event for players already in room)
        io.to(info.roomName).emit("new-player", room.players);
      }
    },
  );

  //Leave a room (only one room by player)
  socket.on("leave-room", (user: Player, roomName: string) => {
    leaveRoom(socket, roomName, rooms, io, user.id, false);
    //Emit to EVERYONE rooms updated
    io.emit("get-rooms", displayRoomsForHomePage(rooms));
  });

  //asked immediatly when playe entry on room/[id].vue
  socket.on("i-want-room-data", (roomName) => {
    const room = rooms.get(roomName);
    if (room) {
      //players, times...
      socket.emit("send-all-room-data", {
        players: room.players,
        scramble: room.actualScramble,
        event: room.event,
        actualSolveId: room.actualSolveId,
        allSolves: room.allSolves,
      });
    }
  });

  //When a player just submit his time
  socket.on(
    "save-time",
    async (info: {
      roomName: string;
      time: string;
      userId: string;
      solveId: number;
    }) => {
      await saveTime(info.roomName, rooms, io, info.time, info.userId, info.solveId);
    },
  );

  //when event is updated
  socket.on("update-event", async (event, roomName) => {
    const room = rooms.get(roomName);
    if (room) {
      room.event = event;
      room.currentSolve = { solveId: -1 };
      room.allSolves = [];
      room.actualScramble = (await randomScrambleForEvent(event)).toString();
      room.actualSolveId = 1;
      rooms.set(roomName, room);
      io.to(roomName).emit("event-updated", {
        event: room.event,
        scramble: room.actualScramble,
      });
    }
  });

  //When owner clear session
  socket.on("clear-session", (roomName) => {
    const room = rooms.get(roomName);
    if (room) {
      room.currentSolve = { solveId: -1 };
      room.allSolves = [];
      room.actualSolveId = 1;
      io.to(roomName).emit("session-cleaned");
    }
  });
});

httpServer.listen(3001, () => {
  console.log("Realtime server listening on :3001");
});
