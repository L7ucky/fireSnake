/**
 * Created by Andrew on 4/11/2015.
 */

var app = angular.module("mainApp", ["firebase"]);


app.controller("mainApp", function($scope, $firebaseObject) {
    //var ref = new Firebase("https://firesnakes.firebaseio.com/");
    //console.log("Got inside the controller and about to attempt the data bind")
    //// download the data into a local object
    //$scope.data = $firebaseObject(ref);
    //var syncObject = $firebaseObject(ref);
    //syncObject.$bindTo($scope, "data");
    //// putting a console.log here won't work, see below
});
var direction = 'right';
var curX=2;
var curY=2;
var speed=125;
var grow = false;
var fb={};
var myID=0;
fb.main =new Firebase('https://firesnakes.firebaseio.com/');
var mySnake = [];
var me ={
    color:'F00',
    length:1,
    body:[curX+':'+curY],
    head:'2:2'
};


var myStartPoint = function(){
    return '2:2';
};

var interval = setInterval(function(){
    moveSnake(direction);
}, speed);

var resetInterval = function(newSpeed){
    clearInterval(interval);
    interval = setInterval(function(){
        moveSnake(direction);
    }, newSpeed);
}

var removeTail = function(){
    if(!grow) {
        fb.me.body.child(me.body[0]).remove();
        me.body.splice(0, 1);
    }
    else
        grow = false;
};

//var checkIfEatsFruit = function(x, y){
//    for(f in fruit){
//        var fruitArray = fruit[f].split(':');
//        if(fruitArray[0] == x && fruitArray[1] == y)
//            return true;
//        return false;
//    }
//};

//var makeNewFruit = function(){
//    var x = Math.floor(Math.random()*100);
//    var y = Math.floor(Math.random()*100);
//    fb.fruit.child(x+':'+y).set('0F0');
//};
var changeLength = function(snap){
    console.log("Something happened...");
    if(snap.val() > me.length) {
        grow = true;
        me.length = snap.val();
        document.getElementById('myScore').innerHTML = me.length;
        console.log("I'm growing to be\t "+snap.val()+" pixels\tlong!")
    }
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
    removeTail();

};


document.onkeydown =function (e) {
    e = e || window.event;


    if (e.keyCode == '87') {
        // w
        direction = 'up';
    }
    else if (e.keyCode == '83') {
        // s
        direction = 'down';
    }
    else if (e.keyCode == '65') {
        // a
        direction = 'left';
    }
    else if (e.keyCode == '68') {
        // d
        direction = 'right';
    }
    else if (e.keyCode == '40') {
        // down arrow
        if(speed<1000) {
            speed *= 1.25;
            resetInterval(speed);
        }
    }
    else if (e.keyCode == '38') {
        // up arrow
        if(speed>40){
            speed*=0.75;
            resetInterval(speed);
        }

    }
    //else if (e.keyCode == '37') {
    //    // left arrow
    //    direction = 'left';
    //}
    //else if (e.keyCode == '39') {
    //    // right arrow
    //    direction = 'right';
    //}

};


$(document).ready(function () {
    //Set up some globals
    var pixSize = 3, lastPoint = null, currentColor = "000", mouseDown = 0;


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
        var coords = snapshot.key().split(":");
        myContext.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
    };

    var snakeAdded = function(snap){
        var named = snap.key();
        fb.snakes[named] = fb.snakes.child(named);
        fb.snakes[named].body = fb.snakes[named].child('body');
        fb.snakes[named].body.on('child_added', drawPixel);
        fb.snakes[named].body.on('child_changed', drawPixel);
        fb.snakes[named].body.on('child_removed', clearPixel);
        fb.snakes[named].onDisconnect().remove();
    };
    var addSnake = function(snap){
        drawPixel(snap);
    };

    var changeSnake = function(snap){
        drawPixel(snap);
    };

    var removeSnake = function(snap){
        clearPixel(snap);
    };

    var generateID = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    var _init = function(){

        myID = generateID();

        //fb.main.on('child_added', drawPixel);
        //fb.main.on('child_changed', drawPixel);
        //fb.main.on('child_removed', clearPixel);


        fb.snakes = fb.main.child('snakes');
        fb.snakes.on('child_added',snakeAdded);
        fb.snakes.body = fb.snakes.child('body');
        fb.food = fb.main.child('food');

        fb.me = fb.snakes.child(myID);
        fb.me.body = fb.me.child('body');

        fb.me.set({
            'color': me.color,
            'length': me.length
        });
        fb.me.length = fb.me.child('length');
        fb.me.length.on('value',changeLength);
        fb.me.onDisconnect().remove();
        fb.me.body.child(curX + ":" + curY).set(me.color);
        //Draw the fruit

        fb.food.on('child_added',function(snap){
            console.log("FOOD UPDATE: \tFood drawn at: \t"+snap.key());
            drawPixel(snap);
        });
        fb.food.on('child_removed',function(snap){
            console.log("FOOD UPDATE: \tFood removed at: \t"+snap.key());
           // clearPixel(snap);
        });
        fb.snakes.body.on('child_added', addSnake);
        fb.snakes.body.on('child_changed', changeSnake);
        fb.snakes.body.on('child_removed', removeSnake);
    };


    _init();
});