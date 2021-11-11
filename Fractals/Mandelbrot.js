'use strict';
import {cn, cadd , csub, cmul}
  from '../ComplexNumbers.js';

import {TopLeft, Zero, SetZero, height,
        width, xycn, SetLsqArea, Plot}
  from '../ComplexPlane.js';
  
// let escname = 'sqrtabsrxi';
let escname = 'vector';
let rw = new Worker(
  ('./Fractals/Workers/MandRow.js?' +
    escname), {type: 'module'});

let Iterations = 60;
let esclim = 2;
let ColourArray = [];
let RequestQueue = [];

FillColourArray();
async function GetMandelbrot(
  c, Dpp, gwidth, gheight) {
  let request = {
    mresultresolve: {},
    mresultreject: {},
    c: new cn(c.r, c.i), 
    Dpp: Dpp,
    gwidth: gwidth,
    gheight: gheight,
  };
  request.mandelbrot = new Promise(
    (resolve, reject) => {
      request.mresultresolve = resolve;
      request.mresultreject = reject;
    }),
  RequestQueue.push(request);
  if (RequestQueue.length == 1) {
    NextRequest();
  };
  async function NextRequest() {
    RequestQueue[0].mresultresolve(
      await GetMandRows(
        RequestQueue[0]
      )
    );
    RequestQueue.shift();
    if (RequestQueue.length > 0) {
      NextRequest();
    };
  };
  return request.mandelbrot;
}



async function GetMandRows(request) {
  let rwidth = request.gwidth;
  let rheight = request.gheight;
  let rc = new cn (
    request.c.r, request.c.i);
  let Dpp = request.Dpp
  return new Promise(
      (resolve, reject) => {
    let Mandelbrot = {c: request.c};
    Mandelbrot.data = new
      Uint8ClampedArray(
      ((rwidth * rheight) * 4));
    let Escapes = [];
    //let rc = new cn(c.r, c.i);
    let row = {
      c: rc,
      Dpp: Dpp,
      rwidth: rwidth,
      esclim: esclim,
      Iterations: Iterations,
    };
    let rnum = 0;
    rw.onmessage = function(event) {
      switch (event.data.type) {
        case 'result':
          processresult();
          break;
        case 'msg':
          logmsg();
          break;
      };
      function processresult() {
        Escapes.push(
          ...event.data.escapes);
        if (rnum == (rheight - 1)) {
          processEscapes();
          resolve(Mandelbrot);
        } else {
          rc.i -= Dpp;
          row.c = rc;
          rnum++;
          rw.postMessage(row); // next..
        };
      };
      function logmsg() {
        console.log(event.data.msg)
      };
    };
    rw.onerror = function(event) {
      console.log(
        'rw error!', event.message +
        " (" + event.filename +
        ":" + event.lineno + ")");
    };
    function processEscapes() {
      for (let i = 0;
           i < Escapes.length; i++) {
        let pos = (i * 4);
        let col = ColourArray.slice(
          (Escapes[i] * 4), 
          ((Escapes[i] * 4) + 4));
        Mandelbrot.data[pos] = col[0];
        Mandelbrot.data[pos+1] = col[1];
        Mandelbrot.data[pos+2] = col[2];
        Mandelbrot.data[pos+3] = col[3];
      };
    };
    rw.postMessage(row); // start worker
    }
  ); // end promise...
};

function DrawMandelbrot() {
  // Original test, needs revision
  // Set Initial area
  let upperleft = new cn(-2, 1.5);
  let lowerright = new cn(1.5, -1);
  SetLsqArea(upperleft, lowerright);
  
  // each pixel
  for (let xp = 0;
       xp < width; xp++) {
    
    for (let yp = 0;
         yp < height; yp++) {
              
      let z = new cn(0, 0);
      let c = xycn(xp, yp);
    
      for (let i = 0;
           i < Iterations; i++) {
        
        z = cmul(z, z);
        z = cadd(z, c);
        
        if (Escape(z)) {
          Plot({x: xp, y: yp},
            WhiteToBlackFade(i));
          break;
        };
      };
    };
  };
}

function FillColourArray() {
  for (let i = 0;
       i <= Iterations; i++) {
    ColourArray.push(
      ...WhiteBlueBlackFade(i));
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

export {GetMandelbrot,DrawMandelbrot};