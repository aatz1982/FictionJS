'use strict';
function vector(z, lim) {
  let r = Math.abs(z.r);
  let i = Math.abs(z.i);
  if ((r > lim) || (i > lim)) {
    return true;
  } else {
    if ((r + i) < lim) {return false};
    let v = ((r * r) + (i * i));
    if (v > (lim * lim)) {
      return true;
    } else {
      return false;
    };
  };
}
export {vector as default};