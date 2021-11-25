'use strict';
function sqrtabsrxi(z, lim) {
  let r = Math.sqrt((
    Math.abs(z.r) *
    Math.abs(z.i)));
  if (r > lim) {
    return true;
  } else {
    return false;
  };
}
export {sqrtabsrxi as default};