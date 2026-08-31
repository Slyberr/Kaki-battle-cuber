import { randomScrambleForEvent } from "cubing/scramble";
import { Player, Room } from "../types/types.js";
import { Server } from "socket.io";
import { everyoneScored } from "./everyoneScored.js";

/**
 * Buisneed logic when a player saving time.
 * @param roomName
 * @param rooms
 * @param io
 * @param time
 * @param playerId
 * @param solveId
 */
export const saveTime = async (
  roomName: string,
  rooms: Map<string, Room>,
  io: Server,
  time: string,
  userId: string,
  solveId: number,
) => {
  const room = rooms.get(roomName);

  if (room) {
    const player = room.players.find((player: Player) => player.id === userId);

    if (player) {
      //it mean  "no one in this solve submit before"
      if (room.currentSolve.solveId === -1) {
        room.currentSolve = {
          solveId: solveId,
        };
      }

      //add player time
      room.currentSolve[userId] = time;
      player.state = "SCORED";
      rooms.set(roomName,room)
      io.to(roomName).emit('players-updated', room.players);

      //If everyone in this room submit his time
      if (room.players.every((player) => player.state === "SCORED")) {
        everyoneScored(rooms,roomName,io);
      } 
    }
  }
};