'use strict';

import { dbglog, dbgline, dbgdot, dbgrect }
  from './Debug/Overlay.js';
  
class epn { // extended precision number
  // i = integer (Int)
  // z = zeros at start of... (Int)
  // e = expansion (BigInt)
  // v = repetend 'vinculum' (Bigint)
  constructor(i, z, e, v) {
    if (i == undefined) {i = 0};
    if (z == undefined) {z = 0};
    if (e == undefined) {e = 0n};
    if (v == undefined) {v = 0n};
    this.i = i;
    this.z = z;
    this.e = BigInt(e);
    this.v = BigInt(v);
    this.efl10 = sflog10bi(this.e);
    this.vfl10 = sflog10bi(this.v);
    // for strings:
    let zoff = 0; // 0s right place in str
    if (v > 0n) {while ( // measure offset
      (`${v}`.at(-1 * (zoff + 1)) == '0') &&
     ((`${e}`.at(-1 * (zoff + 1)) == '0') ||
      ((e == 0n) && (z > zoff)))) { zoff++;
    };};
    let oz = ((e > 0n) ? z : (z - zoff));
    let el = ((this.efl10 - zoff) + 
     ((e > 0n) ? 1 : 0));
    let me = 10; // max e
    let mv = 8; // max extra rep
    this.sstr =
      // i
      `${i}` +
      // decimal point
      (((e > 0) || (v > 0)) ? '.' : '') +
      // zeros
      ((z > 0) ? '0'.repeat(oz) : '') +
      // expansion
      ((e > 0) ? 
      (el > me) ? 
       (`${e}`.slice(0, (me - z)) + 
       `...` + `${e}`.slice(-5)
       + `(${el})`) :
      ((zoff == 0) ? `${e}` :
        (`${e}`.slice(0, el))) : '') +
      // repetend
      ((v > 0n) ? ((zoff == 0) ?
        ((`${v}`.length > 
         ((me - el) + 10)) ? 
          (`'${v}`.slice(0, mv) + 
          '...' + `'${v}`.slice(-5) +
          '(' + `${v}`.length + `)'`) :
          `'${v}'`) :
        ((`${v}`.length >
         (me - (el + z))) ?
          (`'` + '0'.repeat(
          (zoff > me) ? me : zoff) +
          `${v}`.slice(0, (me - zoff))
          + `'`) :
          (`'` + '0'.repeat(zoff)) +
          `${v}`.slice(0, (-1 * zoff))
          + `'`))
          : '');
    this.str = 
     // i
     `${i}` +
     // decimal point
     (((e > 0) || (v > 0)) ? '.' : '') +
     // zeros
     ((z > 0) ? '0'.repeat(oz) : '') +
     // expansion
     ((e > 0) ? ((zoff == 0) ? `${e}` :
     (`${e}`.slice(0, (-1 * zoff)))) : '') +
     // repetend
     ((v > 0n) ? ((zoff == 0) ? `'${v}'` :
      (`'` + '0'.repeat(zoff) + 
      `${v}`.slice(0, (-1 * zoff)) +
      `'`)) : '');
  };
}

function red(a, b) {
  let m = (a % (b - 1n));
  m = ((a / (b - m)) - m);
  return m;
}
testred();
function testred() {
  for (let i = 1n; i < 60n; i++) {
    let r = red(i, 3n);
    let c = ((r == 0n) ?
     [200, 250, 190, 255] :
     [250, 120, 120, 255]);
    dbglog(r , i, 'rtest', c);
  };
}

