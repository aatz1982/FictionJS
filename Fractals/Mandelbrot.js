'use strict';
// Calculates the Mandelbrot set and
// returns the requested sections.
// Delegates calulations per line
// to MandLine worker which delegates
// to point workers.

import {cn, cadd, csub, cmul}
  from '../ComplexNumbers.js';

import {TopLeft, Zero, SetZero, height,
  width, xycn, cnxy, SetLsqArea, Plot}
  from '../ComplexPlane.js';
  
let escname = 'sqrtabsrxi';
// let escname = 'vector';

let lw = new Worker(
  ('./Fractals/Workers/MandLine.js?' +
    escname), { type: 'module' });

let log1 = true;
//if (log1) {
    
// General settings
// to do: implement way to set settings
let Iterations = 60;
let esclim = 2;
// Data for requests
let RequestQueue = [];
let l = {};
let line;
let Escapes = [];
let Mandelbrot;
// Setup colours
let ColourArray = [];
FillColourArray(); // to improve later..

async function GetMandelbrot(
  c, Dpp, gwidth, gheight) {
  // Returns a Promise that resolves
  // to an Object that contains the
  // image data, the location in the
  // complex plane, ...wip
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
  // Push the request onto the queue
  RequestQueue.push(request);
  // If it's the only request, start,
  // if not assume already running
  if (RequestQueue.length == 1) {
    NextRequest();
  };
  return request.mandelbrot;
  
  async function NextRequest() {
    // Once started this function
    // calls itself recursively until
    // there are no requests waiting.
    // need to add a trim... here?
    let r = RequestQueue[0];
    TrimRequest();
    if((r.gwidth > 0) && 
       (r.gheight > 0)) {
      // Send request for processing
      r.mresultresolve(
       await GetMandLines(r));
    } else {
      // Reject if offscreen
      r.mresultresolve(
        {mandelbrot:
          {Processed: 'not required'}
        }
      );
    };
    // Delete request from queue
    RequestQueue.shift();
    // If queue not empty start next req
    if (RequestQueue.length > 0) {
      NextRequest();
    };
    function TrimRequest() {
      // get current pos for c?
      let cpos = cnxy(r.c);
      
      //  console.log(cpos);
      //};
      // Right
      if ((cpos.x + r.gwidth) > width) {
        r.gwidth = (width - cpos.x);
      };
      // Bottom
      if ((cpos.y + r.height) > height) {
        r.gheight = (height - cpos.y);
      };
      // Left
      if (cpos.x < 0) {
        // to do write xycn in 2 halfs?
        r.c = xycn(0, cpos.y);
        r.gwidth = (r.gwidth + cpos.x);
      };
      // Top
      if (cpos.y < 0) {
        r.c = xycn(cpos.x, 0);
        r.gheight = (r.gheight + cpos.y);
      };
    };
  };
}

async function GetMandLines(request) {
  Mandelbrot = {}; // reset obj
  let r = request;
  l.p = 0;
  l.x = r.gwidth;
  l.y = r.gheight;
  l.c = new cn(r.c.r, r.c.i);
  l.Dpp = r.Dpp
  // switch for rows/columns
  if (l.y < l.x) {
    l.type = 'row';
    l.len = r.gwidth;
    l.count = r.gheight;
    l.step = new cn(r.Dpp, 0);
  } else {
    l.type = 'column';
    l.len = r.gheight
    l.count = r.gwidth;
    l.step = new cn(0, (0 - r.Dpp));
  };
  return new Promise(
    (resolve, reject) => {
      Mandelbrot = { c: r.c };
      Mandelbrot.w = l.x;
      Mandelbrot.h = l.y;
      Mandelbrot.data =
       new Uint8ClampedArray(
        ((l.x * l.y) * 4)
      );
      l.resolvegetrequest = resolve;
      l.rejectgetrequest = reject;
      line = {
        c: l.c,
        step: l.step,
        len: l.len,
        esclim: esclim,
        Iterations: Iterations,
      };
      // Start line worker (first line)
      lw.postMessage(line);
    }
  ); // End returned promise
}

// Actions to take when lw sends a msg
lw.onmessage = function(event) {
  //console.log(linelength);
  switch (event.data.type) {
    case 'result':
      processresult();
      break;
    case 'msg':
      logmsg();
      break;
    default:
      processresult();
      // console.log(event);
  };
  function processresult() {
    Escapes.push(event.data);
    // check if completed
    if (l.p == (l.count - 1)) {
      // if completed:
      processEscapes();
      Mandelbrot.Processed = true;
      l.resolvegetrequest(Mandelbrot);
    } else {
      // not completed: set next line
      let s = new cn(
        (0 - l.step.i),
        (0 - l.step.r)
      );
      l.c = cadd(l.c, s);
      line.c = l.c;
      l.p++;
      lw.postMessage(line); // next..
    };
  };
  function logmsg() {
    console.log(event.data.msg)
  };
};
lw.onerror = function(event) {
  console.log(
    'lw error!', event.message +
    " (" + event.filename +
    ":" + event.lineno + ")");
};

