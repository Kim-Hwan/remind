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

	self.words = info.word;
    self.answer = 0;
    self.mine = 0;

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
	self.drawerNum = -1;
	self.drawer = null;

	for(var i = 0 ; i < 6 ; i++)
		self.scores[i] = 0;

	if(self.gameInterval)
		clearInterval(self.gameInterval);

}


//다음 라운드 Game, 시간이 다 되면 or 정답 시 호출
GameLobby.prototype.nextRound = function() {
	var self = this;

	self.timeNum = self.maxTime;
	self.roundNum++;
	self.answer = self.words[self.roundNum].word	    // 단어
	self.mine = self.words[self.roundNum].similar[0]	// 나중에 변경 필요
	self.drawerNum = self.nextDrawer();
	self.drawer = self.players[self.drawerNum];
	self.changeState(State.STATES.PLAY);

	if(self.gameInterval)
		clearInterval(self.gameInterval);

	console.log(self.host + "'s Game: " + self.roundNum + "round start");
	self.io.sockets.to(self.host).emit('update_Game_round', self.roundNum);
	self.io.to((self.sockets[self.drawerNum]).id).emit('update_Game_round_yourdrawturn', 
		{	answerword: self.answer,
			mineword: self.mine
	});
	self.io.sockets.to(self.host).emit('clearcanvas', self.roundNum);

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

// 다음 drawer의 번호를 계산하여 반환
GameLobby.prototype.nextDrawer = function() {
	var self = this;
	var nextDrawerNum = self.drawerNum + 1;

	// 단순하게 (최근번호+1)%(플레이어 수)를 반환하면 안되는 이유
	// 플레이어 수는 중간에 나가는 플레이어로 인해 유동적이기 때문
	while(self.players[nextDrawerNum] == null) {
		nextDrawerNum = (nextDrawerNum + 1) % 6
		if(nextDrawerNum == self.drawerNum)	// 검색 도중 이전 drawer를 반환하는 경우(정상적이지 않은 게임 흐름)
			return -1
	}	

	return nextDrawerNum;
}

//정답 확인 함수, app.js에서 전송받은 message가 답인지 확인할 때 호출
GameLobby.prototype.isAnswer = function(message) {
	var self = this;

	//게임중이 아니라면 무시
	if(self.state != State.STATES.PLAY)
		return 0;
	return (message == self.answer);
}

//점수 증가 함수
GameLobby.prototype.incScore = function(player) {
	var self = this;

	for(var i = 0 ; i < 6 ; i++) {
		if(self.players[i] == player) {
			self.scores[i]++;

			console.log(self.scores);
			self.io.sockets.to(self.host).emit('update_Game_score', self.scores);
			self.stopRound()	// 정답을 맞춘 사람이 있으므로 다음 라운드
			return;
		}
	}
}

//한 라운드 종료시 호출
GameLobby.prototype.stopRound = function() {
	var self = this;
	self.changeState(State.STATES.STOP);

	if(self.gameInterval)
		clearInterval(self.gameInterval);

	if(self.roundNum >= self.maxRound )
		self.endedGame();
	else
		self.nextRound();
}

//모든 라운드의 Game 끝
GameLobby.prototype.endedGame = function() {
	var self = this;

	if(self.gameInterval)
		clearInterval(self.gameInterval);

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
			self.socket[i] = null;
			socket.leave(self.host);
			return;
		}
	}
}

// MakeRoom -> Game 페이지로 옮겼을 경우 player에 해당하는 socket을 재지정해서 연결
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

// sid로 player의 번호를 찾아내 호출
GameLobby.prototype.playerNum = function(sid) {
	var self = this;

	for(var i in self.players) 
		if(self.players[i] == sid) 
			return Number(i)+1;
	return 0;
}


// 해당 로비에 사람이 참가할 수 있는 상황인가
GameLobby.prototype.canJoin = function() {
	var self = this;
	if(self.state != State.STATES.INIT)
		return 0;
	for(var i = 0 ; i < 6 ; i++) {
		if(self.players[i] == null)
			return 1;
	}
	return 0;
}

module.exports = GameLobby;