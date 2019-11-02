const tilesImage = document.createElement('img');
tilesImage.src = './imgs/tiles.png';

const fillRectOnCanv = (
  ctx,
  x,
  y,
  w,
  h,
  fill = null,
  stroke = null,
  lw = 1,
  clear = true
) => {
  if (clear) {
    ctx.strokeRect(x, y, w, h);
  }
  if (fill !== null) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  if (stroke !== null) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.strokeRect(x, y, w, h);
  }
};

const fillRectOnCanvWithPadding = (
  ctx,
  x,
  y,
  w,
  h,
  padding,
  fill = null,
  stroke = null,
  lw = 1,
  clear = true
) => {
  if (clear) {
    ctx.clearRect(x, y, w, h);
  }
  if (fill !== null) {
    ctx.fillStyle = fill;
    ctx.fillRect(x + padding, y + padding, w - 2 * padding, h - 2 * padding);
  }
  if (stroke !== null) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.strokeRect(x + padding, y + padding, w - 2 * padding, h - 2 * padding);
  }
};

const fillTextOnCanv = (
  ctx,
  text,
  x,
  y,
  fill = 'white',
  font = '20px calibri',
  maxWidth = null
) => {
  if (fill !== null) {
    if (font !== null) {
      ctx.font = font;
    }
    ctx.fillStyle = fill;
    if (maxWidth !== null) {
      ctx.fillText(text, x, y, maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }
  }
};

const fillTextInRect = (ctx, text, x, y, w, h, fill = 'white', font = '20px calibri') => {
  if (fill !== null) {
    ctx.fillStyle = fill;
    if (font !== null)
      ctx.font = font;

    var textHeight = Number(font.slice(0, font.indexOf('px')));
    ctx.fillText(text, x + 8, y + h / 2 + (textHeight / 3), w - 10);
  }
}

const fillTextInRectCentre = (ctx, text, x, y, w, h, fill = 'white', font = '20px calibri') => {
  if (fill !== null) {
    ctx.fillStyle = fill;
    if (font !== null)
      ctx.font = font;
    var textHeight = Number(font.slice(0, font.indexOf('px')));
    ctx.fillText(text, x + (w - (ctx.measureText(text).width)) / 2, y + h / 2 + (textHeight / 3), w);
  }
}
const drawBlock = (ctx, blockx, blocky, xdisp, ydisp, w, h) => {
  ctx.drawImage(
    tilesImage,
    blockx * 64 + 1,
    blocky * 64 + 1,
    62,
    62,
    xdisp,
    ydisp,
    w,
    h
  );
};

const drawTextBox = (ctx, text, x, y, w, h, fill = 'grey', stroke = 'white', lw = 2, centre = true) => {
  fillRectOnCanv(ctx, x, y, w, h, fill, stroke, lw, true);
  if (centre)
    fillTextInRectCentre(ctx, text, x, y, w, h);
  else {
    fillTextInRect(ctx, text, x, y, w, h);
  }
}

const drawCharBox = (ctx, char, image, x, y, w, h, fill = 'lightgrey', stroke = 'grey', lw = 2) => {
  fillRectOnCanv(
    ctx,
    x,
    y,
    w,
    h, fill, stroke, lw
  );
  drawChar(
    ctx,
    char,
    x,
    y,
    w,
    h,
    image
  );
};

const drawCharBoxWithPadding = (ctx, char, image, x, y, w, h, padding) => {
  fillRectOnCanv(
    ctx,
    x,
    y,
    w,
    h, 'lightgrey', 'grey', 2, true
  );
  drawChar(
    ctx,
    char,
    x + padding / 2,
    y + padding / 2,
    w - padding,
    h - padding,
    image
  );
};

const fillRectWithTiles = (ctx, temp, blockx, blocky, tileSize, x, y, w, h) => {
  fillRectOnCanv(ctx, x, y, w, h, 'white');
  var xNum = Math.ceil(w / tileSize);
  var yNum = Math.ceil(h / tileSize);
  for (var i_y = 0; i_y < yNum; i_y++) {
    for (var i_x = 0; i_x < xNum; i_x++) {
      drawBlock(temp, blockx, blocky, i_x * tileSize, i_y * tileSize, tileSize, tileSize);
    }
  }
  var image = temp.getImageData(x, y, w, h);
  // fillRectOnCanv(temp, 0, 0, w, h, null, 'blue', 2);
  // temp.clearRect(0, 0, xNum * tileSize, yNum * tileSize);
  ctx.putImageData(image, x, y);
}

const drawCharNameCard = (ctx, char, name, x, y, w, h) => {
  var size = Math.min(w, h);
  fillRectOnCanv(ctx, x, y, w, h, 'white');
  drawTextBox(ctx, name,
    h < w ? x + size : x, h < w ? y : y + size,
    h < w ? w - size : size, h < w ? h : h - size, 'black', 'grey', 2, false);
  drawCharBoxWithPadding(ctx, char, 0, x, y, size, size, 4);
}

// const drawTextBox = (ctx, text, x, y, callback) => {
//   fillRectOnCanv(
//     ctx,
//     state_Lobby.tileSize * x,
//     y * state_Lobby.tileSize,
//     (text.length / state_Lobby.tileSize) *
//     state_Lobby.tileSize *
//     0.8 *
//     state_Lobby.tileSize,
//     state_Lobby.tileSize * 1.5,
//     'lightgrey',
//     'white',
//     2,
//     true
//   );
//   fillTextOnCanv(
//     ctx,
//     text,
//     state_Lobby.tileSize * x + state_Lobby.tileSize / 2,
//     state_Lobby.tileSize * y + state_Lobby.tileSize,
//     'black',
//     `${state_Lobby.tileSize}px monospace`,
//     (text.length / state_Lobby.tileSize) *
//     state_Lobby.tileSize *
//     0.8 *
//     state_Lobby.tileSize -
//     state_Lobby.tileSize
//   );
// };

const drawChar = (ctx, char, x, y, w, h, image = 0) => {
  drawBlock(ctx, 0 + image, 11 - char, x, y, w, h);
};

const drawBomb = (ctx, x, y, w, h, offset) => {
  drawBlock(ctx, 0 + offset, 1, x, y, w, h);
};

function pointIsInRect(x, y, rectData) {
  if (
    x > rectData[0] &&
    x < rectData[0] + rectData[2] &&
    y > rectData[1] &&
    y < rectData[1] + rectData[3]
  )
    return true;
  return false;
}
