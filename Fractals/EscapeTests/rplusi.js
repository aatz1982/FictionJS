'use strict';
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