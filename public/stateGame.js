const drawGame = ctxs => {
  // initial map
  if (state_Game.iTime <= 0) {
    let boundingRect = ctxs['bg'].canvas.getBoundingClientRect();
    state_Game.canvasBoundOffsets = [boundingRect.left, boundingRect.top];
    state_Game.tileSize =
      Math.max(ctxs['bg'].canvas.width, ctxs['bg'].canvas.height) / 20;
    state_Game.touchScale = 1 / state_Game.tileSize;
    for (let y = 0; y < gameMap.length; y++) {
      for (let x = 0; x < gameMap[0].length; x++) {
        drawBlock(
          ctxs['bg'],
          gameMap[y][x],
          0,
          x * state_Game.tileSize,
          y * state_Game.tileSize,
          state_Game.tileSize,
          state_Game.tileSize
        );
      }
    }
  }
  // each frame
  // player
  ctxs['fg'].clearRect(
    bomberData.x * state_Game.tileSize - (1 * state_Game.tileSize) / 5,
    bomberData.y * state_Game.tileSize - state_Game.tileSize / 2,
    state_Game.tileSize * 1.5,
    state_Game.tileSize * 1.5
  );
  drawChar(
    ctxs['fg'],
    bomberData.char,
    bomberData.x * state_Game.tileSize - (1 * state_Game.tileSize) / 5,
    bomberData.y * state_Game.tileSize - state_Game.tileSize / 2,
    state_Game.tileSize * 1.5,
    state_Game.tileSize * 1.5,
    Math.floor(
      state_Game.iTime / (bomberData.moveDuration * (gameVars.FPS / 10))
    ) % 2
  );
  if (state_Game.pathBlocks.length > 0) {
    fillRectOnCanv(
      ctxs['mid'],
      bomberData.x * state_Game.tileSize,
      bomberData.y * state_Game.tileSize,
      state_Game.tileSize,
      state_Game.tileSize,
      'white'
    );
    for (let i = 0; i < state_Game.pathBlocks.length; i++) {
      fillRectOnCanv(
        ctxs['mid'],
        state_Game.pathBlocks[i][0] * state_Game.tileSize +
          state_Game.tileSize / 4,
        state_Game.pathBlocks[i][1] * state_Game.tileSize +
          state_Game.tileSize / 4,
        state_Game.tileSize - state_Game.tileSize / 2,
        state_Game.tileSize - state_Game.tileSize / 2,
        state_Game.pathColor
      );
    }
  } else {
    ctxs['mid'].clearRect(
      0,
      0,
      ctxs['mid'].canvas.width,
      ctxs['mid'].canvas.height
    );
  }
};

const updateGame = iTick => {
  state_Game.iTime = iTick;
  // update background blocks
  if (state_Game.bgQueue.length > 0) {
    console.log('bgQueue:', JSON.stringify(state_Game.bgQueue));
    state_Game.bgQueue.forEach(coord => {
      drawBlock(
        ctxs['bg'],
        gameMap[coord[1]][coord[0]],
        0,
        coord[0] * state_Game.tileSize,
        coord[1] * state_Game.tileSize,
        state_Game.tileSize,
        state_Game.tileSize
      );
    });
    state_Game.bgQueue = [];
  }
};

const changeGameBlock = (x, y, newVal) => {
  gameMap[y][x] = newVal;
  console.log('updated', y, x, 'newVal', newVal);
  state_Game.bgQueue.push([x, y]);
  console.log('bgQueue:', JSON.stringify(state_Game.bgQueue));
};

const getOpenBlocks = block => {
  let x = block.block[0];
  let y = block.block[1];
  let openBlocks = [];
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (!(i == 0 && j == 0) && Math.abs(i) !== Math.abs(j)) {
        if (
          i + x > 0 &&
          i + x < gameMap[0].length &&
          (j + y > 0 && j + y < gameMap.length)
        ) {
          if (gameMap[j + y][i + x] === 0 || gameMap[j + y][i + x] === 5) {
            openBlocks.push({ prev: block, block: [i + x, j + y] });
          }
        }
      }
    }
  }
  return openBlocks;
};

const getPath = (destX, destY) => {
  let openBlocks = getOpenBlocks({
    block: [bomberData.x, bomberData.y],
    prev: [bomberData.x, bomberData.y]
  });
  let closedBlocks = [];
  let block = {
    block: [bomberData.x, bomberData.y],
    prev: [bomberData.x, bomberData.y]
  };
  let newBlocks = [];
  for (
    let it = 0;
    openBlocks.length > 0 &&
    !(block.block[0] === destX && block.block[1] === destY);
    // it.length < 5;
    it++
  ) {
    block = openBlocks.shift();
    closedBlocks.push(block);
    newBlocks = getOpenBlocks(block);
    for (let i = 0; i < newBlocks.length; i++) {
      if (
        openBlocks.filter(
          ob =>
            ob.block[0] === newBlocks[i].block[0] &&
            ob.block[1] === newBlocks[i].block[1]
        ).length === 0 &&
        closedBlocks.filter(
          cb =>
            cb.block[0] === newBlocks[i].block[0] &&
            cb.block[1] === newBlocks[i].block[1]
        ).length === 0 &&
        !(
          newBlocks[i].block[0] === bomberData.x &&
          newBlocks[i].block[1] === bomberData.y
        )
      ) {
        openBlocks.push(newBlocks[i]);
      }
    }
  }
  if (block.block[0] === destX && block.block[1] === destY) {
    let path = [];
    let prev = block.prev;
    while (prev.block !== prev.prev) {
      path.push(prev.block);
      prev = prev.prev;
    }
    path.push([destX, destY]);
    return path;
  } else {
    return null;
  }
};

const state_Game = {
  actionButtonText: 'B',
  draw: drawGame,
  update: updateGame,
  handleMouse: (x, y, down) => {
    if (down) {
      let xDest = Math.floor(
        (x - state_Game.canvasBoundOffsets[0]) * state_Game.touchScale
      );
      let yDest = Math.floor(
        (y - state_Game.canvasBoundOffsets[1]) * state_Game.touchScale
      );
      let path = getPath(xDest, yDest);
      if (path !== null) {
        for (let i = 0; i < path.length; i++) {
          if (!(path[i][0] === bomberData.x && path[i][1] === bomberData.y)) {
            state_Game.pathBlocks.push(path[i]);
          }
        }
        state_Game.pathColor = 'lime';
      } else {
        state_Game.pathBlocks = [xDest, yDest];
        state_Game.pathColor = 'red';
      }
    } else {
      state_Game.pathBlocks = [];
    }
  },
  handleAction: () => {},
  iTime: 0,
  tileSize: 40,
  canvasBoundOffsets: [0, 0],
  touchScale: 1,
  pathBlocks: [],
  pathColor: 'green',
  bgQueue: []
};
