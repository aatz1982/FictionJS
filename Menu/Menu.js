'use-strict';
import {crect
} from '../Plane/Shapes.js';
import {dbglog, dbgline, dbgdot, dbgrect
} from '../Debug/Overlay.js';
import {Input
} from '../Input.js'
import {composite
} from '../Fiction.js'
import {AxisMenu
} from './SubMenus/AxisMenu.js'
import {FractalMenu
} from './SubMenus/FractalMenu.js'
  
export const menu =
  document.querySelector('.CanvasMenu');
export const ctxm = menu.getContext('2d');

let buttons = {}; buttons.all = [];
buttons.closeall = () => {
  for (let i = 0; 
   i < buttons.all.length; i++) {
    buttons.all[i].hide();
  };
}
export class btn { 
  constructor(name, x, y, w, h, border, r,
   olc, fc, hc, active, draw, press, 
   highlight, state) {
    if (name == undefined) {
      name = `${buttons.all.count + 1}`;
    }; // everything else can stay undef..
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.border = border;
    this.olc = olc; // outline colour
    this.fc = fc; // fill colour
    this.hc = hc; // highlight colour
    this.active = active;
    this.draw = draw; // function
    this.highlight = highlight; // function
    this.press = press; // function
    this.pressed = false;
    this.visible = false;
    this.state = state;
    buttons[this.name] = this;
    buttons.all.push(this);
    this.hide = () => {
      this.active = false;
      this.visible = false;
    };
  };
}

const canvas =
  document.querySelector('.CanvasPlane');
const ctxc = canvas.getContext('2d');

const height =
  menu.height = window.innerHeight;
const width =
  menu.width = window.innerWidth;

let m = {buttons: buttons}; // Menu object

// menu settings:
m.btnoutline =  [30, 30, 30, 0.25];
m.btnfill = [200, 200, 200, 0.1];
m.textcolour = [250, 250, 250, 0.4];
m.tickcolour = [120, 250, 120, 0.5];
m.tickbg = [80, 80, 80, 0.3];
m.crosscolour = [20, 20, 20, 0.5];
m.crossbg = [200, 200, 200, 0.5];
m.textsize = 16;
m.visible = false;
m.buttonpressed = '';

let bg = {}; m.bg = bg; // background
setbg(); // setup the menu background
addclosebtn(); // setup the close button
setupMenuEvents();
// imported submenu buttons:
AxisMenu.addbtn();
FractalMenu.addbtn();

function setupMenuEvents() {
  m.x = 0; // x, y for input coords
  m.y = 0;
  //m.draw = draw;
  m.close = close;
  m.touchstart = () => {
    let i = ButtonPressCheck();
    if (i >= 0) {
      buttons.all[i].pressed = true;
      m.buttonpressed = buttons.all[i].name;
    };
  };
  m.touchmove = () => {
    let i = ButtonPressCheck();
    if (i >= 0) {
      if (m.buttonpressed !=
       buttons.all[i].name) {
        buttons.all[i].pressed = false;
        m.buttonpressed = '';
      };
    } else {
      if (m.buttonpressed != '') {
        buttons[m.buttonpressed].pressed =
         false;
        m.buttonpressed = '';
      };
    };
  };
  m.touchend = () => {
    if (m.buttonpressed != '') {
      buttons[m.buttonpressed].press();
      m.buttonpressed = '';
    };
  };
  m.open = () => {
    buttons.close.visible = true;
    buttons.axis.visible = true;
    buttons.fractal.visible = true;
    m.draw();
    m.visible = true;
  };
  m.clear = () => {
    ctxm.clearRect(0, 0, width, height);
  };
  m.draw = () => {
    m.clear();
    drawbg(); // background
    for (let i = 0; 
     i < buttons.all.length; i++) {
      if (buttons.all[i].visible == true) {
        buttons.all[i].draw();
      };
    };
    dbglog(buttons, 'buttons', 'Menu');
  };
  m.reset = () => {
    buttons.closeall();
    m.open();
  };
}

function close() {
  // can't put straight into obj
  // due to precedence (I think?)
  m.clear();
  m.visible = false;
  Input.reset();
}

