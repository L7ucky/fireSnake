/**
 * Created by Andrew on 7/26/2015.
 */
//Lets require/import the HTTP module
var http = require('http');
var dispatcher = require('httpdispatcher');
var Firebase = require('firebase');

//Lets define a port we want to listen to
const PORT=8080;
const X_MAX_WINDOW = 160;
const Y_MAX_WINDOW = 140;


//Lets use our dispatcher
function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

//For all your static (js/css/images/etc.) set the directory name (relative path).
dispatcher.setStatic('resources');

//A sample POST request
dispatcher.onPost("/post1", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Got Post asda sdad asfasf asd Data');
});

//A sample GET request
dispatcher.onGet("/page1", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Page One');
});

//A sample GET request
dispatcher.onGet("/", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Default page');
});

var fbRef = new Firebase("https://firesnakes.firebaseio.com/");
var snakes ={};
var map = {};
var food = {};
var refs = {};
refs.snakes = fbRef.child("snakes");
refs.food = fbRef.child("food");
refs.food.onDisconnect().remove();

//fbRef.once("value", function(snap){
//    fbRef = snap.val();
//});
var setUpSnakeRefs = function(fireSnake,key){
    refs.snakes[key].color = fireSnake.child("color");
    fireSnake.color.on("value", function(snap) {
        snakes[key].color = snap.val();
    });


    refs.snakes[key].length = fireSnake.child("length");
    fireSnake.length.on("value", function(snap){
        console.log("length value is: "+snap.val());
        console.log("length key is: "+snap.key());
        console.log(" key is: "+key);
        snakes[key].length = snap.val();
        console.log(" snakes.length  is: "+snakes[key].length);
    });

    refs.snakes[key].body = fireSnake.child("body");
    fireSnake.body.on("child_added", function(snap){
        //console.log(key+" moved to\t"+snap.key());
        handleDeath(snap.key(), fireSnake, key);
        map[snap.key()] = key;
        handleFood(snap.key(), fireSnake, key);
    });
    fireSnake.body.on("child_removed", function(snap){
        delete map[snap.key()];
    });
    refs.snakes[key].onDisconnect(function(){
        fireSnake = null;
    });
};

refs.snakes.on("child_added", function(snapshot) {
    refs.snakes[snapshot.key()] = refs.snakes.child(snapshot.key());
    console.log(snapshot.key()+" is set as:\n\n"+snapshot.val());
    snakes[snapshot.key()] = snapshot.val();

    setUpSnakeRefs(refs.snakes[snapshot.key()],snapshot.key());
    makefood();

});

refs.snakes.on("child_removed", function(snapshot) {
    console.log(snapshot.key() +"was REMOVED!");
    snakes[snapshot.key()]= null;

});

refs.food.on("child_removed",function(snap){
    if(needMoreFood(snap.val())){
        console.log("FOOD UPDATE: \tFood needed now!");
        makefood();
    }
    else{
        console.log("FOOD UPDATE: \tNo food needed now...");
    }
});

var needMoreFood = function(numOfFood){
    if(numOfFood < Object.keys(food).length)
        return true;
    return false;
};

var handleFood = function(coords, fireSnake,snakeKey){
    if(checkIfEatsFood(coords)){
        console.log(snakeKey+" eats food at: "+coords);
        console.log(snakeKey+" grows to be length: "+(snakes[snakeKey].length+1));
        fireSnake.child("length").set(snakes[snakeKey].length+1);
        refs.food.child(coords).remove();
        delete food[coords];
        makefood();
    }
};
var checkIfEatsFood = function(coords){
    if(food[coords])
        return true;
    //console.log("\t\t\tNOPE NO FOOD HERE");
    return false;
};
var makefood = function() {
    var coords="";
    var color = "8F0";
    var spaceTaken = true;
    while(spaceTaken){

        coords += Math.floor((1 + Math.random()) * 10000) % X_MAX_WINDOW;
        coords += ":";
        coords += Math.floor((1 + Math.random()) * 10000) % Y_MAX_WINDOW;
        if(!food[coords])
            spaceTaken = false;
    }
    console.log("FOOD UPDATE: \tMade food at: \t"+coords);
    refs.food.child(coords).set(color);
    food[coords] = color;
    return coords;
};

var handleDeath = function(coords, fireSnake,snakeKey){
    if(checkIfDies(coords, snakeKey)){
        console.log(snakeKey+" ran into "+map[coords]+" at: "+coords);

        fireSnake.child("death").set(messages.ranIntoAnotherSnake);
    }
};
var checkIfDies = function(coords, snakeKey){
    if(map[coords]){
        if(map[coords]!= snakeKey) {
            console.log(map);
            return true;
        }
    }
    return false;
};

var messages = {
    ranIntoAnotherSnake:"You died because you ran into another snake"
};