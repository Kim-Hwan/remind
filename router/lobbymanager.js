function LobbyManager(socketio) {
	var self = this;

	self.gameLobbys = {};
	self.sockets = [];
	self.io = socketio;

}

module.exports = LobbyManager;