function setbg() {
  bg.border = 15;
  bg.olc = [100, 100, 100, 0.2]; // outline
  bg.fc = [250, 250, 250, 0.13]; // fill
  bg.x = bg.border;
  bg.y = bg.border;
  bg.w = (width - (bg.border * 2));
  bg.h = (height - (bg.border * 2));
  bg.r = (bg.w / 30);
}
function drawbg () {
  composite(2, 6); // bottom 2 lay, blur 6
  crect(
    bg.x, bg.y, bg.w, bg.h, bg.r,
    null, null, ctxm, true //<-true=invert
  );
  ctxm.filter = 'blur(24px)';
  ctxm.fillStyle = `rgba(${bg.fc})`
  ctxm.fill('evenodd');
  ctxm.filter = 'none';
  ctxm.globalCompositeOperation =
   'destination-out';
  ctxm.fillStyle = `rgba(255,255,255,1)`;
  ctxm.fill('evenodd');
  ctxm.globalCompositeOperation =
   'source-over';
  crect( // tint edges...
    bg.x, bg.y, bg.w, bg.h, bg.r,
    null, null, ctxm, // don't invert
  );
  ctxm.fillStyle = `rgba(${bg.fc})`;
  ctxm.fill();
}

function addclosebtn() {
  let cb = new btn('close');
  cb.border = 15;
  cb.olc = m.btnoutline // outline
  cb.fc = [200, 200, 200, 0.1]; // fill
  cb.w = (bg.w / 9);
  cb.h = cb.w;
  cb.x = (
    (bg.x + bg.w) - (cb.w + cb.border)
  );
  cb.y = (bg.y + cb.border);
  cb.r = (bg.w / 40);
  cb.draw = () => {
    crect(
      cb.x, cb.y, cb.w, cb.h, cb.r,
      cb.fc, null, ctxm,
    );
    // add a cross...
    ctxm.beginPath();
    ctxm.moveTo(
      (cb.x + (cb.w / 4)),
      (cb.y + (cb.h / 4))
    );
    ctxm.lineTo(
      ((cb.x + cb.w) - (cb.w / 4)),
      ((cb.y + cb.h) - (cb.h / 4))
    );
    ctxm.moveTo(
      (cb.x + (cb.h / 4)),
      ((cb.y + cb.h) - (cb.h / 4))
    );
    ctxm.lineTo(
      ((cb.x + cb.w) - (cb.w / 4)),
      (cb.y + (cb.h / 4))
    );
    ctxm.closePath();
    ctxm.lineWidth = (cb.w / 5);
    ctxm.strokeStyle = `rgba(${cb.olc})`;
    ctxm.stroke();
    cb.active = true;
  };
  cb.active = true;
  cb.visible = true;
  cb.press = close;
}

function ButtonPressCheck() {
  for (let i = 0;
   i < buttons.all.length; i++) {
    let b = buttons.all[i];
    if (b.active == true) {
      if (
       ((m.x > b.x) && 
       (m.x < (b.x + b.w))) &&
       ((m.y > b.y) &&
       (m.y < (b.y + b.h)))) {
        return i;
      };
    };
  };
  return -1;
}
  
function tick(b) {
  // add a tick... currently green
  ctxm.beginPath();
  ctxm.moveTo(
    (b.x + (b.w / 4)),
    (b.y + (b.h / 2))
  );
  ctxm.lineTo(
    (b.x + (b.w / 2.5)),
    ((b.y + b.h) - (b.h / 3.2))
  );
  ctxm.lineTo(
    (b.x + b.w) - (b.w / 4),
    (b.y + (b.h / 3))
  );
  ctxm.lineWidth = (4);
  ctxm.strokeStyle =
    `rgba(${m.tickcolour})`;
  ctxm.stroke();
}

function cross(b) {
  // add a cross... currently grey
  let x = 3.5;
  ctxm.beginPath();
  ctxm.moveTo(
    (b.x + (b.w / x)),
    (b.y + (b.h / x))
  );
  ctxm.lineTo(
    ((b.x + b.w) - (b.w / x)),
    ((b.y + b.h) - (b.h / x))
  );
  ctxm.moveTo(
    (b.x + (b.h / x)),
    ((b.y + b.h) - (b.h / x))
  );
  ctxm.lineTo(
    ((b.x + b.w) - (b.w / x)),
    (b.y + (b.h / x))
  );
  ctxm.lineWidth = (4);
   ctxm.strokeStyle =
     `rgba(${m.crosscolour})`;
  ctxm.stroke();
}

function resizebox(b, s) {
  // resize a box (centred).
  // b=box{x,y,w,h}, s=size multiplier
  let x = b.w - (s * b.w);
  let y = b.h - (s * b.h);
  return{
    x: (b.x + (x * 0.5)),
    y: (b.y + (y * 0.5)),
    w: (b.w - x),
    h: (b.h - y)
  };
}

export {
  m as Menu,
  crect,
  tick, 
  cross,
  resizebox,
}
