import { Room } from "../types/types.js";

export const isOwner = (userId : string, rooms : Map<string,Room>,roomName : string ) : boolean => {
    const room = rooms.get(roomName);
    if (room) {
        const player = room.players.find((player)=> player.id === userId && player.owner)
        return player ? true : false
    }
    return false 

}