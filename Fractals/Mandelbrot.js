'use strict';
// Calculates the Mandelbrot set and
// returns the requested sections.
// Delegates calulations per line
// to MandLine worker which delegates
// to point workers.

import {cn, cadd, csub, cmul}
  from '../ComplexNumbers.js';
  
import {ColourArray, FillColourArray}
  from './Colours/Colour.js';

import {Dpp, TopLeft, Zero, SetZero, height,
  width, xycn, cnxy, SetLsqArea, Plot}
  from '../ComplexPlane.js';
  
import {dbglog, dbgline, dbgdot, dbgrect}
  from '../Debug/Overlay.js';

let escname = 'rplusi';
// let escname = 'sqrtabsrxi';
// let escname = 'vector';

let lw = new Worker(
  ('./Fractals/Workers/MandLine.js?' +
    escname), {type: 'module'}
);

// General settings
// to do: implement a menu...
let Iterations = 5000;
let esclim = 2;
// Data for requests
let RequestQueue = [];
let l = {};
let line;
let Escapes;
let Mandelbrot;
let M = {
  request: GetMandelbrot,
  iterations: Iterations,
  escapename: escname,
};
// Setup colours
FillColourArray(Iterations);

async function GetMandelbrot(
  c, gDpp, gwidth, gheight) {
  // Returns a Promise that resolves
  // to an Object that contains the
  // image data, the location in the
  // complex plane, ...wip
  let request = {
    mresultresolve: {},
    mresultreject: {},
    c: new cn(c.r, c.i), 
    Dpp: gDpp,
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
    // dbglog('+', 'next', 'mand');
    NextRequest();
  };
  return request.mandelbrot;
  
  async function NextRequest() {
    // Once started, this function
    // calls itself recursively until
    // there are no requests waiting.
    // currently plane only sends one at
    // a time anyway, but this may change.
    let r = RequestQueue[0];
    TrimRequest();
    // Check if trim has removed...
    if((r.gwidth > 0) && 
       (r.gheight > 0)) {
      // Send request for processing
      //dbglog('+', 'mdbsent', 'mand');
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
      /* dbglog(
        RequestQueue.length, 'rlen', 'mand'
      ); */
      NextRequest();
    };
    function TrimRequest() {
      // dbglog('+', 'trim', 'mand');
      // dbglog(r.Dpp, 'dpp', 'mand');
      if (r.Dpp != Dpp) {
        r.gheight = 0;
        // dbglog('+', 'tdpp', 'mand');
        return;
      };
      // get current pos for c
      let cpos = cnxy(r.c, true);
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
  Escapes = new Uint16Array(l.x * l.y);
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
    case 'result': // redundant now?
      processresult();
      break;
    case 'msg':
      logmsg();
      break;
    case 'dbg':
      dbg();
      break;
    default:
      processresult();
      break;
      // console.log(event);
  };
  function processresult() {
    //dbglog('+', 'mdbproc', 'mand');
    //console.log(event.data);
    Escapes.set(
      event.data, l.p * l.len
    );
    /*
    let nb = new Uint16Array(
      Escapes.length + event.data.length
    );
    nb.set(Escapes);
    nb.set(event.data, Escapes.length);
    Escapes = nb;
    */
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
  function dbg() {
    dbglog(
      event.data.msg,
      event.data.name,
      'MANDELBROT'
    );
  };
};
lw.onerror = function(event) {
  console.log(
    'lw error!', event.message +
    " (" + event.filename +
    ":" + event.lineno + ")"
  );
};

function processEscapes() {
  // flatten seems reasonably fast but
  // can probably be avoided by either
  // doing each row as it's returned, or
  // re-writing the below loops...
  /*
  dbglog(
    'mand data length ' +
    `${Mandelbrot.data.length / 4}` +
    ' Escapes length ' +
    `${Escapes.length} ${Escapes[200]}`,
    'PE', 'MANDELBROT')
  */
  //console.log(Escapes);
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
  //Escapes = flatten(Escapes, Uint16Array);
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
let bz;
function bezM() {
  const axis  =
   document.querySelector('.CanvasAxis');
  const ctx = axis.getContext('2d');
  let colour = [255,255,200,255];
  let c = cnxy({r: (1/4), i: 0}) // cusp
  let r = (c.x - Zero.x);
  
  if (bz == undefined) {
    let z = 51;
    bz = {
      a: (28 / z),
      b: (8 / z),
      c: (39 / z),
      d: (63 / z),
      e: (69 / z),
      f: (168 / z),
      g: (198 / z),
      h: (123 / z),
    };
  };
  
  // dbglog(c, 'cusp', 'mand');
  // dbglog(bz, 'bez', 'mand');
  
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  // cusp to point with same real (0.25)
  ctx.bezierCurveTo(
    (c.x + (r * bz.a)), 
     (c.y - (r * bz.b)),
    (c.x + (r * bz.c)),
     (c.y - (r * bz.d)),
    c.x, (c.y - (2 * r))
  );
  // to point on axis opposite cusp
  ctx.bezierCurveTo(
    (c.x - (r * bz.e)),
    (c.y - (r * bz.f)),
    (c.x - (r * bz.g)),
    (c.y - (r * bz.h)),
    (c.x - (4 * r)), c.y
  );
  ctx.bezierCurveTo(
    (c.x - (r * bz.g)),
    (c.y + (r * bz.h)),
    (c.x - (r * bz.e)),
    (c.y + (r * bz.f)),
    c.x, (c.y + (2 * r))
  );
  ctx.bezierCurveTo(
    (c.x + (r * bz.c)),
    (c.y + (r * bz.d)),
    (c.x + (r * bz.a)),
    (c.y + (r * bz.b)),
    c.x, c.y
  );
  ctx.closePath();
  ctx.strokeStyle =
   `rgba(${colour})`;
  ctx.stroke();
  ctx.arc(
    c.x - (5 * r), c.y, r, 0, 6.3
  );
  ctx.stroke();
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

export {
  GetMandelbrot,
  Iterations,
  bezM,
  M as Mand,
};
