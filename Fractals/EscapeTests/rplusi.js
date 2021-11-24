'use strict';
// Adds the absolute values of i and r
function rplusi(z, lim) {
  let r = (
    Math.abs(z.r) + Math.abs(z.i));
  if (r > lim) {
    return true;
  } else {
    return false;
  };
}
export {rplusi as default};