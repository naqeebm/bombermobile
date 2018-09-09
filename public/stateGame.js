const GAME_MAX_BLOCKS = 20;

const drawGame = ctxs => {
  if (state_Game.iTime <= 0) {
    // initialize vars
    let boundingRect = ctxs['bg'].canvas.getBoundingClientRect();
    state_Game.canvasBoundOffsets = [boundingRect.left, boundingRect.top];
    state_Game.tileSize =
      Math.max(ctxs['bg'].canvas.width, ctxs['bg'].canvas.height) /
      GAME_MAX_BLOCKS;
    state_Game.touchScale = 1 / state_Game.tileSize;
    state_Game.disp = [
      ctxs['bg'].canvas.width / 2 - state_Game.tileSize,
      ctxs['bg'].canvas.height / 2 - state_Game.tileSize
    ];
    state_Game.radius = [
      Math.floor(canvs['bg'].width / state_Game.tileSize / 2),
      Math.floor(canvs['bg'].height / state_Game.tileSize / 2)
    ];
    state_Game.xmapMoveFactor = state_Game.radius[0] / 2;
    state_Game.ymapMoveFactor = state_Game.radius[1] / 2;
  }
  // redrawn each frame
  // player
  ctxs['fg'].clearRect(
    0,
    0,
    GAME_MAX_BLOCKS * state_Game.tileSize,
    GAME_MAX_BLOCKS * state_Game.tileSize
  );

  ctxs['fg'].translate(state_Game.disp[0], state_Game.disp[1]);
  drawPlayer(ctxs['fg'], bomberData);
  // other players
  for (let id in players) {
    if (
      players[id].x > Math.floor(bomberData.x) - GAME_MAX_BLOCKS / 3 &&
      players[id].x < Math.floor(bomberData.x) + GAME_MAX_BLOCKS / 3 &&
      players[id].y > Math.floor(bomberData.y) - GAME_MAX_BLOCKS / 3 &&
      players[id].y < Math.floor(bomberData.y) + GAME_MAX_BLOCKS / 3
    ) {
      drawPlayer(ctxs['fg'], players[id]);
    }
  }
  gameVars.myBombs.forEach(bomb => {
    drawBomb(
      ctxs['fg'],
      bomb[0] * state_Game.tileSize,
      bomb[1] * state_Game.tileSize,
      state_Game.tileSize,
      state_Game.tileSize,
      Math.round(bomb[2] / gameVars.FPS)
    );
  });
  gameVars.bombs.forEach(bomb => {
    drawBomb(
      ctxs['fg'],
      bomb[0] * state_Game.tileSize,
      bomb[1] * state_Game.tileSize,
      state_Game.tileSize,
      state_Game.tileSize,
      Math.round(bomb[2] / gameVars.FPS)
    );
  });
  gameVars.explosions.forEach(expl => {
    drawBlock(
      ctxs['fg'],
      expl[2],
      2,
      expl[0] * state_Game.tileSize,
      expl[1] * state_Game.tileSize,
      state_Game.tileSize,
      state_Game.tileSize
    );
  });
  gameVars.powerups.forEach(pow => {
    drawBlock(
      ctxs['fg'],
      pow[2],
      4,
      pow[0] * state_Game.tileSize,
      pow[1] * state_Game.tileSize,
      state_Game.tileSize,
      state_Game.tileSize
    );
  });
  ctxs['fg'].translate(-state_Game.disp[0], -state_Game.disp[1]);

  // path
  ctxs['mid'].translate(state_Game.disp[0], state_Game.disp[1]);
  if (state_Game.pathBlocks.length > 0) {
    drawBreadcrumbs(
      ctxs['mid'],
      state_Game.pathBlocks,
      state_Game.PATHCOLOR,
      state_Game.tileSize,
      true,
      true
    );
    drawBreadcrumbs(
      ctxs['mid'],
      [state_Game.pathBlocks[0], state_Game.pathBlocks[0]],
      state_Game.PATHCOLOR,
      state_Game.tileSize,
      true,
      false,
      Math.sin((state_Game.iTime / 10) % TWOPI)
    );
  }
  ctxs['mid'].translate(-state_Game.disp[0], -state_Game.disp[1]);
  if (state_Game.clearDrawnPathFlag) {
    ctxs['mid'].clearRect(
      0,
      0,
      ctxs['mid'].canvas.width,
      ctxs['mid'].canvas.height
    );
    if (state_Game.clearDrawnPathFlag) state_Game.clearDrawnPathFlag = false;
  }
  // next moves
  ctxs['mid'].translate(state_Game.disp[0], state_Game.disp[1]);
  if (bomberData.nextMoves.length > 0) {
    drawBreadcrumbs(
      ctxs['mid'],
      bomberData.nextMoves,
      state_Game.MOVECOLOR,
      state_Game.tileSize,
      true,
      true
    );
    drawBreadcrumbs(
      ctxs['mid'],
      [bomberData.nextMoves[0], bomberData.nextMoves[0]],
      state_Game.MOVECOLOR,
      state_Game.tileSize,
      true,
      false,
      Math.sin((state_Game.iTime / 10) % TWOPI)
    );
  }
  ctxs['mid'].translate(-state_Game.disp[0], -state_Game.disp[1]);
};

