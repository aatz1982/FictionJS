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

function starttouch(event) {
  event.preventDefault(); // unless mouse
  touches = event.changedTouches;
  for (let i = 0;
       i < touches.length; i++) {
    ongoingTouches.push(
      copyTouch(touches[i]));
    if (Touch1 == -1) {
      Touch1 = touches[i].identifier;
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
        let pos = {
          x: Math.round(
            (touches[i].pageX -
          ongoingTouches[idx].pageX)),
          y: Math.round(
            (touches[i].pageY -
          ongoingTouches[idx].pageY))};
        Move(pos);
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
        let pos = {
          x: Math.round(
            (touches[i].pageX -
            ongoingTouches[idx].
            pageX)),
          y: Math.round(
            (touches[i].pageY -
            ongoingTouches[idx].
            pageY))};
        Move(pos);
        Touch1 = -1;
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

export {startinputlisteners};