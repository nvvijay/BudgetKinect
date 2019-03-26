let globalctx;
let isNewGame = true;
let isSuspended = false;
let isPaused = false;
let old_yspeed, old_xspeed;
let s;
let scl = 20;

let food;

export function Snake(element){
	console.log("got element as :", element);
	this.x = 0;
	this.y = 0;
	this.xspeed = 1;
	this.yspeed = 0;
	this.total = 0;
	this.tail = [];

	this.dist = function(x1,y1, x2,y2){
		return Math.abs(x2-x1) + Math.abs(y2-y1);
	}

	this.eat = function(pos) {
		var d = this.dist(this.x, this.y, pos.x, pos.y);
		if (d < 1) {
			this.total++;
			return true;
		} else {
			return false;
		}
	}

	this.dir = function(x, y) {
		this.xspeed = x;
		this.yspeed = y;
	}

	this.death = function() {
		for (var i = 0; i < this.tail.length; i++) {
			var pos = this.tail[i];
			var d = this.dist(this.x, this.y, pos.x, pos.y);
			if (d < 1) {
				console.log('starting over');
				this.total = 0;
				this.tail = [];
			}
		}
	}

	this.update = function() {
		if(isPaused){
			return;
		}
		for (var i = 0; i < this.tail.length - 1; i++) {
			this.tail[i] = this.tail[i + 1];
		}
		if (this.total >= 1) {
			this.tail[this.total - 1] = createVector(this.x, this.y);
		}

		this.x = this.x + this.xspeed * scl;
		this.y = this.y + this.yspeed * scl;

		// this.x = constrain(this.x, 0, width - scl);
		// this.y = constrain(this.y, 0, height - scl);
	}

	this.show = function(ctx) {
		// fill(255);
		for (var i = 0; i < this.tail.length; i++) {
			// rect(this.tail[i].x, this.tail[i].y, scl, scl);
			ctx.fillRect(this.tail[i].x, this.tail[i].y, scl, scl);
		}
		// rect(this.x, this.y, scl, scl);
		ctx.fillRect(this.x, this.y, scl, scl);
	}

	this.init = function(){
		var canvas = document.getElementById(element);
		canvas.height = 500;
		canvas.width = 700;
		var ctx = canvas.getContext('2d');
		s = new Snake("viewport");
		
		globalctx = ctx;
		var cols = Math.floor(500/scl);
		var rows = Math.floor(700/scl);
		food = createVector(Math.floor(Math.random(cols)*scl)*scl, Math.floor(Math.random(rows)*scl)*scl);
		console.log("food at:", food.x, food.y);

		animate(ctx);
	}

	this.takeAction = function(direction){
		if(direction == "PAUSE"){
			if(isPaused){ // unpause
				console.log("game unpaused");
				this.yspeed = old_yspeed;
				this.xspeed = old_xspeed;
				isPaused = false;
			}else{ //pause
				console.log("game paused");
				old_yspeed = this.yspeed;
				old_xspeed = this.xspeed;
				this.xspeed = 0;
				this.yspeed = 0;
				isPaused = true;
			}
		}
		if(isPaused){
			return;
		}
		if(direction == "UP"){
			if(this.yspeed != 1){
				this.yspeed = -1;
				this.xspeed = 0;
			}
		}else if(direction == "DOWN"){
			if(this.yspeed != -1){
				this.yspeed = 1;
				this.xspeed = 0;
			}
		}
		else if(direction == "LEFT"){
			if(this.xspeed != 1){
				this.yspeed = 0;
				this.xspeed = -1;
			}
		}else if(direction == "RIGHT"){
			if(this.xspeed != -1){
				this.yspeed = 0;
				this.xspeed = 1;
			}
		}
	}
}

export function takeAction(direction){
	s.takeAction(direction);
}

window.addEventListener('keydown', keydownhandler ,false);

function keydownhandler(e) {
	if(e.keyCode == 37){
		s.takeAction("LEFT");
	}else if(e.keyCode == 38) {
		s.takeAction("UP");
	}else if(e.keyCode == 39) {
		s.takeAction("RIGHT");
	}else if(e.keyCode == 40) {
		s.takeAction("DOWN");
	}else if(e.keyCode == 32) {
		s.takeAction("PAUSE");
	}
    console.log(e.keyCode);
}

let fpsLimit = 2;
let previousDelta = Date.now();
function animate(ctx){

	let delta = Date.now() - previousDelta;
	if (fpsLimit && delta < 1000 / fpsLimit) {
        requestAnimationFrame(function(){animate(ctx);});
        return;
    }
    // console.log("ran 1 frame");
    previousDelta = Date.now();
	clearscreen(ctx);
	// if(isNewGame){
	// 	showtext(1, ctx);
	// }else if(isSuspended){
	// 	showtext(2, ctx);
	// }
	// if(isPaused){
	// 	showtext(3, ctx);
	// }else{
		// background(51);

		if (s.eat(food)) {
			pickLocation();
		}
		s.death();
		s.update();
		s.show(ctx);

		// fill(255, 0, 100);
		// rect(food.x, food.y, scl, scl);
		ctx.fillRect(food.x, food.y, 20, 20);
	// }
	requestAnimationFrame(function(){animate(ctx);});
}

function pickLocation() {
	var cols = Math.floor(500/scl);
	var rows = Math.floor(700/scl);
	food = createVector(Math.floor(Math.random(cols)*scl)*scl, Math.floor(Math.random(rows)*scl)*scl);
}

function createVector(x, y){
	return {"x": x, "y": y};
}
function pause(){
	isPaused = true;
}

function clearscreen(ctx){
	ctx.clearRect(0,0,700,500);
	ctx.fillRect(0, 0, 20, 500);
	ctx.fillRect(680, 0, 20, 500);
}
function updateSnake(){
	
}


function drawSnake(ctx){
	
}

function detectcollision(ctx){
	//collision with roof and floor
	if(yPos <0 || yPos > 500){
		console.log("game over");
		pause();
	}
}


function showtext(type, ctx){
	ctx.font = "30px Ariel";
	if(type == 1){
		ctx.fillText("Press SpaceBar to start!",180,250);
	}else if(type == 2){
		ctx.fillText("Paused", 250,250);
		ctx.fillText("Press Esc to resume!", 180,290);
	}else if(type == 3){
		ctx.fillText("Game Over!", 250,210);
		ctx.fillText("Score is :"+totalScore,250,250);
		ctx.fillText("Press SpaceBar to start!", 180,290);
	}
}

function resetgamestate(){
	
}

function nextframe(action){
	if(action == 1){
		
	}
	animate(globalctx);
	return getdata(action);
}

// FlyBirdFly("viewport");