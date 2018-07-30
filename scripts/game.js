const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;

function resize() { // resizowanie canvasa!!!!!!!!!!!!!!!!!!!
    var canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
    var wratio = width / height, ratio = canvas.width / canvas.height;

    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
}

var config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 840 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var bg;
var player, menus, menu;
var walls;
var coins;
var spikes;
var AllowClick = true;
var score = 0;
var scoreText, text, coinsText, text2;
var gameOver = true;
var multiplier = 1;
var collectingCoin = false;
var nrOfCoins = 0;
var numOfSpikes = numOfSpikesVer(GAME_WIDTH, 60);
var space = howMuchIsLeft(GAME_WIDTH, 60);
var numOfSpikes2 = numOfSpikesVer(GAME_HEIGHT, 50);
var space2 = howMuchIsLeft(GAME_HEIGHT, 50);
var menuContainer;
var timer;
var czasDrugiejSzansy;
var highScore;
var totalCoins;
var thisSessionScore;
	

function numOfSpikesVer(length, val){
	var width = length - val;
	return parseInt(width / 75);
}

function howMuchIsLeft(length, val){
	var width = length - val;
	return width % 75;
}

var QUERY_BACKGROUND = '<?php echo 1; ?>';

console.log(QUERY_BACKGROUND);

function preload(){ //dodawanie obrazków spirteów..
	this.load.image('background', 'assets/backgrounds/' + QUERY_BACKGROUND + ".png");
	this.load.spritesheet('player', 'assets/player.png', { frameWidth: 67, frameHeight: 66 });
	this.load.image('wall', 'assets/wall.png');
	this.load.image('spike', 'assets/spike.png');
	this.load.image('spike2', 'assets/spike2.png');
	this.load.spritesheet('coin', 'assets/coin.png', { frameWidth: 72, frameHeight: 59 });
	this.load.spritesheet('menu', 'assets/menu.png', { frameWidth: 420, frameHeight: 306 });
	this.load.spritesheet('button', 'assets/button.png', { frameWidth: 134, frameHeight: 76 });
}

