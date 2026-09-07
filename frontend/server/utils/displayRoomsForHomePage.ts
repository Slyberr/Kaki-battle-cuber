import { EventID, Room } from '../types/types.js';

export const displayRoomsForHomePage = (rooms : Map<string,Room>) => {
  let res: { roomName: string;isPrivate : boolean;currentEvent: EventID, length: number }[] = [];
  rooms.forEach((room, key) => {
    res.push({ roomName: key,isPrivate : room.isPrivate,currentEvent : room.event, length: room.players.length });
  });
  return res;
};