'use strict';
// Handles input events
import {
 Move, StretchZoom, distxyxy, midxyxy}
  from './ComplexPlane.js';
import {dbglog, dbgline, dbgdot}
  from './Debug/Overlay.js';

const canvas =
  document.querySelector('.CanvasInput');
const height =
  canvas.height = window.innerHeight;
const width =
  canvas.width = window.innerWidth;
  
function startinputlisteners () {
  // Input event listeners
  // Mouse:
  canvas.addEventListener(
    'mousedown',
    function(event) { 
      HandleMouseEvent(event,
        'mousedown'); });
      
  canvas.addEventListener(
    'mouseup',
    function(event) { 
      MoveZero(event,
        'mouseup'); });
      
  // Touchscreen:
  canvas.addEventListener(
    'touchstart',
    function(event) { 
      starttouch(event); });
  
  canvas.addEventListener(
    'touchmove',
    function(event) { 
      movetouch(event); });
      
  canvas.addEventListener(
    'touchend',
    function(event) { 
      endtouch(event); });
        
  canvas.addEventListener(
    'touchcancel',
    function(event) { 
      canceltouch(
        event); });
}

let t = {}; // touch info
let z = {}; // zoom info

resetTouchObj();

function resetTouchObj() {
  t.count = 0; // number of current touches
  t.touches = []; // last known positions
  t.changes = []; // new positions
  t.moves = 0; // total number move events
  t.t1 = {};
  t.t2 = {};
  resetTouch1();
  resetTouch2();
}
function resetTouch1 () {
  t.t1.id = -1; // -1 is not assigned
  t.t1.mode = 'move';
  t.t1.events = 0;
}
function resetTouch2() {
  t.t2.id = -1;
  t.t2.mode = 'zoom';
  t.t2.events = 0;
}
function swapt1t2() {
  const swap = Number(t.t1.id);
  t.t1.id = t.t2.id;
  t.t2.id = swap;
}

function resetZoom() {
  z.dist = 0;
  z.lastdist = 0;
  z.mid = 0;
  z.change = 0;
};

function starttouch(event) {
  event.preventDefault(); // unless mouse
  t.count++;
  t.changes = event.changedTouches;
  t.clen = t.changes.length;
  for (let i = 0; i < t.clen; i++) {
    t.touches.push(
      copyTouch(t.changes[i])
    );
    // If the touches being monitored are
    // not in use, assign the new touch:
    t.cid = t.changes[i].identifier;
    if (t.t1.id == -1) {
      t.t1.id = t.cid;
    } else {
      if (t.t2.id == -1) {
        t.t2.id = t.cid;
        t.t1.mode = 'zoom';
        Touch2Event(
          t.changes[i],
          null,
          'start',
        );
      };
    };
  };
  updatedbg();
}

function movetouch(event) {
  event.preventDefault();
  t.moves++
  t.changes = event.changedTouches;
  t.clen = t.changes.length;
  // Loop through changes
  for (let i = 0; i < t.clen; i++) {
    t.cid = t.changes[i].identifier;
    let idx = FindTouchById(t.cid);
    dbglog(idx, 'last midx', 'Touch Zoom');
    if (idx >= 0) {
      if (t.t1.id == t.cid) {
        Touch1Event(
          t.changes[i],
          t.touches[idx],
          'move',
        );
      } else {
        if (t.t2.id == t.cid) {
          Touch2Event(
            t.changes[i],
            t.touches[idx],
            'move',
          );
          dbglog(t.changes[i], 'i')
        };
      };
      // Update last known position
      t.touches.splice(
        idx, 1, copyTouch(t.changes[i])
      );
    } else {
      console.log(
        'movetouch - ',
        'idx not found:', idx
      );
    };
  };
  updatedbg();
}


function endtouch(event) {
  event.preventDefault();
  t.count--;
  t.changes = event.changedTouches;
  t.clen = t.changes.length;
  for (let i = 0; i < t.clen; i++) {
    t.cid = t.changes[i].identifier;
    let idx = FindTouchById(t.cid);
    let swap = false;
    if (idx >= 0) {
      if (t.t1.id == t.cid) {
        Touch1Event(
          t.changes[i],
          t.touches[idx],
          'end',
        );
        t.t1.id = -1; // unassign t1
        t.t1.mode = 'move';
        swap = true; // make t2 take t1
      } else {
        if (t.t2.id == t.cid) {
          Touch2Event(
            t.changes[i],
            t.touches[idx],
            'end',
          );
          t.t2.id = -1; // unassign t2
          t.t1.mode = 'move';
        };
      };
      t.touches.splice(idx, 1); // remove
      if (swap) {swapt1t2()};
    } else {
      console.log(
        'endtouch - ',
        'idx not found:', idx
      );
    };
  };
  updatedbg();
}