function create(){
	
	window.addEventListener('resize', resize); // RESIZE!!
    resize(); // AGHHH

	bg = this.add.group();
	bgChildren = bg.getChildren();
	for (var y = 0; y <= GAME_HEIGHT / 400; y++){
		for(var x = 0; x <= GAME_WIDTH / 400; x++){
			bg.create(x*400, y*400, 'background'); //stworzenie tła
	}}
	
	 bg.children.iterate(function (child) {

        child.setOrigin(0,0);

    });
	
	spikes = this.physics.add.staticGroup(); // dodanie spikow z colliderami
	var spikesChildren = spikes.getChildren();
	
	for(var i = 0; i < numOfSpikes; i++){
	
	spikes.create((70+space/2) + 75*i, 17, 'spike2');
	spikesChildren[i].angle = 180;
	}
	
	for(i = numOfSpikes; i < numOfSpikes*2; i++){
	spikes.create((70+space/2) + 75*(i-numOfSpikes), config.height-17, 'spike2');
	}
	
	for(i = numOfSpikes*2; i < numOfSpikes*2 + numOfSpikes2; i++){
	spikes.create(20, 75 + 75*(i-numOfSpikes*2)+space2/2, 'spike');
	spikesChildren[i].body.enable = false;
	spikesChildren[i].visible = false;
	spikesChildren[i].body.height = 10;
	spikesChildren[i].body.y += 32;
	spikesChildren[i].depth = 0;
	
	}
	
	for(i = numOfSpikes*2 + numOfSpikes2; i < numOfSpikes*2 + numOfSpikes2*2; i++){
	spikes.create(config.width-20, (75 + 75*(i-(numOfSpikes*2 + numOfSpikes2))+space2/2), 'spike');
	spikesChildren[i].angle = 180;
	spikesChildren[i].body.enable = false;
	spikesChildren[i].visible = false;
	spikesChildren[i].body.height = 10;
	spikesChildren[i].body.y += 32;
	spikesChildren[i].depth = 0;
	}

	walls = this.physics.add.staticGroup(); // dodanie ścian z colliderami
	var wallsChildren = walls.getChildren();
	walls.create(0, 0, 'wall');
	walls.create(0, 0, 'wall');
	
	wallsChildren[0].setOrigin(0, 0);
	wallsChildren[0].height = GAME_HEIGHT;
	wallsChildren[0].body.height = GAME_HEIGHT;
	console.log(wallsChildren[0].body);
	wallsChildren[1].setOrigin(0, 0);
	wallsChildren[1].height = GAME_HEIGHT;
	wallsChildren[1].x = GAME_WIDTH-wallsChildren[1].width;
	
	walls.refresh();
	
	coins = this.physics.add.staticGroup({
        key: 'coin',
        frameQuantity: 1,
        immovable: true
    });


	player = this.physics.add.sprite(config.width/2, config.height/2, 'player'); // stworzenie playera nma którego oddziałowuje fizyka
	player.setCollideWorldBounds(true); // player nie może wyjśc poza grę
	player.body.setAllowGravity(false);
	
	game.input.mouse.capture = true;

	 this.anims.create({ //animacje coina
        key: 'coin_animation',
        frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 9 }),
        frameRate: 13,
        repeat: 1
    });

		coinsChildren = coins.getChildren();

        coinsChildren[0].setPosition(x, y).visible = false;
        coinsChildren[0].setPosition(x, y).body.enable = false;
		
	
	this.physics.add.overlap(player, coins, collectCoin);
	
	this.physics.add.collider(player, walls, hitWall, null, this); // collider między playerem a wallami
	player.setVelocityX(0); // pierwsz ustawienie prędkości (na prawo)
	
	scoreText = this.add.text(config.width/2 - 60, 32, '', { fontSize: '32px', fill: '#000', fontFamily: 'Shadows Into Light'}); // napis scorea
	coinsText = this.add.text(config.width/2 - 60, 80, '', { fontSize: '32px', fill: '#000', fontFamily: 'Shadows Into Light' }); // napis coina

	scoreText.setText('Score: 0');
	coinsText.setText('Coins: 0');
	
	//this.physics.add.overlap(player, coin, collectCoin, null, this); // overlap z coinem
	this.physics.add.collider(player, spikes, hitSpike, null, this);
	
	startMenuContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 300);
	gameOverMenuContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 300);

	var menu1 = this.add.sprite(0, 0, 'menu', 0);
	var menu2 = this.add.sprite(0, 0, 'menu', 1);
	
	var button1_1 = this.add.sprite(-85, 70, 'button');	
	var button2_1 = this.add.sprite(85, 70, 'button');
	var button1_2 = this.add.sprite(0, 70, 'button');
	
	var button2_1_text = this.add.text(50, 50, 'Skins', { fontSize: '32px', fill: '#000', fontFamily: 'Shadows Into Light'}); 
	var button1_1_text = this.add.text(-115, 50, 'Start', { fontSize: '32px', fill: '#000', fontFamily: 'Shadows Into Light'}); 
	timer = this.add.text(-5, 50, '', { fontSize: '32px', fill: '#000', fontFamily: 'Shadows Into Light'}); 
	totalCoins = this.add.text(60, -20, 'QUERY', { fontSize: '32px', fill: '#000', fontFamily: 'Shadows Into Light'}); 
	highScore = this.add.text(-110, -20, 'QUERY', { fontSize: '32px', fill: '#000', fontFamily: 'Shadows Into Light'}); 
	thisSessionScore = this.add.text(50, -60, '', { fontSize: '32px', fill: '#000', fontFamily: 'Shadows Into Light'}); 

	startMenuContainer.add([menu1, button1_1, button2_1, button1_1_text, button2_1_text, totalCoins, highScore]);
	gameOverMenuContainer.add([menu2, button1_2, timer, thisSessionScore]);
	gameOverMenuContainer.visible = false;
	
	button1_1.setInteractive();
	button1_2.setInteractive();
	button2_1.setInteractive();
	
	
	button1_1.on('pointerdown', function (pointer) {

		this.setTexture('button', 1);

    });
	
	button2_1.on('pointerdown', function (pointer) {

        this.setTexture('button', 1);

    });

    button1_1.on('pointerout', function (pointer) {

        this.setTexture('button', 0);

    });
	
	button2_1.on('pointerout', function (pointer) {

        this.setTexture('button', 0);

    });
	
	button1_2.on('pointerdown', function (pointer) {

       this.setTexture('button', 1);

    });
	
    button1_2.on('pointerout', function (pointer) {

       this.setTexture('button', 0);

    });
	
	button1_1.on('pointerup', function (pointer) {

        this.setTexture('button', 0);
		newGame();
    });
		
	button1_2.on('pointerup', function (pointer) {

        this.setTexture('button', 0);
		continueGame();
    });
	
	button2_1.on('pointerup', function (pointer) {
		this.setTexture('button', 0);
		// sie zobaczy jakies skiny czy cus
    });
	
	czasDrugiejSzansy = this.time.delayedCall(0, cancelChoice, [], this);
	
	moveGameOverMenu = this.tweens.add({
		targets: gameOverMenuContainer,
		y: GAME_HEIGHT/2 - 300,
		duration: 1000,
		ease: 'Power2',
		completeDelay: 500,
		paused: true
	});
	
	moveGameOverMenuAway = this.tweens.add({
		targets: gameOverMenuContainer,
		y: -500,
		duration: 500,
		ease: 'Power2',
		paused: true
	});
	
	moveStartMenuAway = this.tweens.add({
		targets: startMenuContainer,
		y: -500,
		duration: 500,
		ease: 'Power2',
		paused: true
	});

}

