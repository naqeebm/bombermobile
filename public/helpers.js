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

const drawChar = (ctx, char, x, y, w, h, image = 0) => {
  drawBlock(ctx, 0 + image, 11 - char, x, y, w, h);
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
