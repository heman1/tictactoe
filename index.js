const express = require('express');
const socket = require('socket.io');
const http = require('http');
const players = require('./players');
const rooms = require('./rooms');
const uuid = require('uuid');

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

var PORT = process.env.PORT || 2121
server.listen(PORT, ()=> console.log('server running on port 2121'));


io.on('connection', function(socket) {
    console.log("new player connected");

    //on disconnection
    socket.on('disconnect', ()=> {
        console.log(socket.id+ " got disconnected");
        var i = players.length;
            while(i--) {
                if( players[i] && players[i].hasOwnProperty('sid') && (players[i]['sid'] === socket.id ) ){ 
                    console.log("deleting.. "+players[i].name);
                    socket.broadcast.emit('playerLeft', {id: players[i].id});
                    players.splice(i,1);
                }
            }
    })

    // make player online
    socket.on('createPlayer', function(data) {
        console.log('creating new player: '+data);
        const newPlayer = {
            id: uuid.v4(),
            sid: socket.id,
            name: data,
            roomId: null,
            opponent: null,
            status: 'waiting'
        }
        players.push(newPlayer);
        socket.broadcast.emit('newPlayer', newPlayer);
        io.to(`${socket.id}`).emit('storeInSession', newPlayer)
        console.log("newPlayer emitted");
    });

    //Ask opponent to join a game
    socket.on('joinGame', (data, callback)=> {
        console.log(data.playerId+ " VS "+ data.opponentId);
        //check if the opponent is available?
        const found = players.some( player=> player.id === data.opponentId);
        if(found) {
            players.forEach(player => {
                if(player.id === data.opponentId && player.status == 'waiting') {
                    var pData = {
                        opponentName: data.playerName,
                        playerId: player.id,
                        opponentId: data.playerId
                    }
                    //io.to(`${player.sid}`).emit('joinRequest', pData);
                    io.sockets.connected[player.sid].emit('joinRequest', pData, (response)=> {
                        if(response)
                            callback(true);
                        else
                            callback(false);
                    });
                }
            });
        } else {
            console.log("player not found");
            callback("player not found");
        }

    })

    //create room
    socket.on('createRoom', (data)=> {
        var newRoom = {
            roomId: uuid.v4(),
            player1id: data.playerId,
            player2Name: data.opponentName,
            player2id: data.opponentId,
            status: 'running',
            count: 1
        }
        //change player 1 configs
        players.forEach(player => {
            if(player.id === data.playerId && player.status == 'waiting') {
                player.status = 'playing';
                player.roomId = newRoom.roomId;
                player.opponent = data.opponentId;
                newRoom.player1Name = player.name;
                rooms.push(newRoom);
                console.log("player "+player.name+" is joining room: "+newRoom.roomId);
                socket.join(newRoom.roomId);
                io.to(`${player.sid}`).emit('storeInSession', {
                    id: player.id,
                    sid: player.sid,
                    name: player.name,
                    status: player.status,
                    opponent: data.opponentId
                })
            }
        });
        players.forEach(player => {
            if(player.id === data.opponentId) {
                io.to(`${player.sid}`).emit('roomCreated', newRoom);
            }
        });
    });

    //join room
    socket.on('joinRoom', (roomData)=> {
        var flag = true;
        players.forEach(player => {
            if(player.id === roomData.player2id && player.status == 'waiting' && roomData.count == 1) {
                player.status = 'playing';
                player.roomId = roomData.roomId;
                player.opponent = roomData.player1id;
                roomData.count = 2;
                console.log("player "+player.name+ " is joining room: "+roomData.roomId);
                socket.join(roomData.roomId);
                io.to(`${player.sid}`).emit('storeInSession', {
                    id: player.id,
                    sid: player.sid,
                    name: player.name,
                    status: player.status,
                    opponent: player.opponent
                })
                flag = false;
                io.in(roomData.roomId).emit('play', { 
                    roomId: roomData.roomId,
                    player: roomData.player1id,
                    pos: -1
                })
                
            }
        });
        if(flag)
            socket.emit('serverError', {msg: 'player is busy or the room is full'});

        socket.emit('refreshList');
    });

    //recieving pos, player, roomId
    socket.on('swapPlayer', (data)=> {
        rooms.forEach(room => {
            if(room.roomId === data.roomId) {
                if(data.player == room.player1id) {
                    console.log("sending data to room: "+room.roomId+" and player: "+room.player2Name);
                    io.in(room.roomId).emit('play', { 
                        roomId: room.roomId,
                        player: room.player2id,
                        pos: data.pos
                    });
                } else {
                    console.log("sending data to room: "+room.roomId+" and player: "+room.player1Name);
                    io.in(room.roomId).emit('play', { 
                        roomId: room.roomId,
                        player: room.player1id,
                        pos: data.pos
                    });
                }
            }
        });
    });

    var playerLooser = null;
    socket.on('gameFinish', (data)=> {
        console.log("game number: "+data.roomId+" finished");
        rooms.forEach(room => {
            if(room.roomId === data.roomId) {
                if(data.winner == room.player1id) {
                    console.log("looser is: "+room.player1Name);
                    io.in(room.roomId).emit('lost', {uid: room.player2id});
                    playerLooser = room.player2id;
                } else {
                    console.log("looser is: "+room.player1Name);
                    io.in(room.roomId).emit('lost', {uid: room.player1id});
                    playerLooser = room.player1id;
                }
            }
        });
        // rolling out updated session variables
        players.forEach(player=> {
            if(player.id === data.winner) {
                player.status = 'waiting';
                player.roomId = null;
                player.opponent = null;
                console.log("session set for "+ player.name);
                io.to(player.sid).emit('storeInSession', {
                    id: player.id,
                    sid: player.sid,
                    name: player.name,
                    status: player.status,
                    opponent: null
                })
            } 
            if(player.id === playerLooser) {
                player.status = 'waiting';
                player.roomId = null;
                player.opponent = null;
                console.log("session set for "+ player.name);
                io.to(player.sid).emit('storeInSession', {
                    id: player.id,
                    sid: player.sid,
                    name: player.name,
                    status: player.status,
                    opponent: null
                })
            }
        });

        //deleting the room
        var i = rooms.length;
            while(i--) {
                if( rooms[i] && rooms[i].hasOwnProperty('roomId') && (rooms[i]['roomId'] === data.roomId ) ) { 
                    console.log("deleting.. "+rooms[i].roomId);
                    rooms.splice(i,1);
                }
            }

    });

    socket.emit('refreshList');

});

//handle errors
process.on('uncaughtException', function(error) {
    socket.emit('serverError', {msg: "crashed due to some error"});
    console.log(error);
});


