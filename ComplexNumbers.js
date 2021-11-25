'use strict';
class cn {
  constructor(r, i) {
    this.r = r;
    this.i = i;
  }
}

function cadd(a, b) {
  var c = {
    r: a.r + b.r,
    i: a.i + b.i
  };
  return c;
}

function csub(a, b) {
  var c = {
    r: a.r - b.r,
    i: a.i - b.i
  };
  return c;
}

function cmul(a, b) {
  var F = a.r * b.r;
  var O = a.r * b.i;
  var I = a.i * b.r;
  var L = a.i * b.i;
  
  var c = {
    r: F - L,
    i: O + I
  };
  return c;
}

/* math test  
import {cadd , csub, cmul}
from './ComplexNumbers.Js';

var ca = {r: 0, i: 1};
var cb = {r: 2, i: 1};

ca = cmul(ca, cb);

console.log (
  ca.r, ',', 
  ca.i, 'i'
);

ca = cmul(ca, cb);

console.log (
  ca.r, ',', 
  ca.i, 'i'
);
console.log('data type is', 
  typeof 'data');

*/

export {cn, cadd , csub, cmul};