var socket2 = io()

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var admin = 0;
 
var painting = document.getElementById('paint');
var paint_style = getComputedStyle(painting);
canvas.width = parseInt(paint_style.getPropertyValue('width'));
canvas.height = parseInt(paint_style.getPropertyValue('height'));

var mouse = {x: 0, y: 0};
var premouse = {x:0,y:0};
 
canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;
}, false);

ctx.lineWidth = 3;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = '#00CC99';
 
canvas.addEventListener('mousedown', function(e) {
    if (admin == 0) return;

    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    premouse.x = mouse.x;
    premouse.y = mouse.y;
 
    canvas.addEventListener('mousemove', onPaint, false);
}, false);
 
canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', onPaint, false);
}, false);
 
var onPaint = function() {
    ctx.lineTo(mouse.x, mouse.y);
    socket2.emit('draw', {x1: premouse.x, x2: mouse.x, y1: premouse.y, y2: mouse.y})
    premouse.x = mouse.x;
    premouse.y = mouse.y;
    ctx.stroke();
};

socket2.on('draw', function(data) {

    if (admin != 0) return;
    console.log(data);

    ctx.beginPath();
    ctx.moveTo(data.x1, data.y1);
    ctx.lineTo(data.x2, data.y2);
    ctx.stroke();

    
  })