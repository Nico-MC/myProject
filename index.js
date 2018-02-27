var http = require('http');
var fs = require('fs');

fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
        startGame();
    }).listen(80);
});

function startGame() {
  require('bootstrap');
}
// <script type="text/javascript" src="js/db.js"></script>
// <script type="text/javascript" src="js/states/Boot.js"></script>
// <script type="text/javascript" src="js/states/Preload.js"></script>
// <script type="text/javascript" src="js/states/Menu.js"></script>
// <script type="text/javascript" src="js/states/game/Game.js"></script>
// <script type="text/javascript" src="js/states/game/Movement.js"></script>
// <script type="text/javascript" src="js/states/game/Ui.js"></script>
// <script type="text/javascript" src="js/main.js"></script>
// <!-- MODULES -->
// <script type="text/javascript" src="/modules/PHASER/phaser.js"></script>
