const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const server = createServer(app);

// Render स्वचालित रूप से PORT चुनता है
const PORT = process.env.PORT || 8000;

// 'public' फोल्डर से index.html सर्व करें
app.use(express.static(path.join(__dirname, 'public')));

// Root route पर index.html भेजें
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// HTTP server के ऊपर WebSocket अटैच करें
const wss = new WebSocketServer({ server });

let clients = { host: null, controller: null };

wss.on('connection', (ws) => {
  let role = null;

  ws.on('message', (message) => {
    const msgStr = message.toString().trim();

    // Handshake
    if (!role) {
      if (msgStr === 'host' || msgStr === 'controller') {
        role = msgStr;
        clients[role] = ws;
        console.log(`[+] ${role} connected`);
      }
      return;
    }

    // Traffic Relay
    const targetRole = role === 'host' ? 'controller' : 'host';
    const targetWs = clients[targetRole];

    if (targetWs && targetWs.readyState === 1) { // 1 = OPEN
      targetWs.send(message);
    }
  });

  ws.on('close', () => {
    if (role && clients[role] === ws) {
      clients[role] = null;
      console.log(`[-] ${role} disconnected`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
