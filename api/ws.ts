import { experimental_upgradeWebSocket } from '@vercel/functions';

// In-memory reference for local instance matching
let hostSocket: any = null;
let controllerSocket: any = null;

export const GET = experimental_upgradeWebSocket((ws) => {
  let role: 'host' | 'controller' | null = null;

  ws.on('message', (message: Buffer | string) => {
    // Phase 1: Handle registration handshakes
    if (!role) {
      const msgStr = message.toString().trim();
      if (msgStr === 'host') {
        role = 'host';
        hostSocket = ws;
        console.log('Host connected');
      } else if (msgStr === 'controller') {
        role = 'controller';
        controllerSocket = ws;
        console.log('Controller connected');
      }
      return;
    }

    // Phase 2: Relay traffic between role pairs
    if (role === 'host' && controllerSocket && controllerSocket.readyState === 1) {
      controllerSocket.send(message);
    } else if (role === 'controller' && hostSocket && hostSocket.readyState === 1) {
      hostSocket.send(message);
    }
  });

  ws.on('close', () => {
    if (role === 'host' && hostSocket === ws) hostSocket = null;
    if (role === 'controller' && controllerSocket === ws) controllerSocket = null;
  });
});