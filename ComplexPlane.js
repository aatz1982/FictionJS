// Functions etc to draw part of the 
// Complex Plane into the HTML Canvas.
'use strict';
import {cn}
  from './ComplexNumbers.js';
import {GetMandelbrot}
from './Fractals/Mandelbrot.js';

let TopLeft; // Where in CP is Canvas 0,0
let Lsq; // Largest (centered) square
let Zero; // Where is 0 relative TopLeft
let Dpp; // Distance per-pixel
let BackColour = [0, 0, 0, 255];
let ForeColour = [255, 255, 255, 255];
let AxisColour = [150, 150, 255, 200];
let Display = 'Mandelbrot'; // to do...
let Requests = []; // To queue requests

const canvas =
  document.querySelector('.CanvasPlane');
const axis  =
  document.querySelector('.CanvasAxis');
  
const ctxc = canvas.getContext('2d');
const ctxa = axis.getContext('2d');

// CanvasResToMax(); // Can call here
// doesn't work in IFrame...

const height = axis.height =
  canvas.height = window.innerHeight;
const width = axis.width =
  canvas.width = window.innerWidth;
const pix = height * width;
  
function xycn(x, y) {
  // return the complex number from coord
  let c = new cn(
    (TopLeft.r + (x * Dpp)),
    (TopLeft.i - (y * Dpp)));
  return c;
}

function cnxy(c) {
  let pos = {
    x: Math.round(
      ((c.r - TopLeft.r) / Dpp)),
    y: Math.round(
      ((TopLeft.i - c.i) / Dpp)),
  };
  return pos;
}

function SetWholeCanvas(ctx, rgba) {
  if (rgba == undefined) {
    rgba = BackColour;
  };
  ctx.fillStyle = 'rgba(...rgba)';
  ctx.fillRect(0, 0, width, height);
}

function SetCanvasClear(ctx) {
  //SetWholeCanvas(ctx, [0, 0, 0, 0]);
  ctx.clearRect(0, 0, width, height);
}

function RepaintAxis() {
  SetCanvasClear(ctxa);
  PaintAxis(AxisColour);
}

function BlankPlane() {
  SetWholeCanvas(ctxc, BackColour);
  RepaintAxis(AxisColour);
  ForceCanvasRefresh(ctxc);
  SetupLsq();
  let upperLeft = new cn(-2, 2);
  let lowerRight = new cn(2, -2);
  SetLsqArea(upperLeft, lowerRight);
}

function SetZero(pos) {
  if (pos == 'centre') {
    Zero = {x:(Math.round(width / 2)),
            y:(Math.round(height / 2))};
  } else {
    Zero = {x:(Math.round(pos.x)),
            y:(Math.round(pos.y))};
    Zero.onscreen = 
      ((Zero.x >= 0) &&
       (Zero.y >= 0) &&
       (Zero.x <= width) &&
       (Zero.y <= height));
  };
  RepaintAxis();
}

function MoveZero(rel) {
  let pos = {
    x: (Zero.x + rel.x),
    y: (Zero.y + rel.y),
  };
  SetZero(pos);
}

function SetLsqArea(
    upperLeft, lowerRight) {
  Lsq.upperLeft = upperLeft;
  Lsq.lowerRight = lowerRight;
  SetDpp();
  SetTopLeft();
}

function SetDpp() {
  Dpp = ((Lsq.lowerRight.r -
          Lsq.upperLeft.r) /
          Lsq.width);
}

function SetupLsq() {
  if (height > width) {
    Lsq = {width: width};
    Lsq.offsetY = 
      Math.round((height - width) / 2);
      // Round so on a pixel
    Lsq.offsetX = 0;
  } else {
    if (width >= height) {
      Lsq = {width: height};
      Lsq.offsetX = 
        Math.round((width - height) / 2);
      Lsq.offsetY = 0;
    };
  };
}

function MoveLsq(relpos) {
  Lsq.upperLeft.r -= (Dpp * relpos.x);
  Lsq.upperLeft.i += (Dpp * relpos.y);
  Lsq.lowerRight.r -= (Dpp * relpos.x);
  Lsq.lowerRight.i += (Dpp * relpos.y);
}

function SetTopLeft() {
  TopLeft = new cn(
    (Lsq.upperLeft.r - 
      (Lsq.offsetX * Dpp)),
    (Lsq.upperLeft.i +
      (Lsq.offsetY * Dpp)));
}

function Move(relpos) {
  MoveZero(relpos);
  MoveLsq(relpos);
  SetTopLeft();
  Reposition(relpos); // Needs to go last
};

function Zoom(centre, z) {
  // centre {x, y}; z is Dpp multiplier
  // ... do a stretch then req whole cp?
  
  
}

