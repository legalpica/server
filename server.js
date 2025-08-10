const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

const rooms = {};

wss.on('connection', (ws) => {
  let room = null;

  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch {
      return;
    }

    if(data.type === 'join') {
      room = data.room;
      if(!rooms[room]) rooms[room] = new Set();
      rooms[room].add(ws);
      console.log(`Cliente entrou na sala ${room}`);
    } else if(room) {
      // Envia mensagem para outros na mesma sala
      rooms[room].forEach(client => {
        if(client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      });
    }
  });

  ws.on('close', () => {
    if(room && rooms[room]) {
      rooms[room].delete(ws);
      if(rooms[room].size === 0) delete rooms[room];
      console.log(`Cliente saiu da sala ${room}`);
    }
  });
});

console.log('Servidor WebSocket rodando...');