const updateGame = iTick => {
  // update timer
  state_Game.iTime = iTick;
  if (iTick >= 0) {
    // add blocks for initial map
    addFollowBgBlocksToQueue(bomberData, state_Game.bgQueue, state_Game.radius);
  }
  // update background blocks
  if (state_Game.bgQueue.length > 0) {
    ctxs['bg'].translate(state_Game.disp[0], state_Game.disp[1]);
    state_Game.bgQueue.forEach(coord => {
      if (
        coord[0] >= 0 &&
        coord[0] < gameVars.xTilesNum &&
        coord[1] >= 0 &&
        coord[1] < gameVars.yTilesNum
      ) {
        drawBlock(
          ctxs['bg'],
          gameVars.gameMap[coord[1]][coord[0]],
          0,
          coord[0] * state_Game.tileSize,
          coord[1] * state_Game.tileSize,
          state_Game.tileSize,
          state_Game.tileSize
        );
      } else {
        drawBlock(
          ctxs['bg'],
          0,
          0,
          coord[0] * state_Game.tileSize,
          coord[1] * state_Game.tileSize,
          state_Game.tileSize,
          state_Game.tileSize
        );
      }
    });
    ctxs['bg'].translate(-state_Game.disp[0], -state_Game.disp[1]);
    state_Game.bgQueue = [];
  }

  // update bomb timers

  gameVars.myBombs.forEach(bomb => {
    bomb[2] -= 1;
    if (bomb[2] === 0) {
      explodeBomb(bomb);
      incBombNo(bomberData);
    }
  });
  gameVars.myBombs = gameVars.myBombs.filter(b => b[2] >= 0);

  gameVars.bombs.forEach(bomb => {
    bomb[2] -= 1;
    if (bombs[2] === 0) {
      explodeBomb(bomb);
    }
  });
  gameVars.bombs = gameVars.bombs.filter(b => b[2] >= 0);

  // update explosions

  gameVars.explosions.forEach(expl => {
    // explode other bombs
    let bIndex = gameVars.myBombs.findIndex(
      b => b[0] === expl[0] && b[1] === expl[1]
    );
    if (bIndex !== -1) {
      explodeBomb(gameVars.myBombs[bIndex]);
      gameVars.myBombs.splice(bIndex, 1);
      incBombNo(bomberData);
    } else {
      bIndex = gameVars.bombs.findIndex(
        b => b[0] === expl[0] && b[1] === expl[1]
      );
      if (bIndex !== -1) {
        explodeBomb(gameVars.myBombs[bIndex]);
        gameVars.bombs.splice(bIndex, 1);
      }
    }
    expl[3]--;
    if (expl[3] === 0) {
      if (gameVars.gameMap[expl[1]][expl[0]] === 2) {
        // changeGameBlock(expl[0], expl[1], 5);
        emitMessage('newPowerup', { x: expl[0], y: expl[1] });
      } else {
        changeGameBlock(expl[0], expl[1], 0);
      }
    } else {
    }
  });
  gameVars.explosions = gameVars.explosions.filter(expl => expl[3] >= 0);

  // update player motion

  // player
  if (bomberData.moveTemp !== null) {
    updateMotion(bomberData);

    clearPath();
    if (bomberData.moveTemp[2] < 1) {
      bomberData.x = Math.round(bomberData.x);
      bomberData.y = Math.round(bomberData.y);
      bomberData.moving = [0, 0];
      bomberData.moveTemp = null;

      // check if on powerup
      gameVars.powerups.forEach(pow => {
        if (bomberData.x === pow[0] && bomberData.y === pow[1]) {
          emitMessage('takePowerup', { x: pow[0], y: pow[1], type: pow[2] });
        }
      });
    }

    // add new background blocks to bgQueue
    addFollowBgBlocksToQueue(bomberData, state_Game.bgQueue, state_Game.radius);
  }

  // move map along if needs be

  if (
    Math.abs(
      Math.round(
        ctxs['bg'].canvas.width / 2 / state_Game.tileSize -
          state_Game.disp[0] / state_Game.tileSize -
          bomberData.x
      )
    ) > state_Game.xmapMoveFactor
  ) {
    state_Game.xmapMoveFactor = 1;
    state_Game.disp[0] +=
      Math.round(
        ctxs['bg'].canvas.width / 2 / state_Game.tileSize -
          state_Game.disp[0] / state_Game.tileSize -
          bomberData.x
      ) / state_Game.moveSpeedFactor;
  } else if (
    Math.abs(
      Math.round(
        ctxs['bg'].canvas.height / 2 / state_Game.tileSize -
          state_Game.disp[1] / state_Game.tileSize -
          bomberData.y
      )
    ) > state_Game.ymapMoveFactor
  ) {
    state_Game.ymapMoveFactor = 1;
    state_Game.disp[1] +=
      Math.round(
        ctxs['bg'].canvas.height / 2 / state_Game.tileSize -
          state_Game.disp[1] / state_Game.tileSize -
          bomberData.y
      ) / state_Game.moveSpeedFactor;
  } else {
    state_Game.xmapMoveFactor = state_Game.radius[0] / 2;
    state_Game.ymapMoveFactor = state_Game.radius[1] / 2;
  }

  // add next move (player) if not moving
  if (bomberData.moveTemp === null) {
    if (bomberData.nextMoves.length > 0) {
      let nextMove = bomberData.nextMoves.pop();
      if (!(nextMove[0] === bomberData.x && nextMove[1] === bomberData.y)) {
        setMoving(bomberData, nextMove[0], nextMove[1]);
        startMotion(bomberData);
      }
    }
  }

  // other players
  for (let id in players) {
    if (players[id].moveTemp !== null) {
      updateMotion(players[id]);
      if (players[id].moveTemp[2] < 1) {
        players[id].x = Math.round(players[id].x);
        players[id].y = Math.round(players[id].y);
        players[id].moving = [0, 0];
        players[id].moveTemp = null;
      }
    }
    // add next move (other players) if not moving
    if (players[id].moveTemp === null) {
      if (players[id].nextMoves.length > 0) {
        let nextMove = players[id].nextMoves.pop();
        if (!(nextMove[0] === players[id].x && nextMove[1] === players[id].y)) {
          setMoving(players[id], nextMove[0], nextMove[1]);
          startMotion(players[id]);
        }
      }
    }
  }
  // update map translation smoothly
  // TODO ?
};

