var socket = io()
var ishost = 0;
var players = {}

socket.on('connect', function() {
  socket.emit('newUser_MakeRoom')
})

socket.on('init_MakeRoom', function(data) {
  ishost = data
})




/* 서버로부터 데이터 받은 경우 */
socket.on('update_MakeRoom', function(data) {

  //message.classList.add(className)
  //message.appendChild(node)
  //chat.appendChild(message)
})

socket.on('startLobby', function(data) {
  location.href = '../Game/' + data;
})


/* 메시지 전송 함수 */
function start(maxRound, maxTime) {
  if(!ishost)
    return
  socket.emit('start', {maxRound: maxRound, maxTime: maxTime});
}

// 라운드 증가 버튼 클릭
function incRound() {
  if(!ishost)
    return
}


// 라운드 감소 버튼 클릭
function decRound() {
  if(!ishost)
    return

}


// 시간 증가 버튼 클릭
function incTime() {
  if(!ishost)
    return

}


// 시간 감소 버튼 클릭
function decTime() {
  if(!ishost)
    return

}

