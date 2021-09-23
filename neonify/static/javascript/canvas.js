/*
  Author: Eron Ristich
  Date: 9/21/21
  File: ./neonify/static/javascript/canvas.js
  Description: Drawing scripts with smoothing functions 
*/

// CONSTANTS
// constant scalar for drawing canvas
const scalar = 2;

// constant drawingCanvas element
const element = document.getElementById("drawingCanvas");

// constant drawingCanvas context
const ctx = setupCanvas(element); 

// constant stroke weight slider element initialized to 5 
const weight = document.getElementById("weight");
weight.value = 5*scalar;

// constant color picker element
const colors = document.getElementById("colorpicker");


// UTILITY FUNCTIONS
// integer array deepcopy function
// actually assorts arrays into dictionaries, but it's functionally the same
var arrayDeepcopy = function(array) {
  return (array.map(a => {return {...a}}));
}

// canvas setup
function setupCanvas(canvas) {
  var rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * scalar;
  canvas.height = rect.height * scalar;
  
  var ctx = canvas.getContext('2d');
  ctx.scale(scalar, scalar);
  
  return ctx;
}

// SMOOTHING FUNCTIONS
// micro smoothing function (MA)
// given a point and the previous moving average, return the new moving average
var movingAverage = function(point, madict) {
  var nmvax = (point[0] + madict["x"]) / 2;
  var nmvay = (point[1] + madict["y"]) / 2;
  return ({ "x": nmvax, "y": nmvay });
}

// macro smoothing function (polynomial point pudding)
// returns a 1d lagrange polynomial function given three 1d points (x and y will be calculated parametrically in order to accomodate for non-function behavior)
var naiveLagrange = function(points) {
  var lagranges = [];
  var zeroes = [];
  
  for (let i = 0; i < points.length; i ++) {
    zeroes.push(function(x) {return(x-i);});
  }

  for (let i = 0; i < points.length; i ++) {
    lagranges.push(function(x) {
      var a = 1;
      for (let j = 0; j < zeroes.length; j ++) {
        if (j != i) {a *= zeroes[j](x);}
      }
      return (a);
    });
  }

  return (lagranges);
}
var lagrange = function(points) {
  var lagranges = naiveLagrange(points);
  var multipliers = [];

  for (let i = 0; i < lagranges.length; i ++) {
    multipliers.push(points[i] / lagranges[i](i))
  }
  
  var lagrangian = function(x) {
    var a = 0;
    for (let i = 0; i < lagranges.length; i ++) {
      a += multipliers[i]*lagranges[i](x);
    }
    return (a);
  }

  return (lagrangian);
}

// realtime 1d lagrange polynomials that place non-given points between given points along a smooth curve
// runs on a set of three (technically any number of) points and returns n points that are to be placed between the two most recent points
// [3, 2, 1] in terms of age
// returns format of [3, 2, r1, r2, ..., rn, 1]
var polynomialPudding = function(points, n) {
  var pudding = lagrange(points);
  var rpoints = [];

  for (let i = 1; i < n; i ++) {
    rpoints.push(pudding(points.length-2+i*(1/n)));
  }

  return rpoints;
}

// handles 2d points by splitting points into their respective parametric 1d curves
// points are inputted in the form [x,y]
var polynomialPudding2D = function(points, n) {
  var pointsX = [];
  var pointsY = [];

  for (let i = 0; i < points.length; i ++) {
    pointsX.push(points[i][0]);
    pointsY.push(points[i][1]);
  }

  var rpointsX = polynomialPudding(pointsX, n);
  var rpointsY = polynomialPudding(pointsY, n);

  var rpoints = [];

  for (let i = 0; i < rpointsX.length; i ++) {
    rpoints.push([rpointsX[i], rpointsY[i]]);
  }

  return rpoints;
}


// PEN FUNCTIONS
// draw a point
var drawPoint = function(ctx, x, y, w, color) {
  ctx.beginPath();

  ctx.arc(x, y, w / 2, 0, 2 * Math.PI);
  ctx.fillStyle = color;

  ctx.fill();
}

