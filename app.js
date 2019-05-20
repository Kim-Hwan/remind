/* 설치한 express 모듈 불러오기 */
const express = require('express')

/* 설치한 socket.io 모듈 불러오기 */
const socket = require('socket.io')

/* Node.js 기본 내장 모듈 불러오기 */
const http = require('http')

/* Node.js 기본 내장 모듈 불러오기 */
const fs = require('fs')

/* express 객체 생성 */
const app = express()

/* express http 서버 생성 */
const server = http.createServer(app)

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server)

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

/* Get 방식으로 / 경로에 접속하면 실행 됨 */
app.get('/', function(request, response) {
  fs.readFile('./static/midtest.html', function(err, data) {
    if(err) {
      response.send('에러')
    } else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})

io.sockets.on('connection', function(socket) {

  /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
  socket.on('newUser', function(name) {
    console.log(name + ' 님이 접속하였습니다.')

    /* 소켓에 이름 저장해두기 */
    socket.name = name

    /* 모든 소켓에게 전송 */
    io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })

  /* 전송한 메시지 받기 */
  socket.on('message', function(data) {
    /* 받은 데이터에 누가 보냈는지 이름을 추가 */
    data.name = socket.name
    
    console.log(data)

    /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', data);
  })

  /* 접속 종료 */
  socket.on('disconnect', function() {
    console.log(socket.name + '님이 나가셨습니다.')

    /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'});
  })

  socket.on('draw', function(data) {

    /* 모든 소켓에게 전송 */
    io.sockets.emit('draw', data)
  })


  testfunc = function(data){
    io.sockets.emit('answer',data);
  }



})

/* 서버를 8080 포트로 listen */
server.listen(8080, function() {
  console.log('서버 실행 중..')
})


var mongoose = require('mongoose');

// [ CONFIGURE mongoose ]

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/remind');

var Word = require('./models/word');
//var router = require('./router')(app, Book);

function Getaword(){
  Word.count(function(err, count){
    if(err) console.log('get a word error: count');
    var rand = Math.floor(Math.random() * count);
    Word.findOne().skip(rand).exec(
      function (err, result){
        console.log(result);
        return result;
      })
  })
}

Getaword();

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