function epadd (a, b) {
  let fl10 = sflog10bi; // choose algorithm
  let alen = (
    a.z + a.efl10 + ((a.e == 0) ? 0 : 1)
  );
  let blen = (
    b.z + b.efl10 + ((b.e == 0) ? 0 : 1)
  );
  let elen = (
   (alen > blen) ? alen : blen
  );
  let avl = ((a.v > 0n) ? a.vfl10 + 1 : 0);
  let bvl = ((b.v > 0n) ? b.vfl10 + 1 : 0);
  let vlen = ( // greater; a/b rep flog10
    ((a.v == 0n) && (b.v == 0n)) ? 0 :
    ((avl > bvl) ? avl : bvl)
  );
  let adif = ((elen - alen) % avl);
  let bdif = ((elen - blen) % bvl);
  // complete the shorter e so same flog10
  let ae = '0';
  let be = '0';
  if (elen > 0n) {
    ae = ((a.z > 0) ? '0'.repeat(a.z) : '')
      + ((a.e > 0n) ? `${a.e}` : '');
    ae = ae.padEnd((elen), `${a.v}`);
    be = ((b.z > 0) ? '0'.repeat(b.z) : '')
      + ((b.e > 0n) ? `${b.e}` : '');
    be = be.padEnd((elen), `${b.v}`);
  };
  ae = BigInt(ae);
  be = BigInt(be);
  // re-order repetends, leave as string
  let av = (
    `${a.v}`.substring(adif) +
    `${a.v}`.substring(0, adif)
  );
  let bv = (
    `${b.v}`.substring(bdif) +
    `${b.v}`.substring(0, bdif)
  );
  /*
  console.log(
    'a', a.i, a.z, ae, av, 'alen', alen,
    'b', b.i, b.z, be, bv, 'blen', blen
  );
  */
  // add: integer; expansion.
  let i = (a.i + b.i); 
  let e = (ae + be);
  let v = 0n; // create temp repetend.
  // re-measure e
  let nel = (fl10(e) + ((e > 0n) ? 1 : 0));
  let z = (elen - nel);
  let nvl = vlen;
  // calculate repetend
  if (vlen > 0) {
    nvl = ((av.length == bv.length) ? 
     av.length : // if same - either
     ((av.length) * (bv.length))
    );
    let ao = (nel - alen);
    let nva = BigInt(
     av.padEnd(nvl, av)
    );
    let bo = (nel - blen);
    let nvb = BigInt(
     bv.padEnd(nvl, bv)
    );
    v = (nva + nvb); // add repetends
    if ((fl10(v) + 1) > nvl) { // longer?
      v = BigInt(
        `${v}`.substring(1) // trim start
      );
      v++; //Loop start of v (1) to end
      if (e > 0n) {
        e++;
        if (fl10(e) > nel) {
          if (z > 0n) {z--} else {
            e = `${e}`.substring(1);
            i++;
          };
        };
      } else {
        if (z > 0n) {e++; z--} else {i++};
      };
      if ((fl10(v) + 1) < nvl) { // lost 0
        v*= 10n; //store 0 at end...
        if (e > 0n) {
          e*= 10n; // add 0 to end e
          nel++; // hmmmm
        } else {z++}; // ...or to z
      };
    };
    let t = (v + 1n); // resolve recurring 9
    if (fl10(t) > fl10(v)) {
      v = 0n;
      if (e != 0n) {
        e++; 
        nel = (fl10(e) + 1);
      } else {
        if (z > 0) {z--; e = 1n} else {i++};
      };
    };
  } else {
    v = a.v + b.v; // one or both rep are 0
  };
  // expansion overflows:
  if (z < 0) {
    i++;
    e = BigInt(`${e}`.substring(1));
    nel = (fl10(e) + ((e > 0n) ? 1 : 0));
    if ((nel == 0) && (v == 0n)) {z = 0}
    else {z = (elen - nel)};
  };
  if ( // remove repeats in repetend
  // this probably needs doing properly?
  // i.e. a prime sieve/factors before...?
   `${v}`.substring(0, vlen) ==
   `${v}`.substring(nvl - vlen)) {
    nvl = vlen;
    v = BigInt(
      `${v}`.substring(0, vlen)
    );
  };
  // trim end of e if = end of repetend
  let m; // matches
  let zm = 0; // zeros
  for (m = 1; // loop shorter length e/v
   m <= ((nel > nvl) ? nvl : nel); m++) {
    let d = `${v}`.at(-1 * m); // digit
    if (d != `${e}`.at(-1 * m)) {break};
    if (d == '0') {zm++} else {zm = 0};
  };
  m--; m-= zm; // remove un-enclosed zeros
  if (m > 0) { // trim expansion
    e = BigInt(`${e}`.slice(0, (-1 * m)));
    v = BigInt( // re-order repetend
      `${v}`.slice(-1 * m) +
      `${v}`.slice(0, (-1 * m))
    );
  };
  // trim e trailing 0s if no repetend
  if ((v == 0n) && (e != 0n)) { 
    e = `${e}`;
    while (e.at(-1) == '0') {
      e = e.slice(0, -1);
    };
    e = BigInt(e);
  };
  let c = new epn(i, z, e, v);
  return c;
}

