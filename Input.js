'use strict';
// Handles input events
import {MenuButton,
} from './Menu/Button.js';
import {Menu,
} from './Menu/Menu.js';
import {Move, StretchZoom, distxyxy, midxyxy
} from './ComplexPlane.js';
import {dbglog, dbgline, dbgdot,
} from './Debug/Overlay.js';

const canvas =
  document.querySelector('.CanvasMenu');
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
let Input = {
  touches: t,
  reset: resetInput
};
function resetInput() {
  t.t1.mode = 'move';
  MenuButton.active = true;
  MenuButton.draw();
}
resetTouchObj();
function resetTouchObj() {
  t.count = 0; // number of current touches
  t.touches = []; // last known positions
  t.changes = []; // new positions
  t.moves = 0; // total number move events
  t.t1 = {};
  t.t2 = {};
  t.t1.mode = 'move';
  resetTouch1();
  resetTouch2();
}
function resetTouch1() {
  t.t1.id = -1; // -1 is not assigned
  if (t.t1.mode != 'menu') {
    t.t1.mode = 'move';
  };
  t.t1.events = 0;
}
function resetTouch2() {
  t.t2.id = -1;
  t.t2.mode = 'zoom';
  t.t2.events = 0;
}
function swapt1t2() { // probably overkill?
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
      Touch1Event(
        t.changes[i],
        null,
        'start',
      );
    } else {
      if (t.t2.id == -1) {
        t.t2.id = t.cid;
        Touch2Event(
          t.changes[i],
          null,
          'start',
        );
      };
    };
  };
  // updatedbg();
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
    //dbglog(idx, 'last midx','Touch Zoom');
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
  // updatedbg();
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
        resetTouch1(); // unassign t1
        swap = true; // make t2 take t1
      } else {
        if (t.t2.id == t.cid) {
          Touch2Event(
            t.changes[i],
            t.touches[idx],
            'end',
          ); // fix t2 zoom end...
          resetTouch2(); // unassign t2
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
  // updatedbg();
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
        resetTouch1(); // unassign
      } else {
        if (t.t2.id == t.cid) {
          Touch2Event(
            t.changes[i],
            t.touches[idx],
            'canc',
          );
          resetTouch2(); // unassign
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
  // updatedbg();
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
  if (ttype != 'start') {
    t.t1.dif = {
      x: Math.round(
        (touch.pageX -
        prevtouch.pageX)),
      y: Math.round(
        (touch.pageY -
        prevtouch.pageY))
    };
    z.dif1 = t.t1.dif;
  };
  
  t.t1.pos = {
    x: touch.pageX,
    y: touch.pageY,
  };
  
  z.pos1 = t.t1.pos;
  
  if ((ttype == 'start') &&
   (MenuButton.active == true)) {
    if (touchMenuButton(t.t1.pos)) {
      t.t1.mode = 'menubutton';
    };
  };
  
  switch (t.t1.mode) {
    case 'move':
      if (ttype == 'start') {return};
      CPMove(t.t1.dif);
      break;
    case 'zoom':
      if (ttype == 'start') {return};
      t1zoom();
      break;
    case 'menu':
      Menu.x = t.t1.pos.x;
      Menu.y = t.t1.pos.y;
      switch (ttype) {
        case 'start':
          Menu.touchstart();
          break;
        case 'move':
          Menu.touchmove();
          break;
        case 'end':
          Menu.touchend();
          break;
      };
      break;
    case 'menubutton':
      if (ttype == 'end') {
        if (touchMenuButton(t.t1.pos)) {
          t.t1.mode = 'menu';
          MenuButton.press();
        } else {
          resetTouch1();
        };
      };
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
    if (t.t1.mode == 'move') {
      t.t1.mode = 'zoom';
    };
    if (t.t1.mode == 'menu') {
      t.t2.mode = 'menu';
    };
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
  
  switch (t.t2.mode) {
    case 'zoom':
      if (ttype == 'end') {
        CPStretchZoom(true); // apply
        t.t1.mode = 'move';
      } else {
        CPStretchZoom(false); // update
      };
      break;
    case 'menu' :
      // to do if/when required
      break;
  };
}

function CPStretchZoom(apply) {
  // quick fix... improve...?
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
}

function touchMenuButton(to) {
  let x = to.x;
  let y = to.y;
  let mb = MenuButton;
  if (
    ((x > mb.x) &&
    (x < (mb.x + mb.w)))
    && 
    ((y > mb.y) &&
    (y < (mb.y + mb.h)))
  ) {
    return true;
  };
  return false;
}

function updatedbg() {
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

export {
  startinputlisteners, 
  Input
};
