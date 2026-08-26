import { Server } from "socket.io";
import { Player, Room } from "../types/types.js";

/**
 * Buisness logic when a user leave a room (by the normal case or disconnection)
 * @param mySocket
 * @param roomName
 * @param userID
 * @param disconnected True if he leave or reload the page. False if he just leave the room.
 */
export const leaveRoom = (
  mySocket: any,
  roomName: string,
  rooms: Map<string, Room>,
  io: Server,
  userID: string,
  disconnected: boolean,
) => {
  if (!disconnected) {
    mySocket.leave(roomName);
  }

  const room = rooms.get(roomName);

  if (room) {

    let wasOwner = false;

    const roomWithoutleaver = room.players.filter((player: Player) => {
      if (player.id === userID) {
        wasOwner = player.owner;
        return false;
      } else {
        return true;
      }
    });

    room.players = roomWithoutleaver;

    //performance + when user leave room but not disconnect, ID is same so times come back. Actually, i don't want this.
    room.allTimes.forEach((time: Record<string, any>) => {
      delete time[userID];
    });

    if (roomWithoutleaver.length === 0) {
      //Socket.io auto-deleting if no one left.
      rooms.delete(roomName);
      console.log(
        "room",
        roomName,
        "Deleted. Actual rooms state :",
        Array.from(rooms.keys()),
      );
    } else {
      room.nbrPlayers--;

      //Select a new room owner if the leaver was owner
      if (wasOwner) {
        room.players[0].owner = true;
      }

      //Update
      rooms.set(roomName, room);
      console.log("room", roomName, "still standing. Players left : ");
      room.players.forEach((player) => console.log(player.pseudo));
    }
    //Stop display the leaver player and update the room.
    io.to(roomName).emit(
      "remove-player",
      rooms.get(roomName)?.players ?? [],
      userID,
    );
  }
};
