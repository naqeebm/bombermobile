const drawLobby = ctxs => {
  if (state_Lobby.iTime >= 0) {
    state_Lobby.tileSize =
      Math.min(ctxs['bg'].canvas.width, ctxs['bg'].canvas.height) /
      state_Lobby.numTiles;
    state_Lobby.xOffset =
      (canvs['fg'].width - state_Lobby.tileSize * state_Lobby.numTiles) / 2;
    ctxs['bg'].translate(state_Lobby.xOffset, 0);
    drawLobbyBg(ctxs['bg'], state_Lobby.tileSize);
    state_Lobby.charPlacement = [
      (state_Lobby.numTiles / 2 - 3) * state_Lobby.tileSize,
      4 * state_Lobby.tileSize,
      (state_Lobby.numTiles / 3.5) * state_Lobby.tileSize,
      (state_Lobby.numTiles / 3.5) * state_Lobby.tileSize
    ];
    ctxs['bg'].translate(-state_Lobby.xOffset, 0);
  }
  ctxs['fg'].translate(state_Lobby.xOffset, 0);
  if (state_Lobby.redrawNameFlag) {
    ctxs['fg'].clearRect(
      0,
      0,
      ctxs['fg'].canvas.width,
      ctxs['fg'].canvas.height
    );
    drawTextBox(
      ctxs['fg'],
      bomberData.name,
      state_Lobby.numTiles / 2 -
        ((bomberData.name.length / state_Lobby.tileSize) *
          state_Lobby.tileSize *
          0.8 *
          state_Lobby.tileSize) /
          2 /
          state_Lobby.tileSize,
      11
    );
    state_Lobby.namePlacement = [
      (state_Lobby.numTiles / 2 -
        ((bomberData.name.length / state_Lobby.tileSize) *
          state_Lobby.tileSize *
          0.8 *
          state_Lobby.tileSize) /
          2 /
          state_Lobby.tileSize) *
        state_Lobby.tileSize,
      11 * state_Lobby.tileSize,
      (bomberData.name.length / state_Lobby.tileSize) *
        state_Lobby.tileSize *
        0.8 *
        state_Lobby.tileSize,
      state_Lobby.tileSize * 1.5
    ];
    state_Lobby.redrawNameFlag = false;
  }
  drawCharBox(ctxs['fg'], state_Lobby.numTiles / 2 - 3, 4);
  ctxs['fg'].translate(-state_Lobby.xOffset, 0);
};

const updateLobby = iTick => {
  state_Lobby.iTime = iTick;
};

const drawLobbyBg = (ctx, tileSize) => {
  for (let i = 0; i < state_Lobby.numTiles; i++) {
    for (let j = 0; j < state_Lobby.numTiles; j++) {
      drawBlock(ctx, 0, 0, i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }
  fillTextOnCanv(
    ctxs['bg'],
    'Welcome to BomberMobile!',
    state_Lobby.tileSize,
    state_Lobby.tileSize * 2,
    'white',
    state_Lobby.tileSize + 'px calibri'
  );
};

const drawTextBox = (ctx, text, x, y, callback) => {
  fillRectOnCanv(
    ctx,
    state_Lobby.tileSize * x,
    y * state_Lobby.tileSize,
    (text.length / state_Lobby.tileSize) *
      state_Lobby.tileSize *
      0.8 *
      state_Lobby.tileSize,
    state_Lobby.tileSize * 1.5,
    'lightgrey',
    'white',
    2,
    true
  );
  fillTextOnCanv(
    ctx,
    text,
    state_Lobby.tileSize * x + state_Lobby.tileSize / 2,
    state_Lobby.tileSize * y + state_Lobby.tileSize,
    'black',
    `${state_Lobby.tileSize}px monospace`,
    (text.length / state_Lobby.tileSize) *
      state_Lobby.tileSize *
      0.8 *
      state_Lobby.tileSize -
      state_Lobby.tileSize
  );
};

const drawCharBox = (ctx, x, y, callback) => {
  fillRectOnCanv(
    ctx,
    state_Lobby.tileSize * x,
    y * state_Lobby.tileSize,
    (state_Lobby.numTiles / 3.5) * state_Lobby.tileSize,
    (state_Lobby.numTiles / 3.5) * state_Lobby.tileSize,
    'lightgrey',
    'white',
    2,
    true
  );
  drawChar(
    ctx,
    bomberData.char,
    state_Lobby.tileSize * x,
    y * state_Lobby.tileSize,
    (state_Lobby.numTiles / 3.5) * state_Lobby.tileSize,
    (state_Lobby.numTiles / 3.5) * state_Lobby.tileSize,
    Math.floor(state_Lobby.iTime / (gameVars.FPS / 3)) % 8
  );
};

const state_Lobby = {
  actionButtonText: 'Enter Game!',
  draw: drawLobby,
  update: updateLobby,
  handleMouse: (x, y, up) => {
    if (up) {
      if (pointIsInRect(x - state_Lobby.xOffset, y, state_Lobby.charPlacement))
        changeChar();
      if (pointIsInRect(x - state_Lobby.xOffset, y, state_Lobby.namePlacement))
        changeName();
    }
  },
  handleAction: () => {
    gotoMainGameMap();
  },
  iTime: 0,
  ready: false,
  tileSize: null,
  numTiles: 20,
  redrawNameFlag: true,
  charPlacement: [], // [x, y, w, h]
  namePlacement: [], // [x, y, w, h]
  xOffset: 0
};
