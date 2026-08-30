import { Server } from "socket.io";
import { Room } from "../types/types.js";
import { randomScrambleForEvent } from "cubing/scramble";

/**
 * Buisness logic when everyone in the room scored. 
 * @param rooms 
 * @param roomName 
 * @param io 
 */
export const everyoneScored = async (
  rooms: Map<string, Room>,
  roomName: string,
  io: Server,
) => {
  const room = rooms.get(roomName);
  if (room) {
    const newScramble = (
      await randomScrambleForEvent(room?.event ?? "333")
    ).toString();

    //Each new row is the first row.
    room.allSolves.unshift(room.currentSolve);

    room.actualScramble = newScramble;
    room.actualSolveId++;
    room.players.map((player) => (player.state = "READY"));

    io.to(roomName).emit("nextSolve", {
      solveToDisplay: room.currentSolve,
      scramble: newScramble,
      solveId: room.actualSolveId,
    });

    room.currentSolve = { solveId: -1 };
    rooms.set(roomName, room);
  }
};
