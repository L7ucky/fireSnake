/**
 * Created by Andrew on 4/11/2015.
 */
var direction = 'right';
var curX=2;
var curY=2;
var speed=0.25;
var fb={};
fb.main =new Firebase('https://firesnakes.firebaseio.com/');
var mySnake = [];
var me ={
    color:'F00',
    length:1,
    body:[curX+':'+curY],
    head:'2:2'
};
var fruit =['10:10'];
var allEnemySnakes = [];

var myStartPoint = function(){
    return '2:2';
};



setInterval(function(){
    moveSnake(direction);
    console.log("moving "+this.direction +' '+this.curX+' '+this.curY);
}, 500*speed);

var drawSnake = function(){
    mySnake.push(curX + ":" + curY);
};

var eatFruit = function(){
    mySnake.splice(0,0,curX + ":" + curY);
};

var removeTail = function(){
    console.log("Removetail pixel: "+me.body[0]);
    fb.me.body.child(me.body[0]).remove();
    me.body.splice(0, 1);
};

var checkIfEatsFruit = function(x, y){
    for(f in fruit){
        var fruitArray = fruit[f].split(':');
        if(fruitArray[0] == x && fruitArray[1] == y)
            return true;
        return false;
    }
};

var makeNewFruit = function(){
    var x = Math.floor(Math.random()*100);
    var y = Math.floor(Math.random()*100);
    fruit[0]=x+':'+y;
    fb.main.child(x+':'+y).set('0F0');
};

var moveSnake = function(d){
    if(d == 'up'){
        this.curY -=1;
    }
    else if(d =='down'){
        this.curY +=1;
    }
    else if(d == 'left'){
        this.curX -=1;
    }
    else if (d == 'right'){
        this.curX +=1;
    }
    me.body.push(curX + ":" + curY);
    fb.me.body.child(curX + ":" + curY).set(me.color);

    if(!checkIfEatsFruit(curX,curY))
        removeTail();
    else{
        makeNewFruit()
    }
};


document.onkeydown =function (e) {
    console.log(e.keyCode);
    e = e || window.event;

    if (e.keyCode == '38') {
        direction = 'up';
    }
    else if (e.keyCode == '40') {
        // down arrow
        direction = 'down';
    }
    else if (e.keyCode == '37') {
        // left arrow
        direction = 'left';
    }
    else if (e.keyCode == '39') {
        // right arrow
        direction = 'right';
    }
};


$(document).ready(function () {
    //Set up some globals
    var pixSize = 3, lastPoint = null, currentColor = "000", mouseDown = 0;

    //Create a reference to the pixel data for our drawing.


    // Set up our canvas
    var myCanvas = document.getElementById('drawing-canvas');
    var myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
    if (myContext == null) {
        alert("You must use a browser that supports HTML5 Canvas to run this demo.");
        return;
    }

    //Setup each color palette & add it to the screen
    var colors = ["fff","000","f00","0f0","00f","88f","f8d","f88","f05","f80","0f8","cf0","08f","408","ff8","8ff"];
    for (c in colors) {
        var item = $('<div/>').css("background-color", '#' + colors[c]).addClass("colorbox");
        item.click((function () {
            var col = colors[c];
            return function () {
                currentColor = col;
            };
        })());
        item.appendTo('#colorholder');
    }

    //Keep track of if the mouse is up or down
    myCanvas.onmousedown = function () {mouseDown = 1;};
    myCanvas.onmouseout = myCanvas.onmouseup = function () {
        mouseDown = 0; lastPoint = null;
    };

    //Draw a line from the mouse's last position to its current position
    var drawLineOnMouseMove = function(e) {
        if (!mouseDown) return;

        e.preventDefault();

        // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
        var offset = $('canvas').offset();
        var x1 = Math.floor((e.pageX - offset.left) / pixSize - 1),
            y1 = Math.floor((e.pageY - offset.top) / pixSize - 1);
        var x0 = (lastPoint == null) ? x1 : lastPoint[0];
        var y0 = (lastPoint == null) ? y1 : lastPoint[1];
        var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
        while (true) {
            //write the pixel into Firebase, or if we are drawing white, remove the pixel
            fb.main.child(x0 + ":" + y0).set(currentColor === "fff" ? null : currentColor);

            if (x0 == x1 && y0 == y1) break;
            var e2 = 2 * err;
            if (e2 > -dy) {
                err = err - dy;
                x0 = x0 + sx;
            }
            if (e2 < dx) {
                err = err + dx;
                y0 = y0 + sy;
            }
        }
        lastPoint = [x1, y1];
    };
    $(myCanvas).mousemove(drawLineOnMouseMove);
    $(myCanvas).mousedown(drawLineOnMouseMove);



    $('#delete').click(function(){
        fb.main.remove();
    });



    // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
    // Note that child_added events will be fired for initial pixel data as well.
    var drawPixel = function(snapshot) {
        var coords = snapshot.key().split(":");
        myContext.fillStyle = "#" + snapshot.val();
        myContext.fillRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
    };
    var clearPixel = function(snapshot) {
        console.log("Clearing pixel: "+snapshot.val());
        var coords = snapshot.key().split(":");
        myContext.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
    };


    var addEnemySnake = function(snap){
        var sRef =fb.snakes.child(snap.key());

        sRef.child('body').on('child_added', drawPixel);
        sRef.child('body').on('child_changed', drawPixel);
        sRef.child('body').on('child_removed', clearPixel);
        console.log('addEnemySnake');
        var newSnake ={
            name:snap.key(),
            color:snap.val().color,
            length:snap.val().length,
            body:snap.val().body,
            head:snap.val().head
        };
        allEnemySnakes[newSnake.name]=newSnake;
        console.log(snap);
    };
    var updateEnemySnake = function(snap){
        for(snake in allEnemySnakes){
            if(snake.name === snap.key()){
                console.log('updateEnemySnake:');
                console.log(snap.key());
            }
        }
    };
    var clearEnemySnake = function(snap){
        console.log('clearEnemySanke');
        console.log(snap);
    };

    fb.main.on('child_added', drawPixel);
    fb.main.on('child_changed', drawPixel);
    fb.main.on('child_removed', clearPixel);


    fb.snakes = fb.main.child('snakes');

    fb.me = fb.snakes.push({
        'color': me.color,
        'length': me.length
        });
    fb.me.body = fb.me.child('body');
    fb.me.body.child(curX + ":" + curY).set(me.color);
    //Draw the fruit
    fb.main.child("10:10").set('0f0');
    fb.snakes.on('child_added', addEnemySnake);
    fb.snakes.on('child_changed', updateEnemySnake);
    fb.snakes.on('child_removed', clearEnemySnake);


});