// draw a line (with curved endpoints)
var drawLine = function(ctx, x1, y1, x2, y2, w, color) {
  ctx.beginPath();

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = w;
  ctx.strokeStyle = color;

  ctx.stroke();

  drawPoint(ctx, x1, y1, w, color);
  drawPoint(ctx, x2, y2, w, color);
}


// LISTENERS
var defineListeners = function(canvas, details, pointSpace, f1, f2, f3) {
  // variable handler
  let moved

  // mousedown
  let downListener = () => {
    moved = true;
    f1(details, event, pointSpace);
  }
  canvas.addEventListener('mousedown', downListener)

  // mousemoved
  let moveListener = () => {
    if (moved) {
      f2(details, event, pointSpace);
    }
  }
  canvas.addEventListener('mousemove', moveListener)

  // mouseup
  let upListener = () => {
    moved = false;
    f3(details, event, pointSpace);
  }
  canvas.addEventListener('mouseup', upListener)

  // release memory
  //canvas.removeEventListener('mousedown', downListener)
  //canvas.removeEventListener('mousemove', moveListener)
  //canvas.removeEventListener('mouseup', upListener)
}


// DATA STRUCTURES
// class structure for containing points
class Points {
  // limiter is an integer representing the maximum size of this.points
  constructor(limiter, details) {
    this.points = [];
    this.limiter = limiter;
    this.canvas = details["l"];
    this.weight = details["w"];
    this.colors = details["c"];
    this.ctx = details["x"];

    // storage for extra information to be passed and handled by functions such as moving average previous values
    this.extras = {"ma": {"x": -1, "y": -1}};
  }
  
  // accepts coordinates in the form [x,y]
  // draws a line between the second newest point and the newest point
  update(coord) {
    if (this.points.push(coord) == this.limiter) {
      this.points.shift();
    }
    if (this.points.length > 1) {
      var p1 = this.points[this.points.length-1];
      var p2 = this.points[this.points.length-2];

      drawLine(this.ctx, p1[0], p1[1], p2[0], p2[1], this.weight.value, this.colors.value);
    }
  }

  // clears point space
  clear() {
    this.points = [];
  }
}

// RUNNER FUNCTIONS
// get event coordinates (within object e.g. canvas)
var getEventCoords = function(event) {
  var rect = event.target.getBoundingClientRect();

  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  return [x, y];
}

// all event functions require the three parameters "details" and "event" and "points"
// details is defined as a dictionary {l: canvas, w: weight, c: colors, x: context}

// on mouse down function
var onMouseDown = function(details, event, points) {
  var coord = getEventCoords(event);
  var x = coord[0];
  var y = coord[1];

  var canvas = details["l"];
  var weight = details["w"];
  var colors = details["c"];
  var ctx = details["x"];

  // draw a point
  drawPoint(ctx, x, y, weight.value, colors.value)

  // initialize moving average
  points.extras["ma"]["x"] = x;
  points.extras["ma"]["y"] = y;

  points.update(coord);
}

// on mouse moved function
var onMouseMoved = function(details, event, points) {
  var coord = getEventCoords(event);
  
  points.extras["ma"] = movingAverage(coord, points.extras["ma"]);
  var x = points.extras["ma"]["x"];
  var y = points.extras["ma"]["y"];

  var pcopy = arrayDeepcopy(points.points);
  pcopy.shift();
  pcopy.push({0: x, 1: y});
  var rpoints = polynomialPudding2D(pcopy, 5);
  
  for (let i = 0; i < rpoints.length; i ++) {
    points.update(rpoints[i]);
  }
  points.update([x,y]);

}

// on mouse up function
var onMouseUp = function(details, event, points) {
  points.clear();
}

var main = function() {
  var details = { "l": element, "w": weight, "c": colors, "x": ctx };
  var pointSpace = new Points(3, details);

  // for nonexistent functions (mousedown/mousemoved/mouseup), use void instead
  defineListeners(
    element,      // canvas element
    details,      // canvas/pen details
    pointSpace,   // point space object
    onMouseDown,  // mousedown function
    onMouseMoved, // mousemoved function
    onMouseUp     // mouseup function
  );


}

main();