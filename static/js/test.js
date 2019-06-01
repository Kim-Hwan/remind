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
        img.setAttribute("src", "Logo/speakl.png");
        img.style.left = String(ply.offsetWidth/2) + 'px';
    }
    else
    {
        img.setAttribute("src", "Logo/speakr.png");
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

