$(document).ready(function(){

	/* GLOBAL VARS */
	var SCREEN_WIDTH = 1024;
	var SCREEN_HEIGHT = 851;
	var MISSILE_SPEED = 20;
	var EGO_SPEED = 0.5;
	var EGO_MAX_SPEED = 15;
	var WAVE_MIN = 1;
	var WAVE_SIZE = 3;
	var FPS = 60;
	var STARTING_HITS = 5;
	var missiles = [];
	var martians = [];
	var deadMartians = [];
	var martianCount = 0;
	var frames = 0;
	var hits = STARTING_HITS;
	var player = "Unknown Soldier";
	var score = 0;
	var hiscore = 0;
	var wave = 0;
	var snd = new Audio("./sounds/nextwave.wav"); // buffers automatically when created
	var kill = new Audio("./sounds/kill.wav");
	var hit = new Audio("./sounds/hit.wav");
	var action = new Audio("./sounds/action.wav");
	var background = new Audio("./sounds/background.ogg");
	background.loop = true;
	var gameRunning = false;
	var gameStarted = false;
	var playerHasControl = false;
	var ego = null;
	

	function blink(elem, speed){
		return setInterval(function() {
			if (elem.css('visibility') == 'hidden') {
				elem.css('visibility', 'visible');
			} else {
				elem.css('visibility', 'hidden');
			}
		}, speed);
	}
	
	$('.blink').each(function() {
		blink($(this), 600);
	});
	

	/* PAUSE */
	function pause() {
		action.play();
		gameRunning = (!gameRunning);
		$("#wave").html((gameRunning) ? ("WAVE " + wave) : "PAUSE");
	}
	
	/* GAMEOVER */
	function gameover() {		
		$("#youranked").html(getRank(score));
		ego.skin.remove();
		$("#gameover").css("display", "block");
		playerHasControl = false;
		signPlayer();
	}
	
	function signPlayer(){
		$("#player-name").toggle();		
		$("#playerName").focus();
		
		$('#playerName').change(function() {
			player = $(this).val();
			saveScore(score, wave, player);
			$("#player-name").toggle();
			endGame();
		});
	}

	/* END GAME */

	function endGame() {
		action.play();
		gameRunning = false;
		gameStarted = false;

		window.onblur();

		/* RESET */
		for(i = 0; i < martians.length; i++) {
			if(martians[i]) {
				martians[i].skin.remove();
			}
		}
		for(i = 0; i < missiles.length; i++) {
			if(missiles[i]) {
				missiles[i].skin.remove();
			}
		}
		ego.skin.remove();

		martians = new Array();
		missiles = new Array();

		delete fcounter;		
		$("#player-name").css("display", "none");
		$("#gameover").css("display", "none");
		$("#score").html("SCORE " + (score = 0));
		$("#hits").html("HITS " + (hits = STARTING_HITS));
		martianCount = 0;
		frames = 0;
		score = 0;
		wave = 0;

		$("#info").html("");

		displayTitleScreen(true);
	}

	function getLives(){

		var lives = "";

		for(i=0; i < hits; i++){
			lives += "<img src='./img/live.png'/>";
		}
		return lives;
	}

	function resetScores(){

		var html ="<div id='hiscore'>HI-SCORE 0</div>" +
			"<div id='score'>SCORE 0</div>" +
			"<div id='hits'>" + hits + " LIVES LEFT</div></br><div id='live'>" + getLives() + "</div>";
		$("#info").append(html);
		$("#hiscore").html(getHiScore());
	}

	function displayTitleScreen(highscore){
		background.play();
		$("#game-screen").css("display", "none");
		$("#title-screen").css("display", "block");
		if(highscore == true)
			showRanking();
	}
	
	function displayGameScreen(){
		background.pause();
		$("#title-screen").css("display", "none");
		$("#game-screen").css("display", "block");		
	}

	/* SPAWN FUNCTIONS */		
	function getSquadFormation(index){
	
		switch(index){
			case 0:	
				var formation = [
					[1, 0, 0, 0, 0],
					[0, 0, 0, 0, 1],
					[0, 0, 0, 1, 0],
					[1, 0, 1, 0, 0],
					[0, 1, 0, 0, 0]
				];
				break;	
			case 1:	
				var formation = [
					[0, 0, 0, 0, 1],
					[1, 0, 0, 0, 0],
					[0, 1, 0, 0, 0],
					[0, 0, 1, 0, 1],
					[0, 0, 0, 1, 0]
				];
				break;
			case 2:	
				var formation = [
					[1, 0, 1, 0, 1],
					[0, 0, 0, 0, 0],
					[0, 1, 0, 1, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 1, 0, 0]
				];
				break;
			case 3:
				var formation = [
					[1, 0, 1],
					[0, 0, 0],
					[0, 1, 0]
				];
				break;
			case 4:
				var formation = [
					[1, 0, 0],
					[0, 1, 0],
					[0, 0, 1]
				];
				break;
			case 5:
				var formation = [
					[0, 0, 1],
					[0, 1, 0],
					[1, 0, 0]
				];
				break;
			case 6:
				var formation = [
					[0, 0, 0],
					[0, 1, 0],
					[1, 0, 1]
				];
				break;
			case 7:
				var formation = [
					[1, 0, 1],
					[0, 1, 0],
					[0, 0, 0]
				];
				break;
			default:			
				var formation = [
					[0, 0, 0],
					[1, 1, 1],
					[0, 0, 0]
				];
		}	
		
		var positions = new Array();		
		
		for(offsetY = 0; offsetY < formation.length; offsetY++){
			for(offsetX = 0; offsetX < formation.length; offsetX++){
				if(formation[offsetY][offsetX]){
					positions.push({x: offsetX, y: offsetY});
				}
			}			
		}		
		return positions;
	}
	
	function spawnMartian(squadSize){
		var SPAWN_X_WIDTH = 800;
		var SPAWN_X = 200;
		var SPAWN_Y = -200;
		var BUFFER = 50;
		
		var positions = getSquadFormation(Math.floor(Math.random() * 8));
		
		var CENTER_X = Math.floor((Math.random() * SPAWN_X_WIDTH) + SPAWN_X);
		
		var behavior = Math.floor((Math.random() * 5));
		
		for(i = 0; i < positions.length; i++){
			martians.push( new Martian(
				CENTER_X + (positions[i].x * BUFFER) , 
				SPAWN_Y + (positions[i].y * BUFFER), 
				martians.length, 
				behavior
			));
			martianCount++;
		}		
	}
		
	function spawnEgo(){		
		ego.skin.css("top", "850px");
		ego.skin.css("left", "475px");		
		ego.deltaXY.x = 0;
		ego.deltaXY.y = -12;
	}

	/* FRAME COUNT FUNCTION */
	function frameCounter(){

		var sysTime = new Date();
		this.startTime = sysTime.getTime();

		this.now = function(){
			var sysTime = new Date();
			t = sysTime.getTime();
			return t;
		}

		this.update = function(f){
			var deltaT = (this.now() - this.startTime);

			if(deltaT >= 1000) {

				var frate = Math.floor(((f / deltaT) * 1000));
				var setfrate = (FPS + (FPS - frate));
				$("#fps").html("FPS: " + frate);
				$("#setfps").html("SET FPS: " + setfrate);

				frames = 0;
				this.startTime = this.now();
				return setfrate;
			}

			return false;
		}
	}
	/* FRAME COUNT FUNCTION - END OF BLOCK */

	/*COLLISION FUNCTIONS*/
	function getPosition(elem, nextPos) {

		if(nextPos){
			deltaX = nextPos.deltaX || 0;
			deltaY = nextPos.deltaY || 0;
		} else {deltaX = 0; deltaY = 0;}

		var pos, width, height;
		pos = $( elem ).offset();
		width = $( elem ).width();
		height = $( elem ).height();

		return [ [ pos.left + deltaX, pos.left + width + deltaX ], [ pos.top + deltaY, pos.top + height + deltaY ] ];
	}

	function comparePositions(p1, p2) {
		var r1, r2;
		r1 = p1[0] < p2[0] ? p1 : p2;
		r2 = p1[0] < p2[0] ? p2 : p1;
		r1[1] > r2[0] || r1[0] === r2[0];
		return r1[1] > r2[0] || r1[0] === r2[0];
	}

	function cannotMove(pos1, enemyClass){

		var obstacles = $(enemyClass);

		for(i = 0; i < obstacles.length; i++) {
			pos2 = getPosition(obstacles[i]);

			if(comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] )) {
				return obstacles[i];
			}
		}
		return false;
	}

	function collide( a, b ) {
		var pos1 = getPosition( a ), pos2 = getPosition( b );
		return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
	} /*COLLISION->END OF BLOCK*/
	
	
	/* BEHAVIOR CLASS */
	function Behavior(settings){

		// fire rate
		var LAZY_FIRE_RATE = 64;
		var REGULAR_FIRE_RATE = 64;
		var TRIGGER_HAPPY = 16;
		var FRENZIED_FIRE_RATE = 8;
		// speed
		var DUMB_SLOW = 1;
		var REGULAR_SPEED = 2;
		var QUICKY_FELLOW = 3;
		var LIGHTING_SPEED = 4;	
		var TRUCE_CYCLES = Math.floor(Math.random() * 40) +  32;

		this.clock = new Clock();
		this.owner = settings.owner || false;
		this.fireHoldCycles = REGULAR_FIRE_RATE; 
		
		this.update = function(){
			this.clock.update();
		}

		this.fireHold = function(){
			this.clock.reset();
			this.clock.set({ clockwise: false, reach: this.fireHoldCycles, owner: settings.owner, callback: ('fire' in this.owner) ? 'fire' : false, loop: true });
			this.clock.start();
		}
		
		this.truce = function(cycles){
			return { clockwise: false, reach: cycles, owner: this, callback: 'fireHold' , loop: false };
		}

		this.inFiringRange = function(x, y){
			return ((Math.abs(x - ego.x()) < 10) && (y < ego.y()));
		}

		var behavior = (settings.index || Math.floor((Math.random() * 5) + 1));
			
		switch(behavior){
			case 1:	// STRAIGHT
				if(this.owner){
					this.fireHoldCycles = TRIGGER_HAPPY; 
					this.clock.set(this.truce(TRUCE_CYCLES));
				}
				this.speed = LIGHTING_SPEED;
				this.move = function(coordX, coordY) {
					return {x: coordX, y: coordY + this.speed};
				}
				break;
				
			case 2:	// SINUSOID
				if(this.owner){
					this.fireHoldCycles = REGULAR_FIRE_RATE; 
					this.clock.set(this.truce(TRUCE_CYCLES));
				}
				this.speed = QUICKY_FELLOW;
				this.move = function(coordX, coordY){
					return {x: coordX + ((Math.sin(coordY/64)) * 8), y: coordY + this.speed};
				}
				break;
				
			case 3: // QUADRATIC
				if(this.owner){
					this.fireHoldCycles = REGULAR_FIRE_RATE; 
					this.clock.set(this.truce(TRUCE_CYCLES));
				}
				this.speed = REGULAR_SPEED;
				this.move = function(coordX, coordY){
					return {x: coordX + (Math.pow(coordY / 160, 2)), y: coordY + this.speed};
				}
				break;
				
			case 4:	// TRICKY
				if(this.owner){
					this.fireHoldCycles = REGULAR_FIRE_RATE; 
					this.clock.set(this.truce(TRUCE_CYCLES));
				}
				this.speed = REGULAR_SPEED;
				this.move = function(coordX, coordY){
					return {x: coordX + ((Math.sin(coordY/100)) * 8), y: coordY + this.speed};
				}
				break;
				
			case 5:	// EXPERIMENTAL
				if(this.owner){
					this.fireHoldCycles = REGULAR_FIRE_RATE; 
					this.clock.set(this.truce(TRUCE_CYCLES));
				}
				this.speed = REGULAR_SPEED;
				this.move = function(coordX, coordY){
					if(ego.y() > coordY)
						return {x: ego.x() / 1.25 + ((Math.sin(coordY/32)) * 64), y: coordY + this.speed};
					return {x: coordX, y: coordY + this.speed + 4};
				}
				break;			
		}
		this.clock.start();
	}

	/* CLOCK CLASS */

	function Clock() {}

	Clock.prototype = {
		set: function(args) {
			this.clockwise = args.clockwise || true;
			this.step = args.step || 1;
			this.zero = args.zero || 0;
			this.reach = args.reach || false;
			this.loop = args.loop || false;
			this.owner = args.owner || false;
			this.callback = args.callback || false;
			this.counter = this.zero;
			this.running = false;
		},
		reset: function() {
			this.counter = this.zero;
		},
		toggle: function() {
			this.reset();
			this.running = !(this.running);
		},
		start: function() {
			this.running = true;
		},
		stop: function() {
			this.reset();
			this.running = false;
		},
		update: function() {
			if(this.running) {
				if((this.reach != false) && (this.counter == this.reach)) {

					if(this.owner && this.callback){
						if( !this.owner[this.callback]() )
							return;
					}

					if(this.loop)
						this.reset();
					else
						this.stop();
				}
				this.counter += (this.clockwise) ? this.step : -this.step;
			}
		}
	}
	/* END OF BLOCK - CLOCK CLASS */

	/* ENTITY CLASS */
	function Entity(){}

	Entity.prototype = {
		set: function(args) {
			this.skin = $(args.skin) || false;
			this.collider = (args.collider) ? $(args.skin + " .collider") : false;
			this.speed = (args.speed) || 0;
		},
		x: function() {
			return parseInt(this.skin.css("left"));
		},
		y: function() {
			return parseInt(this.skin.css("top"));
		},
		setX: function(x){
			this.skin.css("left", x);
		},
		setY: function(y){
			this.skin.css("top", y);
		},
		setXY: function(x, y){
			this.setX(x);
			this.setY(y);
		},
		setZ: function(){
			this.skin.css("z-index", (this.y() + this.skin.height()));
		},
		visible: function(){
			this.skin.css('visibility', 'visible');
		},
		invisible: function(){
			this.skin.css('visibility', 'hidden');
		}
	}
	/* END OF BLOCK - ENTITY CLASS */

	/* SPRITE CLASS */
	function Sprite() {
		// -1: dead
		// 0: ghost
		// 1: playing
		// 2: exploding
		this.state = 1;
		this.timeout = false;		
		this.clock = new Clock();
		this.clock.set({reach: 128, owner: this, callback: 'changeState'}); 
		
		this.deltaXY = {x: 0, y: 0};
	}
	Sprite.prototype = new Entity();
	
	Sprite.prototype.update = function(){
		this.clock.update();
		
		if((this.state == -1) && (this.isReady())){
			ego.changeState();
		}
	}
	
	Sprite.prototype.changeState = function() {
	
		switch(ego.state){
			case 1:
				ego.state = -1;				
				playerHasControl = false;						
				ego.timeout = blink(ego.skin, 125);
				this.clock.toggle();
				spawnEgo();
				break;
			case -1:		
				ego.state = 0;
				ego.deltaXY.x = 0;
				ego.deltaXY.y = 0;
				playerHasControl = true;
				break;
			case 0:
				ego.state = 1;
				this.clock.toggle();				
				clearTimeout(ego.timeout);			
				ego.timeout = false;
				ego.skin.css("visibility", "visible");					
				break;
		}
	}
	
	Sprite.prototype.isReady = function(){
		return (ego.y() < 680);
	}

	Sprite.prototype.move = function(left, top) {

		// COLLIDERS CHECK
		for(e = 0; e < this.collider.length; e++) {
			var nextPosition = getPosition(this.collider[e],  {deltaX: (left * this.speed), deltaY: (top * this.speed)});
			if(ego.state == 1) {
				if(enemy = cannotMove(nextPosition, this.enemyClass)) {
					martians[($(enemy).attr('id')).slice(1)].destroy();
					ego.destroy();
					return;
				}
			}
		}

		// SCREEN BOUNDS CHECK
		if(((this.x() + (left * this.speed)) < 0) || 
			((this.x() + (left * this.speed)) > (SCREEN_WIDTH - 25/*EGO WIDTH*/)) || 
			((this.y() + (top * this.speed)) < 0) || ((this.y() + (top * this.speed)) > SCREEN_HEIGHT)){
			return;
		}

		this.setXY(this.x() + (left * this.speed), this.y() + (top * this.speed));
	}
	/* SPRITE CLASS - END OF BLOCK */

	/* MISSILE CLASS */
	function Missile(x, y, id, targetClass) {}
	Missile.prototype = new Entity();

	function Missile(x, y, id, targetClass) {
		this.id = id;
		this.targetClass = targetClass;

		this.color = (targetClass == ".martian") ? "green" : "red";

		$("div[role='main']").append("<div id='m" + id + "' class='missile' style='background: " + this.color + "'></div>");
		this.set({skin: "#m" + id, collider: false, speed: (this.targetClass == ".martian") ? MISSILE_SPEED : -MISSILE_SPEED});
		this.setXY(x, y);
	}

	Missile.prototype = new Entity();

	/* MISSILE UPDATE() */
	Missile.prototype.update = function() {

		if(ego.state == 1) {
			if(enemy = cannotMove(getPosition(this.skin, {deltaX: 0, deltaY: -this.speed}), this.targetClass)){
				if(this.targetClass == ".martian") {
					kill.play();
					$("#score").html("SCORE " + (score += 10));
				}
				this.destroy(enemy);
				return;
			}
		}

		this.setY(this.y() - this.speed);

		if(this.y() < 0 || this.y() > SCREEN_HEIGHT)
			this.destroy();
	}
	/* MISSILE UPDATE() - END OF BLOCK */

	Missile.prototype.destroy = function(target) {
		if(target){
			if(this.targetClass == ".martian") {
				martians[($(target).attr('id')).slice(1)].destroy();
			} else {
				ego.destroy();
				missiles.slice(this.id);
				this.skin.remove();
				return; // keep it alive
			}
		}
		missiles.slice(this.id);
		this.skin.remove();
	}
	/* MISSILE CLASS - END OF BLOCK */

	/* EGO CLASS */
	function Ego() {
	
		$("div[role='main']").append("<div id='ego' class='earthling sprite'><div id='front' class='collider'></div></div>");
		this.enemyClass = ".martian";
		this.state = 1;
	}
	Ego.prototype = new Sprite();
	
	Ego.prototype.destroy = function() {
		if(this.state == 1){
			hit.play();
			$("#hits").html(--hits + " LIVES LEFT");
			$("#live").html(getLives());
			
			if(hits == 0){
				gameover();	
				return;
			}		
			
			ego.changeState();
		}
	}

	Ego.prototype.fire = function() {
		missiles.push(new Missile(this.x() + 8, this.y() - MISSILE_SPEED, missiles.length, this.enemyClass));
	}
	
	Ego.prototype.update = function(){
		Sprite.prototype.update.call(this);
		ego.move(this.deltaXY.x, this.deltaXY.y);
		
		if(this.state != -1){
		// movement damping
		this.deltaXY.x -= this.deltaXY.x/8;		
		
		this.deltaXY.y -= this.deltaXY.y/8;
	
		if(Math.abs(this.deltaXY.x) < 1)
			this.deltaXY.x = 0;
		
		if(Math.abs(this.deltaXY.y) < 1)
			this.deltaXY.y = 0;
		}
		
	}
	
	Ego.prototype.setDeltaXY = function(delta){
		this.deltaXY.x += (Math.abs(this.deltaXY.x + delta.x) > EGO_MAX_SPEED) ? 0 : delta.x;
		this.deltaXY.y += (Math.abs(this.deltaXY.y + delta.y) > EGO_MAX_SPEED) ? 0 : delta.y;
	}
	

	/* EGO CLASS - END OF BLOCK */

	/* MARTIAN CLASS */
	function Martian() {}
	Martian.prototype = new Entity();
	function Martian(x, y, id, behavior){

		this.id = id;
		this.enemyClass = ".earthling";
		this.behavior = new Behavior({index: ((behavior) ? behavior : 1), owner: this});

		// creates DOM element
		$("div[role='main']").append("<div id='e" + id + "' class='martian collider'></div>");
		
		this.set({skin: "#e" + id, collider: true});
		this.setXY(x, y);
	}

	/* MARTIAN UPDATE() */
	Martian.prototype.update = function(){
		this.behavior.update();

		var coord = this.behavior.move(this.x(), this.y());
		this.setXY(coord.x, coord.y);

		if(this.y() > SCREEN_HEIGHT){
			martians[this.id] = null;
			martianCount--;
			this.skin.remove();
		}
	}
	Martian.prototype.fire = function() {
		if(this.behavior.inFiringRange(this.x(), this.y())){
			missiles.push(new Missile(this.x() + 8, this.y() + MISSILE_SPEED, missiles.length, this.enemyClass));
			return true;
		}
		return false;
	}
	/* MARTIAN UPDATE() - END OF BLOCK */

	Martian.prototype.destroy = function(target) {
		this.skin.css('background-position', '-28px')
		if(target){
			$(target).remove();
		}
		deadMartians.push(this);
		setTimeout(eraseMartian, 250);
	}

	function eraseMartian(){
		var m = deadMartians.shift();
		m.skin.remove();
		martians[m.id] = null;
		martianCount--;
	}

	/* MARTIAN CLASS - END OF BLOCK */

	//	THE GAME LOOP
	//
	function loop(){
		var corectedFramerate = fcounter.update(++frames) || FPS;

		if(gameRunning){
		
			ego.update();

			if(martianCount < WAVE_MIN && hits > 0){
				snd.play();
				spawnMartian(WAVE_SIZE);
				$("#wave").html("WAVE " + ++wave);
			}

			var to = new Date();
			var startTime = to.getTime();

			$(".trigger").each(function(index){
				if(collide($("#ego"), $(this))){
				}
			});

			$(".missile").each(function(index){
				missiles[($(this).attr('id')).slice(1)].update();

				// DEBUG - MISSILE TRACK
				//$("#missiletrack").html("<div>Missile track (x;y): " + missiles[($(this).attr('id')).slice(1)].x() + " ; " + missiles[($(this).attr('id')).slice(1)].y() + "</div>");

			});

			$(".martian").each(function(index){
				martians[($(this).attr('id')).slice(1)].update();

				// DEBUG - MARTIAN COORD TRACK
				/*
				if(martianCount > 0){
					$("#martiantrack").html("<div>Martian (x,y): " + martians[($(this).attr('id')).slice(1)].x() +
					" ; " + martians[($(this).attr('id')).slice(1)].y() + "</div>");
				}
				*/
				// DEBUG - FIRE BEHAVIOR
				//$("#firebehavior").html("<div>FireHold: " + martians[($(this).attr('id')).slice(1)].fireHold + "</div>");
			});
			
			$("#egoclock").html("<div>Ego clock: " + ego.clock.counter + "</div>");
			$("#egostate").html("<div>Ego state: " + ego.state + "</div>");
			$("#egodeltax").html("<div>Ego delta x: " + ego.deltaXY.x + "</div>");
			$("#egodeltay").html("<div>Ego delta y: " + ego.deltaXY.y + "</div>");

			var tc = new Date();
			var endTime = tc.getTime();

			$("#performance").html("Performance (loop): " + (endTime - startTime) + " ms");
		}
		setTimeout(loop, 1000/corectedFramerate);
	}
	
	function start(){		
		displayGameScreen();
		action.play();
		gameRunning = true;
		gameStarted = true;
		playerHasControl = true;
		ego = new Ego();
		ego.set({skin: "#ego", collider: true, speed: EGO_SPEED});
		resetScores();
		ego.visible();
		fcounter = new frameCounter();
		loop();
	}
	
	KeyboardController({
		27: function() { if(gameStarted) endGame();},
		80: function() { if(gameStarted && (hits > 0)) pause();},
		32: function() { if(!gameStarted){showRanking();} else return true},
		88: function() { if(gameStarted){if(playerHasControl) ego.fire();} else {start();} },
		37: function() { if(playerHasControl) ego.setDeltaXY({x:-1, y: 0}) },
		38: function() { if(playerHasControl) ego.setDeltaXY({x: 0, y: -1}) },
		39: function() { if(playerHasControl) ego.setDeltaXY({x: 1, y: 0}) },
		40: function() { if(playerHasControl) ego.setDeltaXY({x: 0, y: 1}) }
	}, {27: 0, 80: 0, 32: 0, 88:0, 37:1, 38:1, 39:1, 40:1});

	displayTitleScreen();

}); /*DOMREADY->END OF BLOCK*/

/*KEYBOARD CONTROLS*/
// Keyboard input with customisable repeat (set to 0 for no key repeat)
//
function KeyboardController(keys, repeat) {
	// Lookup of key codes to timer ID, or null for no repeat
	//
	var timers = {};

	// When key is pressed and we don't already think it's pressed, call the
	// key action callback and set a timer to generate another one after a delay
	//
	document.onkeydown= function(event) {

		var key= (event || window.event).keyCode;

		if (!(key in keys))
			return true;

		if (!(key in timers)) {
			timers[key]= null;
			keys[key]();
			if (repeat[key]!==0)
			timers[key]= setInterval(keys[key], repeat[key]);
		}
		return false;
	};

	// Cancel timeout and mark key as released on keyup
	//
	document.onkeyup= function(event) {
		var key= (event || window.event).keyCode;

		if (key in timers) {
			if (timers[key]!==null)
				clearInterval(timers[key]);
			delete timers[key];
		}
	};

	// When window is unfocused we may not get key events. To prevent this
	// causing a key to 'get stuck down', cancel all held keys
	//
	window.onblur= function() {
		for (key in timers)
			if (timers[key]!==null)
				clearInterval(timers[key]);
		timers= {};
	};
};/*KEYBOARD->END OF BLOCK*/