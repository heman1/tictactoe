// using socket object 
const socketForClient = io.connect('http://localhost:2121');
//initializing global variables
var painted;
var Xwin = 0;
var Owin = 0;
var content;
var winningCombinations;
var turn = 0;
var theCanvas;
var c,w,y,cxt;
var squaresFilled = 0;

//setting up game on start
window.onload=function(){
	painted = new Array();
	content = new Array();
	winningCombinations = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

	for(var l = 0; l <= 8; l++) {
		painted[l] = false;
		content[l]= '_';
	}
}

//check for offline/online status
window.addEventListener('online', ()=> {
	console.log('you are offline');
});

window.addEventListener('offline', ()=> {
	console.log('connected to internet');
});

//if cpu state changes (on/off)
function changeCpuState() {
	var cpu = document.getElementsByClassName("cpu")[0];
	document.getElementById("xResult").innerHTML = "0";
	document.getElementById("oResult").innerHTML = "0";
	Xwin = 0; 
	Owin = 0;
	if(cpu.classList.contains("off")) {
		cpu.classList.remove("off");
		cpu.classList.add("on");
		cpu.innerHTML = "ON";
		document.getElementsByClassName('mp')[0].classList.add('disable');
		clearCanvas();
	}
	else {
		cpu.classList.remove("on");
		cpu.classList.add("off");
		cpu.innerHTML = "OFF";
		document.getElementsByClassName('mp')[0].classList.remove('disable');
		clearCanvas();
	}

}

//responding when box canvas is clicked
function canvasClicked(canvasNumber){
	theCanvas = "canvas"+canvasNumber;
	c = document.getElementById(theCanvas);
	cxt = c.getContext("2d");
	var cpu = document.getElementsByClassName("cpu")[0];

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

//check if we got any winner
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

//------minimax algorithm to find next optimal move-------------------------------------//
		
function getOptimalLocation(content) {
	var bestScore = -1000;
	var bestMove;
	for(var i=0; i<9; i++) {
		if(content[i]=='_') {
			content[i] = 'O';
			var n = minmax(content, 0, false);
			content[i] = '_';
			if(n>bestScore) {
				bestScore = n;
				bestMove = i;
			}
		}
	}
	return bestMove+1;
}

function minmax(content, depth, isMax) {
	var score = evaluate(content);
	if(score == 10)
		return score;
	if(score == -10) 
		return score;
	if(isMovesLeft(content)==false)
		return 0;
	if(isMax) {
		var best = -1000;
		for(var i=0; i<9; i++) {
			if(content[i]=='_') {
				content[i]='O';
				best = Math.max(best, minmax(content, depth+1, !isMax));
				content[i] = '_';
			}
		}
		return best;
	}
	else {
		var best = 1000;
		for(var i=0; i<9; i++) {
			if(content[i]=='_') {
				content[i] = 'X';
				best = Math.min(best, minmax(content, depth+1, !isMax));
				content[i] = '_';
			}
		}
		return best;
	}
}

function evaluate(content) {
	//horizontal check
	for(var row=1; row<=3; row++) {
		if(content[3*row-3]==content[3*row-2] && content[3*row-2]==content[3*row-1]) {
			if(content[3*row-3]=='O')
				return +10;
			else if(content[3*row-3]=='X')
				return -10;
		}
	}
	//vertical check
	for(var col=0; col<3; col++) {
		if(content[col]==content[col+3] && content[col+3]==content[col+6]) {
			if(content[col]=='O')
				return +10;
			else if(content[col]=='X')
				return -10;
		}
	}
	//diagnal 1
	if(content[0]==content[4] && content[4]==content[8]) {
		if(content[0]=='O')
			return +10;
		else if(content[0]=='X')
			return -10;
	}
	//diagnal 2
	if(content[2]==content[4] && content[4]==content[6]) {
		if(content[2]=='O')
			return +10;
		else if(content[2]=='X')
			return -10;
	}
	//for a no win (tie)
	return 0;
}
	
function isMovesLeft(content) 
{ 
	for (var i = 0; i<9; i++)  
		if (content[i]=='_') 
			return true; 
	console.log("no moves left");
	return false; 
}	

//------minimax algorithm ends----------------------------------------------------//

//------normal event handlers starts----------------------------------------------------------//

// utility function to make element visible and invisible
function changeVisibility(node) {
	let x = document.getElementById(node);
	if(x.classList.contains('invisible')) {
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
	let box = document.getElementById('box');
	let mp = document.getElementsByClassName('mp')[0];
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
				//start sending request to server
				socketForClient.emit('makeMeOnline', {name: pName});
				console.log('makeMeOnline emitted');
			  }
		  });
	} 
	else {
		box.classList.remove('disable');
		mp.classList.replace('on', 'off');
		mp.innerHTML = "OFF";
		document.getElementsByClassName('cpu')[0].classList.remove('disable');
	}


	//popup online div and pop-down controls div
}

// Listen to server
var players = document.getElementById('players');

socketForClient.on('newPlayer', function(data) {
	console.log('new player listened');
	players.insertAdjacentHTML('afterbegin','<li class="player" onclick="connectTo(this)">'+ data.name +'</li>');
	console.log("added HTML");
});