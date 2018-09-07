// resizing of webpage
const canvs = {};
const ctxs = {};
canvs['bg'] = document.getElementById('canv1');
canvs['fg'] = document.getElementById('canv3');
canvs['mid'] = document.getElementById('canv2');
ctxs['bg'] = canvs['bg'].getContext('2d');
ctxs['fg'] = canvs['fg'].getContext('2d');
ctxs['mid'] = canvs['mid'].getContext('2d');
canvs['bg'].width = canvs['fg'].width = canvs['mid'].width = window.innerWidth;
canvs['bg'].height = canvs['fg'].height = canvs['mid'].height =
  window.innerHeight;

// game vars
const NUM_CHARS = 4;
const TWOPI = 2 * Math.PI;
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
  changeState: newState => {
    for (let ctx in ctxs) {
      ctxs[ctx].resetTransform();
      ctxs[ctx].clearRect(0, 0, canvs[ctx].width, canvs[ctx].height);
    }
    console.log('changeState:', newState, ticker);
    ticker = -1;
    document.getElementById('action').value =
      gameStates[newState].actionButtonText;
    gameVars.state = newState;
  },
  changedBlocks: [],
  FPS: 60
};

const bomberData = {
  name: 'Player',
  char: 1,
  score: 0,
  x: 1,
  y: 1,
  undrawx: 1,
  undrawy: 1,
  moveDuration: 10,
  moveTemp: null, // [x inc, y inc, count]
  moving: [0, 0], // [x, y]
  nextMoves: [] // [[new x block, new y block],...]
};
let players = [];
let ids = [];
let flags = { resize: false };

// server connection
console.log('connecting...');
// const server = io.connect('http://localhost:8181');
const server = io.connect('http://178.128.35.83:8181');

const gotoMainGameMap = () => {
  emitMessage('enterMainGame', bomberData);
};

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
  console.log(
    ids.map(id => {
      if (players[id] !== undefined) {
        return `${id.slice(0, 4)}... ${players[id].name}: x:${
          players[id].x
        } y:${players[id].y} ${JSON.stringify(players[id].nextMoves)}`;
      } else {
        return;
      }
    })
  );
});

server.on('gameMap', data => {
  gameVars.gameMap = data;
  gameVars.xTilesNum = data[0].length;
  gameVars.yTilesNum = data.length;
  gameVars.changeState('GAME');
});

const emitMessage = (messageType, data) => {
  console.log('emit message', messageType, data);
  if (server.connected) {
    server.emit(messageType, data);
  }
};

const startTimer = () => {
  if (timer === null) {
    timer = setInterval(() => {
      // draw
      gameStates[gameVars.state].draw(ctxs);
      // fillInfo(ctxs['mid']);
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
    ctx.clearRect(0, 0, ctx.canvas.width, 50);
    ctx.font = '16px calibri';
    ctx.fillStyle = 'white';
    ctx.fillText(
      `w/2:${Math.round((ctx.canvas.width / 2 / state_Game.tileSize) * 100) /
        100}
      xdisp:${Math.round((state_Game.disp[0] / state_Game.tileSize) * 100) /
        100}
    xpos:${Math.round(bomberData.x * 100) / 100} 
    sum:${Math.round((state_Game.disp[0] / state_Game.tileSize) * 100) / 100 +
      Math.round(bomberData.x * 100) / 100}
      diff:${Math.abs(
        Math.round(
          ctx.canvas.width / 2 / state_Game.tileSize -
            state_Game.disp[0] / state_Game.tileSize -
            bomberData.x
        )
      )}`,
      5,
      18
    );
    ctx.fillText(
      `h/2:${Math.round((ctx.canvas.height / 2 / state_Game.tileSize) * 100) /
        100}
      ydisp:${Math.round((state_Game.disp[1] / state_Game.tileSize) * 100) /
        100} 
    ypos:${Math.round(bomberData.y * 100) / 100} 
    sum:${Math.round((state_Game.disp[1] / state_Game.tileSize) * 100) / 100 +
      Math.round(bomberData.y * 100) / 100}
      diff:${Math.abs(
        Math.round(
          ctx.canvas.height / 2 / state_Game.tileSize -
            state_Game.disp[1] / state_Game.tileSize -
            bomberData.y
        )
      )}`,
      5,
      36
    );
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
  gameStates[gameVars.state].handleMouse(e.pageX, e.pageY, true);
});

canvs['fg'].addEventListener('mouseup', e => {
  gameStates[gameVars.state].handleMouse(e.pageX, e.pageY, false);
});

canvs['fg'].addEventListener('resize', e => {
  flags['resize'] = true;
});

canvs['fg'].addEventListener('touchstart', e => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    gameStates[gameVars.state].handleMouse(
      e.changedTouches[i].pageX,
      e.changedTouches[i].pageY,
      true
    );
  }
});

canvs['fg'].addEventListener('touchend', e => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    gameStates[gameVars.state].handleMouse(
      e.changedTouches[i].pageX,
      e.changedTouches[i].pageY,
      false
    );
  }
});

canvs['fg'].addEventListener('contextmenu', e => {
  e.preventDefault();
});

startTimer();
