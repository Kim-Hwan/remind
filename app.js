/* 설치한 express 모듈 불러오기 */
const express = require('express')

/* 설치한 socket.io 모듈 불러오기 */
const socket = require('socket.io')

/* Node.js 기본 내장 모듈 불러오기 */
const http = require('http')

/* Node.js 기본 내장 모듈 불러오기 */
const fs = require('fs')

// 추가
const cookie = require('cookie');
const session = require("express-session")({
    secret: "secretcodeofhwan",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session"); // socket io session 모듈

/* express 객체 생성 */
const app = express()

/* express http 서버 생성 */
const server = http.createServer(app)

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server)

// word 불러오기 및 객체 생성
const Word = require('./router/newworddb');

// 로비매니저 불러오기 및 객체 생성
var LobbyManager = require('./router/socket/lobbymanager');
var lobbyManager = new LobbyManager(io, Word);

// 데이터베이스 대체 배열
var sessions = {};

app.use(session);

io.use(sharedsession(session, {
    autoSave:true
})); 

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))
app.use('/Logo', express.static('./static/Logo'))

/* Get 방식으로 / 경로에 접속하면 실행 됨 */
app.get('/', function(request, response) {
  fs.readFile('./static/MainPage.html', function(err, data) {
    if(err) {
      response.send('에러')
    } else {
      sessions[request.sessionID] = request.sessionID   // 세션 배열에 추가
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})

app.get('/MakeRoom/:id', function(request, response) {
  fs.readFile('./static/MakeRoom.html', function(err, data) {
    if(err) {
      response.send('에러')
    } else {
      sessions[request.sessionID] = request.params.id   // 세션 배열에 추가
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})


app.get('/Game/:id', function(request, response) {
  fs.readFile('./static/Game2.html', function(err, data) {
    if(err) {
      response.send('에러')
    } else if(sessions[request.sessionID] != request.params.id) {
      response.send('정상적이지 않은 접근')
    } 
    else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})



io.sockets.on('connection', function(socket) {

  /* 새로운 유저가 접속 */
  socket.on('newUser', function(name) {
    //console.log(name + ' 님이 접속하였습니다.')

    /* 소켓과 세션에 이름 저장해두기 */
    socket.name = name;
    socket.handshake.session.userName = name;
  })

  /* 새로운 유저가 참가*/
  socket.on('newUser_MakeRoom', function() {
    var sid = socket.handshake.sessionID;       // 전송받은 메세지가 보내진 세션id
    var roomsid = sessions[sid];                   // 전송받은 메세지가 보내질 룸의 세션ID
    var lobby = lobbyManager.gameLobbys[roomsid];   // 전송받은 메세지가 보내질 로비

    lobbyManager.joinLobby(socket, roomsid)    // 로비매니저에게 joinlobby 요청
    socket.join(roomsid);   // 소켓 룸 조인
    socket.name = socket.handshake.session.userName;    // 이름 백업

    //새로 로드된 MakeRoom.html 초기화
    socket.emit('init_MakeRoom', {  ishost: !!(socket.handshake.sessionID == sessions[socket.handshake.sessionID]),
                                    roomsid: roomsid
    });
  })

  /* 새로운 유저가 참가 */
  socket.on('newUser_Game', function() {

    var sid = socket.handshake.sessionID;       // 전송받은 메세지가 보내진 세션id
    var roomsid = sessions[sid];                   // 전송받은 메세지가 보내질 룸의 세션ID
    var lobby = lobbyManager.gameLobbys[roomsid];   // 전송받은 메세지가 보내질 로비

    if(!lobby) {
      socket.emit('wrongAccess');
      return;
    }

    socket.join(roomsid);  // 소켓 룸 조인
    socket.name = socket.handshake.session.userName;    // 이름 백업

    if(lobby)
      lobby.reconnectSocket(socket);

    //새로 로드된 Game.html 초기화
    socket.emit('init_Game', {ishost: !!(socket.handshake.sessionID == sessions[socket.handshake.sessionID]), 
                              player: lobby.playerNum(sid)
    });
  })

  // 방만들기 요청
  socket.on('makeLobby', function() {
    // 로비매니저에게 로비 생성 요청
    lobbyManager.makeLobby(socket)

    // 클라이언트에게 페이지 업데이트 요청
    socket.emit('nextPage', 'MakeRoom/' + socket.handshake.sessionID)
    //socket.emit('nextPage', 'MakeRoom.html')
  })

  // 방참가 요청
  socket.on('fastStart', function() {
    var roomsid = lobbyManager.canJoinLobby()
    if(roomsid) {
      socket.emit('nextPage', 'MakeRoom/' + roomsid)
    }
    else {
      // 로비매니저에게 로비 생성 요청
      lobbyManager.makeLobby(socket)

      // 클라이언트에게 페이지 업데이트 요청
      socket.emit('nextPage', 'MakeRoom/' + socket.handshake.sessionID)
    }
  })

  

  socket.on('update_MakeRoom', function(data) {
    var sid = socket.handshake.sessionID;       // 전송받은 메세지가 보내진 세션id
    var roomsid = sessions[sid];                   // 전송받은 메세지가 보내질 룸의 세션ID  
    socket.broadcast.to(roomsid).emit('update_MakeRoom', data);
  })

  // MakeRoom.html의 host가 보낸 start 요청
  socket.on('start', function(data) {
    io.sockets.to(socket.handshake.sessionID).emit('startLobby', socket.handshake.sessionID);
    console.log("SSSSSSSSTTTTTTTAAAAAARTTLoby");
    lobbyManager.startLobby(socket.handshake.sessionID, {maxRound: data.maxRound, maxTime: data.maxTime});
  })

  // Game.html의 host가 보낸 start 요청
  socket.on('startGame', function(data) {
    io.sockets.to(socket.handshake.sessionID).emit('startLobby', socket.handshake.sessionID);
    console.log("SSSSSSSSTTTTTTTAAAAAARTTGGGGGAAAAMMMEEEE");
    lobbyManager.startLobby2(socket.handshake.sessionID);
  })

  /* 전송한 메시지 받기 */
  socket.on('message', function(data) {

    var sid = socket.handshake.sessionID;       // 전송받은 메세지가 보내진 세션id
    var roomsid = sessions[sid];                   // 전송받은 메세지가 보내질 룸의 세션ID
    var lobby = lobbyManager.gameLobbys[roomsid];   // 전송받은 메세지가 보내질 로비

    // 전송받은 메세지가 드로어에 의해 보내진 경우 무시
    if(lobby.drawer == sid)
      return

    // 전송받은 메세지가 현 라운드의 정답이라면,
    if(lobby.isAnswer(data.message)) {
      lobby.incScore(sid);
      //emit
    }
    /* 받은 데이터에 누가 보냈는지 이름을 추가 */
    data.name = socket.name
    
    console.log(data)

    io.sockets.to(roomsid).emit('update', data);
    //socket.broadcast.emit('update', data);
  })

  /* 접속 종료 */
  socket.on('disconnect', function() {
    //if(socket.handshake.session.userName)
    //  delete socket.handshake.session.userName;
    //delete sessions[socket.handshake.sessionID]
    //console.log(socket.name + '님이 나가셨습니다.')
  })

  socket.on('draw', function(data) {

    /* 모든 소켓에게 전송 */
    io.sockets.to(sessions[socket.handshake.sessionID]).emit('draw', data)
  })


  testfunc = function(data){
    io.sockets.emit('answer',data);
  }

  //new paint
  socket.on('drawline', function(data) {
    /* 소켓에게 전송 except sender*/
    socket.broadcast.to(sessions[socket.handshake.sessionID]).emit('drawline',data);
  })

  socket.on('clearcanvas', function() {
    /* 소켓에게 전송 except sender*/
    socket.broadcast.to(sessions[socket.handshake.sessionID]).emit('clearcanvas');
  })

})

/* 서버를 8080 포트로 listen */
server.listen(8080, function() {
  console.log('서버 실행 중..')
})  



const twitch = require('./router/twitchconfig');

function connecttwitch(userid,roomid,answerword)
{
    var twitchclient = twitch.create(userid);

  twitchclient.connect();


  twitchclient.on('chat', (channel, userstate, message, self) => {
    var user = userstate.username;
    var msg = message.trim();
    console.log(user + ':' + msg);
    if (msg == answerword){
      rooms['123'].answer(io,user + '님이 정답을 맞췄습니다!' + msg);
      //some function with roomid
      twitchclient.disconnect();
    }
    
  });
}


var users = [];

//users['3'] = connecttwitch('elded');
//users['6'] = connecttwitch('thtl1999',345,'아메리카');


const youtube = require('./router/youtubeconfig');

function connectyoutube(videoid,roomid,answerword)
{
  youtube.create(videoid,function(config){

    var lasttime = 0;

    var intervalid = setInterval(function(){
      youtube.getchat(config,lasttime,function(chatlist,t){
      //console.log(chatlist);
      //console.log(t);
      lasttime = t;
      chatlist.forEach(element => {
        console.log(element.author + ':' + element.msg);
        if (element.msg == answerword){
          rooms['123'].answer(io,element.author + '님이 정답을 맞췄습니다!' + element.msg);
          //somefunction with room id
          clearInterval(intervalid);
        }  
      });

      });
    },2000)

  });

}

//users['123'] = connectyoutube('YCDezUvIOUs',123,'아메리카');

var rooms = [];
rooms['123'] = require('./router/sockettest.js');


/*
setInterval(function(){
  rooms['123'].answer(io,'asd');
},1000)
*/

//const Word = require('./router/newworddb');

var test = Word.Getwords(3);


