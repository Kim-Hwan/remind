var State = require('./gamestates');

function GameLobby(info) {
	var self  = this;

	//self.lobbyPW = info.lobbyPW;
	self.host = info.host;
	self.io = info.io
	self.gameInterval = 0;

	self.players = [info.host, null, null, null, null, null];
	self.sockets = [info.socket, null, null, null, null, null];
	self.scores = [0, 0, 0, 0, 0, 0]
	self.anwsers = ["fuck"]
	self.drawerNum = 0;
	self.drawer = null;

	self.state = State.STATES.INIT;

	self.maxRound = 0;
	self.maxTime = 0;

	self.roundNum = 0;
	self.timeNum = 0;

	self.changeState = function(state) {
		self.state = state;
	}

	//self.players[0] = info.host;

}


//Game 초기화, 프론트엔드에서 Game.html을 로드할때 처음 한번 실행
GameLobby.prototype.initGame = function(maxRound, maxTime) {
	var self = this;

	self.changeState(State.STATES.READY);
	self.maxRound = maxRound;
	self.maxTime = maxTime;
	self.timeNum = self.maxTime;
	self.roundNum = 0;
	self.drawerNum = 0;
	self.drawer = null;

	for(var i = 0 ; i < 6 ; i++)
		self.scores[i] = 0;

	if(self.gameInterval)
		clearInterval(self.gameInterval);

}


//다음 라운드 Game, 시간이 다 되면 호출
GameLobby.prototype.nextRound = function() {
	var self = this;

	self.timeNum = self.maxTime;
	self.roundNum++;
	self.drawerNum = self.nextDrawer();
	self.drawer = self.players[self.drawerNum];
	self.changeState(State.STATES.PLAY);

	console.log(self.host + "'s Game: " + self.roundNum + "round start");
	self.io.sockets.to(self.host).emit('update_Game_round', self.roundNum);
	self.io.to((self.sockets[0]).id).emit('update_Game_round_yourdrawturn', self.anwsers[0]);

	function gameLoop() {
	
		if(self.timeNum < 1) {
			clearInterval(self.gameInterval);
			self.stopRound()
		}
		
		console.log("Tick..." + self.timeNum);
		self.timeNum--;
	}

	if(self.gameInterval)
		clearInterval(self.gameInterval);
	self.gameInterval = setInterval(gameLoop.bind(self), 1000);
}

GameLobby.prototype.nextDrawer = function() {
	var self = this;
	return 0;
}

//정답 확인 함수, app.js에서 전송받은 message가 답인지 확인할 때 호출
GameLobby.prototype.isAnwser = function(message) {
	var self = this;

	//게임중이 아니라면 무시
	if(self.state != State.STATES.PLAY)
		return 0;
	return (message == self.anwsers[0]);
}

//점수 증가 함수
GameLobby.prototype.incScore = function(player) {
	var self = this;

	for(var i = 0 ; i < 6 ; i++) {
		if(self.players[i] == player) {
			self.scores[i]++;

			console.log(self.scores);
			self.io.sockets.to(self.host).emit('update_Game_score', self.scores);

			return;
		}
	}
}

//한 라운드 종료시 호출
GameLobby.prototype.stopRound = function() {
	var self = this;
	self.changeState(State.STATES.STOP);

	if(self.roundNum >= self.maxRound )
		self.endedGame();
	else
		self.nextRound();
}

//모든 라운드의 Game 끝
GameLobby.prototype.endedGame = function() {
	var self = this;

	self.changeState(State.STATES.INIT);

	self.io.sockets.to(self.host).emit('ended_Game', self.host);
}


// lobby와 user 관리 함수

GameLobby.prototype.joinUser = function(socket, PW) {
	var self = this;
	var sid = socket.handshake.sessionID

	socket.join(PW);
	for(var i in self.players) {
		// 이미 입력된 players
		if(self.players[i] == sid)
			return;
		if(!self.players[i]) {
			self.players[i] = sid;
			self.sockets[i] = socket;
			console.log(self.players);
			return;
		}
	}

}

GameLobby.prototype.leaveUser = function(socket) {
	var self = this;
	var sid = socket.handshake.sessionID;
	//socket.leave();
	for(var i in self.players) {
		if(self.players[i] == sid) {
			self.players[i] = null;
			return;
		}
	}
}

GameLobby.prototype.reconnectSocket = function(socket) {
	var self = this;
	var sid = socket.handshake.sessionID;

	for(var i in self.players) {
		if(self.players[i] == sid) {
			self.sockets[i] = socket;
			return;
		}
	}
}


module.exports = GameLobby;