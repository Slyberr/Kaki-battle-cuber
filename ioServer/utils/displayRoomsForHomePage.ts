import { Room } from "../types/types.js";

export const displayRoomsForHomePage = (rooms : Map<string,Room>) => {
  let res: { roomName: string;isPrivate : boolean; length: number }[] = [];
  rooms.forEach((room, key) => {
    res.push({ roomName: key,isPrivate : room.isPrivate, length: room.players.length });
  });
  return res;
};