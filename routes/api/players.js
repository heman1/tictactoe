const express = require('express');
const router = express.Router(); //interface
const players = require('../../players');


//create a player
// router.post('/:name', (req, res)=> {
//     console.log(req.params.name+ " with sid "+ socket.id);
//     const newPlayer = {
//         id: uuid.v4(),
//         sid: socket.id,
//         name: req.params.name,
//         gameId: null,
//         opponent: null,
//         status: 'waiting'
//     }
//     players.push(newPlayer);
//     res.json(newPlayer);
// });

//join request
// router.post('/join/:id', (req, res)=> {
//     // send prompt to player2(url id)
//     // on successful validation -> change the status and opponents of both the players
//     // initialize a room and game id
//     players.forEach(player => {
//         if(player.id === req.params.id) {
//             console.log(player.sid);
//             socket.broadcast.to(player.sid).emit( 'gameRequest', { name : req.body.playerName } );
//         }
//     });


// });



//read all players
router.get('/', (req, res)=> {
    res.json(players);
});



//update player details -> gameId, opponent, status
router.put('/:id', (req, res)=> {
    //search player with id
    const found = players.some( player=> player.id === req.params.id);
    console.log(found);
    console.log("updating values: "+ req.body.gameId + req.body.opponent + req.body.status);
    if(found) {
        players.forEach(player => {
            if(player.id === req.params.id) {
                player.gameId = req.body.gameId;
                player.opponent = req.body.opponent;
                player.status = req.body.status;
            }
        });
        res.status(200).json( {msg: 'updated player configs'} );

    } else {
        //player not found
        res.status(400).json( { msg: 'player not found'} );
    }
});


//remove a player
router.delete('/:id', (req, res)=> {
    const found = players.some(player=> player.id === req.params.id);
    if(found) {
        res.json( {
            msg : 'Player Deleted',
            members: players.filter (player => player.id !== req.params.id ) 
        });
    } else {
        //player not found
        res.status(400).json( { mg: 'player not found'} );
    }
});

module.exports = router;