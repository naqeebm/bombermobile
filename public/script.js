// resizing of webpage
const canvs = {};
const ctxs = {};
canvs['temp'] = document.getElementById('canv0');
canvs['bg'] = document.getElementById('canv1');
canvs['fg'] = document.getElementById('canv3');
canvs['mid'] = document.getElementById('canv2');
ctxs['temp'] = canvs['temp'].getContext('2d');
ctxs['bg'] = canvs['bg'].getContext('2d');
ctxs['fg'] = canvs['fg'].getContext('2d');
ctxs['mid'] = canvs['mid'].getContext('2d');
canvs['bg'].width = canvs['fg'].width = canvs['mid'].width = window.innerWidth;
canvs['bg'].height = canvs['fg'].height = canvs['mid'].height =
  window.innerHeight;

// game vars
const NUM_CHARS = 4;
const DEFAULTBOMBSIZE = 1;
const DEFAULTNUMBOMBS = 2;
const gameStates = {
  LOADING: state_Loading,
  CONNECTED: state_Connected,
  LOBBY: state_Lobby,
  GAME: state_Game,
  ENDSCREEN: state_EndScreen
};
let timer = null;
let ticker = 0;
const gameVars = {
  xTilesNum: 16,
  yTilesNum: 16,
  TILESIZE: 40,
  gameMap: [],
  state: 'LOADING',
  updateButtonText: () => {
    document.getElementById('action').value = gameStates[gameVars.state].actionButtonText;
  },
  changeState: newState => {
    for (let ctx in ctxs) {
      ctxs[ctx].resetTransform();
      ctxs[ctx].clearRect(0, 0, canvs[ctx].width, canvs[ctx].height);
    }
    console.log('changeState:', newState, ticker);
    ticker = -1;
    gameVars.state = newState;
    gameVars.updateButtonText();
  },
  changedBlocks: [],
  FPS: 60,
  myBombs: [],
  bombs: [],
  explosions: [],
  powerups: []
};
const DEFAULTBOMBTIME = 3 * gameVars.FPS;

const bomberData = {
  name: ['Player 2', 'Not player 1', 'Im noob', 'Me desu', 'Neck rope'][
    Math.floor(Math.random() * 5)
  ],
  char: Math.floor(Math.random() * NUM_CHARS),
  score: 0,
  x: 1,
  y: 1,
  undrawx: 1,
  undrawy: 1,
  moveDuration: 10,
  moveTemp: null, // [x inc, y inc, count]
  moving: [0, 0], // [x, y]
  nextMoves: [], // [[new x block, new y block],...]
  bombSize: DEFAULTBOMBSIZE,
  numBombs: DEFAULTNUMBOMBS,
  numBombsMax: DEFAULTNUMBOMBS
};
let players = [];
let ids = [];
let flags = { resize: false };

// server connection
console.log('connecting...');
const server = io.connect('https://naqeeb.me:8181');
// const server = io.connect('http://178.62.65.196:8181');

const gotoMainGameMap = () => {
  emitMessage('enterMainGame', bomberData);
};

server.on('gamesData', data => {
  state_Lobby.dataRecieved(data);
})

server.on('connect', data => {
  console.log('connected!');
  gameVars.changeState('CONNECTED');
  emitMessage('testConnection', null);
  state_Lobby.redrawNameFlag = true;
});

server.on('connectionConfirmed', () => {
  gameVars.changeState('LOBBY');
});

server.on('disconnecting', gameVars.changeState('LOADING'));

server.on('changedName', data => {
  if (data.id === server.id) {
    if (gameVars.state === 'LOBBY') {
      gameStates['LOBBY'].redrawNameFlag = true;
      bomberData.name = data.payload;
    }
  } else {
    if (players[data.id] !== undefined) {
      players[data.id].name = data.payload;
    }
    //TODO
  }
});

server.on('currentPlayers', data => {
  console.log('currentPlayers', data);
  data.ids.forEach(id => {
    if (ids.indexOf(id) === -1 && id !== server.id) {
      ids.push(id);
      players[id] = data.players[id];
    }
  });
});

server.on('newPlayer', data => {
  console.log('newPlayer', data);
  if (data.id !== server.id) {
    if (ids.indexOf(data.id) === -1) {
      ids.push(data.id);
      players[data.id] = data.payload;
    } else {
      players[data.id] = data.payload;
    }
  }
});

server.on('playerLeft', data => {
  console.log('playerLeft', data);
  if (players[data] !== undefined) {
    delete players[data];
  }
  ids.splice(ids.indexOf(data), 1);
});

server.on('startedMotion', data => {
  if (players[data.id] !== undefined) {
    players[data.id].undrawx = players[data.id].x;
    players[data.id].undrawy = players[data.id].y;
    players[data.id].x = data.x;
    players[data.id].y = data.y;
    players[data.id].nextMoves = data.moves;
  }
});

