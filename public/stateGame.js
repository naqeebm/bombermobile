const GAME_MAX_BLOCKS = 40;

const drawGame = ctxs => {
  // initial map
  if (state_Game.iTime <= 0) {
    let boundingRect = ctxs['bg'].canvas.getBoundingClientRect();
    state_Game.canvasBoundOffsets = [boundingRect.left, boundingRect.top];
    state_Game.tileSize =
      Math.max(ctxs['bg'].canvas.width, ctxs['bg'].canvas.height) /
      GAME_MAX_BLOCKS;
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
    bomberData.undrawx * state_Game.tileSize - (1 * state_Game.tileSize) / 5,
    bomberData.undrawy * state_Game.tileSize - state_Game.tileSize / 2,
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
    (bomberData.moving[0] > 0
      ? 2
      : bomberData.moving[0] < 0
        ? 4
        : bomberData.moving[1] > 0
          ? 8
          : bomberData.moving[1] < 0
            ? 6
            : 0) +
      (Math.floor(state_Game.iTime / (bomberData.moveDuration * 4)) % 2)
  );
  if (state_Game.pathBlocks.length > 0) {
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
  }
  if (bomberData.nextMoves.length > 0) {
    for (let i = 0; i < bomberData.nextMoves.length; i++) {
      fillRectOnCanv(
        ctxs['mid'],
        bomberData.nextMoves[i][0] * state_Game.tileSize +
          state_Game.tileSize / 4,
        bomberData.nextMoves[i][1] * state_Game.tileSize +
          state_Game.tileSize / 4,
        state_Game.tileSize - state_Game.tileSize / 2,
        state_Game.tileSize - state_Game.tileSize / 2,
        ``
      );
    }
  }
  ctxs['mid'].clearRect(
    bomberData.x * state_Game.tileSize,
    bomberData.y * state_Game.tileSize,
    state_Game.tileSize,
    state_Game.tileSize
  );
  if (bomberData.nextMoves.length === 0 && state_Game.pathBlocks.length === 0) {
    ctxs['mid'].clearRect(
      0,
      0,
      ctxs['mid'].canvas.width,
      ctxs['mid'].canvas.height
    );
  }
};

const updateGame = iTick => {
  // update timer
  state_Game.iTime = iTick;

  // update background blocks
  if (state_Game.bgQueue.length > 0) {
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

  // update motion
  if (bomberData.moveTemp !== null) {
    bomberData.undrawx = bomberData.x; // for undraw
    bomberData.undrawy = bomberData.y; // for undraw
    bomberData.x += bomberData.moveTemp[0];
    bomberData.y += bomberData.moveTemp[1];
    bomberData.moveTemp[2]--;
    if (bomberData.moveTemp[2] < 1) {
      bomberData.x = Math.round(bomberData.x);
      bomberData.y = Math.round(bomberData.y);
      bomberData.moving = [0, 0];
      bomberData.moveTemp = null;
    }
  }
  if (bomberData.moveTemp === null) {
    if (bomberData.nextMoves.length > 0) {
      let nextMove = bomberData.nextMoves.pop();
      if (!(nextMove[0] === bomberData.x && nextMove[1] === bomberData.y)) {
        setMoving(bomberData, nextMove[0], nextMove[1]);
        startMotion(bomberData);
      }
    }
  }
};

const changeGameBlock = (x, y, newVal) => {
  gameMap[y][x] = newVal;
  state_Game.bgQueue.push([x, y]);
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
    path.unshift([destX, destY]);
    return path;
  } else {
    return null;
  }
};

const setMoving = (bomberData, newX, newY) => {
  if (!(newX === bomberData.x && newY === bomberData.y)) {
    let dx = newX - bomberData.x;
    let dy = newY - bomberData.y;
    if (dx > 0) {
      bomberData.moving = [1, 0];
    } else if (dx < 0) {
      bomberData.moving = [-1, 0];
    } else if (dy > 0) {
      bomberData.moving = [0, 1];
    } else if (dy < 0) {
      bomberData.moving = [0, -1];
    }
  }
};

const startMotion = bomberData => {
  if (!((bomberData.moving[0] === bomberData.moving[1]) === 0)) {
    if (Math.abs(bomberData.moving[0]) > 0) {
      bomberData.moveTemp = [
        (Math.sign(bomberData.moving[0]) * 1) / bomberData.moveDuration,
        0,
        bomberData.moveDuration
      ];
    } else if (Math.abs(bomberData.moving[1]) > 0) {
      bomberData.moveTemp = [
        0,
        (Math.sign(bomberData.moving[1]) * 1) / bomberData.moveDuration,
        bomberData.moveDuration
      ];
    }
  }
};

const stopMotion = (bomberData, gameAlso = true) => {
  if (gameAlso) state_Game.pathBlocks = [];
  bomberData.nextMoves = [];
  bomberData.moving = [0, 0];
};

const state_Game = {
  actionButtonText: 'B',
  draw: drawGame,
  update: updateGame,
  handleMouse: (x, y, down) => {
    console.log('handlemouse', x, y, down ? 'down' : 'up');
    if (down) {
      state_Game.temp++;
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
        state_Game.temp = 0;
      }
    } else {
      if (state_Game.pathBlocks.length > 0 && state_Game.temp > 0) {
        stopMotion(bomberData);
      }
    }
  },
  handleAction: () => {},
  iTime: 0,
  tileSize: 40,
  canvasBoundOffsets: [0, 0],
  touchScale: 1,
  pathBlocks: [],
  pathColor: 'green',
  bgQueue: [],
  temp: 0
};
