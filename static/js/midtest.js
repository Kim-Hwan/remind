window.onload = function () {

  // Definitions
  var canvas = document.getElementById("paint-canvas");
  var context = canvas.getContext("2d");
  var boundings = canvas.getBoundingClientRect();
  context.lineJoin = "round";
  // Specifications
  var mouseX = 0;
  var mouseY = 0;
  context.strokeStyle = 'black'; // initial brush color
  context.lineWidth = 1; // initial brush width
  var isDrawing = 0;


  // Handle Colors
  var colors = document.getElementsByClassName('colors')[0];

  colors.addEventListener('click', function(event) {
    context.strokeStyle = event.target.value || 'black';
    isDrawing = 0;
  });

  // Handle Brushes
  var brushes = document.getElementsByClassName('brushes')[0];

  brushes.addEventListener('click', function(event) {
    context.lineWidth = event.target.value || 1;
    isDrawing = 0;
  });

  // Mouse Down Event
  canvas.addEventListener('mousedown', function(event) {
    setMouseCoordinates(event,this);
    isDrawing = 1;

    // Start Drawing
    context.beginPath();
    context.moveTo(mouseX - 1, mouseY);
    context.lineTo(mouseX, mouseY);
    context.stroke();
  });

  // Mouse Move Event
  canvas.addEventListener('mousemove', function(event) {
    setMouseCoordinates(event,this);

    if(isDrawing == 1){
      context.lineTo(mouseX, mouseY);
      context.stroke();
    }
  });

  // Mouse Up Event
  /*
  canvas.addEventListener('mouseup', function(event) {
    setMouseCoordinates(event,this);
    isDrawing = 0;
  });
  */

  window.addEventListener('mouseup', function(event){
    setMouseCoordinates(event,this);
    isDrawing = 0;
  })

  canvas.addEventListener('mouseleave', function(event) {
    if (isDrawing == 1) isDrawing = -1;
  })

  canvas.addEventListener('mouseenter', function(event) {
    setMouseCoordinates(event,this);
    if (isDrawing == -1) isDrawing = 1;
    context.moveTo(mouseX, mouseY);
  });

  // Handle Mouse Coordinates
  function setMouseCoordinates(e,c) {
    //mouseX = event.clientX - boundings.left;
    //mouseY = event.clientY - boundings.top;
    mouseX = e.pageX - c.offsetLeft;
    mouseY = e.pageY - c.offsetTop;
  }

  // Handle Clear Button
  var clearButton = document.getElementById('clear');

  clearButton.addEventListener('click', function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    isDrawing = 0;
  });

  // Handle Save Button
  var saveButton = document.getElementById('save');

  saveButton.addEventListener('click', function() {
    var imageName = prompt('Please enter image name');
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = imageName || 'drawing';
    a.click();
  });

  context.font = "30px Arial";
  

  var socket = io();
  var answered = 0;


  socket.on('answer',function(data){
    if (answered == 0)
    {
      context.fillText(data,10,50);
    answered = 1;
    console.log(data);
    }
    
  });
  


};