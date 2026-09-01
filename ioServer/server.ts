import { createServer } from "https";
import { Server, ServerOptions } from "socket.io";
import express from "express";
import cors, { CorsOptions } from "cors";
import { randomScrambleForEvent } from "cubing/scramble";
import { Player, PlayerState, Room } from "./types/types.js";
import { leaveRoom } from "./utils/leaveRoom.js";
import { displayRoomsForHomePage } from "./utils/displayRoomsForHomePage.js";
import { saveTime } from "./utils/saveTime.js";
import { isOwner } from "./utils/isOwner.js";
import { readFileSync } from "fs";


const options = {
  key : readFileSync('key.pem'),
  cert : readFileSync('cert.pem')
}

const corsOptions  : CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}


const httpsServer = createServer(options,(req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
});


const io: Server = new Server(httpsServer, {
  cors : corsOptions
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
      leaveRoom(socket, roomName, rooms, io, true);
      //Emit to EVERYONE rooms updated
      io.emit("get-rooms", displayRoomsForHomePage(rooms));
    }

    console.log("Bye", socket.id);
  });

  //Create room
  socket.on(
    "create-room",
    async (room: {
      roomName: string;
      isPrivate: boolean;
      password: string;
      pseudo: string;
    }) => {
      if (!rooms.get(room.roomName)) {
        //Create socket.io Room and a room
        socket.join(room.roomName);
        rooms.set(room.roomName, {
          password: room.isPrivate ? room.password : undefined,
          isPrivate: room.isPrivate,
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
          "players-updated",
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

      if (room && room.isPrivate && room.password !== info.password) {
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
        io.to(info.roomName).emit("players-updated", room.players);
      }
    },
  );

  //Leave a room (only one room by player)
  socket.on("leave-room", (roomName: string) => {
    leaveRoom(socket, roomName, rooms, io, false);
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
  //When a player juste change his state (solving, inspecting...)
  socket.on(
    "change-state",
    (roomName: string, state: PlayerState) => {
        const room = rooms.get(roomName);

        if (room) {
          const player = room.players.find((player) => player.id === socket.id)
          if (player) {
            player.state = state;
            io.to(roomName).emit("players-updated",room.players);
            rooms.set(roomName,room);
          }
        }
    },

  
  );

  //When a player just submit his time
  socket.on(
    "save-time",
    async (info: {
      roomName: string;
      time: string;
      solveId: number;
    }) => {
      await saveTime(
        info.roomName,
        rooms,
        io,
        info.time,
        socket.id,
        info.solveId,
      );
    },
  );

  //when event is updated
  socket.on("update-event", async (event, roomName) => {
    const room = rooms.get(roomName);
    if (room && isOwner(socket.id,rooms,roomName)) {
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
    }else {
      socket.emit("error","Vous n'avez pas les droits de faire cette action.")
    }
  });

  //When owner clear session
  socket.on("clear-session", (roomName) => {
    const room = rooms.get(roomName);
    if (room && isOwner(socket.id,rooms,roomName)) {
      room.currentSolve = { solveId: -1 };
      room.allSolves = [];
      room.actualSolveId = 1;
      io.to(roomName).emit("session-cleaned");
    } else {
      socket.emit("error","Vous n'avez pas les droits de faire cette action.")
    }
  });
});

httpsServer.listen(3001, () => {
  console.log("Server OK ! Go on https://localhost:3001");
});
