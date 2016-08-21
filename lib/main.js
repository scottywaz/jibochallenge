var PIXI = require("pixi.js");
var renderer = PIXI.autoDetectRenderer(800, 600); // will be changed after board is created
document.body.appendChild(renderer.view);
var stage = new PIXI.Container();
var boardContainer = new PIXI.Container();
boardContainer.x = 20;
boardContainer.y = 50;
stage.addChild(boardContainer);
var squares = [];
var squareRadius = 70;
var boardSize = 7; // the amount of rows and columns of the board
var boardSizeText;
var checker;
var currentSquare;
var checkerInterval;

// Load all of our assets before starting
PIXI.loader
	.add("bin/buttons/playUp.png")
	.add("bin/buttons/playDown.png")
	.add("bin/buttons/playOver.png")
	.add("bin/buttons/stopUp.png")
	.add("bin/buttons/stopOver.png")
	.add("bin/buttons/stopDown.png")
	.add("bin/buttons/resetUp.png")
	.add("bin/buttons/resetOver.png")
	.add("bin/buttons/resetDown.png")
	.add("bin/miniArrow.png")
	.add("bin/checker.png")
	.add("bin/arrow.png")
	.load(setupButtons);

requestAnimationFrame(updateLoop);

function updateLoop()
{
	renderer.render(stage);
	requestAnimationFrame(updateLoop);
}

/**
 * Creates all of the UI buttons and sets up their mouse interactions.
 */
function setupButtons() {
	var btns = ["play", "stop", "reset"];
	var newBtn;

	// Setup the 3 buttons to control the game
	for(var i = 0; i < btns.length; i++) {
		newBtn = new PIXI.Sprite(PIXI.loader.resources["bin/buttons/" + btns[i] + "Up.png"].texture);
		stage.addChild(newBtn);
		newBtn.buttonMode = true;
		newBtn.interactive = true;
		newBtn.x = i * newBtn.width;
		newBtn
			.on('click', window[btns[i] + "Clicked"])
			.on('mouseover', window[btns[i] + "Over"])
			.on('mouseUp', window[btns[i] + "Up"])
			.on('mouseout', window[btns[i] + "Up"])
			.on('mousedown', window[btns[i] +"Down"]);
	}

	// The text showing how big the board size is
	// Still have to click reset to activate
	var style = {font:"bold 24px Arial", fill:"pink"}
	boardSizeText = new PIXI.Text(boardSize.toString(), style);
	boardSizeText.x = newBtn.x + newBtn.width*2;
	boardSizeText.y = 10;
	stage.addChild(boardSizeText);

	// create mini arrows for adjusting board size
	for(var j = 0; j < 2; j++) {
		var miniArrow = new PIXI.Sprite(PIXI.loader.resources["bin/miniArrow.png"].texture);
		miniArrow.buttonMode = true;
		miniArrow.interactive = true;
		miniArrow.x = boardSizeText.x + miniArrow.width + 10;
		miniArrow.y = 30;
		miniArrow.anchor.x = .5;
		miniArrow.anchor.y = 0;
		stage.addChild(miniArrow);
		var func = arrowDownClicked;

		// rotate the arrow up and change which function to call
		if(j%2 == 1) {
			isUp = true;
			miniArrow.rotation = Math.PI;
			miniArrow.y = 25;
			func = arrowUpClicked
		}

		miniArrow.on('click', func);
	}

	// Create the board to start off
	refreshCheckerBoard(boardSize);
}

/**
 * Remakes the checkerboard and places the checker
 * Also creates the arrows and stores what each square is linked to
 */
function refreshCheckerBoard() {
	createCheckerboard();
	addArrowsToSquares();
	createChecker();

	// Want the render window to stay at a minimum of 800 x 600
	var resizeX = boardSize * squareRadius + 50 > 800 ? boardSize * squareRadius + 50 : 800;
	var resizeY = boardSize * squareRadius + 70 > 600 ? boardSize * squareRadius + 70 : 600;
	renderer.resize(resizeX, resizeY);
}

/**
 * Create a new checkerboard based on the size changed
 * I was going to write the algorithm to only remove the right squares and
 * add new squares based on the board change, but that would require storing in
 * an associative array and would be a bit more complicated and I wanted to focus on
 * the other algorithms.
 *
 * So for now I just clear the full board if there is a change and remake it.
 */
function createCheckerboard() {
	console.log("Creating a new board");

	var total = boardSize*boardSize;
	if(squares.length == total) return; // No change needed, can exit function

	// clean up current board
	for (var i = squares.length - 1; i >= 0; i--) {
		var deleteSquare = squares[i];
		boardContainer.removeChild(deleteSquare.squareGraphic);
		boardContainer.removeChild(deleteSquare.arrowGraphic);
		squares.pop();
	}

	var key = 0;
	for (var row = 0; row < boardSize; row++) {
		for (var col = 0; col < boardSize; col++) {
			// var color = key++ % 2 == 0 ? 0x333333 : 0xBBBBBB; ** This doesn't work with even numbered columns
			var color = 0x333333;
			if ((row % 2 == 1 && col % 2 == 0) || (row % 2 == 0 && col % 2 == 1)) {
				color = 0xBBBBBB;
			}

			// create square graphic and place in right spot
			var square = createSquare(color, squareRadius, squareRadius);
			square.x = col * squareRadius;
			square.y = row * squareRadius;

			var checkerSquare = {squareGraphic:square, arrowGraphic:null,linkedSquare:null};
			boardContainer.addChild(square);
			squares.push(checkerSquare);
		}
	}
}

