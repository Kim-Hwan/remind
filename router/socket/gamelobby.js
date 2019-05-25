var State = require('./gamestates');

function GameLobby(info) {
	var self  = this;

	self.lobbyPW = info.lobbyPW;
	self.players = {};
	self.host = info.host;

	self.maxRound = info.maxRound;
	self.maxTime = info.maxTime;

	self.state = State.STATES.INIT;
	self.roundNum = 0;

	self.players[0] = info.host;

}


GameLobby.prototype.joinUser = function(socket, PW) {
	var self = this;

	socket.join(PW);
	self.players[socket] = socket;

}

GameLobby.prototype.leaveUser = function() {
	var self = this;
}


module.exports = GameLobby;