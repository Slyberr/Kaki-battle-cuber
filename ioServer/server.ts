import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { randomScrambleForEvent } from "cubing/scramble";

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


export type player = {
  id: string;
  pseudo: string;
  owner: boolean;
  state: "READY" | "SCORE";
};

const rooms: Map<
  string,
  {
    password: string;
    players: player[];
    nbrPlayers: number;
    currentTimes: Record<string, any>;
    allTimes: Record<string, any>[];
    solveId: number;
    actualScramble: string;
    event:
      | "222"
      | "333"
      | "333oh"
      | "333bf"
      | "333fm"
      | "444"
      | "444bf"
      | "555"
      | "555bf"
      | "666"
      | "777"
      | "fto"
      | "pyram"
      | "skewb"
      | "clock"
      | "minx"
      | "sq1";
  }
> = new Map();

io.on("connection", (socket) => {
  console.log("Nouvel utilisateur !", socket.id);

  //Send all room name for home.vue
  socket.emit("get-rooms", sendNameAndLengthRooms());

  socket.on("disconnect", (reason) => {
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
      leaveRoom(socket, roomName, socket.id, true);
      //Emit to EVERYONE rooms updated
      io.emit("get-rooms", sendNameAndLengthRooms());
    }

    //special case : everyone submit his time but last one disconnected.
    if (
      roomName !== "" &&
      !rooms.get(roomName)?.players.find((player) => player.state === "READY")
    ) {
      io.to(roomName).emit("nextSolve", rooms.get(roomName)?.currentTimes);
    }
    console.log("Aureveoir", socket.id, "\n Raison: ", reason);
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
          currentTimes: {},
          allTimes: [{}],
          solveId: 1,
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
        io.emit("get-rooms", sendNameAndLengthRooms());
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
        io.emit("get-rooms", sendNameAndLengthRooms());

        //when a new player come (event for players already in room)
        io.to(info.roomName).emit("new-player", room.players);
      }
    },
  );

  //Leave a room (only one room by player)
  socket.on("leave-room", (user: player, roomName: string) => {
    leaveRoom(socket, roomName, user.id, false);
    //Emit to EVERYONE rooms updated
    io.emit("get-rooms", sendNameAndLengthRooms());
  });

  //asked immediatly when enter on room/[id].vue
  socket.on("i-want-room-data", (roomName) => {
    const room = rooms.get(roomName);
    if (room) {
      //players, times...
      socket.emit("send-all-room-data", {
        players: room.players,
        scramble: room.actualScramble,
        event: room.event,
        solveId: room.solveId,
        times: room.allTimes,
      });
    }
  });

  //When a player just submit his time
  socket.on(
    "save-time",
    async (info: {
      roomName: string;
      time: string;
      playerId: string;
      solveId: number;
    }) => {
      const room = rooms.get(info.roomName)!;
      const player = room?.players.find(
        (player) => player.id === info.playerId,
      );

      if (player) {
        if (Object.keys(room.currentTimes).length === 0) {
          room.currentTimes = {
            num: info.solveId,
            roomID: info.roomName,
            [info.playerId]: info.time,
          };
        } else {
          room.currentTimes[info.playerId] = info.time;
        }
        rooms.set(info.roomName, room);
        player.state = "SCORE";

        //If everyone in the room send his time
        if (!room!.players.find((player) => player.state !== "SCORE")) {
          room!.players.map((player) => (player.state = "READY"));
          const newScramble = (
            await randomScrambleForEvent(room?.event ?? "333")
          ).toString();
          room!.actualScramble = newScramble;
          room.allTimes.push(room.currentTimes);

          room.solveId++;
          io.to(info.roomName).emit("nextSolve", {
            times: room.currentTimes,
            scramble: newScramble,
            solveId: room.solveId,
          });
          room.currentTimes = {};

          rooms.set(info.roomName, room);
        }
      }
    },
  );

  //when event is updated
  socket.on("update-event", async (event, roomName) => {
    const room = rooms.get(roomName)!;
    
    room.event = event
    room.currentTimes = {}
    room.allTimes = []
    room.actualScramble = (await randomScrambleForEvent(event)).toString();
    room.solveId = 1
    rooms.set(roomName, room);
    io.to(roomName).emit("event-updated", {
      event: room.event,
      times: room.allTimes,
      scramble: room.actualScramble,
    });
  });

  //When owner want to clear session
  socket.on("clear-session", (roomName) => {
    const room = rooms.get(roomName)!
    room.currentTimes = {}
    room.allTimes = []
    room.solveId = 1
    io.to(roomName).emit("session-cleaned",{times: room.allTimes, solveId : room.solveId})
  })
});

/**
 *
 * @param mySocket
 * @param roomName
 * @param userID
 * @param disconnected true if he leave or reload the page. false if he leaved because he want.
 */
const leaveRoom = (
  mySocket: any,
  roomName: string,
  userID: string,
  disconnected: boolean,
) => {
  if (!disconnected) {
    mySocket.leave(roomName);
  }

  const room = rooms.get(roomName)!;
  let wasOwner = false;
  const roomWithoutleaver = room.players.filter((player) => {
    if (player.id === userID) {
      wasOwner = player.owner;
      return false;
    } else {
      return true
    }
  });
  room!.players = roomWithoutleaver;

  if (roomWithoutleaver.length === 0) {
    //Socket.io auto-deleting if no one left.
    rooms.delete(roomName);
    console.log(
      "La room nommée",
      roomName,
      "supprimée. Etat des rooms :",
      Array.from(rooms.keys()),
    );
  } else {
    room.nbrPlayers--;
    
    //Select a new room owner
    if (wasOwner) {
      room.players[0].owner = true;
    }
    
    rooms.set(roomName, room);
    console.log("la room", roomName, "est conservée. Joueurs restants : ");
    room.players.forEach((player) => console.log(player.pseudo));
  }
  //Stop display the leaver player and update the room.
  io.to(roomName).emit("remove-player", rooms.get(roomName)?.players ?? []);
};

const sendNameAndLengthRooms = () => {
  let res: { roomName: string; length: number }[] = [];
  rooms.forEach((room, key) => {
    res.push({ roomName: key, length: room.players.length });
  });
  return res;
};

httpServer.listen(3001, () => {
  console.log("Realtime server listening on :3001");
});
