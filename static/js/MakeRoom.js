var socket = io()
var ishost = 0;
var roomsid = 0;

socket.on('connect', function() {
  socket.emit('newUser_MakeRoom')
})

socket.on('init_MakeRoom', function(data) {
  ishost = data.ishost
  roomsid = data.roomsid
})

/* 서버로부터 데이터 받은 경우 */
socket.on('update_MakeRoom', function(data) {
  if(data.proundNumber)
    document.getElementById("proundNumber").innerHTML = data.proundNumber
  if(data.ptimeToDraw)
    document.getElementById("ptimeToDraw").innerHTML = data.ptimeToDraw

  //message.classList.add(className)
  //message.appendChild(node)
  //chat.appendChild(message)
})

socket.on('startLobby', function(data) {
  location.href = '../Game/' + data;
})

socket.on('wrongAccess', function() {
  console.log('wrongAccess');
  location.href = '../';
})


/* 시작 함수 */
function start(maxRound, maxTime) {
  if(!ishost)
    return
  socket.emit('start', {maxRound: Number(maxRound), maxTime: Number(maxTime)});
}

// 라운드 증가 버튼 클릭
function incRound() {
  if(!ishost)
      return
  var text = document.getElementById("proundNumber").textContent;
  if(text=="9")
    return;
  var number = Number(text) + 1;
  document.getElementById("proundNumber").innerHTML = String(number);

  socket.emit('update_MakeRoom', {proundNumber: String(number)});
}


// 라운드 감소 버튼 클릭
function decRound() {
  if(!ishost)
      return
  var text = document.getElementById("proundNumber").textContent;
  if(text=="1")
    return;
  var number = Number(text) - 1;
  document.getElementById("proundNumber").innerHTML = String(number);

  socket.emit('update_MakeRoom', {proundNumber: String(number)});
}


// 시간 증가 버튼 클릭
function incTime() {
  if(!ishost)
      return
  var text = document.getElementById("ptimeToDraw").textContent;
  if(text=="90")
    return;
  var number = Number(text) + 10;
  document.getElementById("ptimeToDraw").innerHTML = String(number);

  socket.emit('update_MakeRoom', {ptimeToDraw: String(number)});
}


// 시간 감소 버튼 클릭
function decTime() {
  if(!ishost)
      return
  var text = document.getElementById("ptimeToDraw").textContent;
  if(text=="0")
    return;
  var number = Number(text) - 10;
  document.getElementById("ptimeToDraw").innerHTML = String(number);

  socket.emit('update_MakeRoom', {ptimeToDraw: String(number)});
}

