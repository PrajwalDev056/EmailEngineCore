import { io } from 'socket.io-client';
import { AppConst } from './AppConstant';

const socket = io(AppConst.SOCKET_BASEURL, {
  transports: ['websocket'], // Optional, depending on your needs
  withCredentials: true,
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });
  
  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

export default socket;
