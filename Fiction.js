import {MenuButton,
} from './Menu/Button.js';
import {menu, ctxm,
} from './Menu/Menu.js';
import {startinputlisteners,
} from './Input.js';
import {width, height, canvas as plane, 
 ctxc, axis, ctxa, Mandelbrot,
} from './ComplexPlane.js';

function fiction () {
  MenuButton.draw();
  startinputlisteners();
  Mandelbrot();
}

// canvas layers and contexts
const layers = [plane, axis, menu];
const ctxs = [ctxc, ctxa, ctxm];

function composite(l, blur) {
  // composite canvas layers below up
  for (let i = l - 1; i >= 0; i--) {
    ctxs[l].globalCompositeOperation =
      'destination-over';
    if (blur != undefined) {
      ctxs[l].filter = `blur(${blur}px)`;
    };
    ctxs[l].drawImage(layers[i], 0, 0);
    if (blur != undefined) {
      ctxs[l].filter = 'none';
    };
    ctxs[l].globalCompositeOperation =
      'source-over';
  };
}

function composited(l, d, blur) {
  // composite canvas layers above down
  l = l - 1;
  for (let i = l + 1; i <= l + d; i++) {
    ctxs[l].globalCompositeOperation =
      'source-over';
    if (blur != undefined) {
      ctxs[l].filter = `blur(${blur}px)`;
    };
    ctxs[l].drawImage(layers[i], 0, 0);
    if (blur != undefined) {
      ctxs[l].filter = 'none';
    };
  };
}

function compositeblob(l, ctx, blur) {
  // not using but may reuse later
  for (let i = l - 1; i >= 0; i--) {
    layers[i].toBlob(
      async function(blob) {
        let bi = 
         document.createElement('img');
        let url = 
         URL.createObjectURL(blob);
        bi.onload = await function() {
          ctx.globalCompositeOperation =
            'destination-over';
          ctxm.filter = `blur(${blur}px)`;
          ctx.drawImage(bi, 0, 0);
          URL.revokeObjectURL(url);
          ctxm.filter = 'none';
          ctx.globalCompositeOperation =
            'source-over';
        }
        bi.src = url;
        document.body.appendChild(bi);
      }
    );
  };
}

export {fiction, composite, composited};
