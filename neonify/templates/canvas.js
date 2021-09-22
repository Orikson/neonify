var recentPoints = [];
var pen = false;
var recentCurvePoints = [];
var curvefit = 0;
var weight = document.getElementById("weight");
weight.value = "5";
var colors = document.getElementById("colorpicker");

var pendown = function(){
  pen = true;
}
var penup = function(){
  pen = false;
}

var drawLine = function(points){
  var c = document.getElementById("drawingCanvas");
  var ctx = c.getContext("2d");
  ctx.beginPath();

  ctx.moveTo(points[0][0], points[0][1]);
  ctx.lineTo(points[1][0], points[1][1]);
  ctx.lineWidth = weight.value;
  ctx.strokeStyle = colors.value;
  ctx.stroke();
  
  ctx.arc(points[1][0], points[1][1], weight.value/2, 0, 2 * Math.PI);
  ctx.arc(points[0][0], points[0][1], weight.value/2, 0, 2 * Math.PI);
  ctx.fillStyle = colors.value;
  ctx.fill();
}

var drawCurve = function(points){
  var c = document.getElementById("drawingCanvas");
  var ctx = c.getContext("2d");
  ctx.beginPath();

  ctx.moveTo(points[0][0], points[0][1]);
  ctx.quadraticCurveTo(points[1][0], points[1][1], points[2][0], points[2][1]);
  ctx.lineWidth = weight.value;
  ctx.strokeStyle = colors.value;
  ctx.stroke();

  ctx.arc(points[2][0], points[2][1], weight.value/2, 0, 2 * Math.PI);
  ctx.arc(points[0][0], points[0][1], weight.value/2, 0, 2 * Math.PI);
  ctx.fillStyle = colors.value;
  ctx.fill();
}

var drawPoint = function(point){
  var c = document.getElementById("drawingCanvas");
  var ctx = c.getContext("2d");
  ctx.beginPath();

  ctx.arc(point[0], point[1], weight.value/2, 0, 2 * Math.PI);
  ctx.fillStyle = colors.value;
  ctx.fill();
}

const element = document.getElementById("drawingCanvas")
let moved
let downListener = () => {
  moved = true;
  
  var rect = event.target.getBoundingClientRect();

  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  
  drawPoint([x, y]);
  
  if (recentPoints.length < 3) {
    recentPoints.push([x,y]);
  } else {
    recentPoints[2] = recentPoints[1];
    recentPoints[1] = recentPoints[0];
    recentPoints[0] = [x,y];
  }
  
  if (recentPoints.length < 3) {
    recentPoints.push([x,y]);
  } else {
    recentPoints[2] = recentPoints[1];
    recentPoints[1] = recentPoints[0];
    recentPoints[0] = [x,y];
  }
  
  curvefit = 0;
}
element.addEventListener('mousedown', downListener)
let moveListener = () => {
  if (moved){
    var rect = event.target.getBoundingClientRect();

    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    if (recentPoints.length < 3) {
      recentPoints.push([x,y]);
    } else {
      recentPoints[2] = recentPoints[1];
      recentPoints[1] = recentPoints[0];
      recentPoints[0] = [x,y];

      //drawLine(recentPoints);

      drawCurve(recentPoints);
      
      curvefit += 1;
    }
  }
}
element.addEventListener('mousemove', moveListener)
let upListener = () => {
  //element.style.backgroundColor = "black";
  moved = false;
  var rect = event.target.getBoundingClientRect();

  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  
  drawPoint([x, y]);
  
  if (recentPoints.length < 3) {
    recentPoints.push([x,y]);
  } else {
    recentPoints[2] = recentPoints[1];
    recentPoints[1] = recentPoints[0];
    recentPoints[0] = [x,y];
  }
  
  if (recentPoints.length < 3) {
    recentPoints.push([x,y]);
  } else {
    recentPoints[2] = recentPoints[1];
    recentPoints[1] = recentPoints[0];
    recentPoints[0] = [x,y];
  }
  
  recentPoints = [];
}
element.addEventListener('mouseup', upListener)

// release memory
//element.removeEventListener('mousedown', downListener)
//element.removeEventListener('mousemove', moveListener)
//element.removeEventListener('mouseup', upListener)

