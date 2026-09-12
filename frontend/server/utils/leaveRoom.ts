import { Server } from 'socket.io';
import { Player, Room } from '../types/types.js';
import { everyoneScored } from './everyoneScored.js';

/**
 * Buisness logic when a user leave a room (by the normal case or disconnection)
 * @param mySocket
 * @param roomname
 * @param rooms
 * @param roomname
 * @param disconnected True if he leave or reload the page. False if he just leave the room.
 */
export const leaveRoom = (
  mySocket: any,
  roomname: string,
  rooms: Map<string, Room>,
  io: Server,
  disconnected: boolean,
) => {

  const  roomToManage = rooms.get(roomname);
  
  if (!disconnected) {
    mySocket.leave(roomname);
  }


  if (roomToManage) {
    let wasOwner = false;

    const roomNoLeaver = roomToManage.players.filter((player: Player) => {
      if (player.id === mySocket.id) {
        wasOwner = player.owner;
        return false;
      } else {
        return true;
      }
    });

    roomToManage.players = roomNoLeaver;

    //performance + when user leave room but not disconnect.
    // socketID is same : maybe next feature, score will stay if come back. Actually, i don't want this.
    roomToManage.allSolves.forEach((time) => {
      delete time[mySocket.id];
    });

    if (roomToManage.players.length < 1) {
      //Socket.io auto-deleting if no one left.
      rooms.delete(roomname);
      console.log(
        'room',
        roomname,
        'Deleted. Actual rooms state :',
        Array.from(rooms.keys()),
      );
    } else {

      //Select a new room owner if the leaver was owner
      if (wasOwner) {
        roomToManage.players[0]!.owner = true;
      }

      console.log('room', roomname, 'still standing. Players left : ');
      roomToManage.players.forEach((player) => console.log(player.pseudo));
    }

    //Stop display the leaver player and update the room.
    io.to(roomname).emit('remove-player', roomToManage.players, mySocket.id);

    //special case : everyone submit his time but last one disconnected.
    if (roomToManage.players.every((player) => player.state === 'SCORED')) {
      everyoneScored(rooms,roomname,io);
    } else {
      rooms.set(roomname, roomToManage);
    }
  }
};
