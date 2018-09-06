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
const DEFAULT_SPAWN_PLACES = [
  [1, 1],
  [1, yTilesNum - 2],
  [xTilesNum - 2, 1],
  [xTilesNum - 2, yTilesNum - 2]
];
let state = 'LOBBY';
let groups = {};

io.on('connection', con => {
  io.to(con.id).emit('acceptCon', { state: state, ids, players });
  ids.push(con.id);
  console.log(con.id, 'CONNECTED, data sent');

  con.on('acceptConData', data => {
    players[con.id] = data;
  });

  con.on('disconnecting', data => {
    sendToAllExcept(con.id, 'playerLeft', con.id);
    ids = ids.filter(id => id !== con.id);
    ids.forEach(id => {
      if (players[id] === undefined) ids.splice(ids.indexOf(id), 1);
    });
    let newPlayersArray = [];
    for (let i = 0; i < ids.length; i++) {
      newPlayersArray[ids[i]] = players[ids[i]];
    }
    players = newPlayersArray;
    console.log(con.id, 'DISCONNECTED', data);
    if (ids.length === 0) {
      changeState('LOBBY');
      ids = [];
      players = new Array();
      console.log('ALL DISCONNECTED, RESET VARS');
    }
  });

  con.on('readyChange', data => {
    players[con.id].ready = data;
    sendToAllExcept(con.id, 'readyChanged', data);
    let all = true;
    for (let pl in players) {
      if (players[pl] !== undefined)
        if (!players[pl].ready) {
          all = false;
        }
    }
    if (all) {
      io.emit('gameMap', getNewGameMap(xTilesNum, yTilesNum));
      changeState('GAME');
    }
  });
});

function sendToAllExcept(id, req, data) {
  for (let i = 0; i < ids.length; i++) {
    if (players[ids[i]] !== undefined) {
      if (players[ids[i]].connected === true && players[ids[i]].id !== id) {
        io.to(ids[i]).emit(req, data);
      }
    }
  }
}

function getNewGroup(leader) {
  return {
    state: 'LOBBY',
    ids: [leader],
    players: []
  };
}

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

const changeState = newState => {
  state = newState;
  io.emit('serverStateChanged', newState);
  console.log('CHANGE STATE', newState);
};
