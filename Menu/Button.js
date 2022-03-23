'use-strict';
import {cremonaC, crect}
  from '../Plane/Shapes.js';
import { dbglog, dbgline, dbgdot, dbgrect }
  from '../Debug/Overlay.js';
import {Menu}
  from './Menu.js';
  
const menu =
  document.querySelector('.CanvasMenu');
const ctxm = menu.getContext('2d');
const height =
  menu.height = window.innerHeight;
const width =
  menu.width = window.innerWidth;
  
let b = {};
b.draw = draw;
b.press = press
b.active = true;

function press() {
  clear();
  Menu.open();
  b.active = false;
}

function clear() {
  ctxm.clearRect(0, 0, width, height);
}

function draw () {
  ctxm.globalAlpha = 0.2;
  b.olc = [0, 0 , 0, 20];
  b.fc = [0, 0 , 0, 15];
  b.w = (
    (width * height / (width + height)) / 5
  );
  b.h = b.w;
  b.r = (b.w / 6);
  b.x = (width - b.w - 30);
  b.y = 30;
  crect(
    b.x, b.y, b.w, b.h, b.r,
    b.fc, null, ctxm,
  );
  logo();
  b.visible = true;
  ctxm.globalAlpha = 1;
}

function logo() {
  let cen = {
    x: (b.x + (b.w / 2)),
    y: (b.y + (b.h / 1.5)),
  };
  let r = (b.w / 4);
  let z = {r: cen.x, i: cen.y};
  let n = 32;
  let pi2 = (Math.PI * 2);
  let card = cremonaC(
    n, null, r, ((3 * Math.PI) / 2),
  );
  let p0 = {x: cen.x, y: (cen.y - r)};
  const ctx = ctxm;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  for (let i = 0; i < n; i++) {
    ctx.lineTo(
      cen.x + card[i].r,
      cen.y - card[i].i
    );
    //dbglog(card[i], `card ${i}`, 'logo');
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
  ctx.lineTo(p0.x, p0.y);
  ctx.closePath();
  ctx.strokeStyle = 
   `rgba(${[100, 100, 100, 100]})`;
  //ctx.stroke();
  
  ctx.fillStyle =
    `rgba(${[255, 255, 255,255]})`;
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(
    cen.x, ((cen.y - r) - (r / 3)),
    (b.r / 2), 0, pi2
  );
  ctx.closePath();
  //ctx.stroke();
  ctx.fill();
}
  
export{
  b as MenuButton,
};
