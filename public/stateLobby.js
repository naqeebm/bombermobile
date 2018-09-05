const drawLobby = ctxs => {
  if (state_Lobby.iTime === 0) {
    state_Lobby.tileSize =
      Math.min(ctxs['bg'].canvas.width, ctxs['bg'].canvas.height) /
      state_Lobby.numTiles;
    drawLobbyBg(ctxs['bg'], state_Lobby.tileSize);
  }
  ctxs['fg'].translate(
    -state_Lobby.tileSize * 10 + ctxs['fg'].canvas.width / 2,
    0
  );
  ctxs['fg'].clearRect(
    state_Lobby.tileSize * 3,
    state_Lobby.tileSize * 5,
    state_Lobby.tileSize,
    state_Lobby.tileSize
  );
  drawChar(
    ctxs['fg'],
    0,
    state_Lobby.tileSize * 3,
    state_Lobby.tileSize * 5,
    state_Lobby.tileSize,
    state_Lobby.tileSize,
    state_Lobby.iTime
  );
  ctxs['fg'].translate(
    state_Lobby.tileSize * 10 - ctxs['fg'].canvas.width / 2,
    0
  );
};

const updateLobby = iTick => {
  if (iTick % 20 === 0) {
    state_Lobby.iTime = (state_Lobby.iTime + 1) % 2;
  }
};

const drawLobbyBg = (ctx, tileSize) => {
  // ctx.fillStyle = 'black';
  // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let xtranslation = Math.min(0, tileSize * 10 - ctx.canvas.width / 2);
  ctx.translate(-xtranslation, 0);
  for (let j = 0; j < state_Lobby.numTiles; j++) {
    for (let i = 0; i < state_Lobby.numTiles; i++) {
      drawBlock(
        ctx,
        i === 1 ||
        i === state_Lobby.numTiles - 2 ||
        j === 1 ||
        j === state_Lobby.numTiles - 2
          ? 1
          : 0,
        0,
        i * tileSize,
        j * tileSize,
        tileSize,
        tileSize
      );
    }
  }
  drawPlayerCard(
    ctx,
    tileSize,
    tileSize * 3,
    tileSize * 5,
    bomberData.name,
    bomberData.score,
    state_Lobby.ready
  );
  ctx.translate(xtranslation, 0);
};

function drawPlayerCard(ctx, tileSize, x, y, name, score, ready) {
  fillRectOnCanv(
    ctx,
    x + tileSize * 9,
    y,
    tileSize * 2,
    tileSize,
    'rgba(181,151,252,0.5)',
    'darkslateblue',
    2
  );
  fillTextOnCanv(
    ctx,
    score,
    x + tileSize * 9.1,
    y + tileSize * 0.8,
    'white',
    '' + tileSize + 'px roman',
    tileSize * 2
  );
  fillRectOnCanv(
    ctx,
    x + tileSize * 6.5,
    y,
    tileSize * 2,
    tileSize,
    ready ? 'rgba(88,215,88,0.5)' : 'rgba(205,255,205,0.4)',
    2
  );
  fillTextOnCanv(
    ctx,
    ready ? 'ready!' : '...',
    x + tileSize * 6.6,
    y + tileSize * 0.8,
    ready ? 'lime' : 'lightgrey',
    '' + tileSize * 0.75 + 'px calibri',
    tileSize * 1.8
  );
  fillRectOnCanv(
    ctx,
    x + tileSize,
    y,
    tileSize * 5,
    tileSize,
    ready ? 'rgba(128,255,128,0.6)' : 'rgba(255,255,255,0.5)',
    'darkslateblue',
    2
  );
  fillTextOnCanv(
    ctx,
    name,
    x + tileSize * 1.1,
    y + tileSize * 0.8,
    'white',
    '' + tileSize + 'px calibri',
    tileSize * 4.8
  );
  fillRectOnCanv(
    ctx,
    x,
    y,
    tileSize,
    tileSize,
    'rgba(255,255,255,0.9)',
    'white',
    4
  );
}

const state_Lobby = {
  actionButtonText: "I'm Ready!",
  draw: drawLobby,
  update: updateLobby,
  handleMouse: () => {},
  handleAction: () => {
    state_Lobby.changeReady(!state_Lobby.ready);
  },
  changeReady: newReadyState => {
    state_Lobby.ready = newReadyState;
    console.log('ReadyChange', newReadyState);
    emitMessage('readyChange', newReadyState);
  },
  iTime: 0,
  ready: false,
  tileSize: null,
  numTiles: 17
};
