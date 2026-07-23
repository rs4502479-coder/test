import { experimental_upgradeWebSocket, type WebSocketData } from '@vercel/functions';

let hostSocket: any = null;
let controllerSocket: any = null;

export function GET() {
  return experimental_upgradeWebSocket((ws: any) => {
    let role: 'host' | 'controller' | null = null;

    ws.on('message', (message: WebSocketData) => {
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
}