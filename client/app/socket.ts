import io from 'socket.io-client';

// Initialize socket connection (client-side only)
export const socket = io('localhost:3001'); //io('http://192.168.20.59:3001');
