var btnName;

function button(name)
{
	btnName = name;
	
	var buttonUp = PIXI.Sprite.fromImage('bin/buttons/' + btnName + 'Up.png');
	var buttonOver = PIXI.Sprite.fromImage('bin/buttons/' + btnName + 'Over.png');
	var buttonDown = PIXI.Sprite.fromImage('bin/buttons/' + btnName + 'Down.png');
}

button.constructor = button;

