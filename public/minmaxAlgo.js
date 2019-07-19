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