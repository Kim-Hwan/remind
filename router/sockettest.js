module.exports = {
    /*
    answer: function(io,data) {
        io.on('connection', function(socket) {
            socket.emit('answer',data);
        return;
        });
    }
    */
   answer: function(io,data) {
        io.sockets.emit('answer',data);
    }
        
}