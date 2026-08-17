import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";

export type player = {
  id: string;
  pseudo: string;
  owner: Boolean;
  state: "READY" | "SCORE";
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

const rooms: Map<
  string,
  {
    password: string;
    players: player[];
    nbrPlayers: number;
    currentScores: Record<string, any>;
  }
> = new Map();

io.on("connection", (socket) => {
  console.log("Nouvel utilisateur !", socket.id);

  //Send all room name for home.vue
  socket.emit("get-rooms", sendNameAndLengthRoom());

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
      io.emit("get-rooms", sendNameAndLengthRoom());
    }

    //special case : everyone submit his time but last one disconnected.
    if (
      roomName !== "" &&
      !rooms.get(roomName)?.players.find((player) => player.state === "READY")
    ) {
      io.to(roomName).emit("nextSolve", rooms.get(roomName)?.currentScores);
    }
    console.log("Aureveoir", socket.id, "\n Raison: ", reason);
  });

  // socket.on("sendmessage", (id, data, date) => {
  //   io.emit("receivemessage", { id, data, date });
  // });

  //Create room
  socket.on(
    "create-room",
    (room: { roomName: string; password: string; pseudo: string }) => {
      if (!rooms.get(room.roomName)) {
        //Create socket.io Room and a room
        socket.join(room.roomName);
        rooms.set(room.roomName, {
          password: room.password,
          players: [
            { id: socket.id, pseudo: room.pseudo, owner: true, state: "READY" },
          ],
          currentScores: {},
          nbrPlayers : 1
        });
        socket.emit("go-to-room", room.roomName);

        //when a new player come (event for players already in room)
        io.to(room.roomName).emit(
          "new-player",
          rooms.get(room.roomName)?.players,
        );

        //Emit to EVERYONE rooms updated
        io.emit("get-rooms", sendNameAndLengthRoom());
      } else {
        socket.emit("error", "Une room de ce nom existe déjà !");
      }
    },
  );

  //join a room
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

        room.nbrPlayers++
        rooms.set(info.roomName,room);
        //redirect on room/[id].vue
        socket.emit("go-to-room", info.roomName);

        //Emit to EVERYONE rooms updated
        io.emit("get-rooms", sendNameAndLengthRoom());
 
        //when a new player come (event for players already in room)
        io.to(info.roomName).emit("new-player", room.players);
      }
    },
  );

  //Leave a room (only one room by player)
  socket.on("leave-room", (user: player, roomName: string) => {
    leaveRoom(socket, roomName, user.id, false);
    //Emit to EVERYONE rooms updated
    io.emit("get-rooms", sendNameAndLengthRoom());
  });
  //ask data immediatly when enter on room/[id].vue
  socket.on("i-want-room-data", (roomName) => {
    const room = rooms.get(roomName);
    if (room) {
      //Joueurs, temps réalisés...
      socket.emit("send-all-room-data", room.players);
    }
  });

  socket.on(
    "save-time",
    (info: {
      roomName: string;
      time: string;
      playerId: string;
      solveId: number;
    }) => {
      const room = rooms.get(info.roomName);
      const player = room?.players.find(
        (player) => player.id === info.playerId,
      );

      if (player) {
        let getRoom = rooms.get(info.roomName)!;
        if (Object.keys(getRoom.currentScores).length === 0) {
          getRoom.currentScores = {
            num: info.solveId,
            roomID: info.roomName,
            [info.playerId]: info.time,
          };
        } else {
          getRoom.currentScores[info.playerId] = info.time;
        }
        rooms.set(info.roomName, getRoom);
        player.state = "SCORE";

        if (!room!.players.find((player) => player.state !== "SCORE")) {
          room!.players.map((player) => (player.state = "READY"));

          io.to(info.roomName).emit("nextSolve", getRoom?.currentScores);

          //Delete the current score in this ROOM.
          getRoom.currentScores = {};
          rooms.set(info.roomName, getRoom);
        }
      }
    },
  );
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
  const playerRemoved = room.players.filter((player) => player.id !== userID);
  room!.players = playerRemoved;

  if (playerRemoved.length === 0) {
    //Socket.io auto-deleting if no one left.
    rooms.delete(roomName);
    console.log(
      "Room",
      roomName,
      "supprimée. Etat des rooms :",
      Array.from(rooms.keys()),
    );
  } else {
    room.nbrPlayers--
    rooms.set(roomName, room);
    console.log("Room", roomName, "conservée. Joueurs restants : ");
    room.players.forEach((player) => console.log(player.pseudo));
  }
  //Stop display the leaver player and update the room.
  io.to(roomName).emit("remove-player", rooms.get(roomName)?.players ?? []);
};

const sendNameAndLengthRoom = () => {
  let res : {roomName : string,length : number}[] = []
  rooms.forEach((room,key) => {
    res.push({roomName : key, length : room.players.length})
  })
  return res
}
httpServer.listen(3001, () => {
  console.log("Realtime server listening on :3001");
});
