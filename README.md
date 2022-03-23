# FictionJS
Complex plane & fractals in the HTML Canvas.
Work in progress...

26/12/2021:

Touch Zoom is implemented, it does a stretch
of the existing canvas while in progress,
copies the zoomed image to the canvas when
the second touch ends, and then  requests
the plane is re-drawn via the Mandelbrot
function.

Also a colour rotor that doesn't calculate
based on the iterations being checked and so
produces the same results when this is 
changed, and a function that fades the last
x entries in the array to black.

24/11/2021:

I started to write this in October 2021 to
learn 'modern' JavaScript and what can be 
done using the htlm canvas.

Current progress:
FictionJS will currently only draw the 
Mandelbrot set. x/y r/i axis are implemented 
on a separate canvas. Webworkers provide some
parallel processing of individual points.
Escape tests can be dynamically loaded to
workers. Move plane implemented (touch only).
Move generates asyncronous requests for the
new sections required, which are inserted
into the correct place on the canvas.

Immediate plans:
Add straight/radial gridlines to axis canvas.
Implememt zoom. *partly done
Implement mouse controls.

Future plans:
Implement an overlay menu.
Implement different optimisations, eg;
edge trace, purturbations, optimise the
complex number math, add division etc...
Use WebGL.
Implement rotation.
Add some prettier colour generators.
Implement Julia sets and other fractals.
Implement other functions/fields that use the
Complex Plane.
Possibly implement oversampling / 
anti-aliasing.
Add code to generate interferance patterns -
not really related to complex numbers as such
but will use some of the same functions.