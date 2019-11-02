const drawLobby = ctxs => {
  if (state_Lobby.iTime >= 0) {
    state_Lobby.tileSize =
      Math.min(ctxs['bg'].canvas.width, ctxs['bg'].canvas.height) /
      state_Lobby.numTiles;
    state_Lobby.xOffset =
      (canvs['fg'].width - state_Lobby.tileSize * state_Lobby.numTiles) / 2;
    ctxs['bg'].translate(state_Lobby.xOffset, 0);
    drawLobbyBg(ctxs['bg'], state_Lobby.tileSize);
    ctxs['bg'].translate(-state_Lobby.xOffset, 0);

  }
  for (var c in ctxs) {
    ctxs[c].translate(state_Lobby.xOffset, 0);
  }

  if (state_Lobby.redrawFgFlag) {
    ctxs['fg'].clearRect(0, 0, canvs['fg'].width, canvs['fg'].height);
    state_Lobby.redrawFgFlag = false;
  }

  switch (state_Lobby.phase) {
    case 0:
      {
        // title + subtitle
        fillTextInRectCentre(
          ctxs['bg'],
          'Character select',
          0,
          state_Lobby.tileSize * 2, state_Lobby.numTiles * state_Lobby.tileSize, state_Lobby.tileSize,
          'white',
          state_Lobby.tileSize / 2 + 'px calibri'
        );
        fillTextInRectCentre(
          ctxs['bg'],
          'Select a character and a name.',
          0,
          state_Lobby.tileSize * 2, state_Lobby.numTiles * state_Lobby.tileSize, state_Lobby.tileSize * 3,
          'white',
          state_Lobby.tileSize + 'px roman'
        );
        fillTextInRectCentre(
          ctxs['bg'],
          'Game room select',
          0,
          state_Lobby.tileSize * 2, state_Lobby.numTiles * state_Lobby.tileSize, state_Lobby.tileSize,
          'white',
          state_Lobby.tileSize / 2 + 'px calibri'
        );
        fillTextInRectCentre(
          ctxs['bg'],
          'Choose an available game room or create one.',
          0,
          state_Lobby.tileSize * 2, state_Lobby.numTiles * state_Lobby.tileSize, state_Lobby.tileSize * 3,
          'white',
          state_Lobby.tileSize + 'px roman'
        );
        drawCharNameCard(ctxs['fg'], bomberData.char, bomberData.name,
          state_Lobby.tileSize, state_Lobby.tileSize * 5,
          state_Lobby.tileSize * ((state_Lobby.numTiles / 2) - 1), state_Lobby.tileSize);

        drawTextBox(ctxs['fg'], 'Create new Room!',
          state_Lobby.tileSize * state_Lobby.numTiles - (state_Lobby.tileSize * 10),
          state_Lobby.tileSize * 5,
          state_Lobby.tileSize * ((state_Lobby.numTiles / 2) - 1),
          state_Lobby.tileSize,
          null, 'lightgrey', 2, true);

        // char + name placement
        var charhw = [state_Lobby.tileSize * 7, state_Lobby.tileSize * 8];
        state_Lobby.charPlacement = [
          (state_Lobby.tileSize * state_Lobby.numTiles) / 2 - charhw[0] / 2, state_Lobby.tileSize * 4.5,
          ...charhw
        ];
        state_Lobby.namePlacement = [
          (state_Lobby.tileSize * state_Lobby.numTiles) / 2 - state_Lobby.tileSize * 4, state_Lobby.tileSize * 13,
          state_Lobby.tileSize * 8, state_Lobby.tileSize
        ];
        if (state_Lobby.redrawNameFlag) {
          ctxs['fg'].clearRect(
            ...state_Lobby.namePlacement
          );
          drawTextBox(ctxs['fg'], bomberData.name, ...state_Lobby.namePlacement);
          console.log('redraw name');
        }
        state_Lobby.redrawNameFlag = false;

        drawCharBoxWithPadding(ctxs['fg'], bomberData.char, Math.floor(state_Lobby.iTime / (gameVars.FPS / 3)) % 8,
          ...state_Lobby.charPlacement, state_Lobby.tileSize / 4
        );

      }
      break;
    case 1:
      {
        // title + subtitle

      }
      break;
  }
  for (var c in ctxs) {
    ctxs[c].translate(-state_Lobby.xOffset, 0);
  }
};

const drawGameDetailsCard = (name, players, tCreated, yOffset, selected = false) => {
  fillRectOnCanv(ctxs['fg'], state_Lobby.tileSize, state_Lobby.tileSize * yOffset,
    state_Lobby.tileSize * state_Lobby.numTiles,
    state_Lobby.tileSize, 'black', selected ? lime : 'white', 2, true);
  var text = `"${name.slice(0, 16)}", ${players} players, created ${new Date(tCreated).toTimeString().slice(0, 5)}`;
  fillTextInRect(ctxs['fg'], text, state_Lobby.tileSize, state_Lobby.tileSize * yOffset,
    state_Lobby.tileSize * state_Lobby.numTiles,
    state_Lobby.tileSize, 'white');
}

const updateLobby = iTick => {
  state_Lobby.iTime = iTick;
};

const drawLobbyBg = (ctx, tileSize) => {
  for (let i = 0; i < state_Lobby.numTiles; i++) {
    for (let j = 0; j < state_Lobby.numTiles; j++) {
      drawBlock(ctx, 0, 0, i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }
  // fillRectOnCanv(ctxs['bg'],
  // state_Lobby.xOffset + state_Lobby.tileSize * 2, state_Lobby.tileSize / 2,
  // state_Lobby.tileSize * 9.8, state_Lobby.tileSize * 2, 'black', 'white');
  fillTextInRectCentre(ctxs['bg'], "Bomber Mobile",
    0, state_Lobby.tileSize / 2,
    state_Lobby.tileSize * state_Lobby.numTiles, state_Lobby.tileSize * 2,
    'white', state_Lobby.tileSize + 'px calibri');
  // fillTextOnCanv(
  //   ctxs['bg'],
  //   'Welcome to BomberMobile!',
  //   state_Lobby.tileSize,
  //   state_Lobby.tileSize * 2,
  //   'white',
  //   state_Lobby.tileSize + 'px calibri'
  // );
  drawCharBox(ctxs['fg'], 10, Math.floor(state_Lobby.iTime / (gameVars.FPS / 3)) % 5,
    state_Lobby.xOffset + state_Lobby.tileSize * 3, state_Lobby.tileSize / 2,
    state_Lobby.tileSize * 2, state_Lobby.tileSize * 2, 'black', 'black', 2
  );
  drawCharBox(ctxs['fg'], 10, Math.floor(state_Lobby.iTime / (gameVars.FPS / 3)) % 5,
    state_Lobby.xOffset + state_Lobby.tileSize * 15, state_Lobby.tileSize / 2,
    state_Lobby.tileSize * 2, state_Lobby.tileSize * 2, 'black', 'black', 2
  );
};

const state_Lobby = {
  actionButtonText: 'Ready!',
  phase: 0,
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
    switch (state_Lobby.phase) {
      case 0:
        state_Lobby.phase++;
        state_Lobby.actionButtonText = 'Enter Game!';
        gameVars.updateButtonText();
        state_Lobby.redrawFgFlag = true;
        break;
      case 1:
        gotoMainGameMap();
        break;
    }

  },
  iTime: 0,
  ready: false,
  tileSize: null,
  numTiles: 20,
  redrawNameFlag: true,
  redrawFgFlag: true,
  charPlacement: [], // [x, y, w, h]
  namePlacement: [], // [x, y, w, h]
  xOffset: 0
};
