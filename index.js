const express = require('express');
const socket = require('socket.io');
const http = require('http');

//App setup
var app = express();
var server = http.Server(app);
var io = socket(server);

//body parser set-up
app.use( express.json() );
app.use( express.urlencoded({ extended: false }) );

//static files
app.use(express.static('public'));
app.use('/api/players', require('./routes/api/players'))


//middle-ware function
const logger = (req, res, next)=> {
    console.log(`the url hit was: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next(); //important
}
app.use(logger);

server.listen(2121, ()=> console.log('server running on port 2121'));

io.on('connection', function(socket) {
    console.log("new player connected");
    io.sockets.emit('players', players);

    // make player online
    socket.on('makeMeOnline', function(data) {
        console.log('makeMeOnline recieved');
        players.push(data.name);
        socket.broadcast.emit('newPlayer', data);
        console.log("newPlayer emitted");
    });

    //connect another player

    //handle game events (start, turns, end)
});