const incBombNo = bomberData => {
  if (bomberData.numBombs < bomberData.numBombsMax) {
    bomberData.numBombs++;
  }
};

const changeGameBlock = (x, y, newVal) => {
  gameVars.gameMap[y][x] = newVal;
  state_Game.bgQueue.push([x, y]);
};

const drawBreadcrumbs = (
  ctx,
  movesList,
  rgbaColor,
  tileSize,
  fading = true,
  decreasingSize = true,
  offset = 0
) => {
  for (let i = 0; i < movesList.length; i++) {
    fillRectOnCanvWithPadding(
      ctx,
      movesList[i][0] * tileSize,
      movesList[i][1] * tileSize,
      tileSize,
      tileSize,
      decreasingSize
        ? Math.min(
            tileSize / 2,
            tileSize / ((tileSize / 12) * (i / movesList.length + 1))
          ) + offset
        : tileSize / 3 + offset,
      fading
        ? rgbaColor.slice(0, rgbaColor.length - 4) +
          ((i + 1) / movesList.length + offset) +
          ')'
        : rgbaColor
    );
  }
};

const drawPlayer = (ctx, bomberData) => {
  // ctx.clearRect(
  //   bomberData.undrawx * state_Game.tileSize - (1 * state_Game.tileSize) / 5,
  //   bomberData.undrawy * state_Game.tileSize - state_Game.tileSize / 2,
  //   state_Game.tileSize * 1.5,
  //   state_Game.tileSize * 1.5
  // );
  drawChar(
    ctx,
    bomberData.char,
    bomberData.x * state_Game.tileSize - (1 * state_Game.tileSize) / 5,
    bomberData.y * state_Game.tileSize - state_Game.tileSize / 2,
    state_Game.tileSize * 1.5,
    state_Game.tileSize * 1.5,
    (bomberData.moving[0] > 0 // working out offset for direction to face
      ? 2
      : bomberData.moving[0] < 0
        ? 4
        : bomberData.moving[1] > 0
          ? 8
          : bomberData.moving[1] < 0
            ? 6
            : 0) +
      (Math.floor(
        state_Game.iTime /
          (bomberData.moveTemp === null
            ? bomberData.moveDuration * 4
            : bomberData.moveDuration)
      ) %
        2) // working out offset for animation
  );
  // character name
  fillTextOnCanv(
    ctx,
    bomberData.name,
    2 + bomberData.x * state_Game.tileSize - (1 * state_Game.tileSize) / 5,
    2 + bomberData.y * state_Game.tileSize - state_Game.tileSize / 2,
    'black'
  );
  fillTextOnCanv(
    ctx,
    bomberData.name,
    bomberData.x * state_Game.tileSize - (1 * state_Game.tileSize) / 5,
    bomberData.y * state_Game.tileSize - state_Game.tileSize / 2,
    'cyan'
  );
};

