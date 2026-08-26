const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('connessione socket', socket.id);
  // Relay da pannello -> overlay
  socket.on('panel:updatePlayers', (data) => io.emit('overlay:updatePlayers', data));
  socket.on('panel:openCell', (cell) => io.emit('overlay:openCell', cell));
  socket.on('panel:revealNext', () => io.emit('overlay:revealNext'));
  socket.on('panel:awardPoints', (payload) => io.emit('overlay:awardPoints', payload));
  socket.on('panel:updateScores', (scores) => io.emit('overlay:updateScores', scores));
  socket.on('panel:closeFull', () => io.emit('overlay:closeFull'));
});

const port = process.env.PORT || 3000;
http.listen(port, () => console.log(`Server su http://localhost:${port}`));
