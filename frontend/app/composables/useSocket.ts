import { io, Socket } from "socket.io-client";

let socket : Socket | null = null;

export const useSocket = () => {
  if (!socket) {
    //const config = useRuntimeConfig();
    //const url : string = config.public.socketUrl as string
    socket = io("https://localhost:3001", 
      {rejectUnauthorized: false}
    );
  }
  return socket;

};