//mathtest();
function mathtest() {
  let a = new epn(0, 1, '999999', 7890n);
  let b = new epn(0, 1, 99n, 84n);
  let c = epadd(a, b);
  for (let i = 0; i < 61; i++) {
    c = epadd(a, b)
    if (i == 60) {
      console.log(
        a.sstr, '+', b.sstr, '=', c.sstr
      );
    };
    a = c;
  };
  // console.log(c);
  //console.log(
  //  a.str, '+', b.str, '=', c.str
  //);
  /*
  let d = epadd(b, c);
  console.log(
    b.str, '+', c.str, '=', d.str
  );
  let e = epadd(a, d);
  console.log(
    a.str, '+', d.str, '=', e.str
  );
  console.log(e);
  let f = epadd(d, e);
  console.log(
    d.str, '+', e.str, '=', f.str
  );
  // console.log(f);
  */
}

function epmul(a, b) {
  let ae = ('0'.repeat(a.z) + 
   ((a.e != 0n) ?
   `${a.e}` : ''));
  let be = ('0'.repeat(b.z) +
   ((b.e != 0n) ?
   `${b.e}` : ''));
  let al = ae.length;
  let bl = be.length;
  let lo = ((al > bl) ? al : bl); // point
  let sh = ((al < bl) ? al : bl)
  let d = lo;  // point
  //console.log('d', d, 'ae', ae, 'be', be);
  let eend = (d - ((al < bl) ? al : bl));
  //console.log('eend', eend);
  ae = ae.padEnd(d, `${a.v}`); // rep to e
  be = be.padEnd(d, `${b.v}`);
  ae = `${a.i}` + ae; // prepend integers
  be = `${b.i}` + be;
  //console.log('ae', ae, 'be', be);
  let x;
  if ((a.v != 0n) && (b.v != 0n)) {
    x = Number(
      (9 ** (a.vfl10 + 1)) *
      (9 ** (b.vfl10 + 1))
    );
  } else {
    x = 1; // need 1?
  };
  //console.log('x', x);
  let vl = x * (
    ((a.vfl10 == b.vfl10) ? (a.vfl10 + 1) :
    ((a.vfl10 + 1) * (b.vfl10 + 1)))
  );
  let av = 
   `${a.v}`.repeat(vl / (a.vfl10 + 1));
  let bv =
   `${b.v}`.repeat(vl / (b.vfl10 + 1));
  ae = BigInt(
    ae + av.slice(al - d) + 
    av.slice(0, al - d));
  be = BigInt(
    be + bv.slice(bl - d) + 
    bv.slice(0, bl - d));
  
  d+= (vl); eend += (vl);
  //console.log('d', d);
  let m = (ae * be); // multiply!
  let ml = `${m}`.length;
  /*
  console.log(
    'ae', ae, 'be', be, 'm', m, 'ml', ml,
    'd', d, 'eend', eend, 'vl', vl
  ); */
  //if ((a.v == 0n) && (b.v == 0n)) {d++};
  //if (((a.i == 0) && (b.i == 0)) ||
  //   ((a.e == 0n) && (b.e == 0n))) {d++};
  //console.log('d', d);
  d = (ml - (d * 2)); // new d
  eend = (ml - ((vl * 2) /*+ 1*/)); // new eend
  //console.log('d = (ml - (d * 2)) =', d);
  let z = 0;
  if (d < 0) {
    z = (d * -1);
    d = 0;
    eend = 0;
  };
  eend+= z;
  let v = BigInt(
    `${m}`.slice(
      eend, vl // (eend + (vl / x))
    )
  );
  /*
  console.log('v', v, 'eend', eend, 'z', z);
  //if (vl > 0) {
  //  v+= BigInt(`${m}`.slice(d, eend));
  //  v = BigInt(`${v}`.slice(0, vl / 2));
  //};
  console.log('v', v, 'vl', vl);
  console.log(
    'ae', ae, 'be', be, 'm', m, 'ml', ml,
    'd', d, 'eend', eend, 'vl', vl, 'z', z
  ); */
  eend-= (lo - sh);
  let e = (`${m}`.slice(d, eend));
  //if (e.length > ((eend - d) > 0)) {
    z+= (e.length - (eend - d));
    //e = e.slice(0, (-1 * (2 * z)));
  //};
  
  let c = new epn(
    ((d == 0) ? 0 : 
    Number(`${m}`.slice(0, d))),
    z, e, v
  );
  return c;
}

