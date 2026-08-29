import { randomScrambleForEvent } from "cubing/scramble";
import { Player, Room } from "../types/types.js";
import { Server } from "socket.io";

/**
 * Buisneed logic when a player saving time.
 * @param roomName
 * @param rooms 
 * @param io
 * @param time 
 * @param playerId 
 * @param solveId 
 */
export const saveTime = async(roomName: string, rooms : Map<string,Room>, io : Server, time: string, userId: string, solveId: number) => {
    
    const room = rooms.get(roomName);

      if (room) {
        const player = room.players.find((player : Player) => player.id === userId);

        if (player) {
          //it mean  "no one in this solve submit before" 
          if (room.currentSolve.solveId) {
            room.currentSolve = {
              solveId: solveId
            };
          }
          
          //add player time
          room.currentSolve[userId] = time
          player.state = "SCORE";

          //If everyone in this room submit his time
          if (!room.players.find((player) => player.state !== "SCORE")) {
            
            room.players.map((player) => (player.state = "READY"));

            const newScramble = (await randomScrambleForEvent(room?.event ?? "333")).toString();
           
            //Each new row is the first row.
            room.allSolves.unshift(room.currentSolve);

            room.actualScramble = newScramble;
            room.actualSolveId++;

            io.to(roomName).emit("nextSolve", {
              solveToDisplay: room.currentSolve,
              scramble: newScramble,
              solveId: room.actualSolveId,
            });
           
            room.currentSolve = {solveId : -1};
          }

          rooms.set(roomName, room);
        }
      }
}