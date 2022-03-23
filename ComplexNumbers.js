'use strict';

class cn { // complex number
  constructor(r, i) {
    this.r = r;
    this.i = i;
  };
}

function cadd(a, b) {
  let c = {
    r: a.r + b.r,
    i: a.i + b.i
  };
  return c;
}

function csub(a, b) {
  let c = {
    r: a.r - b.r,
    i: a.i - b.i
  };
  return c;
}

function cmul(a, b) {
  let F = a.r * b.r;
  let O = a.r * b.i;
  let I = a.i * b.r;
  let L = a.i * b.i;
  
  let c = {
    r: F - L,
    i: O + I
  };
  return c;
}

function csq(a) {
  let F = a.r * a.r;
  let L = a.i * a.i;
  let OI = a.r * a.i;
  let c = {
    r: F - L,
    i: OI + OI
  };
  return c;
}

function intcn(cn1, cn2, cn3, cn4) {
  // Intersection using determinants
  // Line a = cn1>cn2, line b = cn3>cn4
  // same as intxy which may be better
  let da = (
    (cn1.r * cn2.i) - (cn1.i * cn2.r)
  );
  let db = (
    (cn3.r * cn4.i) - (cn3.i * cn4.r)
  );
  let ra = (cn1.r - cn2.r);
  let rb = (cn3.r - cn4.r);
  let ia = (cn1.i - cn2.i);
  let ib = (cn3.i - cn4.i);
  let d = ((ra * ib) - (ia * rb));
  let c = {
    r: (((da * rb) - (ra * db)) / d),
    i: (((da * ib) - (ia * db)) / d),
  };
  return c;
}

function agm(a, b, n) { // not tested yet
  // arithmetic-geometric mean
  if (n == undefined) {n = 8};
  for (let i = 0; i < n; i++) {
    let c = ((a + b) / 2);
    let d = Math.sqrt(a * b);
    a = c;
    b = d;
  };
  return a;
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

export {
  cn,
  cadd,
  csub,
  cmul,
  csq,
  intcn,
};
