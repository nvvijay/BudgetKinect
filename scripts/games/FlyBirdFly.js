//bird physics state variables
var yPos = 250;
var yAcc = 0;
var gravity = 0;

//pipe state vairables
var curCenter = 250;
var pipeCenters = [100, 150, 200, 250];
var pipeSpeed = 0;
var pipeGap = 200;
var pipeDisp = 100+pipeGap;
var pipeWidth = 60;
var pipeHole = 120;

var isPaused = false;
var isNewGame = true;
var isSuspended = false;
var suspendedYacc = 0;

var totalScore = 0;
var isDebug = false;

var isTrain = false;
var globalctx = 1;
export function FlyBirdFly(element){

	var canvas = document.getElementById(element);
	canvas.height = 500;
	canvas.width = 700;
	var ctx = canvas.getContext('2d');
	
	globalctx = ctx;
	this.init = function() {
		console.log("Fly Bird");
		
		if(!isTrain){
			animate(ctx);
		}else{
			resetgamestate();
			isNewGame = false;
		}
	}
}


export function pressButton(){
	yAcc = 10;
}

window.addEventListener('keydown', keydownhandler ,false);

function keydownhandler(e) {
    if(e.keyCode == 32){
    	console.log("space bar pressed: ");
    	if(isNewGame){
    		resetgamestate();
    		isNewGame = false;
    	}else if(isPaused){
    		console.log("restarting");
    		resetgamestate();
    		isPaused = false;
		}
		if(!isSuspended){
    		yAcc = 10;
    	}
    }else if(e.keyCode == 27){
    	if(isSuspended){
    		console.log("resuming game state");
    		gravity = -0.6;
    		isSuspended = false;
    		yAcc = suspendedYacc;
    		pipeSpeed = 5;
    	}else{
    		gravity = 0;
    		console.log("Suspending game state");
    		isSuspended = true;
    		suspendedYacc = yAcc;
    		yAcc = 0;
    		pipeSpeed = 0;
    	}
    }else if(e.keyCode == 68){
    	isDebug = !isDebug;
    }else if(e.keyCode == 84){
    	isTrain = !isTrain;
    }else{
    	console.log(e.keyCode);
    }
}

function animate(ctx){
	clearscreen(ctx);
	if(isNewGame){
		showtext(1, ctx);
	}else if(isSuspended){
		showtext(2, ctx);
	}
	if(isPaused){
		showtext(3, ctx);
	}else{
		updateBird();
		updatePipes();
		drawBird(ctx);
		drawpipe(ctx);
		detectcollision(ctx);
		//printstatedata();
	}
	if(!isTrain){
		requestAnimationFrame(function(){animate(ctx);});
	}
}

function pause(){
	isPaused = true;
}

function clearscreen(ctx){
	ctx.clearRect(0,0,700,500);
	ctx.fillRect(0, 0, 20, 500);
	ctx.fillRect(680, 0, 20, 500);
}
function updateBird(){
	yAcc = yAcc+gravity;
	yPos = yPos - (yAcc);
}

function updatePipes(){
	pipeDisp -= pipeSpeed;
	if(pipeDisp < 0){
		pipeDisp = pipeGap;
		generatepipe();
	}
}

function drawBird(ctx){
	ctx.beginPath();
	ctx.arc(100,yPos,10,0,2*Math.PI);
	ctx.fill();
}

function drawpipe(ctx){
	for (var i = 0; i < pipeCenters.length; i++) {
		ctx.beginPath()
		ctx.rect(i*pipeGap+pipeDisp, 0, pipeWidth, pipeCenters[i]-pipeHole);
		ctx.rect(i*pipeGap+pipeDisp, pipeCenters[i]+pipeHole, pipeWidth, 500);
		ctx.fill();
	}
	
}

function generatepipe(){
	var nextgap = pipeCenters[pipeCenters.length-1]+randomgap(-100,100);
	if(nextgap < 150 || nextgap > 400){
		nextgap = pipeCenters[pipeCenters.length-1];
	}
	if(pipeCenters.length < 4){
		pipeCenters.push(nextgap);
	}else{
		pipeCenters.shift();
		pipeCenters.push(nextgap);
	}
	totalScore += 1;
}

function randomgap(max, min){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function detectcollision(ctx){
	if(isDebug){
		if(Math.max(90, pipeDisp) < Math.min(110, pipeDisp+pipeWidth)){
			ctx.fillStyle = 'red';
		}else{
			ctx.fillStyle = 'green';
		}
		ctx.globalAlpha = 0.5;
		ctx.fillRect(90, 0, 20, 500);
		ctx.fillStyle = 'blue';
		ctx.fillRect(pipeDisp, 0, 2, 500);
		ctx.fillRect(pipeDisp+pipeWidth, 0, 2, 500);
		ctx.fillStyle = 'black';
		ctx.globalAlpha = 1;
	}
	//collision with roof and floor
	if(yPos <0 || yPos > 500){
		console.log("game over");
		yAcc = 0;
		gravity = 0;
		pause();
	}
	//collision with pipes
	//max(min) < min(max) => collision
	if(Math.max(90, pipeDisp) < Math.min(110, pipeDisp+pipeWidth)){
		if(yPos-10 < pipeCenters[0]-pipeHole || yPos+10 > pipeCenters[0]+pipeHole){
			console.log("game over");
			pause();
		}
	}
}

function printstatedata(){
	//print data values
	var data = getdata();

	var ele = document.getElementById("data");
	var str = "<b> yPos: </b>"+data[0].toFixed(2)+" <b> yAcc: </b>"+data[1].toFixed(2)+"</br>";
	str += "<b> pipeDisp: </b>"+data[2];
	str += "<b> pipeCenters: </b>"+data[3];
	ele.innerHTML = str;
}

function getdata(action){
	if(!action){
		action = 0;
	}
	return [yPos, pipeCenters[0], pipeCenters[1], pipeCenters[2], pipeCenters[3], pipeDisp, isPaused? 1: 0, totalScore, action];
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
	yPos = 250;
	pipeSpeed = 5;
	pipeDisp = 100+pipeGap;
	gravity = -0.6;
	yAcc = 0;
	pipeCenters = [100, 150, 200, 250];
	totalScore = 0;
}

function nextframe(action){
	if(action == 1){
		// if(yAcc <= 0){
		// 	yAcc = 10;
		// }
		yAcc = 10;
	}
	animate(globalctx);
	return getdata(action);
}

// FlyBirdFly("viewport");