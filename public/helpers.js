const tilesImage = document.createElement('img');
tilesImage.src = './imgs/tiles.png';
const TWOPI = Math.PI * 2;
const PIBY2 = Math.PI / 2;
const PIBY4 = PIBY2 / 2;

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
    var textWidth = ctx.measureText(text).width;
    ctx.fillText(text,
      textWidth >= w ? x + 4 : (x + (w - textWidth) / 2),
      y + h / 2 + (textHeight / 3), textWidth >= w ? w - 8 : w);
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

const drawRoundedRectangle = (ctx, x, y, w, h, rad, fill = null, stroke = null, lw = 2, strokeFirstHalf = false, redraw = false) => {
  if (fill || stroke) {
    if (redraw)
      ctx.clearRect(x, y, w, h);
    if (fill)
      ctx.fillStyle = fill;
    if (stroke)
      ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(x + rad, y + rad, rad, Math.PI, -PIBY2);
    ctx.arc(x + w - rad, y + rad, rad, -PIBY2, 0);
    ctx.arc(x + w - rad, y + h - rad, rad, 0, PIBY2);
    ctx.arc(x + rad, y + h - rad, rad, PIBY2, Math.PI);
    if (fill)
      ctx.fill();
    if (stroke) {
      if (strokeFirstHalf) {
        ctx.beginPath();
        ctx.arc(x + rad, y + rad, rad, Math.PI + PIBY4, -PIBY2);
        ctx.arc(x + w - rad, y + rad, rad, -PIBY2, -PIBY4);
      } else {
        ctx.beginPath();
        ctx.arc(x + w - rad, y + h - rad, rad, -PIBY4, PIBY2);
        ctx.arc(x + rad, y + h - rad, rad, PIBY2, Math.PI - PIBY4);
      }
      ctx.stroke();
    }
  }
}

const drawButton = (ctx, text, x, y, w, h, type2 = false, down = false) => {
  drawRoundedRectangle(ctx, x, y, w, h, h / 2, type2 ? '#bfbfbf' : '#f2f2f2', type2 ? '#4d4d4d' : '#666666', 2, down);
  fillTextInRectCentre(ctx, text, x, y, w, h, type2 ? '#f2f2f2' : 'black', Math.min(h / 1.7, 32) + 'px sans-serif');
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
};

const drawCharNameCard = (ctx, char, name, x, y, w, h) => {
  var size = Math.min(w, h);
  fillRectOnCanv(ctx, x, y, w, h, 'white');
  drawTextBox(ctx, name,
    h < w ? x + size : x, h < w ? y : y + size,
    h < w ? w - size : size, h < w ? h : h - size, 'black', 'grey', 2, false);
  drawCharBoxWithPadding(ctx, char, 0, x, y, size, size, 4);
};

const fillLabelWithBlock = (ctx, blockx, blocky, text, x, y, w, h, padding = 8,
  selected, font = '20px calibri', centre = false, bgfill = '#f2f2f2', bgstroke = 'black', lw = 2,
  textfill = 'black', redraw = false) => {
  var size = Math.min(w, h);
  fillRectOnCanv(ctx, h < w ? x + size : x, h < w ? y : y + size,
    h < w ? w - size : size, h < w ? h : h - size, bgfill, bgstroke, lw, redraw);
  if (!centre)
    fillTextInRect(ctx, text, h < w ? x + size : x, h < w ? y : y + size,
      h < w ? w - size : size, h < w ? h : h - size, textfill, font);
  else {
    fillTextInRectCentre(ctx, text, h < w ? x + size : x, h < w ? y : y + size,
      h < w ? w - size : size, h < w ? h : h - size, textfill, font);
  }
  fillRectOnCanv(ctx, x, y, size, size, selected ? 'lime' : 'lightgrey', bgstroke, lw);
  drawBlock(ctx, blockx, blocky, x + padding / 2, y + padding / 2, size - padding, size - padding);
};

const drawVerticalSeek = (ctx, position, x, y, h, rad, lw = 2, stroke = 'darkgrey', fill = 'black', redraw = false) => {
  var xOffset = x + rad;
  if (redraw)
    ctx.clearRect(x - lw, y - rad - lw, rad * 2 + lw, h + rad + lw * 2);
  ctx.fillStyle = stroke;
  ctx.fillRect(xOffset - lw / 2, y, lw, h);
  ctx.fillStyle = fill;
  fillCircle(ctx, xOffset, y + clamp(h * position, 0, h), rad);
  ctx.strokeStyle = stroke;
  strokeCircle(ctx, xOffset, y + clamp(h * position, 0, h), rad, lw);
};

const drawMultilineLabelWithBlock = (ctx, blockx, blocky, textArray, x, y, w, h, padding = 8,
  separateText = true, selected, font = '20px calibri', bgfill = '#f2f2f2', bgstroke = 'black', lw = 2,
  textfill = 'black', redraw = false) => {
  var size = Math.min(w, h);
  drawLinesOfText(ctx, textArray,
    h < w ? x + size : x, h < w ? y : y + size,
    h < w ? w - size : size, h < w ? h : h - size,
    separateText, bgfill, bgstroke, lw, textfill, font, redraw);
  fillRectOnCanv(ctx, x, y, size, size, selected ? 'lime' : 'lightgrey', bgstroke, lw);
  drawBlock(ctx, blockx, blocky, x + padding / 2, y + padding / 2, size - padding, size - padding);
};

const drawLinesOfText = (ctx, textArray, x, y, w, h,
  separate = true, bgfill = '#f2f2f2', bgstroke = 'black', lw = 2,
  textfill = 'black', font = '20px calibri', redraw = false) => {
  fillRectOnCanv(ctx, x, y, w, h, bgfill, bgstroke, lw, redraw);
  var calculatedHeight = h / textArray.length;
  for (var i = 0; i < textArray.length; i++) {
    var rect = [x, y + i * calculatedHeight, w, calculatedHeight];
    fillRectOnCanv(ctx, ...rect,
      bgfill, separate ? bgstroke : null, lw, redraw);
    fillTextInRect(ctx, textArray[i], ...rect, textfill, font);
  }
};

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

const convertTime = (ms) => {
  if (ms === null) {
    return '-';
  }
  var s = ms / 1000;
  if (s > 60) {
    var m = s / 60;
    if (m > 60) {
      var h = m / 60;
      return Math.round(h) + 'h ' + (Math.round(m) % 60) + 'm';
    } else {
      return Math.round(m) + 'm ' + (Math.round(s) % 60) + 's';
    }
  } else {
    return Math.round(s) + 's';
  }
  return ms;
};

function fillCircle(ctx, x, y, rad, redraw = false) {
  if (redraw)
    ctx.clearRect(x - rad - 1, y - rad - 1, rad * 2 + 1, rad * 2 + 1);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, rad, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function strokeCircle(ctx, x, y, rad, bold = 2, redraw = false) {
  ctx.lineWidth = bold;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.stroke();
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}