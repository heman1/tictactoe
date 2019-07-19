//initializing global variables
const socketForClient = io.connect('https://tic-tac-toe-pwa.herokuapp.com'); // using socket object 
var painted;
var Xwin = 0;
var Owin = 0;
var content;
var winningCombinations;
var turn = 0;
var theCanvas;
var c,w,y,cxt;
var squaresFilled = 0;

//DOM Query
var gameMode = document.getElementById('game_mode');
var players = document.getElementById('players');
var clientStatus = document.getElementById('client_status');
var showPlayerName = document.getElementById('player_name');
var cpu = document.getElementsByClassName("cpu")[0];
var box = document.getElementById('box');
var mp = document.getElementsByClassName('mp')[0];

//setting up game on start
window.onload=function(){
	painted = new Array();
	content = new Array();
	winningCombinations = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

	for(var l = 0; l <= 8; l++) {
		painted[l] = false;
		content[l]= '_';
	}
	gameMode.innerHTML = "SOLO MODE";
	sessionStorage.clear();
	refreshList();
}

//==========EVENT LISTENERS===========================================//

//check for offline/online status
window.addEventListener('online', ()=> {
	console('you are offline');
});
window.addEventListener('offline', ()=> {
	alert('you are offline');
});

//when live players are clicked
players.addEventListener('click', (e)=> {
	var player2 = e.target.getAttribute("value");
	var player1 = sessionStorage.getItem("uid");
	var player1Status = sessionStorage.getItem("status");
	if(player1==null) {
		swal("Oops!","Select multiplayer option first","error");
	} else if(player1===player2) {
		swal("Oops!","You cannot play with yourself", "error");
	} else if(player1Status=='playing') {
		swal("Oops!","End the current game to play with others", "error");
	} else if(e.target.classList.contains('p')) {
		swal("Oops!", "The user is busy playing with someone else", "error");
	} else if(e.target.classList.contains('w')) {
		console.log("you can play together");
		var obj = {
			playerId: player1,
			playerName: sessionStorage.getItem("name"),
			opponentId: player2
		}

		swal({
			text: 'Do you confirm!',
			button: {
			  text: "send now!",
			  closeModal: false,
			},
		  })
		  .then(name => {
			if (!name) throw null;
			socketForClient.emit('joinGame', obj, (response)=> {        //joinGame emitted
				if(response) {
					swal("Matched!","player accepted your request", "success");
					changeVisibility('online');
				}
				else
					swal("Oops!","your request was rejected", "error");
			})
		  });		
	} else {
		console.log("wrong selection");
	}
});

//===============UTILITY FUNCTIONS============================//

//if cpu state changes (on/off)
function changeCpuState() {
	document.getElementById("xResult").innerHTML = "0";
	document.getElementById("oResult").innerHTML = "0";
	Xwin = 0; 
	Owin = 0;
	if(cpu.classList.contains("off")) {
		cpu.classList.remove("off");
		cpu.classList.add("on");
		cpu.innerHTML = "ON";
		gameMode.innerHTML = "CPU MODE";
		document.getElementsByClassName('mp')[0].classList.add('disable');
		clearCanvas();
	}
	else {
		cpu.classList.remove("on");
		cpu.classList.add("off");
		cpu.innerHTML = "OFF";
		gameMode.innerHTML = "SOLO MODE";
		document.getElementsByClassName('mp')[0].classList.remove('disable');
		clearCanvas();
	}
}

// resetting the game by clearing complete canvas
function clearCanvas() {
	for(var i=1; i<=9; i++) {
		c = document.getElementById("canvas"+i);
		ctx = c.getContext("2d");
		ctx.clearRect(0, 0, c.width, c.height);
		painted[i-1] = false;
		content[i-1]='_';
	}
	squaresFilled = 0;
	turn = 0;
}

