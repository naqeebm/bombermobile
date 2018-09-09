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
const numPowerupTypes = 4;
let players = new Array();
let ids = [];
let gameMap = [];
const DEFAULT_SPAWN_PLACES = [
  [1, 1],
  [1, yTilesNum - 2],
  [xTilesNum - 2, 1],
  [xTilesNum - 2, yTilesNum - 2]
];
let powerups = [];

// let state = 'PLAY';

io.on('connection', con => {
  if (gameMap.length === 0) {
    gameMap = getNewGameMap(xTilesNum, yTilesNum);
    powerups = [];
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
    players[con.id].x = data.x;
    players[con.id].y = data.y;
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
    powerups.forEach(pw => {
      con.emit('newPowerup', pw);
    });
  });

  con.on('newBomb', data => {
    io.sockets.emit('placeBomb', data);
  });

  con.on('newPowerup', data => {
    if (gameMap[data.y][data.x] === 2) {
      // change under block to under powerup block
      gameMap[data.y][data.x] = 5;
      let newPopup = [
        data.x,
        data.y,
        Math.floor(Math.random() * numPowerupTypes)
      ];
      powerups.push(newPopup);
      io.sockets.emit('newPowerup', newPopup);
      console.log('powerups', powerups);
    }
  });

  con.on('takePowerup', data => {
    let powerUp = powerups.filter(pw => pw[0] === data.x && pw[1] === data.y);
    if (powerUp.length > 0) {
      // change under block to air
      gameMap[data.y][data.x] = 0;
      powerUp = powerUp[0];
      io.sockets.emit('takePowerup', data);
      powerups = powerups.filter(pw => !(pw[0] === data.x && pw[1] === data.y));
      if (players[con.id] !== null) {
        switch (data.type) {
          case 0:
            players[con.id].numBombsMax++;
            emitPlayerAttributeChange(
              con.id,
              'numBombsMax',
              players[con.id].numBombsMax
            );
            break;
          case 1:
            players[con.id].bombSize++;
            emitPlayerAttributeChange(
              con.id,
              'bombSize',
              players[con.id].bombSize
            );
            break;
          case 2:
            if (players[con.id].moveDuration > 6) {
              players[con.id].moveDuration /= 1.2;
              emitPlayerAttributeChange(
                con.id,
                'moveDuration',
                players[con.id].moveDuration
              );
            }
            break;
          case 3:
            if (players[con.id].moveDuration < 10) {
              players[con.id].moveDuration *= 1.2;
              emitPlayerAttributeChange(
                con.id,
                'moveDuration',
                players[con.id].moveDuration
              );
            }
            break;
        }
      }
    }
    console.log('powerups', powerups);
  });

  con.on('destroyBlock', data => {
    if (gameMap[data.y][data.x] === 2) {
      gameMap[data.y][data.x] = 0;
      io.sockets.emit('destroyBlock', data);
    }
  });

  con.on('destroyedPowerup', data => {
    let index = powerups.findIndex(pw => pw[0] === data.x && pw[1] === data.y);
    if (index !== -1) {
      powerups.splice(index);
      gameMap[data.y][data.x] = 0;
    }
  });
});

const emitPlayerAttributeChange = (id, attr, newVal) => {
  io.sockets.emit('changePlayerAttribute', {
    id,
    attr,
    newVal
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

// setInterval(() => {
// console.log('======== current vals ========');
// console.log(ids, players);
// }, 5000);
