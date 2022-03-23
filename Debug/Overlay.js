'use strict';
// A layer to log debugging info to the
// Canvas. Currently allows text with a
// name and category, and named lines
// and dots (filled circles).
// To do; add instructions to clear,
// add a timer function (start, stop, avg)
// add better colours and backgrounds,
// line breaks...
const canvas =
  document.querySelector('.CanvasOverlay');
const ctx = canvas.getContext('2d');
const height =
  canvas.height = window.innerHeight;
const width = 
  canvas.width = window.innerWidth;

let textcolour = [135, 100, 20, 200];
let textsize = 12;
let catcolour = [5, 40, 10, 200];
let catsize = 10;
let shapecolour = [210, 160, 45, 200];
let gap = 5;
let catgap = 4;
let ident = 10;
let logs = [];
let shapes = [];

ctx.globalCompositeOperation = 'xor';

function dbglog(
 text, name, category, colour) {
  if (name == undefined) {name = '?'};
  if (category == undefined) {
    category = 'No category'
  };
  if (typeof(text) == 'object') {
    text = JSON.stringify(text);
  };
  if (text == undefined) {
    text = 'undefined'
  };
  if (colour == undefined) {
    colour = textcolour;
  };
  let log = {
    name: name,
    text: text,
    cat: category,
    colour: colour,
  };
  let updatelog = false;
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].name == name) {
      if (log.text == '+') {
        log.text = (logs[i].text + 1);
      };
      logs[i] = log;
      updatelog = true;
      break;
    };
  };
  if (updatelog == false) {
    if (log.text == '+') {
      log.text = 1;
    };
    logs.push(log);
  };
  updateOverlay();
}

function dbgline(start, end, name, rgba) {
  if (rgba == undefined) {
    rgba = shapecolour;
  };
  let line = {
    name: name,
    type: 'line',
    start: start,
    end: end,
    rgba: rgba,
  };
  let updateshape = false;
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].name == name) {
      shapes[i] = line;
      updateshape = true;
      break;
    };
  };
  if (updateshape == false) {
    shapes.push(line);
  };
  updateOverlay();
}

function dbgdot(pos, radius, name, rgba) {
  if (radius == undefined) {rad = 2;};
  if (rgba == undefined) {
    rgba = shapecolour;
  };
  let dot = {
    name: name,
    type: 'dot',
    x: pos.x,
    y: pos.y,
    radius: radius,
    rgba: rgba,
  };
  let updateshape = false;
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].name == name) {
      shapes[i] = dot;
      updateshape = true;
      break;
    };
  };
  if (updateshape == false) {
    shapes.push(dot);
  };
  updateOverlay();
}

function dbgrect(x, y, w, h, name, rgba) {
  if (name == undefined) {name = 'rect'};
  if (rgba == undefined) {
    rgba = shapecolour;
  };
  let rect = {
    name: name,
    type: 'rect',
    x: x,
    y: y,
    w: w,
    h: h,
    rgba: rgba,
  };
  let updateshape = false;
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].name == name) {
      shapes[i] = rect;
      updateshape = true;
      break;
    };
  };
  if (updateshape == false) {
    shapes.push(rect);
  };
  updateOverlay();
}

function updateOverlay() {
  ctx.clearRect(0, 0, width, height);
  // logs
  let cats = 0;
  let lastcat = '';
  logs = logs.sort(SortByCat);
  for (let i = 0; i < logs.length; i++) {
    let l = logs[i];
    if (l.cat != lastcat) {
      lastcat = l.cat;
      cats++;
      // log cat
      ctx.font =
        `${catsize}px sans-serif`;
      ctx.fillStyle =
        `rgba(${catcolour})`;
      ctx.fillText(
        l.cat,
        ident,
        ((i + 1) * (textsize + gap)) +
        ((cats - 1) * (catsize + gap +
        catgap))
      );
    };
    
    ctx.font = 
      `${textsize}px sanserif`;
    ctx.fillStyle = 
      `rgba(${l.colour})`;
    
    // need split long text...
    //console.log(ctx.measureText(l.text));
    ctx.fillText(
      (l.name + ': ' + l.text),
      10,
      ((i + 1) * (textsize + gap))  +
      (cats * (catsize + gap)) +
      ((cats - 1) * catgap)
    );
  };
  // shapes
  for (let i = 0; i < shapes.length; i++) {
    let s = shapes[i];
    if (s.type == 'line') {
      ctx.beginPath();
      ctx.moveTo(
        s.start.x,
        s.start.y
      );
      ctx.lineTo(
        s.end.x,
        s.end.y
      );
      ctx.strokeStyle =
        `rgba(${s.rgba})`;
      ctx.stroke();
    };
    if (s.type == 'dot') {
      ctx.beginPath();
      ctx.arc(
        s.x,
        s.y,
        s.radius,
        0,
        (Math.PI * 2),
      );
      ctx.fillStyle =
        `rgba(${s.rgba})`;
      ctx.fill();
    };
    if (s.type == 'rect') {
      //ctx.rect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle =
        `rgba(${s.rgba})`;
      //ctx.stroke();
      ctx.strokeRect(s.x, s.y, s.w, s.h);
    };
  };
}

function SortByCat(x, y) {
  return x.cat.localeCompare(y.cat);
}

export {
  dbglog,
  dbgline,
  dbgdot,
  dbgrect,
};