function Reposition(r) {
  // r.x: +Right -Left;  r.y: +Down -Up
  let absx = Math.abs(r.x);
  let absy = Math.abs(r.y);
  //  _____________    _____________
  // |^x/y  |   |  |  | c .  row    |
  // |   ___v___|__|  | o ..........|
  // |  |^nx/ny |  |  | l .         |
  // |->|       |^ |  | u .         |
  // |__|_______|h |  | m .         |
  // |  |     <w   |  | n .         |
  // |__|__________|  |___._________|
  //   m obj (move)     n obj (need)
  //  up/left would be this inverted
  let m = { // rect to pickup & move:
    x: ((r.x < 0) ? (0 - r.x) : 0),
    y: ((r.y < 0) ? (0 - r.y) : 0),
    nx: ((r.x > 0) ? r.x : 0),
    ny: ((r.y > 0) ? r.y : 0),
    w: (width - absx),
    h: (height - absy),
  };
  let n = { // topleft rects need to req
    // column (cy will be 0 anyway)
    // may swap to row...
    cx: ((m.nx > 0) ? 0 : (m.w)),
    // row
    ry: ((m.ny > 0) ? 0 : (m.h)),
    rx: ((m.nx > 0) ? m.nx : 0),
  };
  // Request new column if required
  if (absx > 0) {
    let cc = xycn(n.cx, 0);
    Mandelbrot(cc, absx, height);
  };
  // Request new row if required
  if (absy > 0) {
    let rc = xycn(n.rx, n.ry);
    Mandelbrot(rc, (width - absx), absy);
  };
  // Move existing data
  const imageData = ctxc.getImageData(
    m.x, m.y, m.w, m.h);
  const data = imageData.data;
  ctxc.putImageData(
    imageData, m.nx, m.ny);
}

function Plot(pos, rgba) {
  // Just paint 1 pixel on the canvas
  // Pos is {x, y} 
  if (rgba == undefined) {
    rgba = ForeColour;
  };
  const imageData = ctxc.getImageData(
    pos.x, pos.y, 1, 1);
  const data = imageData.data;
  data[0] = rgba.splice(0, 1);
  data[1] = rgba.splice(0, 1);
  data[2] = rgba.splice(0, 1);
  data[3] = rgba.splice(0, 1);
  ctxc.putImageData(
    imageData, pos.x , pos.y);
}

function GetCol(cnum, ctx) {
  const imageData = ctx.getImageData(
    cnum, 0, 1, height);
  const data = imageData.data;
  let col = [];
  col = col.concat(
      ...data.slice(0, data.length));
  return col;
}
  
function GetColWholeCanvas(cnum, ctx) {
  const imageData = ctx.getImageData(
    0, 0, width, height);
  const data = imageData.data;
  let col = [];
  let row = width * 4;
  for (let i = (cnum * 4);
       i < data.length;
       i += row) {
    col = col.concat(
      ...data.slice(i, (i + 4)));
  };
  return col;
}

function SetCol(cnum, cdata, ctx) {
  const imageData = ctx.getImageData(
    cnum, 0, 1, height);
  const data = imageData.data;
  for (let i = 0;
       i < data.length; i++) {
    data[i] = cdata.splice(0, 1);
  };
  ctx.putImageData(imageData, cnum, 0);
}

function SetColWholeCanvas(
    cnum, cdata, ctx) {
  const imageData = ctx.getImageData(
    0, 0, width, height);
  const data = imageData.data;
  let row = width * 4;
  for (let i = (cnum * 4);
       i < data.length;
       i += row) {
    for (let ii = 0; ii < 4; ii++) {
      data[i + ii] = cdata.splice(0, 1);
    };
  };
  ctx.putImageData(imageData, 0, 0);
}

function GetRow(rnum, ctx) {
  const imageData = ctx.getImageData(
    0, rnum, width, 1);
  const data = imageData.data;
  let row = [];
  row = row.concat(...data.slice(
    0, (width * 4)));
  return row;
}

function SetRow(rnum, rdata, ctx) {
  const imageData = ctx.getImageData(
    0, rnum, width, 1);
  const data = imageData.data;
  let row = (width * 4)
  for (let i = 0;
       i < (width * 4); i++) {
    data[i] = rdata.splice(0, 1);
  };
  ctx.putImageData(imageData, 0, rnum);
}

function PaintAxisCentre() {
  const imageData = ctxa.getImageData(
      0, 0, width, height);
  const data = imageData.data;
  //paint y axis
  for (let i = ((canvas.width / 2) * 4);
           i < data.length;
           i += (4 * canvas.width)) {
    data[i]     = 255; // red
    data[i + 1] = 255; // green
    data[i + 2] = 255; // blue
  };
  //paint x axis
  var startpix = ((canvas.height / 2) *
    (canvas.width * 4));
  for (i = startpix;
       i < startpix + (canvas.width * 4);
       i += 4) {
    data[i]     = 255; // red
    data[i + 1] = 255; // green
    data[i + 2] = 255; // blue
  };
  ctx.putImageData(imageData, 0, 0);
}