function hitSpike(player, spikes){
	
	thisSessionScore.setText(score);
	
	if(!gameOver){
	player.setVelocityX(0);
	gameOver = true;
	gameOverMenuContainer.visible = true;
	
	moveGameOverMenu.restart();
	
	czasDrugiejSzansy = this.time.delayedCall(3000, cancelChoice, [], this);

    player.setTint(0xff0000);
	gameOverMenuContainer.visible = true;
	
	coinsChildren[0].visible = false;
    coinsChildren[0].body.enable = false;
	}
}

function update(){
	
	if (this.input.activePointer.isDown && AllowClick && !gameOver) { // pojedyncze kliknięcie (wzlot) i zablokowanie kolejnych kliknięć
		player.setVelocityY(-540 - 10*multiplier);
		AllowClick = false;
	}
	
	else if(!this.input.activePointer.isDown){ // odblokowanie kliknięć
		AllowClick = true;
	}
	
	coins.getChildren()[0].anims.play('coin_animation', true); // aniamacje coina
	
	if(gameOver){
	timer.setText(3 - (czasDrugiejSzansy.getProgress()*3).toString().substr(0, 1));
	}
}

function hitWall(player, walls){
	
	if (player.body.touching.right && !gameOver){ //odbicie od prawej
		increaseMultiplier();
		score += 10;
		scoreText.setText('Score: ' + score);
		player.flipX = true;
		player.setVelocityX(-320 - 30 * multiplier);
	}
	
	if (player.body.touching.left && !gameOver && !collectingCoin){ // odbicie od lewej
		increaseMultiplier();
		score += 10;
		scoreText.setText('Score: ' + score);
		player.flipX = false;
		player.setVelocityX(320 + 30 * multiplier);
	}
	
	var ruffle = Phaser.Math.Between(4, 14);
	
if(ruffle >= 10){
	
	var children = coins.getChildren();
	
        var x = Phaser.Math.Between(100, 440);
        var y = Phaser.Math.Between(100, 860);

        children[0].setPosition(x, y);
		children[0].body.enable = true;
		children[0].visible = true;
		console.log(children[0]);

	coins.refresh();
}


this.time.addEvent({ delay: 100, callback: function() {

	for(var q = numOfSpikes*2; q < numOfSpikes*2 + numOfSpikes2*2; q++){
		
		spikes.getChildren()[q].body.enable = false;
		spikes.getChildren()[q].visible = false;

	}

	for(q = 0; q < multiplier && q < numOfSpikes2; q++){
		randomSpike();
	}
	
}, callbackScope: this, loop: false });

}

