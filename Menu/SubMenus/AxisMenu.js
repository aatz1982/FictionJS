'use-strict';
import {
  Menu as m, btn, crect, ctxm, tick,
  cross, resizebox
} from '../Menu.js';
import {Plane, ctxa, SetCanvasClear,
 RepaintAxis
} from '../../ComplexPlane.js';
export let AxisMenu = {};
let am = AxisMenu;
am.addbtn = function axisbtn() {
  let b = new btn('axis'); // give name...
  b.border = 15;
  b.olc = m.btnoutline // outline
  b.fc = m.btnfill; // fill
  b.w = (m.bg.w / 9);
  b.h = b.w;
  b.x = (m.bg.x + b.border);
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
  am.setupbuttons();
}
// to do... separate functions
am.setupbuttons = function setavbtn () {
  let b = new btn('axisvisible');
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
    
    let ssq = resizebox(sq, 0.8)
    crect(
      ssq.x, ssq.y, ssq.w, ssq.h,
      (b.r * 0.8), b.fc, null, ctxm,
    );
    b.state == true ? tick(sq) : cross(sq);
    ctxm.shadowColor =
     `rgba(${[0, 0, 0, 255]})`;
    
    ctxm.shadowBlur = 7;
    ctxm.fillStyle =
        `rgba(${m.textcolour})`;
    ctxm.font =
      `${(m.textsize)}px sanserif`;
    ctxm.fillText('Show Axis?',
     (b.x + b.h + b.border),
     (b.y + (b.h / 1.5)),
    );
    ctxm.fillText('Show Axis?',
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
      Plane.AxisColour[3] = 0;
      SetCanvasClear(ctxa);
      b.state = false;
      m.draw();
    } else {
      Plane.AxisColour[3] = 85; // to do...
      Plane.RepaintAxis();
      b.state = true;
      m.draw();
    }
  };
}

function activate() {
  m.reset();
  m.buttons.axis.active = false;
  m.buttons.axisvisible.visible = true;
  m.draw();
}
function deactivate () {
  //to do...
}
