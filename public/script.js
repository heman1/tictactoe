		var painted;
		var content;
		var winningCombinations;
		var turn = 0;
		var theCanvas;
		var c,w,y,cxt;
		var squaresFilled = 0;

		window.onload=function(){
			painted = new Array();
			content = new Array();
			winningCombinations = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

			for(var l = 0; l <= 8; l++) {
				painted[l] = false;
				content[l]= '_';
			}
		}

		function changeCpuState() {
			var cpu = document.getElementsByClassName("cpu")[0];
			if(cpu.classList.contains("off")) {
				cpu.classList.remove("off");
				cpu.classList.add("on");
				cpu.innerHTML = "ON";
				//window.location.reload();
				clearCanvas();
			}
			else {
				cpu.classList.remove("on");
				cpu.classList.add("off");
				cpu.innerHTML = "OFF";
				clearCanvas();
			}
		}

		//start the game onclick
		function canvasClicked(canvasNumber){
			theCanvas = "canvas"+canvasNumber;
			c = document.getElementById(theCanvas);
			cxt = c.getContext("2d");
			var cpu = document.getElementsByClassName("cpu")[0];

			if(painted[canvasNumber-1] ==false) {
				if(turn%2==0){
					cxt.beginPath();
					cxt.lineWidth = 5;
					cxt.moveTo(5,5);
					cxt.lineTo(45,45);
					cxt.moveTo(45,5);
					cxt.lineTo(5,45);
					cxt.stroke();
					cxt.closePath();
					content[canvasNumber-1] = 'X';

					
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
								location.reload(true);
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
								location.reload(true);
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
						location.reload(true);
					});
				}
			
			}
			else{
				swal("Oops!","The space is already occupied","error");
			}

		}

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

		function checkForWinners(symbol){
			for(var a = 0; a < winningCombinations.length; a++){
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
					location.reload(true);
				});
			}
			}
		}

//------minimax algorithm------------------------------------------------------//
		
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
			else if(content[0]=='X')
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
		