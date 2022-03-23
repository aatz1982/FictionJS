  import { cn, cadd, csq }
    from '../../ComplexNumbers.js';
  let escname =
    location.search.substring(1);
  let escpath =
    ('../EscapeTests/' +
      escname + '.js');
  let EscapeTest;
  onmessage = function(event) {
    TestPoint(event);
  }
  let z = new cn(0, 0);
  await import(escpath)
    .then((escmod) => {
      EscapeTest = escmod.default;
      postMessage({
        msgtype: 'importsuccess',
        msg: 'import succeeded',
      });
    })
    .catch((error) => {
      postMessage({
        msgtype: 'importerror',
        msg: 'import failed',
        errmsg: error.message
      });
    });
  function TestPoint (event) {
    let esclim = event.data.esclim;
    let c = new cn(
      event.data.c.r,
      event.data.c.i
    );
    z.r = c.r; // or 0...
    z.i = c.i;
    let point = {
      msgtype: 'result',
      pos: event.data.pos,
      wID: event.data.wID
    };
    let i;
    for (i = 0;
         i < event.data.Iterations;
         i++) {
      
      //z = cmul(z, z);
      z = csq(z, z);
      z = cadd(z, c);
      
      if (EscapeTest(z, esclim)) {
        break;
      };
    };
    point.Escape = i; 
    postMessage(point);
    
    /*
    let test = EscapeTest(new cn(0,0),2);
    postMessage({
      msgtype: 'testmsg',
      msg: [test, event.data.wID],
    }); */
  }
      
