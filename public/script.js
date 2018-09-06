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
  XTILES: 16,
  YTILES: 16,
  TILESIZE: 40,
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
    if (gameVars.state === 'LOBBY' && newState === 'GAME') {
      state_Lobby.changeReady(false);
    }
    gameVars.state = newState;
  },
  changedBlocks: [],
  FPS: 60
};

const bomberData = {
  name: 'Player',
  char: 0,
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
let gameMap = [];
let flags = { resize: false };

// server connection
console.log('connecting...');
//const server = io.connect('http://localhost:8181');
const server = io.connect('http://178.128.35.83:8181');

server.on('connect', data => {
  console.log('connected!');
  gameVars.changeState('CONNECTED');
});

server.on('disconnecting', gameVars.changeState('LOADING'));
server.on('readyChanged');
server.on('serverStateChanged', newServerState => {
  gameVars.changeState(newServerState);
});

server.on('acceptCon', data => {
  if (data.state === 'LOBBY') {
    gameVars.changeState(data.state);
    let sendingData = bomberData;
    sendingData.ready = false;
    emitMessage('acceptConData', sendingData);
  } else {
    gameVars.state = 'CONNECTED';
  }
});

server.on('gameMap', data => {
  gameMap = data;
  XTILES = data[0].length;
  YTILES = data.length;
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

      // update
      gameStates[gameVars.state].update(ticker);
      // check flags
      checkFlags(flags);
      ticker++;
    }, 1000 / gameVars.FPS);
    console.log('Started Timer', 'FPS:', gameVars.FPS);
  }
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
