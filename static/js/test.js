function makes(player,str){
    var ply = document.getElementById(player);
    var img = document.createElement("img");
    var txt = document.createElement("figure");
    img.setAttribute("width", "150");
    img.setAttribute("height", ply.offsetHeight/2);
    img.style.position = 'absolute';
    img.style.top = String(ply.offsetTop) + 'px';
    if (['player1','player2','player3'].includes(player))
    {
        img.setAttribute("src", "/Logo/speakl.png");
        img.style.left = String(ply.offsetWidth/2) + 'px';
    }
    else
    {
        img.setAttribute("src", "/Logo/speakr.png");
        img.style.left = String(ply.offsetLeft + ply.offsetWidth/2 - img.width) + 'px';
    }
    
    txt.style.position = 'absolute';
    txt.style.top = img.style.top;
    txt.style.left = img.style.left
    txt.innerHTML = str;
    
    document.body.appendChild(img);
    document.body.appendChild(txt);
    
    setTimeout(function() {
        img.remove();
        txt.remove();
    }, 2000);
    
    
}

function startbutton(){
    if(!ishost)
        return
    var img = document.createElement("img");
    img.setAttribute("id","gamestartbutton");
    img.addEventListener("click",startpressed);
    img.setAttribute("src", "/Logo/시작.png");
    img.setAttribute("width", "400");
    img.style.position = 'absolute';
    
    img.style.top = String(document.documentElement.clientHeight/2 - img.height/2) + 'px';
    img.style.left = String(document.documentElement.clientWidth/2 - img.width/2) + 'px';
    
    img.style.cursor = 'pointer';
    document.body.appendChild(img);
}

//startbutton();

function startpressed(img){
    document.getElementById("gamestartbutton").remove();
    start()
}



function input_Text(){
    var txt = document.getElementById("txtbox").value;

    console.log(txt);
    send(txt);
    
    document.getElementById("txtbox").value = "";
}

function enterkey(e){
    if (e.keyCode == 13) {
        input_Text();
    }
}