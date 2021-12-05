// A layer to log debugging info to the
// Canvas. Currently allows text with a
// name and category, and named lines
// and dots (filled circles).
// To do; add instructions to clear,
// add a timer function (start, stop, avg)
// add better colours and backgrounds,
// line breaks...
const canvas =
  document.querySelector('.CanvasDebug');
const ctx = canvas.getContext('2d');
const height =
  canvas.height = window.innerHeight;
const width = 
  canvas.width = window.innerWidth;

let textcolour = [10, 100, 20, 200];
let textsize = 12;
let catcolour = [5, 40, 10, 200];
let catsize = 10;
let shapecolour = [150, 10, 20, 200];
let gap = 5;
let catgap = 4;
let ident = 10;
let logs = [];
let shapes = [];

ctx.globalCompositeOperation = 'xor';

function dbglog(text, name, category) {
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
  let log = {
    name: name,
    text: name + ': ' + text,
    cat: category,
  };
  let updatelog = false;
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].name == name) {
      logs[i] = log;
      updatelog = true;
      break;
    };
  };
  if (updatelog == false) {
    logs.push(log);
  };
  updateOverlay();
}

function dbgline(start, end, name) {
  let line = {
    name: name,
    type: 'line',
    start: start,
    end: end,
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

function dbgdot(pos, radius, name) {
  if (radius == undefined) {rad = 2};
  let dot = {
    name: name,
    type: 'dot',
    x: pos.x,
    y: pos.y,
    radius: radius,
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
      `rgba(${textcolour})`;
    
    // need split long text...
    //console.log(ctx.measureText(l.text));
    ctx.fillText(
      l.text,
      10,
      ((i + 1) * (textsize + gap))  +
      (cats * (catsize + gap)) +
      ((cats - 1) * catgap)
    );
  };
  // shapes
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].type == 'line') {
      ctx.beginPath();
      ctx.moveTo(
        shapes[i].start.x,
        shapes[i].start.y
      );
      ctx.lineTo(
        shapes[i].end.x,
        shapes[i].end.y
      );
      ctx.strokeStyle =
        `rgba(${shapecolour})`;
      ctx.stroke();
    };
    if (shapes[i].type == 'dot') {
      ctx.beginPath();
      ctx.arc(
        shapes[i].x,
        shapes[i].y,
        shapes[i].radius,
        0,
        6.3 // do less lazy math?
      );
      ctx.fillStyle =
        `rgba(${shapecolour})`;
      ctx.fill();
    };
  };
}

function SortByCat(x, y) {
  return x.cat.localeCompare(y.cat);
}

export {dbglog, dbgline, dbgdot};