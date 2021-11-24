# FictionJS
Complex plane & fractals in the HTML Canvas. WIP.

24/11/2021:

I started to write this in October 2021 to learn
moderm JavaScript and what it is capable of.

Current progress:
Will currently only draw the Mandelbrot set.
x/y r/i axis implemented on top canvas.
Webworkers provide some parallel processing of
individual points.
Escape tests can be dynamically loaded to workers.
Move plane implemented (touch).
Move generates asyncronous requests for the new
sections required.

Immediate plans:
add straight/radial gridlines to axis canvas.
Implememt zoom.
Implement mouse controls.

Future plans:
Implement overlay menu.
Implement different optimisations, eg. edge trace.
Use WebGL.
Add some prettier colour generators.
Implement Julia sets and other fractals.
Implement other functions/fields that use the
Complex Plane.
Possibly implement oversampling/anti-aliasing.
Add code to generate interferance patterns.
