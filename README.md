# FictionJS
Complex plane & fractals in the HTML Canvas.
Work in progress - not currently useable...

24/11/2021:

I started to write this in October 2021 to learn
modern JavaScript and what it's capable of.

Current progress:
FictionJS will currently only draw the Mandelbrot
set.
x/y r/i axis are implemented on a separate canvas.
Webworkers provide some parallel processing of
individual points.
Escape tests can be dynamically loaded to workers.
Move plane implemented (touch only).
Move generates asyncronous requests for the new
sections required, and inserts.

Immediate plans:
Add straight/radial gridlines to axis canvas.
Implememt zoom.
Implement mouse controls.

Future plans:
Implement overlay menu.
Implement different optimisations, eg. edge trace.
Use WebGL.
Implement rotation.
Add some prettier colour generators.
Implement Julia sets and other fractals.
Implement other functions/fields that use the
Complex Plane.
Possibly implement oversampling/anti-aliasing.
Add code to generate interferance patterns.