server.on('gameMap', data => {
  gameVars.gameMap = data;
  gameVars.xTilesNum = data[0].length;
  gameVars.yTilesNum = data.length;
  gameVars.changeState('GAME');
});

server.on('placeBomb', data => {
  console.log('placeBomb', data);
  if (data.id === server.id) {
    bomberData.numBombs--;
    addBomb(gameVars.myBombs, data.x, data.y, DEFAULTBOMBTIME, data.size);
  } else {
    addBomb(gameVars.bombs, data.x, data.y, DEFAULTBOMBTIME, data.size);
  }
});

server.on('newPowerup', data => {
  console.log('newPowerup', data);
  gameVars.powerups.push(data);
  changeGameBlock(data[0], data[1], 5);
});

server.on('takePowerup', data => {
  gameVars.powerups = gameVars.powerups.filter(
    pw => !(pw[0] === data.x && pw[1] === data.y && pw[2] === data.type)
  );
  changeGameBlock(data.x, data.y, 0);
});

server.on('changePlayerAttribute', data => {
  console.log('changePlayerAttribute', data);
  if (server.id === data.id) {
    bomberData[data.attr] = data.newVal;
  } else if (players[data.id] !== undefined) {
    console.log(data.id, data.attr, data.newVal);
    players[data.id][data.attr] = data.newVal;
    console.log(players[data.id][data.attr]);
  }
});

const addBomb = (bombsArray, x, y, life, bombSize) => {
  bombsArray.push([x, y, life, bombSize]);
  changeGameBlock(x, y, 3);
};

const emitMessage = (messageType, data) => {
  // console.log('emit message', messageType, data);
  if (server.connected) {
    server.emit(messageType, data);
  }
};

const startTimer = () => {
  if (timer === null) {
    timer = setInterval(() => {
      // draw
      gameStates[gameVars.state].draw(ctxs);
      fillInfo(ctxs['mid']);
      // update
      gameStates[gameVars.state].update(ticker);
      // check flags
      checkFlags(flags);
      ticker++;
    }, 1000 / gameVars.FPS);
    console.log('Started Timer', 'FPS:', gameVars.FPS);
  }
};

const fillInfo = ctx => {
  if (gameVars.state === 'GAME') {
    ctx.clearRect(0, 0, ctx.canvas.width, 20 + 20 * ids.length + 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, canvs['bg'].width, 20 + 20 * ids.length + 2);
    ctx.font = '20px calibri';
    ctx.fillStyle = 'white';
    drawChar(ctx, bomberData.char, 2, 2, 20, 20, 0);
    drawBlock(ctx, 0, 2, 400, 2, 20, 20);
    ctx.fillText(
      `${bomberData.name}
      |
      Score:${bomberData.score}
      mov:${Math.round(bomberData.moveDuration)}
      ${' '}
      ${bomberData.bombSize}
      ${bomberData.numBombs}/${bomberData.numBombsMax}`,
      20,
      20,
      canvs['bg'].width * 0.9
    );
    let count = 1;
    for (let id in players) {
      drawChar(ctx, players[id].char, 2, 2 + 20 * count, 20, 20, 0);
      drawBlock(ctx, 0, 2, 400, 2, 20, 20 + 20 * count);
      ctx.fillText(
        `${players[id].name}
      |
      Score:${players[id].score}
      ${Math.round(players[id].moveDuration)}
      ${players[id].bombSize}
      ${players[id].numBombsMax}`,
        20,
        20 + 20 * count,
        canvs['bg'].width * 0.9
      );
      count++;
    }
    // ctx.fillText(
    //   `x:${Math.round(bomberData.x * 100) / 100} y:${Math.round(
    //     bomberData.y * 100
    //   ) / 100} mov:${Math.round(bomberData.moveDuration * 100) / 100} bombs:${
    //     bomberData.numBombs
    //   }/${bomberData.numBombsMax} bombSize:${bomberData.bombSize}`,
    //   5,
    //   18,
    //   canvs['bg'].width - 5
    // );
    // ctx.fillText(
    //   `w/2:${Math.round((ctx.canvas.width / 2 / state_Game.tileSize) * 100) /
    //     100}
    //   xdisp:${Math.round((state_Game.disp[0] / state_Game.tileSize) * 100) /
    //     100}
    // xpos:${Math.round(bomberData.x * 100) / 100}
    // sum:${Math.round((state_Game.disp[0] / state_Game.tileSize) * 100) / 100 +
    //   Math.round(bomberData.x * 100) / 100}
    //   diff:${Math.abs(
    //     Math.round(
    //       ctx.canvas.width / 2 / state_Game.tileSize -
    //         state_Game.disp[0] / state_Game.tileSize -
    //         bomberData.x
    //     )
    //   )}
    //   expected: ${Math.round(
    //     (canvs['bg'].width / 2 / state_Game.tileSize - bomberData.x) * 100
    //   ) / 100}`,
    //   5,
    //   18
    // );
    // ctx.fillText(
    //   `h/2:${Math.round((ctx.canvas.height / 2 / state_Game.tileSize) * 100) /
    //     100}
    //   ydisp:${Math.round((state_Game.disp[1] / state_Game.tileSize) * 100) /
    //     100}
    // ypos:${Math.round(bomberData.y * 100) / 100}
    // sum:${Math.round((state_Game.disp[1] / state_Game.tileSize) * 100) / 100 +
    //   Math.round(bomberData.y * 100) / 100}
    //   diff:${Math.abs(
    //     Math.round(
    //       ctx.canvas.height / 2 / state_Game.tileSize -
    //         state_Game.disp[1] / state_Game.tileSize -
    //         bomberData.y
    //     )
    //   )}`,
    //   5,
    //   36
    // );
  }
  // ctx.fillText(`id:${server.id}`, 5, 12);
  // for (let i = 0; i < ids.length; i++) {
  //   if (players[ids[i]] !== undefined) {
  //     ctx.fillText(`>>${players[ids[i]].name}: ${ids[i]}`, 5, 12 + 12 * i + 12);
  //   }
  //   if (players[ids[i]] !== undefined) {
  //     ctx.fillText(
  //       `>>${players[ids[i]].name}: ${JSON.stringify(players[ids[i]])}`,
  //       180,
  //       24 + 12 * i
  //     );
  //   }
  // }
};

