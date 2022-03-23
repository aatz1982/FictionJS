import {cn, cadd}
  from '../../ComplexNumbers.js';

let p = 0; // current position in row
let mpws = []; // MandPoint Workers
let point = {}; // details to send mpws
let escapes; // to store the results
let escapesbuf;
let len; // row width/points
let startr = 0;
let starti = 0;
let step;
let escname = 
  location.search.substring(1);
let cpus =
  (navigator.hardwareConcurrency);
function setup(edata) {
  p = 0; // Position in the row
  point.c = edata.c;
  point.Iterations = edata.Iterations;
  point.esclim = edata.esclim;
  point.wID = 0;
  point.pos = 0;
  len = edata.len;
  escapesbuf = 
    new ArrayBuffer((len * 2));
  escapes = new Uint16Array(escapesbuf);
  startr = edata.c.r;
  starti = edata.c.i;
  step = edata.step;
}
function nextp(w) {
  // configure next point to send
  /* if (p == (len - 1)) {
  postMessage({
    type: 'msg',
    msg: 'p len - 1 requested'});
  };
  if (p == (0)) {
  postMessage({
    type: 'msg',
    msg: ['startr', startr]});
  }; */
  point.wID = w;
  // could/should import cadd?
  //point.c.r = (startr + (p * step.r));
  //point.c.i = (starti + (p * step.i));
  point.c = cadd(point.c, step);
  point.pos = p;
  /* if (p == (len - 1)) {
    postMessage({
      type: 'msg',
      msg: start.r});
  }; */
  p++;
  return point;
}

for (let i = 0;
     i < cpus; i++) {
  // Setup Point Subworkers
  const mpw = new Worker(
    ('./MandPoint.js?'
    + escname), {type: 'module'});
  // What to do when the point worker
  // posts a message back:
  mpw.onmessage = function(pevent) {
    switch (pevent.data.msgtype) {
      case 'result':
        processresult();
        break;
      case 'importsuccess':
        processimportsuccess();
        break;
      case 'importerror':
        processimporterror();
        break;
      case 'testmsg':
        processtestmsg();
        break;
    };
    function processresult() {
      let w = pevent.data.wID;
      let p = pevent.data.pos;
      let e = pevent.data.Escape;
      mpws[w].rcount++;
      // Insert result at pos (p)
      escapes[p] = e;
      // Check if all rows are sent  
      if (p >= len) {
        // If all rows have been sent...
        //dbgl('+', `[${w}] Finished`);
        //dbgl(mpws[w].rcount, `[${w}] R`);
        mpws[w].running = false;
        mpws[w].finishedresolve();
        /*
        // Check if all workers finished
        let busy = false;
        for (let w = 0; w < cpus; w++) {
          if (mpws[w].running == true) {
            busy = true;
          };
        };
        // if all finished return line
        if (busy == false) {
          postMessage(escapes,
            [escapesbuf]
          );
        };
        */
      } else {
        // start processing next point
        mpws[w].mpw.postMessage(nextp(w));
      };
    };
    function processimporterror() {
      postMessage({
        type: 'msg',
        msg: [pevent.data.msg,
        pevent.data.errmsg]}
      );
    };
    function processimportsuccess() {
      mpws[i].readyresolve();
      // for testing:
      /* postMessage({
        type: 'msg',
        msg: pevent.data.msg}); */
    };
    function processtestmsg() {
      postMessage({
        type: 'msg',
        msg: pevent.data.msg
      });
    };
  };
  mpw.onerror = function(event) {
    // works need tidy up (bubble error)
    postMessage(
      'mpw error!' + event.message +
      " (" + event.filename +
      ":" + event.lineno + ")");
  };
  let readyresolve;
  let readyreject;
  let ready = new Promise(
    (resolve, reject) => {
      readyresolve = resolve;
      readyreject = reject;
    });
  
  mpws.push({
    mpw: mpw,
    ready: ready,
    readyresolve: readyresolve,
    readyreject: readyreject,
    running: false,
    rcount: 0,
  });
}
onmessage = function(event) {
  setup(event.data); // Set/Reset worker
  // Check don't need less ws than cpus
  let ws;
  if (len < cpus) {
    ws = len;
  } else {
    ws = cpus;
  };
  // Start Point Workers
  let mpwsfinished = []; // promises
  for (let w = 0; w < ws; w++) {
    let finishedresolve;
    let finishedreject;
    let finished = new Promise(
     (resolve, reject) => {
      finishedresolve = resolve;
      finishedreject = reject;
    });
    mpwsfinished.push(finished);
    mpws[w].finishedresolve = finishedresolve;
    mpws[w].finishedreject = finishedreject;
    // chk worker ready promise fulfilled
    //dbgl(`${w}`);
    mpws[w].ready.then(() => {
      /* postMessage({
       type: 'msg',
       msg: 'mpw started'}); */
      mpws[w].mpw.postMessage(nextp(w));
      //dbgl('+', `[${w}] sent:`);
      mpws[w].running = true;
    });
  };
  Promise.all(mpwsfinished).then(
    () => {
      //dbgl(escapes[309], 'esct')
      postMessage(escapes,[escapesbuf]);
    }
  );
}
function dbgl(msg, name) {
  if (name == undefined) {name = 'LW'};
  postMessage({
    type: 'dbg',
    msg: msg,
    name, name
  });
}
