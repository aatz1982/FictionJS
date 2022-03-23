'use-strict';
import {cn, intcn}
  from '../ComplexNumbers.js';
import {
  ctxc, 
  ctxa, 
  xycn, 
  cnxy, 
  intxy, 
  height, 
  width
} from '../ComplexPlane.js';
import {dbglog, dbgline, dbgdot, dbgrect}
  from '../Debug/Overlay.js';

function cremonaC(
 n, cen, rad, rot, colour) {
  // Cardioid as a pencil of lines
  // (method of Louis Cremona)
  if (n == undefined) {n = (27 * 3)};
  if (cen == undefined) {
    cen = new cn(0, 0);
  };
  if (rad == undefined) {rad = (3/4);};
  if (rot == undefined) {rot = (Math.PI)};
  let d = true; // true = draw to plane
  if (colour == undefined) {d = false};
  let ctx = ctxa;
  let p = cPoints(cen, rad, n, rot);
  let card = [];
  if (d) ctx.beginPath();
  let p0 = cnxy(p[0]);
  if (d) ctx.moveTo(p0.x, p0.y);
  card[0] = p[1];
  let xy = cnxy(card[0]);
  if (d) ctx.lineTo(xy.x, xy.y);
  for (let i = 1; i < (n - 1); i++) {
    let z = (i * 2);
    card[i] = intcn(
      p[i],
      p[(z % n)],
      p[((i + 1) % n)],
      p[((z + 2) % n)]
    );
    //dbglog(card[i], `card ${i}`, 'cremona');
    //dbglog(p[i], `p${i}`, 'cremona');
    if (d) {
      xy = cnxy(card[i]);
      //dbglog(xy, `xy ${i}`, 'cremona');
      ctx.lineTo(xy.x, xy.y);
    };
    /*
    dbglog(card[i], `card ${i}`, 'cremona');
    dbglog(p[i], `p${i}`, 'cremona');
    dbgdot(p[i], 2, `p${i}`);
    dbgline(p[i], p[((i * 2) % n)],`cl${i}`);
    dbgdot(intxy(
      p[i], p[i * 2],
      p[i + 1], p[((i + 1) * 2) % n]),
      2, `crem${i}`,
      dbgc
    );
    */
  };
  card[n - 1] = p[n - 1];
  if (d) {
    xy = cnxy(card[n - 1]);
    ctx.lineTo(xy.x, xy.y);
    ctx.lineTo(p0.x, p0.y);
    ctx.closePath();
    ctx.strokeStyle = `rgba(${colour})`;
    ctx.stroke();
  };
  return card;
}

function cPoints(centre, radius, n, zero) {
  // Returns n points around a circle.
  // centre: complex num, radius: real num,
  // n: num points on circle,
  // zero: clockwise offset in radians p0
  if (zero == undefined) {zero = 0};
  let p = []; // points
  let pi2 = (2 * Math.PI);
  let dt = (pi2 / n);
  for (let i = 0; i < n; i++) {
    let theta = (((i * dt) + zero) % pi2);
    p[i] = {
      r: (centre.r + 
       (radius * Math.cos(theta))),
      i: (centre.i +
       (radius * Math.sin(-theta))),
    };
  };
  return p;
}

function crect(
  x, y, w, h, r, fill, ol, ctx, fseo) {
  // Draws a rectangle with curved 1/4 
  // circle corners, aka a rounded rectangle
  // or if the curves meet at one side a 
  // 'Stadium' or 'Discorectangle'.
  // fseo==true inverts (fills outside).
  // fill/ol(outline)=rgba arrays or udef.
  ctx.beginPath();
  if (fseo == true) { // outside box
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, 0);
  };
  ctx.moveTo((x + r), y);
  ctx.lineTo((x + w) - r, y);
  ctx.quadraticCurveTo(
    (x + w), y, (x + w), (y + r)
  );
  ctx.lineTo((x + w), y + h - r);
  ctx.quadraticCurveTo(
    (x + w), (y + h), ((x + w) - r), (y + h)
  );
  ctx.lineTo((x + r), (y + h));
  ctx.quadraticCurveTo(
    x, (y + h), x, ((y + h) - r)
  );
  ctx.lineTo(x, (y + r));
  ctx.quadraticCurveTo(
    x, y, (x + r), y
  );
  ctx.closePath();
  if (ol != undefined) {
    ctx.strokeStyle = `rgba(${ol})`;
    ctx.stroke();
  };
  if (fill != undefined) {
    ctx.fillStyle = `rgba(${fill})`;
    if (fseo != true) {
      ctx.fill();
    } else {
      ctx.fill('evenodd');
    };
  };
};

export{cremonaC, crect};
