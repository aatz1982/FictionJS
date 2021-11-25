// Handles input events
import {Move}
  from './ComplexPlane.js';

const canvas =
  document.querySelector('.CanvasAxis');
  
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

var ongoingTouches = []; // last pos..
var touches = []; // new positions
var Touch1 = -1; // -1 = not assigned yet
var Touch2 = -1;

function starttouch(event) {
  event.preventDefault(); // unless mouse
  touches = event.changedTouches;
  for (let i = 0;
       i < touches.length; i++) {
    ongoingTouches.push(
      copyTouch(touches[i]));
    if (Touch1 == -1) {
      Touch1 = touches[i].identifier;
    } else {
      if (Touch2 == -1) {
        Touch2 = touches[i].identifier;
        // change Touch1 mode here?
      };
    };
  };
}

function movetouch(event) {
  event.preventDefault();
  touches = event.changedTouches;
  for (let i = 0;
       i < touches.length; i++) {
    let idx = ongoingTouchIndexById(
      touches[i].identifier);
    if (idx >= 0) {
      if (Touch1 == idx) {
        Touch1Event(
          touches[i],
          ongoingTouches[idx],
        );
      } else {
        if (Touch2 == idx) {
          // do stuff move
        };
      };
      ongoingTouches.splice(idx, 1,
        copyTouch(touches[i]));
    } else {
      console.log('movetouch - ',
        'idx not found:', idx);
    };
  };
}

function endtouch(event) {
  event.preventDefault();
  touches = event.changedTouches;
  for (let i = 0;
           i < touches.length; i++) {
    let idx = 
      ongoingTouchIndexById(
        touches[i].identifier);
    if (idx >= 0) {
      if (Touch1 == idx) {
        if (Touch1 == idx) {
          Touch1Event(
            touches[i],
            ongoingTouches[idx],
          );
        };
        Touch1 = -1;
      } else {
        if (Touch2 == idx) {
          // do stuff end
          Touch2 = -1;
        };
      };
      ongoingTouches.splice(idx, 1);
    } else {
      console.log('endtouch - ',
        'idx not found:', idx);
    };
  };
}

function canceltouch(event) {
  event.preventDefault();
  touches = event.changedTouches;
  for (let i = 0;
           i < touches.length; i++) {
    let idx = 
      ongoingTouchIndexById(
        touches[i].identifier);
    if (idx >= 0) {
      ongoingTouches.splice(idx, 1);
      if (Touch1 == idx) {
        Touch1 = -1;
      }else {
        if (Touch2 == idx) {
          Touch2 = -1;
        };
      };
    } else {
      console.log('canceltouch - ',
        'idx not found:', idx);
    };
  };
}

function ongoingTouchIndexById(
  idToFind) {
  for (var i = 0;
       i < ongoingTouches.length;
       i++) {
    var id = 
      ongoingTouches[i].identifier;
    if (id == idToFind) {
      return i;
    };
  };
  return -1; // not found
}

function copyTouch(
  { identifier, pageX, pageY }) {
  return { identifier, pageX, pageY };
}

function HandleMouseEvent(
    event) {
  /*SetZero({x: (event.clientX),
           y: (event.clientY)},
           caller);*/
}

function Touch1Event(touch, prevtouch) {
  let pos = {
    x: Math.round(
      (touch.pageX -
       prevtouch.pageX)),
    y: Math.round(
      (touch.pageY -
       prevtouch.pageY))};
  Move(pos);
}

export {startinputlisteners};