function increaseMultiplier(){
	if(score % 100 == 0 && score != 0){
	multiplier++;
	}
}


function collectCoin(player, coin)
{
		
	nrOfCoins += 1;
	coinsText.setText('Coins: ' + nrOfCoins);
	coins.getChildren()[0].body.enable = false;
	coins.getChildren()[0].visible = false;

}

function newGame(){
	
	score = 0;
	multiplier = 1;
	scoreText.setText('Score: ' + score);
	
	moveStartMenuAway.restart();
	
	gameOverMenuContainer.visible = false;
	
	for(var q = numOfSpikes*2; q < numOfSpikes*2 + numOfSpikes2*2; q++){
		
		spikes.getChildren()[q].body.enable = false;
		spikes.getChildren()[q].visible = false;

	}
	
	player.clearTint();
	player.body.reset(config.width/2, config.height/2);
	if(player.flipX){
		player.setVelocityX(-350)
	}
	else{player.setVelocityX(350);}
	player.body.setAllowGravity(true);
	gameOver=false;
	
}

function continueGame(){
	
	if(true){
		
	czasDrugiejSzansy.remove(false);
	moveGameOverMenuAway.restart();

	for(var q = numOfSpikes*2; q < numOfSpikes*2 + numOfSpikes2*2; q++){
		
		spikes.getChildren()[q].body.enable = false;
		spikes.getChildren()[q].visible = false;
	}
	
	nrOfCoins -=5;
	coinsText.setText('Coins: ' + nrOfCoins);
	player.clearTint();
	player.body.reset(config.width/2, config.height/2);
	if(player.flipX){
		player.setVelocityX(-350)
	}
	else{player.setVelocityX(350);}
	
	gameOver=false;
	}
	
	else{
		console.log("Not enough coins!");
	}
	
}

function randomSpike(){
	
	var ruffle = Phaser.Math.Between(numOfSpikes*2, numOfSpikes*2 + numOfSpikes2*2 - 1);
	
	spikes.getChildren()[ruffle].body.enable = true;
	spikes.getChildren()[ruffle].visible = true;
		
}

function cancelChoice(){
	
	if(gameOver){
	moveGameOverMenuAway.restart();
	startMenuContainer.x = GAME_WIDTH/2;
	startMenuContainer.y = GAME_HEIGHT/2 - 300;
	startMenuContainer.visible = true;
	}
}

