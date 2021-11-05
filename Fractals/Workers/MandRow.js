let p = 0; // current position in row
let mpws = []; // MandPoint Workers
let point = {}; // details to send mpws
let row; // to store the results
let rwidth; // row width/points
let Dpp; // distance per pixel (real)
let rstart; 
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
  rwidth = edata.rwidth;
  row = [];
  Dpp = edata.Dpp;
  rstart = edata.c.r;
}
function nextp(w) {
  // configure next 'point' to send
  point.c.r = (rstart + (p * Dpp));
  point.pos = p;
  point.wID = w;
  p++;
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
      // Insert result into row
      row[pevent.data.pos] = 
        pevent.data.Escape;
      // check if all rows are sent  
      if (p == rwidth) {
        // if all rows have been sent...
        mpws[pevent.data.wID].
          running = false;
        // check if all workers finished
        let busy = false;
        for (let w = 0; w < cpus; w++) {
          if (mpws[w].running == true) {
            busy = true;
          };
        };
        // if all finished return row
        if (busy == false) {
          postMessage({
            type: 'result',
            escapes: row}
          );
        };
      } else {
        // start processing next point
        nextp(pevent.data.wID);
        mpws[pevent.data.wID].
          mpw.postMessage(point);
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
      //postMessage({
      //  type: 'msg',
      //  msg: pevent.data.msg}); 
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
  
  mpws.push({mpw: mpw, running: false});
  mpws[i].ready = new Promise(
    (resolve, reject) => {
      mpws[i].readyresolve = resolve;
      mpws[i].readyreject = reject;
    });
}
onmessage = function(event) {
  setup(event.data); // Set/Reset worker
  // Check don't need less ws than cpus
  let ws;
  if (rwidth < cpus) {
    ws = rwidth;
  } else {
    ws = cpus;
  };
  // Start Point Workers
  for (let w = 0; w < ws; w++) {
    // chk worker ready promise fulfilled
    mpws[w].ready.then(() => {
      nextp(w);
      mpws[w].mpw.postMessage(point);
      mpws[w].running = true;
    });
  };
}