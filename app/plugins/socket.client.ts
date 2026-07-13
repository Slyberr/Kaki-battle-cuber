import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const socket = io("http://localhost:3001");

  socket.on("connect", () =>  {
    console.log("Connecté en ", socket.id)

  })

  socket.on("connect_error", (err) => {
    console.error(err);
  });
  
  return {
    provide: {
      socket,
    },
  };
});