function canceltouch(event) {
  event.preventDefault();
  t.count--;
  t.changes = event.changedTouches;
  t.clen = t.changes.length;
  for (let i = 0;
   i < t.changes.length; i++) {
    t.cid = t.changes[i].identifier;
    let idx = FindTouchById(t.cid);
    if (idx >= 0) {
      if (t.t1.id == t.cid) {
        Touch1Event(
          t.changes[i],
          t.touches[idx],
          'canc',
        );
        t.t1.mode = 'move';
        t.t1.id = -1; // unassign
      } else {
        if (t.t2.id == t.cid) {
          Touch2Event(
            t.changes[i],
            t.touches[idx],
            'canc',
          );
          t.t2.id = -1; // unassign
          t.t1.mode = 'move';
        };
      };
      t.touches.splice(idx, 1); // remove
    } else {
      console.log(
        'canceltouch - ',
        'idx not found:', idx
      );
    };
  };
  updatedbg();
}

function FindTouchById(id) {
  for (let i = 0;
   i < t.touches.length; i++) {
    if (id ==  t.touches[i].identifier) {
      return i;
    };
  };
  return -1; // Not found
}

function copyTouch(
  { identifier, pageX, pageY }) {
  return { identifier, pageX, pageY };
}

function Touch1Event(
 touch, prevtouch, ttype) {
  t.t1.events++;
  t.t1.dif = {
    x: Math.round(
      (touch.pageX -
      prevtouch.pageX)),
    y: Math.round(
      (touch.pageY -
      prevtouch.pageY))
  };
  t.t1.pos = {
    x: touch.pageX,
    y: touch.pageY,
  };
  
  z.pos1 = t.t1.pos;
  z.dif1 = t.t1.dif;
  
  switch (t.t1.mode) {
    case 'move':
      CPMove(t.t1.dif);
      break;
    case 'zoom':
      t1zoom();
      break;
  };
  
  function t1zoom() {
    switch (ttype) {
      case 'end':
        CPStretchZoom(true);
        break;
      default:
      CPStretchZoom(false);
    };
  };
}

function CPMove(dif) {
  Move(dif);
}

function Touch2Event(
 touch, prevtouch, ttype) {
  t.t2.events++;
  
  t.t2.pos = {
    x: touch.pageX,
    y: touch.pageY,
  };
  
  z.pos2 = t.t2.pos;
  
  if (ttype == 'start') {
    return;
  };
  
  t.t2.dif = {
    x: Math.round(
      (touch.pageX -
        prevtouch.pageX)),
    y: Math.round(
      (touch.pageY -
        prevtouch.pageY))
  };
  z.dif2 = t.t2.dif;
  
  if (ttype == 'end') {
    CPStretchZoom(true);
  } else {
    CPStretchZoom(false);
    if (ttype == 'start') {dbglog('!!!')};
  };
}

function CPStretchZoom(apply) {
  // quick fix - to improve
  if (z.pos1 == undefined) {
    z.pos1 = {
      x: t.touches[t.t1.id].pageX,
      y: t.touches[t.t1.id].pageY,
    };
  };
  if (z.pos2 == undefined) {
    z.pos2 = {
      x: t.touches[t.t2.id].pageX,
      y: t.touches[t.t2.id].pageY,
    };
  };
  
  z.lastdist = z.dist;
  z.dist = distxyxy(
    z.pos1, z.pos2
  );
  z.mid = midxyxy(
    z.pos1, z.pos2
  );
  if (z.lastdist == 0) {return};
  
  z.change = z.dist - z.lastdist;
  
  StretchZoom(z.mid, z.change, apply);
  
  if (apply) {
    resetZoom();
  };
  
  // debugging:
  let cat = 'Touch Zoom';
  dbgline(z.pos1, z.pos2, 'diff');
  dbgdot(z.mid, 3, 'midpoint');
  let txt = `x: ${z.pos1.x} y: ${z.pos1.y}`;
  dbglog(txt, 'pos1', cat);
  txt = `x: ${z.pos2.x} y: ${z.pos2.y}`;
  dbglog(txt, 'pos2', cat);
  txt = `x: ${z.mid.x} y: ${z.mid.y}`;
  dbglog(txt, 'mid', cat);
  txt = `${z.dist} last: ${z.lastdist}`;
  dbglog(txt, 'dist', cat);
  dbglog(z.change, 'change', cat);
}

function updatedbg() {
  let cat = 'Touch Zoom';
  let log =
    `${t.count}` +
    ` clen: ${t.clen}` +
    ` cid: ${t.cid}` +
    ` moves: ${t.moves}`;
  dbglog(log, 'Touches', cat);
  dbglog(t.t1, 'Touch 1', cat);
  dbglog(t.t2, 'Touch 2', cat);
  dbglog(z, 'z', cat);
}

function HandleMouseEvent(
    event) {
      // to do... mouse input
  /*SetZero({x: (event.clientX),
           y: (event.clientY)},
           caller);*/
}

export {startinputlisteners};