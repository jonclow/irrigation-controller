import io from 'socket.io-client';

// Initialize socket connection to Pi backend
export const socket = io('http://192.168.20.59:3001');
