const fs = require('fs')


const worddbfile = fs.readFileSync('./db/words.json');
const worddb = JSON.parse(worddbfile);
//console.log(worddb);



module.exports = {
    
    Getwords: function(n) {
        
        var randomlist = [];

        while(randomlist.length < n)
        {
            var rand = Math.floor(Math.random() * worddb.length);
            if (randomlist.indexOf(rand) == -1)
            {
                randomlist.push(rand);
            }
        }

        var wordlist = [];

        randomlist.forEach(e => {
            wordlist.push(worddb[e]);
        });

        return wordlist;

    }
    
        
}