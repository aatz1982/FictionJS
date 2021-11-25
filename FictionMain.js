import {startinputlisteners}
  from './Input.js';

import {BlankPlane,
        Mandelbrot}
  from './ComplexPlane.js';

import {DrawMandelbrot}
  from './Fractals/Mandelbrot.js';

function fiction () {
  /*document.addEventListener('DOMContentLoaded',
    startinputlisteners);*/
  //CanvasResToMax();
  
  BlankPlane();
  startinputlisteners();
  //DrawMandelbrot();
  Mandelbrot();
  
}

export {fiction};