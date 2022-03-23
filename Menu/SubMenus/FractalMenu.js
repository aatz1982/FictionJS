'use-strict';
import {
  Menu as m, btn, crect, ctxm, tick, cross
} from '../Menu.js';
import {Plane, ctxc, SetCanvasClear,
 RepaintAxis
} from '../../ComplexPlane.js';
export let FractalMenu = {};
let fm = FractalMenu;
fm.addbtn = function axisbtn() {
  let b = new btn('fractal');
  b.border = 15;
  b.olc = m.btnoutline // outline
  b.fc = m.btnfill; // fill
  b.w = (m.bg.w / 9);
  b.h = b.w;
  b.x = (m.bg.x + (b.border * 2) + b.w);
  b.y = (m.bg.y + b.border);
  b.r = (m.bg.w / 40);
  b.draw = () => {
    crect(
      b.x, b.y, b.w, b.h, b.r,
      b.fc, null, ctxm,
    );
    // add a cross...
    ctxm.beginPath();
    ctxm.moveTo(
      (b.x + (b.w / 2)),
      (b.y + (b.h / 4))
    );
    ctxm.lineTo(
      ((b.x + b.w) - (b.w / 2)),
      ((b.y + b.h) - (b.h / 4))
    );
    ctxm.moveTo(
      (b.x + (b.h / 4)),
      ((b.y + b.h) - (b.h / 2))
    );
    ctxm.lineTo(
      ((b.x + b.w) - (b.w / 4)),
      (b.y + (b.h / 2))
    );
    ctxm.closePath();
    ctxm.lineWidth = (2);
    ctxm.strokeStyle = 
     `rgba(${
       [Plane.AxisColour[0],
        Plane.AxisColour[1],
        Plane.AxisColour[2],
        85]
     })`;
    ctxm.stroke();
    b.active = true;
  };
  b.active = false;
  b.press = () => {
    activate();
  };
  fm.setupbuttons();
}
// to do... separate functions
fm.setupbuttons = function setavbtn () {
  let b = new btn('plotfractal');
  b.visible = false;
  b.border = 15;
  b.olc = m.btnoutline // outline
  b.fc = m.btnfill; // fill
  b.h = (m.bg.w / 9);
  b.w = (m.bg.w - (b.border * 2));
  b.x = (m.bg.x + b.border);
  b.y = (m.buttons.axis.y + 
   m.buttons.axis.h + b.border);
  b.r = (m.bg.w / 40);
  b.draw = () => {
    crect(
      b.x, b.y, b.w, b.h, b.r,
      b.fc, null, ctxm,
    );
    let sq = {
      x: b.x, y: b.y, h: b.h, w: b.h
    };
    b.state == true ? tick(sq) : cross(sq);
    ctxm.shadowColor =
     `rgba(${[0, 0, 0, 255]})`;
    ctxm.shadowBlur = 4;
    ctxm.fillStyle =
        `rgba(${m.textcolour})`;
    ctxm.font =
      `${(m.textsize)}px sanserif`;
    let c = 'Plot fractal?';
    ctxm.fillText(c,
     (b.x + b.h + b.border),
     (b.y + (b.h / 1.5)),
    );
    ctxm.fillText(c,
      (b.x + b.h + b.border),
      (b.y + (b.h / 1.5)),
    );
    ctxm.shadowBlur = 0;
    b.active = true;
  };
  b.active = false;
  b.state = true;
  b.press = () => {
    if (b.state == true) {
      ctxc.canvas.hidden = true;
      b.state = false;
      m.draw();
    } else {
      ctxc.canvas.hidden = false;
      b.state = true;
      m.draw();
    }
  };
}

function activate() {
  m.reset();
  m.buttons.fractal.active = false;
  m.buttons.plotfractal.visible = true;
  m.draw();
}
function deactivate () {
  m.buttons.fractal.active = true;
  m.buttons.plotfractal.visible = false;
  m.draw();
}