//multest();
function multest() {
  let a = new epn(0, 0, 0n, 1n);
  let b = new epn(0, 0, 0n, 5n);
  let c = epmul(a, b);
  console.log(
    a.sstr, '*', b.sstr, '=', c.sstr
  );
  console.log(c);
}

function epdiv(a, b) { 
  // a dividend / b divisor = c quotient
  let ae = ('0'.repeat(a.z) + 
   ((a.e != 0n) ?
   `${a.e}` : ''));
  let be = ('0'.repeat(b.z) +
   ((b.e != 0n) ?
   `${b.e}` : ''));
  let al = ae.length;
  let bl = be.length;
  let lo = ((al > bl) ? al : bl); // point
  let sh = ((al < bl) ? al : bl)
  let d = lo;  // point
  //console.log('d', d, 'ae', ae, 'be', be);
  let eend = (d - ((al < bl) ? al : bl));
  //console.log('eend', eend);
  ae = ae.padEnd(d, `${a.v}`); // rep to e
  be = be.padEnd(d, `${b.v}`);
  ae = `${a.i}` + ae; // prepend integers
  be = `${b.i}` + be;
  d = ae.length - be.length;
  //console.log('ae', ae, 'be', be);
  let x;
  // if ((a.v != 0n) && (b.v != 0n)) {
    x = Number(
      //(9 ** (a.vfl10 + 1)) *
      (9 ** (be.length))
    );
  //} else {
  //  x = 10; // need 1?
  //};
  //console.log('x', x);
  let vl = x// * (
    //((a.vfl10 == b.vfl10) ? (a.vfl10 + 1) :
    //((a.vfl10 + 1) * (b.vfl10 + 1)))
  //);
  let av = 
   `${a.v}`.repeat(vl * 2 / (a.vfl10 + 1));
  let bv =
   `${b.v}`.repeat(vl / (b.vfl10 + 1));
  ae = BigInt(
    ae + av.slice(al - d) + 
    av.slice(0, al - d));
  be = BigInt(
    be + bv.slice(bl - d) + 
    bv.slice(0, bl - d));
  
  //d+= (vl); eend += (vl);
  //console.log('d', d);
  let m = (ae / be); // multiply!
  let ml = `${m}`.length;
  /*
  console.log(
    'ae', ae, 'be', be, 'm', m, 'ml', ml,
    'd', d, 'eend', eend, 'vl', vl
  ); */
  //if ((a.v == 0n) && (b.v == 0n)) {d++};
  //if (((a.i == 0) && (b.i == 0)) ||
  //   ((a.e == 0n) && (b.e == 0n))) {d++};
  //console.log('d', d);
  //d = (ml - (d * 2)); // new d
  eend = (ml - ((vl * 2) /*+ 1*/)); // new eend
  //console.log('d = (ml - (d * 2)) =', d);
  let z = 0;
  if (d < 0) {
    z = (d * -1);
    d = 0;
    eend = 0;
  };
  eend+= z;
  let v = BigInt(
    `${m}`.slice(
      eend, vl // (eend + (vl / x))
    )
  );
  //console.log('v', v, 'eend', eend, 'z', z);
  //if (vl > 0) {
  //  v+= BigInt(`${m}`.slice(d, eend));
  //  v = BigInt(`${v}`.slice(0, vl / 2));
  //};
  //console.log('v', v, 'vl', vl);
  /*
  console.log(
    'ae', ae, 'be', be, 'm', m, 'ml', ml,
    'd', d, 'eend', eend, 'vl', vl, 'z', z
  );*/
  eend-= (lo - sh);
  let e = (`${m}`.slice(d, -1));
  //if (e.length > ((eend - d) > 0)) {
    //z+= (e.length - (eend - d));
    //e = e.slice(0, (-1 * (2 * z)));
  //};
  while (e.at(-1) == '0') {
    e = e.slice(0, -1);
  };
  
  let c = new epn(
    ((d == 0) ? '0': `${m}`.slice(0, d)),
    z, e, v
  );
  return c;
}
divtest();
function divtest() {
  let a = new epn(1, 0, 0n, 0n);
  let b = new epn(31, 0, 0n, 0n);
  let c = epdiv(a, b);
  console.log(
    a.sstr, '/', b.sstr, '=', c.sstr
  );
  console.log(c);
  let d = epmul(b, c);
  console.log(
    b.sstr, '*', c.sstr, '=', d.sstr
  );
  a = epadd(d, d);
  console.log(
    d.sstr, '+', d.sstr, '=', a.sstr
  );
  console.log(a);
}

