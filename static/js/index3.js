var socket = io()

/* 접속 되었을 때 실행 */
socket.on('connect', function() {

 var name;
  /* 이름을 입력받고 */
  if(1) {
    name = prompt('반갑습니다!', '')
    /* 이름이 빈칸인 경우 */
    if(!name) {
      name = '익명'
    }
  }

  else {
    name = socket.handshake.session.userName
    alert('반갑습니다! ' + name + '님!!');
  }
 
  /* 서버에 새로운 유저가 왔다고 알림 */
  socket.emit('newUser', name)
})
