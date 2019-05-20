const fs = require('fs');
const request = require('request');
const videogeturl = 'https://www.googleapis.com/youtube/v3/videos';
const chatgeturl = 'https://www.googleapis.com/youtube/v3/liveChat/messages';

const videogetbody = {
    part : 'liveStreamingDetails',
    id : '',
    key : ''
};

const chatgetbody = {
    liveChatId: '',
    part: 'snippet,authorDetails',
    maxResults: '200',  //minimum is 200
    key: ''
};

const requestoption = {
    url: '',
    method: 'GET',
    qs: {},
    json: true
}

const keyjson = fs.readFileSync('./keys/api_key.json');
const ytpwd = JSON.parse(keyjson).ytkey;

//var chatgetconfig;

module.exports = {

    create: function(video, callback){
    
        var body = Object.assign({},videogetbody,{id: video, key: ytpwd});
        var videogetconfig = Object.assign({},requestoption,{qs: body},{url: videogeturl});
        //console.log(videogetconfig);
    
        request(videogetconfig, function (error, res, data){
            //console.log(data);
            var livechatid = data.items[0].liveStreamingDetails.activeLiveChatId;
            
            var body = Object.assign({},chatgetbody,{liveChatId: livechatid, key: ytpwd});
            var chatgetconfig = Object.assign({},requestoption,{qs: body},{url: chatgeturl});
            console.log(chatgetconfig)
            callback(chatgetconfig);
        })
    },

    getchat: function(chatgetconfig, lasttime, callback){
        request(chatgetconfig, function (error, res, data){
            var chatitems = data.items;
            var chatlist = [];

            for(var item in chatitems){
                try{

                    var msgtime = Date.parse(chatitems[item].snippet.publishedAt);
                    if (msgtime > lasttime)
                    {
                        var message = chatitems[item].snippet.textMessageDetails.messageText;
                        var author = chatitems[item].authorDetails.displayName;
                        chatlist.push({msg:message,author:author});
                        lasttime = msgtime;
                    }

                    
                }
                catch (e){
                    //console.log(e);
                }
                
            }
            //console.log(chatlist);
            callback(chatlist,lasttime);
            return lasttime;
        })
    }

}