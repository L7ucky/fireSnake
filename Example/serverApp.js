/**
 * Created by Andrew on 7/26/2015.
 */
//Lets require/import the HTTP module
var http = require('http');
var dispatcher = require('httpdispatcher');
var Firebase = require('firebase');

//Lets define a port we want to listen to
const PORT=8080;


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
var food = {};
var refs = {};


//fb.once("value", function(snap){
//    fb = snap.val();
//});

fb.child("snakes").on("child_added", function(snapshot) {

    console.log(snapshot.val());
});

fb.child("food").on("value",function(snap){
    if(!snap.val()){
        console.log("There were no seeds");
        fb.child("food").set({"20:20":'A80'});
    }
    else{
        console.log("there were values in food");
    }
});

var checkIfEatsFruit = function(x, y){
    for(f in fruit){
        var fruitArray = fruit[f].split(':');
        if(fruitArray[0] == x && fruitArray[1] == y)
            return true;
        return false;
    }
};

if(!checkIfEatsFruit(curX,curY))
    removeTail();
else{
    makeNewFruit()
}
setTimeout(function(){
    if(fruit.length <1)
        makeNewFruit();
},3000);