//check for winner in multiplayer
function checkForTheWinner(symbol){
	for(var a = 0; a < winningCombinations.length; a++) {
		if(content[winningCombinations[a][0]]==symbol&&content[winningCombinations[a][1]]==	symbol&&content[winningCombinations[a][2]]==symbol){
			return true;
		}
	}
	return false;
}

//check if we got any winner in offline(solo/cpu)
function checkForWinners(symbol){
	for(var a = 0; a < winningCombinations.length; a++) {
		if(content[winningCombinations[a][0]]==symbol&&content[winningCombinations[a][1]]==	symbol&&content[winningCombinations[a][2]]==symbol){
			swal({
				title: symbol+" won the game!",
				text: "Want to try again?",
				buttons: {
					no: false,
					confirm: "Yes"
				}
			}).then( function(e) {
				if(e)
				clearCanvas();
			});
			if(symbol=='X') {
				console.log("x won")
				Xwin++;
				document.getElementById("xResult").innerHTML = Xwin;
			}
			else {
				Owin++;
				document.getElementById("oResult").innerHTML = Owin;
			}
		}
	}
}


//responding when box canvas is clicked
function canvasClicked(canvasNumber) {
	theCanvas = "canvas"+canvasNumber;
	c = document.getElementById(theCanvas);
	cxt = c.getContext("2d");
	if(sessionStorage.getItem("status")=='playing' && !(box.classList.contains('disable')) ) {
		mHandler(canvasNumber, cxt);
		return;
	}
	if(painted[canvasNumber-1] ==false) {
		if(turn%2==0) {
			cxt.beginPath();
			cxt.lineWidth = 5;
			cxt.moveTo(5,5);
			cxt.lineTo(45,45);
			cxt.moveTo(45,5);
			cxt.lineTo(5,45);
			cxt.stroke();
			cxt.closePath();
			content[canvasNumber-1] = 'X';

			//if cpu state is ON
			if(cpu.classList.contains("on")) {
				// for the X who played before
				content[canvasNumber-1] = 'X';
				painted[canvasNumber-1] = true;
				squaresFilled++;
				turn++
				checkForWinners(content[canvasNumber-1]);
				if(squaresFilled==9){
					swal({
						title: "Game Over",
						text: "Want to try again?",
						buttons: {
							no: false,
							confirm: "Yes"
						}
					}).then( function(e) {
						if(e)
						clearCanvas();
					});
				}

				//cpu turn
				var move = getOptimalLocation(content);
				console.log("optimal value: "+move);
				var cxtn = document.getElementById("canvas"+move).getContext("2d");
				cxtn.beginPath();
				cxtn.lineWidth = 5;
				cxtn.arc(25,25,21,0,Math.PI*2,true);
				cxtn.stroke();
				cxtn.closePath();

				content[move-1] = 'O';
				painted[move-1] = true;
				squaresFilled++;
				turn++;
				checkForWinners(content[move-1]);

				if(squaresFilled==9){
					swal({
						title: "Game Over!",
						text: "Want to try again?",
						buttons: {
							no: false,
							confirm: "Yes"
						}
					}).then( function(e) {
						if(e)
						clearCanvas();
					});
				}
				return;
			}
		}

		else {
			cxt.beginPath();
			cxt.lineWidth = 5;
			cxt.arc(25,25,21,0,Math.PI*2,true);
			cxt.stroke();
			cxt.closePath();
			content[canvasNumber-1] = 'O';
		}

		turn++;
		painted[canvasNumber-1] = true;
		squaresFilled++;
		checkForWinners(content[canvasNumber-1]);

		if(squaresFilled==9){
			swal({
				title: "Game Over",
				text: "Want to try again?",
				buttons: {
					no: false,
					confirm: "Yes"
				}
			}).then( function(e) {
				if(e)
				clearCanvas();
			});
		}
	
	} 
	// when canvas is already filled
	else {
		swal("Oops!","The space is already occupied","error");
	}

}



//DOM Query


