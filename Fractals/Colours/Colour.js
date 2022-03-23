'use-strict';
// Colour related functions
import {dbglog}
 from '../../Debug/Overlay.js';
let ColourArray = [];
let rbow = [];
let Iterations;

function FillColourArray(iterations) {
  setRbow();
  Iterations = iterations;
  for (let i = 0;
   i <= Iterations; i++) {
    //ColourArray.push(
    //  ...blend(newFade(i), newFade2(i))
    //);
    ColourArray.push(
      ...rbowFade(i)
    );
  };
  //FadeColourArray();
  EndDarken(200);
  colourSet();
}

function EndDarken(len) {
  // Linear darken
  const it = Iterations;
  const ro = Math.round;
  let z = (1 / len);
  let d = 0;
  let a = ColourArray;
  for (let i = (4 * (it - len));
   i < it * 4; i += 4) {
    let c = (1 - (d * z));
    for (let ii = 0; ii < 3; ii++) {
      let iii = (i + ii);
      a[iii] = ro(c * a[iii]);
    };
    d++;
  };
}

function FadeColourArray() {
  const it = Iterations;
  const ro = Math.round;
  let z = (2);
  let f = (255 / it);
  let a = ColourArray;
  for(
   let i = 0; i < it * 4; i+= 4) {
    let c = (
      (z / (i / it))
    );
    for (let ii = 0; ii < 3; ii++) {
      let iii = (i + ii);
      a[iii] = (
        (a[iii] > c) ? 
        ro((c + a[i + ii]) / 2) :
         a[iii]
      );
    };
  };
}

function white(num) {
  // probably quicker way...
  return [255, 255, 255, 255];
}

function colourSet(colour) {
  // Last colour is the set itself
  if (colour == undefined) {
    colour = [0, 0, 0, 255];
  };
  for (let i = 0; i < 4; i++) {
    ColourArray[(Iterations * 4) + i] =
     colour[i];
  };
}

function BlackWhite (num) {
  // Return black for even/white for odd
  if ((num % 2) == 0) {
    return [0, 0, 0, 255];
  } else { 
    return [255, 255, 255, 255];
  };
}

function WhiteToBlackFade(num) {
  let f = (255 - Math.round(
    (255 / Iterations) * num));
  return [f, f, f, 255];
}

function WhiteBlueBlackFade(num) {
  let r = (255 - Math.round(
    (255 / (Iterations / num)) * num));
  let g = (255 - Math.round(
    (255 / (Iterations / 1.5)) * num));
  let b = (255 - Math.round(
    (255 / Iterations) * num));
  return [r, g, b, 255];
}

function newFade(n) {
  // kind of offset mod/multiply?
  // need non-linear one though...
  n = n + 626;
  let a = 255;
  let rm = a * 3;
  let gm = a * 2;
  let bm = a;
  let r = a - (((n % (rm)) * 11)% a);
  let g = a - (((n % (gm)) * 7) % a);
  let b = a - (((n % (bm)) * 5) % a);
  return [r, g, b, 255];
}

function newFade2(n) {
  // kind of offset mod/multiply?
  // need non-linear one though...
  n = n + 626;
  let a = 255;
  let rm = a * 3;
  let gm = a * 2;
  let bm = a;
  let r = a - (((n % (rm)) * 17) % a);
  let g = a - (((n % (gm)) * 13) % a);
  let b = a - (((n % (bm)) * 23) % a);
  return [r, g, b, 255];
}

function blend(a, b, z) {
  // blends two rgba (a & b) with z bias
  // (with full alpha, not blended)
  // a/b = [r,g,b,a], z = 0<>1 (a=0, b=1)
  if (z == 0) {return a};
  if (z == 1) {return b};
  if ((z == undefined) ||
   (z > 1) || (z < 0)) {
    z = (0.5);
  };
  let c = [];
  for (let i = 0; i < 3; i++) {
    c[i] = Math.round(
      ((b[i] * z) + (a[i] * (1 - z)))
    );
  };
  c[3] = 255;
  return c;
};

function rbowFade(n, x) {
  if(x == undefined) {x = 16};
  n = (n + (x * 5));
  let y = (n / x);
  let z = (1 / x);
  let f = ((n * z) % 1);
  let a = Math.floor(y % 6);
  let b = Math.floor((y + 1) % 6);
  let c = blend(rbow[a], rbow[b], f);
  return c;
}

function setRbow() {
  rbow[0] = [245, 10, 35, 255];
  rbow[1] = [245, 175, 65, 255];
  rbow[2] = [225, 245, 10, 255];
  rbow[3] = [10, 200, 65, 255];
  rbow[4] = [15, 210, 250, 255];
  rbow[5] = [5, 12, 175, 255];
  rbow[6] = [245, 15, 240, 255];
}

export{
  ColourArray,
  FillColourArray,
};