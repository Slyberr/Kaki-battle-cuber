// server/api/socket.io.ts
import { Server } from 'socket.io';
import { defineEventHandler } from 'h3';

// Stocker l'instance de Socket.IO
let io: Server | null = null;

// Initialiser Socket.IO avec Nitro
const initSocketIO = (event: any) => {
  if (io) return;

  // Récupérer le serveur HTTP de Nitro
  const nodeEvent = event.node;
  const res = nodeEvent.res;

  if (!res || !res.socket) {
    console.error('Impossible de récupérer le serveur HTTP de Nitro.');
    return;
  }

  // Créer le serveur Socket.IO
  io = new Server(res.socket.server, {
    cors: {
      origin: '*', // À adapter selon ton environnement
      methods: ['GET', 'POST'],
    },
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    console.log('Un client est connecté !');

    // Exemple : Écouter un événement personnalisé
    socket.on('message', (data) => {
      console.log('Message reçu :', data);
      // Diffuser le message à tous les clients
      io?.emit('message', data);
    });

    // Gestion de la déconnexion
    socket.on('disconnect', () => {
      console.log('Un client s est déconnecté.');
    });
  });
};

// Exporter une route pour initialiser Socket.IO
export default defineEventHandler((event) => {
  initSocketIO(event);
  return { message: 'Socket.IO initialisé avec Nitro !' };
});