// utility function to make element visible and invisible
function changeVisibility(node) {
	let x = document.getElementById(node);
	if(x.classList.contains('invisible')) {
		if(node == 'online')
			refreshList();
		x.classList.add('visible');
		x.classList.remove('invisible');
	}
	else {
		x.classList.add('invisible');
		x.classList.remove('visible');
	}
}

function changeMultiplayerState() {
	//disable cpu buttons and canvas(playground)
	var pName= "";
	if(mp.innerHTML == "OFF") {
		swal({
			closeOnClickOutside: false,
			closeOnEsc: false,
			content: {
			  element: "input",
			  attributes: {
				placeholder: "Type your avatar name",
				required: true
			  },
			},
		  }).then(function(value) {
			  if(!value) {
				swal("Oops!","You need to give an avatar name","error");
				return false;
			  } else {
				  console.log(value);
				  pName = value;
				  return true;
			  }
		  }).then(function(e) {
			console.log(e);
			if(e) {
				clearCanvas();
				document.getElementById("xResult").innerHTML = "0";
				document.getElementById("oResult").innerHTML = "0";
				box.classList.add('disable');
				mp.classList.replace('off', 'on');
				mp.innerHTML = "ON";
				document.getElementsByClassName('cpu')[0].classList.add('disable');
				gameMode.innerHTML = "MULTIPLAYER MODE";
				showPlayerName.innerHTML = pName+',';
				changeVisibility('controls');
				socketForClient.emit('createPlayer', pName);
				console.log('creating new player');
			  }
		  });
	} 
	else {
		box.classList.remove('disable');
		mp.classList.replace('on', 'off');
		mp.innerHTML = "OFF";
		document.getElementsByClassName('cpu')[0].classList.remove('disable');
		gameMode.innerHTML = "SOLO MODE";
		showPlayerName.innerHTML = "";
	}


	//popup online div and pop-down controls div
}

// handling the game in multiplayer mode
function mHandler(canvasNumber, cxt) {
	if(painted[canvasNumber-1] == false) {
		cxt.beginPath();
		cxt.lineWidth = 5;
		cxt.moveTo(5,5);
		cxt.lineTo(45,45);
		cxt.moveTo(45,5);
		cxt.lineTo(5,45);
		cxt.stroke();
		cxt.closePath();
		content[canvasNumber-1] = 'X';
		painted[canvasNumber-1] = true;
		squaresFilled++;
		if( checkForTheWinner(content[canvasNumber-1]) ) {
			swal({  text: 'You won the game',
					icon: './images/won.gif',
					iconSize: '150x120'
			});
			socketForClient.emit('gameFinish', { 
				winner: sessionStorage.getItem('uid'),
				roomId: sessionStorage.getItem("roomId")
			});
			clearCanvas();
		}
		if(squaresFilled==9) {
			swal("Tie","Game is over");
		} else {
			socketForClient.emit('swapPlayer', {                    //swapPlayer emitted
				pos: canvasNumber,
				player: sessionStorage.getItem("uid"),
				roomId: sessionStorage.getItem("roomId")
			});
		}
	} else {
		swal("Oops!", "The space is already occupied", "error");
	}
}




function refreshList() {
	fetch('https://tic-tac-toe-pwa.herokuapp.com/api/players')
	.then( (response)=> {
		return response.json();
	}).then( (data)=> {
		players.innerHTML = "";
		displayAllPlayers(data);
	});
}

function displayAllPlayers(data) {
	console.log("called"+ data.length);
	for(var i = 0; i < data.length; i++) {
		var obj = data[i];
		var stat = obj.status;
		var x = stat.slice(0,1);
		stat = "status_"+ stat.slice(0,1);
		var htmlContent = `<li class="player ${x}" value="${obj.id}">
								<p class="name ${x}" value="${obj.id}"> ${obj.name}</p>
								<p class="${stat} ${x}" value="${obj.id}"> ${obj.status}</p>
							</li>`
		players.insertAdjacentHTML('afterbegin', htmlContent);
	}
}





