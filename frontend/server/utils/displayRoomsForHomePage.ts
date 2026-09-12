import { EventID, Room } from '../types/types.js';

export const displayRoomsForHomePage = (rooms : Map<string,Room>) : { roomname: string;isPrivate : boolean;currentEvent: EventID, length: number }[] =>   {
  let res: { roomname: string;isPrivate : boolean;currentEvent: EventID, length: number }[] = [];

  rooms.forEach((room, _) => {
    res.push({ roomname: room.roomname,isPrivate : room.isPrivate,currentEvent : room.event, length: room.players.length });
  });
  return res;
};