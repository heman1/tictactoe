//store session variables

socketForClient.on('storeInSession', (data)=> {
	sessionStorage.clear();
	sessionStorage.setItem('uid', data.id);
	sessionStorage.setItem('sid', data.sid);
	sessionStorage.setItem('name', data.name);
	sessionStorage.setItem('status', data.status);
	sessionStorage.setItem('opponent', data.opponent);
});


socketForClient.on('newPlayer', function(obj) {
	console.log('new player listened');
	var stat = obj.status;
	stat = "status_"+ stat.slice(0,1);
	var htmlContent = `<li class="player" value="${obj.id}">
							<p class="name" value="${obj.id}"> ${obj.name} </p>
							<p class="${stat}" value="${obj.id}"> ${obj.status} </p>
						</li>`
	players.insertAdjacentHTML('afterbegin', htmlContent);
});

//join request [pData-> name, id, opponentId]
socketForClient.on('joinRequest', (pData, callback)=> {
	swal({
		title: `${pData.opponentName}`,
		text: "Wants to play with you",
		icon: "info",
		buttons: true,
	  })
	  .then((accept) => {
		if (accept) {
		  swal("Setting up your game", {
			icon: "success",
		  });
		  callback(true);
		  socketForClient.emit('createRoom', pData);
		} else {
		  swal("You rejected the request");
		  callback(false);
		}
	  });
});

//room created now join
socketForClient.on('roomCreated', (roomData) => {
    refreshList();
	socketForClient.emit('joinRoom', roomData);
});

// handle server errors
socketForClient.on('serverError', (msg)=> {
	console.log(msg);
})

//play from server roomId, playerId, pos
socketForClient.on('play',(data)=> {
	sessionStorage.setItem("roomId", data.roomId)
	if(data.player === sessionStorage.getItem("uid")) {
		console.log("position: "+data.pos+ " to: "+data.player);
		if(data.pos>=0) {
			theCanvas = "canvas"+data.pos;
			c = document.getElementById(theCanvas);
			cxt = c.getContext("2d");
			cxt.beginPath();
			cxt.lineWidth = 5;
			cxt.arc(25,25,21,0,Math.PI*2,true);
			cxt.stroke();
			cxt.closePath();
			content[data.pos-1] = 'O';
			painted[data.pos-1] = true;
			squaresFilled++;
		}
		clientStatus.innerHTML = "Your turn";
		box.classList.remove('disable');
	} else {
		box.classList.add('disable');
		clientStatus.innerHTML = "Wait! It's opponent's turn";
	}
})

socketForClient.on('lost', (looser)=> {
	clientStatus.innerHTML = "MULTIPLAYER MODE";
	box.classList.add('disable');
	clearCanvas();
	console.log('clearing stuff');
	clientStatus.innerHTML = "select player from the live icon to play"
	refreshList();
	if(looser.uid == null) {
		swal("Tie", "The game was a tie", "info");
	}else if(looser.uid === sessionStorage.getItem("uid")) {
		swal({  text: 'You lost the game',
					icon: './images/lost.gif',
					iconSize: '150x100'
			});
	} else {
		console.log("you won");
	}
	
})

socketForClient.on('playerLeft', (playerId)=> {
	refreshList();
	if(sessionStorage.getItem('status')=='playing' && sessionStorage.getItem("opponent")=== playerId.id) {
		swal("You won","your opponent left the game", "info");
		clientStatus.innerHTML = "MULTIPLAYER MODE";
		box.classList.add('disable');
		clearCanvas();
		console.log('clearing stuff');
		clientStatus.innerHTML = "select player from the live icon to play";
		socketForClient.emit('gameFinish', { 
			winner: sessionStorage.getItem('uid'),
			roomId: sessionStorage.getItem("roomId")
		});
	}
})

socketForClient.on('refreshList', ()=> {
    refreshList();
});

socketForClient.on('connect_failed',()=> {
	swal("Oops!", "Unable to connect to server, check your connection", "error");
})