const stopTimer = () => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
    console.log('Stopped Timer');
  }
};

const checkFlags = flags => {
  if (flags['resize']) {
    canvs['bg'].width = canvs['fg'].width = canvs['mid'].width =
      window.innerWidth;
    canvs['bg'].height = canvs['fg'].height = canvs['mid'].height =
      window.innerHeight;
    flags['resize'] = false;
    gameVars.changeState(gameVars.state);
  }
};

const buttonAction = () => {
  gameStates[gameVars.state].handleAction();
};

const changeName = () => {
  let newName = prompt(
    'Please enter a new name (4 <= length <= 24)',
    bomberData.name
  );
  if (newName !== null && newName.length >= 4 && newName.length <= 24) {
    bomberData.name = newName;
    state_Lobby.redrawNameFlag = true;
  } else {
    alert('invalid name');
  }
};

const changeChar = () => {
  bomberData.char = (bomberData.char + 1) % NUM_CHARS;
};

canvs['fg'].addEventListener('keyup', e => {
  switch (e.key) {
    case 'x':
      startTimer();
      break;
    case 'c':
      stopTimer();
      break;
  }
});

canvs['fg'].addEventListener('mousedown', e => {
  gameStates[gameVars.state].handleMouse(e.pageX, e.pageY, false);
});

canvs['fg'].addEventListener('mouseup', e => {
  gameStates[gameVars.state].handleMouse(e.pageX, e.pageY, true);
});

canvs['fg'].addEventListener('mousemove', e => {
  gameStates[gameVars.state].handleMouse(e.pageX, e.pageY, null);
});

window.addEventListener('resize', e => {
  flags['resize'] = true;
});

canvs['fg'].addEventListener('touchstart', e => {
  if (gameStates[gameVars.state].handleTouch !== undefined)
    for (let i = 0; i < e.changedTouches.length; i++) {
      gameStates[gameVars.state].handleTouch(
        e.changedTouches[i].identifier,
        e.changedTouches[i].pageX,
        e.changedTouches[i].pageY,
        'start'
      );
    }
});

canvs['fg'].addEventListener('touchmove', e => {
  e.preventDefault();
  if (gameStates[gameVars.state].handleTouch !== undefined)
    for (let i = 0; i < e.changedTouches.length; i++) {
      gameStates[gameVars.state].handleTouch(
        e.changedTouches[i].identifier,
        e.changedTouches[i].pageX,
        e.changedTouches[i].pageY,
        'move'
      );
    }
});

canvs['fg'].addEventListener('touchend', e => {
  if (gameStates[gameVars.state].handleTouch !== undefined)
    for (let i = 0; i < e.changedTouches.length; i++) {
      gameStates[gameVars.state].handleTouch(
        e.changedTouches[i].identifier,
        e.changedTouches[i].pageX,
        e.changedTouches[i].pageY,
        'end'
      );
    }
});

canvs['fg'].addEventListener('touchend', e => {
  if (gameStates[gameVars.state].handleTouch !== undefined)
    for (let i = 0; i < e.changedTouches.length; i++) {
      gameStates[gameVars.state].handleTouch(
        e.changedTouches[i].identifier,
        e.changedTouches[i].pageX,
        e.changedTouches[i].pageY,
        'end'
      );
    }
});

canvs['fg'].addEventListener('contextmenu', e => {
  e.preventDefault();
});

startTimer();