function rgba2array(array, rgba) {
  // only for proper arrays at present
  // not Uint8ClamepedArray i.e. canvas
  for (let i = 0;
       i < array.length; i += 4) {
    array.splice(i, 4, ...rgba);
  };
}

function PaintAxis(rgba) {
  if (rgba == undefined) {
    rgba = AxisColour
  };
  if ((Zero == undefined) || 
   (!(Zero.hasOwnProperty('x') &&
      Zero.hasOwnProperty('y')))) {
    SetZero('centre');
  };
  //paint y axis if in view
  if ((Zero.x >= 0) &&
      (Zero.x <= width)) {
    let y = GetCol(Zero.x, ctxc);
    rgba2array(y, rgba);
    SetCol(Zero.x, y, ctxa);
  };
  //paint x axis if in view
  if ((Zero.y >= 0) &&
      (Zero.y <= height)) {
    let x = GetRow(Zero.y, ctxc);
    rgba2array(x, rgba);
    SetRow(Zero.y, x, ctxa);
  };
}

function CanvasResToMax() {
  // Assuming <html> has `width: 100%`.
  var iwidth = document.
    documentElement.clientWidth * 
    window.devicePixelRatio;
    
  var viewport = document.querySelector(
    "meta[name=viewport]");
  
  viewport.setAttribute(
    'content', 'width=' + 
    iwidth + ', minimum-scale: 1');
  
  document.documentElement.style.
    transform = 
      'scale( 1 / window.devicePixelRatio )';
    
  document.documentElement.style.
    transformOrigin = 'top left';
    
  ctxc.scale(1 / window.devicePixelRatio,
    1 / window.devicePixelRatio);
  ctxa.scale(1 / window.devicePixelRatio,
    1 / window.devicePixelRatio);
}
//document.querySelector("meta[name=viewport]").setAttribute('content', 'width=device-width, initial-scale='+(1/window.devicePixelRatio)+', maximum-scale=1.0, user-scalable=1');

function Refresh() {
  ForceCanvasRefresh(ctxc);
  ForceCanvasRefresh(ctxa);
}

function StartRefreshing() {
  if (!RefreshIntervId) {
    RefreshIntervId = 
      setInterval(Refresh(), 200);
  };
}

function StopRefreshing() {
  clearInterval(RefreshIntervId);
  RefreshIntervId = null;
}

function ForceCanvasRefresh(ctx) {
  const imageData = ctx.getImageData(
    0, 0, width, height);
  const data = imageData.data;
  const copydata = new
    Uint8ClampedArray(pix * 4);
  copydata.set(data);
  let imageDataCopy = new
    ImageData(copydata, width, height);
  ctx.putImageData(imageDataCopy, 0, 0);
}

async function Mandelbrot(
 c, gwidth, gheight) {
  // Default to whole canvas:
  if (c == undefined) {
    c = new cn(
      TopLeft.r,
      TopLeft.i);
  };
  if (gwidth == undefined) {
    gwidth = width;
  };
  if (gheight == undefined) {
    gheight = height;
  };
  // Max rows
  let refreshrows = 
    (Math.ceil((gheight / gwidth)));
  // Split request into smaller parts
  let split = Math.ceil(
    gheight / refreshrows);
  let Parts = [split];
  for (let i = 0; i < split; i++) {
    Parts[i] = {
      c: new cn(
        c.r,
        (c.i - (i * (refreshrows * Dpp)))
      ),
      w: gwidth
    };
    if ((i * refreshrows) <= gheight) {
      Parts[i].h = refreshrows;
    } else {
      Parts[i].h = (
       (i * refreshrows) - gheight);
    };
  };
  // enqueue part requests
  for (let i = 0; i < split; i++) {
    Requests.push(Parts.shift());
  };
  if (Requests.length == split) {
    NextRequest();
  };
  async function NextRequest() {
    let r = Requests[0];
    //console.log(Requests.length);
    r.mandelbrot = 
     await GetMandelbrot(
      r.c, 
      Dpp, 
      r.w, 
      r.h,
    );
    if (r.mandelbrot.Processed == true) {
      DataToCanvasC(
        r.mandelbrot.data,
        r.mandelbrot.w,
        r.mandelbrot.h,
        r.mandelbrot.c,
      );
    };
    // remove completed request
    Requests.shift();
    if (Requests.length > 0) {
      NextRequest();
    };
  };
}

function DataToCanvasXY(
  data, dwidth, dheight, x, y) {
  let imageData = new
    ImageData(data, dwidth, dheight);
  ctxc.putImageData(imageData, x, y);
}

function DataToCanvasC(
  data, dwidth, dheight, c) {
  let pos = cnxy(c);
  let imageData = new
  ImageData(data, dwidth, dheight);
  ctxc.putImageData(
    imageData, pos.x, pos.y);
}

export {
  BlankPlane,
  Zero,
  SetZero,
  Move,
  TopLeft,
  height,
  width,
  SetLsqArea,
  xycn,
  cnxy,
  Plot,
  Mandelbrot, // to change and not exp
};