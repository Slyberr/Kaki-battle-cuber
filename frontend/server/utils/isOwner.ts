import { Room } from '../types/types.js';

/**
 * Verrify if the player is the room's owner.
 * @param userId 
 * @param rooms 
 * @param roomname 
 * @returns 
 */
export const isOwner = (userId : string, rooms : Map<string,Room>,roomname : string ) : boolean => {
    const room = rooms.get(roomname);
    if (room) {
        const player = room.players.find((player)=> player.id === userId && player.owner);
        return player ? true : false;
    }
    return false;
};