function flog2bi(bi) {
  // reference - slow
  let i = 1n;
  let rs = bi;
  while (rs > 1n) {
    rs = bi >> i;
    i++;
  };
  i--;
  return i;
}

// quicker for large numbers...
let dp2n = 12n; // larger for trade-off...
// ...not large enough will crash stack
let dp2 = []; // lookup table 2^(2^p)
function dp2set () { // p = power
  for (let p = dp2n; p > 0n; p--) {
    dp2[Number(p)] = (2n ** (2n ** p));
  };
}
dp2set();
function qflog2bi(bi, r) { // (bi = BigInt)
  // recursion, double powers of 2.
  if (r == undefined) {r = 0n};
  // small bi, under 2^(2^1) ...i.e. 4:
  if (bi < 2n) return r; else {
   if (bi < 4n) return (r + 1n);};
  let s = 0n; // shifted number
  for (let p = dp2n; p > 0n; p--) {
    if (bi >= dp2[Number(p)]) {
      s = bi >> p; // right shift by power
      r = r + qflog2bi(s, p); // <recursion
      return r;
    };
  };
}
function sflog2bi(bi) {
  let l = 
   BigInt(`${bi}`).toString(2).length - 1;
  return l;
};
function sflog10bi(bi) {
  let l = 
   BigInt(`${bi}`).toString(10).length - 1;
  return l;
};



//tqf();
function tqf() {
  let n = 30n;
  let r = 80n;
  for (let i = n; i < (n + 2n); i++) {
    console.log(
      'low ', qflog2bi((i ** 1n) ** r)
    );
    // linear shift 
    /*
    let flog;
    let t0 = performance.now();
    for (let ii = 1n; ii < r; ii++) {
      flog = flog2bi((i ** ii) ** r);
    };
    let t1 = performance.now();
    let flogt = (t1 - t0);
    */
    //recursion
    let qflog;
    let t3 = performance.now();
    for (let ii = 1n; ii < r; ii++) {
      qflog = qflog2bi((i ** ii) ** r);
    };
    let t4 = performance.now();
    let qflogt = (t4 - t3);
    
    //string
    let sflog;
    let t5 = performance.now();
    for (let ii = 1n; ii < r; ii++) {
      sflog = sflog2bi((i ** ii) ** r);
    };
    let t6 = performance.now();
    let sflogt = (t6 - t5);
    /*
    console.log(
      'lfl',
      `avg ${(flogt / Number(r))}ms`
    );*/
    console.log('high', qflog);
    console.log(
      'qfl',
      `avg ${(qflogt / Number(r))}ms`
    );
    console.log(
      'sfl',
      `avg ${(sflogt / Number(r))}ms`
    ); 
  };
}

export {
  epn,
  epadd,
};