function processEscapes() {
  // flatten seems reasonably fast but
  // can probably be avoided by either
  // doing each row as it's returned, or
  // re-writing the below loops...
  function flatten(arrays, TypedArray) {
    let arr = new TypedArray(
      arrays.reduce(
        (n, a) => n + a.length,0)
    );
    let i = 0;
    arrays.forEach(
      a => {
        arr.set(a,i);
        i += a.length;
      }
    );
    return arr;
  };
  Escapes = flatten(
    Escapes, Uint16Array);
  let rgba;
  let i;
  let pos;
  if (l.type == 'row') {
    for (i = 0; 
         i < Escapes.length; i++) {
      pos = (i * 4);
      rgba = ColourArray.slice(
        (Escapes[i] * 4), 
        ((Escapes[i] * 4) + 4)
      );
      EscapeToRgba();
    };
  } else {
    // columns
    let z = (((l.x * l.y) - 1) * 4);
    let w = (l.x * 4);
    for (i = 0;
        i < (Escapes.length - 1); i++) {
      pos = ((i * w) % z);
      rgba = ColourArray.slice(
        (Escapes[i] * 4), 
        ((Escapes[i] * 4) + 4));
      EscapeToRgba();
    }
    // final point as mod z is 0
    pos = z;
    i = (Escapes.length - 1);
    rgba = ColourArray.slice(
      (Escapes[i] * 4),
      ((Escapes[i] * 4) + 4));
    EscapeToRgba();
  };
  Escapes = [];
  function EscapeToRgba() {
    Mandelbrot.data[pos] = rgba[0];
    Mandelbrot.data[pos + 1] = rgba[1];
    Mandelbrot.data[pos + 2] = rgba[2];
    Mandelbrot.data[pos + 3] = rgba[3];
  };
}

// Colour related functions
// to do: put in another place...
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
/*
async function GetMandRows(request) {
  rowsreq = request.gheight;
  colsreq = request.gwidth;
  rc = new cn (
    request.c.r, request.c.i);
  Dpp = request.Dpp
  return new Promise(
      (resolve, reject) => {
    Mandelbrot = {c: request.c};
    Mandelbrot.data = new
      Uint8ClampedArray(
      ((rowsreq * colsreq) * 4));
    resolvegetrequest = resolve;
    rejectgetrequest = reject;
    row = {
      c: rc,
      Dpp: Dpp,
      rwidth: colsreq,
      esclim: esclim,
      Iterations: Iterations,
    };
    rw.postMessage(row); // start worker
    }
  ); // end promise
};
async function GetMandCols(request) {
  colsreq = request.gwidth;
  rowsreq = request.gheight;
  cc = new cn(
    request.c.r, request.c.i);
  Dpp = request.Dpp
  return new Promise(
    (resolve, reject) => {
      Mandelbrot = { c: request.c };
      Mandelbrot.data = new
      Uint8ClampedArray(
        ((rowsreq * colsreq) * 4));
      resolvegetrequest = resolve;
      rejectgetrequest = reject;
      col = {
        c: cc,
        Dpp: Dpp,
        cheight: rowsreq,
        esclim: esclim,
        Iterations: Iterations,
      };
      cw.postMessage(col); // start cw
    }
  ); // end returned Promise
}; */



/*
// Actions to take when rw sends a msg
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
    // check if completed
    if (p == (rowsreq - 1)) {
      // if completed:
      processEscapes();
      resolvegetrequest(Mandelbrot);
    } else {
      // not completed set next row
      rc.i -= Dpp;
      row.c = rc;
      p++;
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

// Actions to take when cw sends a msg
cw.onmessage = function(event) {
  switch (event.data.type) {
    case 'result':
      processresult();
      break;
    case 'msg':
      logmsg();
      break;
  };
  function processresult() {
    // fix
    Escapes.push(
      ...event.data.escapes);
    // check if completed
    if (p == (colsreq - 1)) {
      // if completed:
      processEscapes();
      resolvegetrequest(Mandelbrot);
    } else {
      // not completed set next row
      cc.r += Dpp;
      col.c = cc;
      p++;
      cw.postMessage(col); // next..
    };
  };
  function logmsg() {
    console.log(event.data.msg)
  };
};
cw.onerror = function(event) {
  console.log(
    'cw error!', event.message +
    " (" + event.filename +
    ":" + event.lineno + ")");
};
*/

export {GetMandelbrot,DrawMandelbrot};