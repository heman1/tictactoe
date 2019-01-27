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

			for(var l = 0; l <= 8; l++){
			painted[l] = false;
			content[l]='';
			}

		}

		function changeCpuState() {
			var cpu = document.getElementsByClassName("cpu")[0];
			if(cpu.classList.contains("off")) {
				cpu.classList.remove("off");
				cpu.classList.add("on");
				cpu.innerHTML = "ON";
				//window.location.reload();
			}
			else {
				cpu.classList.remove("on");
				cpu.classList.add("off");
				cpu.innerHTML = "OFF";
			}
		}

		//start the game funk
		function canvasClicked(canvasNumber){
			theCanvas = "canvas"+canvasNumber;
			c = document.getElementById(theCanvas);
			cxt = c.getContext("2d");

			if(painted[canvasNumber-1] ==false){
				if(turn%2==0){
					cxt.beginPath();
					cxt.lineWidth = 5;
					cxt.moveTo(5,5);
					cxt.lineTo(45,45);
					cxt.moveTo(45,5);
					cxt.lineTo(5,45);
					cxt.stroke();
					cxt.closePath();
					// var img = new Image;
					// img.src = "images/cross.png";
					// cxt.drawImage(img,5,5);
					content[canvasNumber-1] = 'X';
				}

				else{
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
					alert("THE GAME IS OVER!");
					location.reload(true);
				}
			
			}
			else{
				alert("THAT SPACE IS ALREADY OCCUPIED");
			}

		}

		function checkForWinners(symbol){
			
			for(var a = 0; a < winningCombinations.length; a++){
			if(content[winningCombinations[a][0]]==symbol&&content[winningCombinations[a][1]]==	symbol&&content[winningCombinations[a][2]]==symbol){
				alert(symbol+ " WON!");
				playAgain();
			}
			}

		}

		function playAgain(){
			y=confirm("PLAY AGAIN?");
			if(y==true){
				location.reload(true);
			}

		}
