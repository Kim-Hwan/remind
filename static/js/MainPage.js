var socket = io()
var lobbyPW = 0;

/* 접속 되었을 때 실행 */
socket.on('connect', function() {

  var name = '익명';
  /* 서버에 새로운 유저가 왔다고 알림 */
  socket.emit('newUser', name)

})

// 서버로부터 페이지 업데이트 명령
socket.on('nextPage', function(data) {
  location.href =  data
}) 

// 방만들기 버튼 클릭
function makeLobby() {
  socket.emit('makeLobby');
  //location.href = "/client/MakeRoom.html";
}



// 시작 버튼 클릭
function fastStart() {
  socket.emit('fastStart');
}



// 캐릭터 변경 화살표 버튼 클릭
function changeCharacter() {


}

