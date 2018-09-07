const express = require('express');
const socket = require('socket.io');

const app = express();
const server = app.listen(8181, () => {
  console.log('listening on port 8181');
});

app.use(express.static(__dirname + '/public'));

const io = socket(server);

const xTilesNum = 32;
const yTilesNum = 32;
let players = new Array();
let ids = [];
let gameMap = [];
const DEFAULT_SPAWN_PLACES = [
  [1, 1],
  [1, yTilesNum - 2],
  [xTilesNum - 2, 1],
  [xTilesNum - 2, yTilesNum - 2]
];
// let state = 'PLAY';

io.on('connection', con => {
  if (gameMap.length === 0) {
    gameMap = getNewGameMap(xTilesNum, yTilesNum);
  }
  ids.push(con.id);
  console.log(con.id, 'CONNECTED');
  console.log('>>', ids, 'CONNECTED');

  con.on('disconnecting', data => {
    // update ids and players arrays
    ids = ids.filter(id => id !== con.id);
    ids.forEach(id => {
      if (players[id] === undefined) ids.splice(ids.indexOf(id), 1);
    });
    let newPlayersArray = [];
    for (let i = 0; i < ids.length; i++) {
      newPlayersArray[ids[i]] = players[ids[i]];
    }
    players = newPlayersArray;
    io.emit('playerLeft', con.id);
    console.log(con.id, 'DISCONNECTED', data);
  });

  con.on('testConnection', () => {
    con.emit('connectionConfirmed');
  });

  con.on('startMotion', data => {
    io.sockets.emit('startedMotion', { id: con.id, ...data });
  });

  con.on('enterMainGame', data => {
    ids.forEach(id => {
      if (id !== con.id && players[id] !== undefined) {
        con.emit('newPlayer', { id: id, payload: players[id] });
      }
    });
    players[con.id] = data;
    io.sockets.emit('newPlayer', { id: con.id, payload: data });
    con.emit('gameMap', gameMap);
  });
});

const sendToAllExcept = (excludeId, req, data) => {
  ids.forEach(id => {
    if (id !== excludeId) {
      io.to(id).emit(req, data);
      console.log('sendToAllExcept', id, req, data);
    }
  });
};

const getNewGameMap = (xTilesNum, yTilesNum) => {
  let map = [];
  let row = null;
  for (let y = 0; y < yTilesNum; y++) {
    row = [];
    for (let x = 0; x < xTilesNum; x++) {
      if (
        x === 0 ||
        x === xTilesNum - 1 ||
        y === 0 ||
        y === yTilesNum - 1 ||
        (x % 3 === 0 && y % 3 === 0)
      ) {
        row.push(1);
      } else {
        if (y === 1) {
          row.push(0);
        } else {
          if (Math.random() * 2 > 1) {
            row.push(2);
          } else {
            row.push(0);
          }
        }
      }
    }
    map.push(row);
  }
  DEFAULT_SPAWN_PLACES.forEach(df => {
    map[df[1]][df[0]] = 0;
  });
  return map;
};

setInterval(() => {
  console.log('======== current vals ========');
  console.log(ids, players);
}, 5000);
