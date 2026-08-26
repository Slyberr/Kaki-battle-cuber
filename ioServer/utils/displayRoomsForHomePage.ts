import { Room } from "../types/types.js";

export const displayRoomsForHomePage = (rooms : Map<string,Room>) => {
  let res: { roomName: string; length: number }[] = [];
  rooms.forEach((room, key) => {
    res.push({ roomName: key, length: room.players.length });
  });
  return res;
};