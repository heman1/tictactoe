const express = require('express');
const router = express.Router(); //interface
const players = require('../../players');

//read all players
router.get('/', (req, res)=> {
    res.json(players);
});


module.exports = router;