/*


addEventListener :OOOOOOOOOO

ionic plugin rm cordova-plugin-screen-orientation --save
ionic plugin add https://github.com/apache/cordova-plugin-screen-orientation --save


shoebox!!

var container = this.add.container(400, 300); // relatywna pozycja elementów

https://www.youtube.com/watch?v=sYleQ1uRmjk               // obczaj

.setDepth(1) //////// wywalamy na wierzch cuś - taki z-index


platforms.create(400, 568, 'ground').setScale(2).refreshBody(); ////// refresh body noooooooo jakby tego od razu nie mogli powiedzieć


	 bg.children.iterate(function (child) { ///////////// dla wszystkich dzieci kek

        child.setOrigin(0,0);

    });

grupa to nie element
grupa posiada dzieci, które znajdują się w tablicy
jeżeli chcesz edytować element grupy musisz wyjąć "dziecko" z grupy i określić id dziecka
grupa.getChildren()[numer];

timedEvent = this.time.addEvent({ delay: 50, callback: reduceHealth, callbackScope: this, loop: true });
} /////// event z opóźnieniem~!

/////////////////////guzik again

button = this.add.group();

	button.create(GAME_WIDTH/2, GAME_HEIGHT/2 - 100, 'button').setInteractive(); 
	button.getChildren()[0].visible = false;
	
	text = this.add.text(button.getChildren()[0].x-30, button.getChildren()[0].y-10, "Try again", {font: "16px Arial", fill: "#ffffff"});
	text.visible = false;
	
	button.create(GAME_WIDTH/2, GAME_HEIGHT/2 + 100, 'button').setInteractive(); 
	button.getChildren()[1].visible = false;
	
	text2 = this.add.text(button.getChildren()[1].x-60, button.getChildren()[1].y-10, "Continue? (5 coins)", {font: "16px Arial", fill: "#ffffff"});
	text2.visible = false;

	
	button.getChildren()[0].on('pointerdown', function (pointer) {

        this.setTint(0xff0000);

    });

    button.getChildren()[0].on('pointerout', function (pointer) {

        this.clearTint();

    });

    button.getChildren()[0].on('pointerup', function (pointer) {

        this.clearTint();
		button.getChildren()[0].visible = false;
		text.visible = false;
		button.getChildren()[1].visible = false;
		text2.visible = false;
		newGame();

    });


	button.getChildren()[1].on('pointerdown', function (pointer) {

        this.setTint(0xff0000);

    });

    button.getChildren()[1].on('pointerout', function (pointer) {

        this.clearTint();

    });

    button.getChildren()[1].on('pointerup', function (pointer) {
	
        this.clearTint();
		continueGame();

    });



///GUZIK

create () {
    this.startBtn = this.add.sprite(100, 100, 'startBtn').setInteractive();

    this.startBtn.on('pointerover', function (event) { });
    this.startBtn.on('pointerout', function (event) {  });
    this.startBtn.on('pointerdown', startGame); // Start game on click.
}

///wymienialne elementy jednego spritu

function preload() {

    game.load.image('eye', 'assets/sprites/robot/eye.png');
    game.load.image('body', 'assets/sprites/robot/body.png');
    game.load.image('arm-l', 'assets/sprites/robot/arm-l.png');
    game.load.image('arm-r', 'assets/sprites/robot/arm-r.png');
    game.load.image('leg-l', 'assets/sprites/robot/leg-l.png');
    game.load.image('leg-r', 'assets/sprites/robot/leg-r.png');
    
}

function create() {

    // Use groups of sprites to create a big robot.
    // Robot itself, you can subclass group class in a real game.
    robot = game.add.group();

    robot.x = 300;
    robot.y = 200;

    robot.pivot.x = 300;
    robot.pivot.y = 300;

    // Robot components.
    robot.create(90, 175, 'arm-l');
    robot.create(549, 175, 'arm-r');
    robot.create(270, 325, 'leg-l');
    robot.create(410, 325, 'leg-r');
    robot.create(219, 32, 'body');
    robot.create(335, 173,'eye');

}

function update() {

    robot.rotation += 0.02;

}





// create a new scene named "Game"
let gameScene = new Phaser.Scene('Game');

gameScene.preload = function(){
	this.load.image('background', 'assets/background.png');
	this.load.image('player', 'assets/player.png');
	this.load.image('obstacle', 'assets/dragon.png');
};

gameScene.create = function(){
		bg.setOrigin(0, 0);
	let bg = this.add.sprite(0, 0, 'background');

	
	let player = this.add.sprite(70, 180, 'player');
	
	this.enemy1 = this.add.sprite(250, 180, 'enemy');
	
	this.enemy1.flipX = true;
	
	console.log(this.enemy1);
};

gameScene.update = function(){
	
	
	if(this.enemy1.displayWidth <= 140){
	this.enemy1.displayWidth += 1;
	this.enemy1.displayHeight += 1;
	}
}

// our game's configuration
let config = {
  type: Phaser.AUTO,  //Phaser will decide how to render our game (WebGL or Canvas)
  width: 245, // game width
  height: 500, // game height
  scene: gameScene // our newly created scene
};
 
// create the game, and pass it the configuration
let game = new Phaser.Game(config);

*/