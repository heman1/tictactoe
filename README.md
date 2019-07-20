# Multiplayer TicTacToe
+ It is a PWA(Progressive Web App) tic tac toe multiplayer game. The application does not require user login to play and completely depends upon the session storage of the browser to identify different users. Players can play with each other online and can play with CPU in offline mode.
  + The CPU algorithm is written on famous minimax algorithm to find the next optimal move to win the game.
  + The cach mechanism is done using service workers and cache API.
+ The application is backed with a node js server using express as a framework. The application also uses socket.io extensively to communicate using web sockets resulting in a smooth user experience and realtime flow of data.

### UI wireframes
![menu](/public/images/pic1.png)
![live players](/public/images/pic2.png)


### Tech used
* node.js
* express.js
* socket.io
* Service Worker
* Cache API

### Installation guide
- clone or download the repo
- install dependencies 
- run ```node index.js``` the server will listen on port 2121

### Hosted on heroku
https://tic-tac-toe-pwa.herokuapp.com