addFollowBgBlocksToQueue = (bomberData, bgQueue, followRadius) => {
  for (
    let y = Math.round(bomberData.y) - followRadius[1];
    y < Math.round(bomberData.y) + followRadius[1];
    y++
  ) {
    for (
      let x = Math.round(bomberData.x) - followRadius[0];
      x < Math.round(bomberData.x) + followRadius[0];
      x++
    ) {
      bgQueue.push([x, y]);
    }
  }
};

const getOpenBlocks = block => {
  let x = Math.round(block.block[0]);
  let y = Math.round(block.block[1]);
  let openBlocks = [];
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (!(i == 0 && j == 0) && Math.abs(i) !== Math.abs(j)) {
        if (
          i + x > 0 &&
          i + x < gameVars.gameMap[0].length &&
          (j + y > 0 && j + y < gameVars.gameMap.length)
        ) {
          if (gameVars.gameMap[j + y][i + x] !== undefined) {
            if (
              gameVars.gameMap[j + y][i + x] === 0 ||
              gameVars.gameMap[j + y][i + x] === 5
            ) {
              openBlocks.push({ prev: block, block: [i + x, j + y] });
            }
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
    clearPath();
  }
};

const updateMotion = bomberData => {
  bomberData.undrawx = bomberData.x; // for undraw
  bomberData.undrawy = bomberData.y; // for undraw
  bomberData.x += bomberData.moveTemp[0];
  bomberData.y += bomberData.moveTemp[1];
  bomberData.moveTemp[2]--;
};

const stopMotion = (bomberData, pathBlocksAlso = true) => {
  if (pathBlocksAlso) state_Game.pathBlocks = [];
  bomberData.nextMoves = [];
  bomberData.moving = [0, 0];
  bomberData.moveTemp = null;
  bomberData.x = Math.round(bomberData.x);
  bomberData.y = Math.round(bomberData.y);
  state_Game.clearDrawnPathFlag = true;
};

const clearPath = () => {
  state_Game.pathBlocks = [];
  state_Game.PATHCOLOR = state_Game.PATHCOLOR;
  state_Game.clearDrawnPathFlag = true;
};

const canPlaceExplosion = (x, y) => {
  switch (gameVars.gameMap[y][x]) {
    case 0:
    case 2:
    case 3: // bomb block
    case 4: // under-explosion block
    case 5: // under-powerup block
      return true;
    default:
      return false;
  }
};

const addExplosion = (x, y, type) => {
  gameVars.explosions.push([x, y, type, DEFAULTBOMBTIME / 2]);
  if (gameVars.gameMap[y][x] === 0) {
    changeGameBlock(x, y, 4);
  }

  if (type !== 0) {
    // burn powerups
    let pwIndex = gameVars.powerups.findIndex(pw => pw[0] === x && pw[1] === y);
    if (pwIndex !== -1) {
      gameVars.powerups.splice(pwIndex, 1);
      changeGameBlock(x, y, 4);
      emitMessage('destroyedPowerup', x, y);
    }
  }
};

const explodeBomb = bombData => {
  let count = 0;
  let x = bombData[0];
  let y = bombData[1];
  let size = bombData[3] + 1;
  addExplosion(x, y, 0);
  changeGameBlock(x, y, 0);
  let flags = [false, false, false, false];
  while (count < size) {
    if (!flags[0]) {
      if (canPlaceExplosion(x - count, y)) {
        addExplosion(x - count, y, 2, count);
        if (gameVars.gameMap[y][x - count] === 2) {
          flags[0] = true;
        }
      } else {
        flags[0] = true;
      }
    }
    if (!flags[1]) {
      if (canPlaceExplosion(x, y - count)) {
        addExplosion(x, y - count, 1, count);
        if (gameVars.gameMap[y - count][x] === 2) {
          flags[1] = true;
        }
      } else {
        flags[1] = true;
      }
    }
    if (!flags[2]) {
      if (canPlaceExplosion(x + count, y)) {
        addExplosion(x + count, y, 2, count);
        if (gameVars.gameMap[y][x + count] === 2) {
          flags[2] = true;
        }
      } else {
        flags[2] = true;
      }
    }
    if (!flags[3]) {
      if (canPlaceExplosion(x, y + count)) {
        addExplosion(x, y + count, 1, count);
        if (gameVars.gameMap[y + count][x] === 2) {
          flags[3] = true;
        }
      } else {
        flags[3] = true;
      }
    }
    count++;
  }
};

const state_Game = {
  actionButtonText: 'B',
  draw: drawGame,
  update: updateGame,
  handleMouse: (x, y, down) => {
    let xDest = Math.floor(
      (x - state_Game.disp[0] - state_Game.canvasBoundOffsets[0]) *
        state_Game.touchScale
    );
    let yDest = Math.floor(
      (y - state_Game.disp[1] - state_Game.canvasBoundOffsets[1]) *
        state_Game.touchScale
    );
    if (down) {
      if (state_Game.pathBlocks.length > 0) {
        clearPath(true);
        stopMotion();
      } else {
        let path = getPath(xDest, yDest);
        if (path !== null) {
          bomberData.nextMoves = [];
          for (let i = 0; i < path.length; i++) {
            if (!(path[i][0] === bomberData.x && path[i][1] === bomberData.y)) {
              bomberData.nextMoves.push(path[i]);
            }
          }
          // bomberData.nextMoves = state_Game.pathBlocks;
          emitMessage('startMotion', {
            x: bomberData.x,
            y: bomberData.y,
            undraw: [bomberData.undrawx, bomberData.undrawy],
            moves: bomberData.nextMoves
          });
        }
      }
    }

    // if (!down) {
    //   // Destination block = (xDest, yDest)
    //   let path = getPath(xDest, yDest);
    //   if (path !== null) {
    //     state_Game.pathBlocks = [];
    //     for (let i = 0; i < path.length; i++) {
    //       if (!(path[i][0] === bomberData.x && path[i][1] === bomberData.y)) {
    //         state_Game.pathBlocks.push(path[i]);
    //       }
    //     }
    //     state_Game.PATHCOLOR = state_Game.PATHCOLOR;
    //   }
    // } else {
    //   if (state_Game.pathBlocks.length > 0) {
    //     let collision = false;
    //     state_Game.pathBlocks.forEach(blk => {
    //       if (blk[0] === xDest && blk[1] === yDest) {
    //         collision = true;
    //       }
    //     });
    //     if (collision) {
    //       bomberData.nextMoves = state_Game.pathBlocks;
    //       emitMessage('startMotion', {
    //         x: bomberData.x,
    //         y: bomberData.y,
    //         undraw: [bomberData.undrawx, bomberData.undrawy],
    //         moves: bomberData.nextMoves
    //       });
    //     } else {
    //       clearPath();
    //     }
    //   }
    //   if (bomberData.nextMoves.length > 0 && bomberData.moveTemp !== null) {
    //     stopMotion(bomberData, true);
    //   }
    // }
  },
  handleAction: () => {
    if (bomberData.numBombs > 0) {
      emitMessage('newBomb', {
        id: server.id,
        x: Math.floor(bomberData.x),
        y: Math.floor(bomberData.y),
        size: bomberData.bombSize
      });
    }
  },
  iTime: 0,
  tileSize: 40,
  canvasBoundOffsets: [0, 0],
  touchScale: 1,
  pathBlocks: [],
  PATHCOLOR: 'rgba(110, 188, 98, 0.4)',
  MOVECOLOR: 'rgba(100, 140, 186, 0.4)',
  clearDrawnPathFlag: false,
  bgQueue: [],
  disp: [0, 0],
  radius: [10, 10],
  xmapMoveFactor: 5,
  ymapMoveFactor: 5,
  moveSpeedFactor: 1
};
