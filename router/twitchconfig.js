const tmi = require("tmi.js");
const fs = require('fs');


var twitchconfig = {
    options: {debug: false},
    connection: {cluster: 'aws', reconnect: true},
    identity: {
    username: "RemindChatBot"
    //password: "oauth:sdfsdfsdf"
    }
    //channels: ['name']
  };

module.exports = {

    create: function(channel){
        var keyjson = fs.readFileSync('./keys/api_key.json');
        var twitchpwd = JSON.parse(keyjson).twitchkey;
      
          var config = Object.assign({},twitchconfig,{identity:{username: "RemindChatBot", password: twitchpwd}},{channels: [channel]});
          console.log(config);
      
      
          return new tmi.client(config);
      }

}

//module.exports = create;