function addArrowsToSquares()
{
	var randRotationVals = [0, Math.PI*.5, Math.PI,Math.PI + Math.PI*.5];
	// The board is ready, add the arrows in random directions on each square
	// Store the linked square too
	for(var j = 0; j < squares.length; j++) {
		var currentSquare = squares[j];
		var currentGraphic = currentSquare.squareGraphic;

		// Only create a new arrow if we have too
		if(currentSquare.arrowGraphic == null) {
			var arrow = new PIXI.Sprite(PIXI.loader.resources["bin/arrow.png"].texture);
			arrow.anchor = new PIXI.Point(.5, .5);
			arrow.x = currentGraphic.width*.5;
			arrow.y = currentGraphic.height*.5;
			currentSquare.arrowGraphic = arrow;
			currentGraphic.addChild(arrow);
		}

		var rand = Math.floor(Math.random() * randRotationVals.length);
		currentSquare.arrowGraphic.rotation = randRotationVals[rand];

		// Figure out which square it links too
		var indexNum = NaN;
		switch (rand) {
			case 0: // up
				if(j >= boardSize) {
					indexNum = j - boardSize;
				}
				break;
			case 1: // right
				if(j % boardSize != 0) {
					indexNum = j + 1;
				}
				break;

			case 2: // down
				if(j < boardSize*boardSize - boardSize) {
					indexNum = j + boardSize;
				}
				break;

			case 3: // left
				if(j % boardSize != 0) {
					indexNum = j - 1;
				}
				break;
		}

		// leave the linkedSquare null if there is no index
		if(!isNaN(indexNum)) {
			currentSquare.linkedSquare = squares[indexNum];
		}
		else {
			currentSquare.linkedSquare = null;
		}
	}
}

/** Graphics function that creates a square to make the checkerboard
 * @param color - color of the square
 * @param width - width of the square
 * @param height - height of the square
 * @returns {PIXI.Graphics}
 */
function createSquare(color, width, height)
{
	var graphics = new PIXI.Graphics();
	graphics.beginFill(color);
	graphics.drawRect(0, 0, width, height);
	graphics.endFill();
	return graphics;
}

/**
 * Simple creates the checker if it hasn't been made yet.
 * Positions it in a random spot.
 */
function createChecker() {
	if(checker == null) {
		checker = new PIXI.Sprite(PIXI.loader.resources["bin/checker.png"].texture);
		checker.anchor.x = .5;
		checker.anchor.y = .5;
		boardContainer.addChild(checker);
	}

	var square = squares[Math.floor(Math.random() * squares.length)];
	repositionChecker(square);
}

/**
 * Moves the checker to a new square, used to move and start the checker
 * @param square - the new square to position the checker on
 */
function repositionChecker(square) {
	var squareGraphic = square.squareGraphic;
	checker.x = squareGraphic.x + checker.width*.5;
	checker.y = squareGraphic.y + checker.height*.5;
	currentSquare = square;
}

/**
 * Play the next checker movement
 */
function nextCheckerMove() {
	// If we have a current linked square
	if(currentSquare.linkedSquare) {
		repositionChecker(currentSquare.linkedSquare);
	}
	else { // else stop the simulation
		console.log("End");
		clearInterval(checkerInterval);
		checkerInterval = null;
	}
}

function playDown() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/playDown.png"];
}

function playOver() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/playOver.png"];
}

function playUp() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/playUp.png"];
}

function playClicked() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/playUp.png"];

	if(checkerInterval == null) {
		// Every second, move the checker
		nextCheckerMove();
		checkerInterval = setInterval(nextCheckerMove, 1000);
	}
}

function stopDown() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/stopDown.png"];
}

function stopOver() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/stopOver.png"];
}

function stopUp() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/stopUp.png"];
}

function stopClicked() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/stopUp.png"];

	// Stop the timer and therefore stop the checker movement
	clearInterval(checkerInterval);
	checkerInterval = null;
}

function resetDown() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/resetDown.png"];
}

function resetOver() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/resetOver.png"];
}

function resetUp() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/resetUp.png"];
}

function resetClicked() {
	this.texture = PIXI.utils.TextureCache["bin/buttons/resetUp.png"];
	refreshCheckerBoard();
}

/**
 * Update board size number, make sure number is above 0
 */
function arrowDownClicked() {
	boardSize = boardSize - 1 > 0 ? boardSize - 1 : boardSize;
	console.log(boardSize);
	boardSizeText.text = boardSize.toString();
}

/**
 * Update board size number, made 99 to stay at 2 digits
 */
function arrowUpClicked() {
	boardSize = boardSize + 1 < 100 ? boardSize + 1 : boardSize;
	boardSizeText.text = boardSize.toString();
}