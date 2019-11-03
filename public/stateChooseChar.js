const drawLobby = ctxs => {
	// Set dynamic variables needed to draw in first frame
	if (state_Lobby.iTime === 0) {
		for (var c in ctxs)
			ctxs[c].clearRect(0, 0, canvs[c].width, canvs[c].height);
		state_Lobby.tileSize =
			Math.min(ctxs['bg'].canvas.width, ctxs['bg'].canvas.height) /
			state_Lobby.numTiles;
		state_Lobby.xOffset =
			(canvs['fg'].width - state_Lobby.tileSize * state_Lobby.numTiles) / 2;
		ctxs['bg'].translate(state_Lobby.xOffset, 0);
		drawLobbyBg(ctxs['bg'], state_Lobby.tileSize);
		ctxs['bg'].translate(-state_Lobby.xOffset, 0);

		state_Lobby.listPlacement = {
			xInset: 2,
			itemHeight: 2,
			start: 7.5,
		};
		state_Lobby.numToShowInList = Math.round((((state_Lobby.numTiles * state_Lobby.tileSize) / 2) - state_Lobby.tileSize * 6) / state_Lobby.tileSize);
		state_Lobby.buttons.name.placement = [
			state_Lobby.tileSize * state_Lobby.numTiles - (state_Lobby.tileSize * state_Lobby.numTiles / 2),
			state_Lobby.tileSize * 4.6,
			state_Lobby.tileSize * 5.5, state_Lobby.tileSize * 0.77
		];
		state_Lobby.buttons.newRoom.placement = [
			state_Lobby.tileSize * state_Lobby.numTiles - (state_Lobby.tileSize * state_Lobby.numTiles / 2),
			state_Lobby.tileSize * 3.6,
			state_Lobby.tileSize * ((state_Lobby.numTiles / 2) - 1),
			state_Lobby.tileSize * 0.9
		];
		var charhw = [state_Lobby.tileSize * 2, state_Lobby.tileSize * 2];
		state_Lobby.buttons.char.placement = [
			(state_Lobby.tileSize * state_Lobby.numTiles) / 2 - charhw[0] / 2,
			state_Lobby.tileSize * 3.5,
			...charhw
		];
	}
	for (var c in ctxs) {
		ctxs[c].translate(state_Lobby.xOffset, 0);
	}

	if (state_Lobby.redrawFgFlag) {
		ctxs['fg'].clearRect(0, 0, canvs['fg'].width, canvs['fg'].height);
		state_Lobby.redrawFgFlag = false;
	}
	// draw  games List
	ctxs['mid'].clearRect(0, 0, canvs['mid'].width, canvs['mid'].height);

	// get yOffset for list
	var val = state_Lobby.listOffset;
	if (state_Lobby.mouseDown) {
		val = state_Lobby.listOffset + (state_Lobby.mouseInitXY[1] - state_Lobby.mouseXY[1]) / state_Lobby.tileSize;
		val = clamp(val, 0, (state_Lobby.gamesData.length - state_Lobby.numToShowInList) * state_Lobby.listPlacement.itemHeight);
	}

	for (var i = 0; i < state_Lobby.gamesData.length; i++) {


		var computedIndex = Math.ceil(i - (val / state_Lobby.listPlacement.itemHeight));

		if (0 <= computedIndex && computedIndex <= state_Lobby.numToShowInList) {
			var text = [i];
			for (var item in state_Lobby.dataTextOutline) {
				if (state_Lobby.gamesData[i][item] !== undefined) {
					text.push(state_Lobby.dataTextOutline[item].replace("$", state_Lobby.gamesData[i][item]));
				}
			}

			var selected = state_Lobby.selected == (i);
			drawMultilineLabelWithBlock(ctxs['mid'], state_Lobby.gamesData[i].icon[0], state_Lobby.gamesData[i].icon[1], joinArray(text, 3),
				state_Lobby.tileSize * state_Lobby.listPlacement.xInset,
				state_Lobby.tileSize * state_Lobby.listPlacement.start + i * state_Lobby.listPlacement.itemHeight
				* state_Lobby.tileSize - state_Lobby.tileSize * val,
				state_Lobby.tileSize * state_Lobby.numTiles - state_Lobby.tileSize * state_Lobby.listPlacement.xInset * 2,
				state_Lobby.tileSize *
				((computedIndex === (state_Lobby.numToShowInList) ? ((val / state_Lobby.listPlacement.itemHeight - Math.floor(val / state_Lobby.listPlacement.itemHeight)) * state_Lobby.listPlacement.itemHeight) : state_Lobby.listPlacement.itemHeight)
					- 0.1),
				4,
				false, selected, state_Lobby.tileSize * 0.6 + 'px calibri');
		}
	}

	var pos = (val / state_Lobby.listPlacement.itemHeight) / (state_Lobby.gamesData.length - state_Lobby.numToShowInList);
	// draw seekbar for list
	drawVerticalSeek(ctxs['mid'], pos,
		state_Lobby.listPlacement.xInset * state_Lobby.tileSize - 10,
		state_Lobby.listPlacement.start * state_Lobby.tileSize,
		state_Lobby.numToShowInList * state_Lobby.listPlacement.itemHeight * state_Lobby.tileSize, 5);

	// draw chosen game thingymabob
	ctxs['mid'].clearRect(0,
		state_Lobby.tileSize * state_Lobby.listPlacement.start - 1 * state_Lobby.listPlacement.itemHeight * state_Lobby.tileSize,
		state_Lobby.tileSize * state_Lobby.numTiles,
		state_Lobby.tileSize * (state_Lobby.listPlacement.itemHeight - 0.1));

	var text = `[--] -- n: --`;
	if (state_Lobby.selected !== null && state_Lobby.gamesData.length >= state_Lobby.selected) {
		text = `selected: [I] "G" players:N`;
		if (state_Lobby.selected !== undefined) {
			text = text.replace('I', state_Lobby.selected);
		} else {
			text = text.replace('I', '--');
		}
		if (state_Lobby.gamesData[state_Lobby.selected]['name'] !== undefined) {
			text = text.replace('G', state_Lobby.gamesData[state_Lobby.selected]['name']);
		} else {
			text = text.replace('G', '--');
		}
		if (state_Lobby.gamesData[state_Lobby.selected]['numPlayers'] !== undefined) {
			text = text.replace('N', state_Lobby.gamesData[state_Lobby.selected]['numPlayers']);
		} else {
			text = text.replace('N', '--');
		}
		var padding = state_Lobby.tileSize;
		fillLabelWithBlock(ctxs['mid'], state_Lobby.gamesData[state_Lobby.selected]['icon'][0],
			state_Lobby.gamesData[state_Lobby.selected]['icon'][1], text,
			state_Lobby.listPlacement.xInset / 2 * state_Lobby.tileSize + padding / 2,
			state_Lobby.tileSize * (state_Lobby.listPlacement.start - state_Lobby.listPlacement.itemHeight) + padding / 2,
			state_Lobby.tileSize * state_Lobby.numTiles - state_Lobby.listPlacement.xInset * state_Lobby.tileSize - padding,
			state_Lobby.tileSize * state_Lobby.listPlacement.itemHeight - padding, 4, true, '20px calibri', true, 'black', 'grey', 2, 'white');

	}

	// draw Buttons
	for (var btn in state_Lobby.buttons) {
		if (state_Lobby.buttons[btn].flag && state_Lobby.buttons[btn].draw) {
			ctxs['fg'].clearRect(
				...state_Lobby.buttons[btn].placement
			);
			drawButton(ctxs['fg'], state_Lobby.buttons[btn].text, ...state_Lobby.buttons[btn].placement,
				state_Lobby.buttons[btn].type2, state_Lobby.buttons[btn].down);
		}
	}

	drawCharNameCard(ctxs['fg'], bomberData.char, bomberData.name,
		state_Lobby.tileSize, state_Lobby.tileSize * 4,
		state_Lobby.tileSize * ((state_Lobby.numTiles / 2) - 1), state_Lobby.tileSize);

	drawCharBoxWithPadding(ctxs['fg'], bomberData.char,
		Math.floor(state_Lobby.iTime / (gameVars.FPS / 3)) % 8,
		...state_Lobby.buttons.char.placement, state_Lobby.tileSize / 4
	);

	for (var c in ctxs) {
		ctxs[c].translate(-state_Lobby.xOffset, 0);
	}

};

const joinArray = (array, num) => {
	if (array.length > num) {
		var newArray = [];
		for (var i = 0; i < array.length; i += num) {
			newArray.push(array.slice(i, i + num).join(' '));
		}
		return newArray;
	}
	return array;
}

const updateLobby = iTick => {
	if (iTick === 0) {
		emitMessage('subscribeGamesData');
	}
	if (flags['resize']) {
		state_Lobby.iTime = 0;
		state_Lobby.redrawFgFlag = true;
		state_Lobby.redrawGamesData = true;
		for (var b in state_Lobby.buttons)
			state_Lobby.buttons[b].flag = true;
	}

	state_Lobby.iTime = iTick;
	if ((iTick % 10) === 0)
		state_Lobby.gamesData = state_Lobby.gamesData.map(g => g.time !== null ? ({
			...g, time: g.time + 100, convertedTime: convertTime(g.time + 100)
		}) : g);

};

const drawLobbyBg = (ctx, tileSize) => {
	for (let i = 0; i < state_Lobby.numTiles; i++) {
		for (let j = 0; j < state_Lobby.numTiles; j++) {
			drawBlock(ctx, 0, 0, i * tileSize, j * tileSize, tileSize, tileSize);
		}
	}
	// fillRectOnCanv(ctxs['bg'],
	// state_Lobby.xOffset + state_Lobby.tileSize * 2, state_Lobby.tileSize / 2,
	// state_Lobby.tileSize * 9.8, state_Lobby.tileSize * 2, 'black', 'white');
	fillTextInRectCentre(ctxs['bg'], "Bomber Mobile",
		0, state_Lobby.tileSize / 2,
		state_Lobby.tileSize * state_Lobby.numTiles, state_Lobby.tileSize * 2,
		'white', state_Lobby.tileSize + 'px calibri');
	fillTextInRectCentre(
		ctxs['bg'],
		'Character Select',
		0,
		state_Lobby.tileSize * 2, state_Lobby.numTiles * state_Lobby.tileSize, state_Lobby.tileSize,
		'white',
		state_Lobby.tileSize * 0.8 + 'px calibri'
	);
	var xInset = Math.floor(state_Lobby.numTiles / 5);
	drawCharBox(ctxs['fg'], 10, Math.floor(state_Lobby.iTime / (gameVars.FPS / 3)) % 5,
		state_Lobby.xOffset + state_Lobby.tileSize * xInset, state_Lobby.tileSize / 2,
		state_Lobby.tileSize * 2, state_Lobby.tileSize * 2, 'black', 'black', 2
	);
	drawCharBox(ctxs['fg'], 10, Math.floor(state_Lobby.iTime / (gameVars.FPS / 3)) % 5,
		state_Lobby.xOffset + state_Lobby.tileSize * (state_Lobby.numTiles - xInset - 2), state_Lobby.tileSize / 2,
		state_Lobby.tileSize * 2, state_Lobby.tileSize * 2, 'black', 'black', 2
	);
};

const state_Lobby = {
	actionButtonText: 'Enter Game!',
	draw: drawLobby,
	update: updateLobby,
	selected: null,
	gamesData: [],
	listOffset: 0,
	listPlacement: {
		xInset: 2,
		itemHeight: 2,
		start: 8,
	},
	numToShowInList: 4,
	redrawGamesData: [],
	dataTextOutline: {
		name: '"$" ',
		numPlayers: '$ players, ',
		convertedTime: 'time: $',
		xTilesNum: '   Map: $ x',
		yTilesNum: '$'
	},
	gamesDataFlag: false,
	mouseDown: false,
	mouseInitXY: null,
	mouseXY: null,
	handleMouse: (x, y, up) => {
		if (up === null) { // mouse move
			if (state_Lobby.mouseDown) {
				state_Lobby.mouseXY = [x, y];
			}
		}
		else if (!up) { // mouse down
			state_Lobby.mouseDown = true;
			state_Lobby.mouseXY = [x, y];
			state_Lobby.mouseInitXY = [x, y];
			var found = false;
			for (var button in state_Lobby.buttons) {
				if (!found)
					if (pointIsInRect(x - state_Lobby.xOffset, y, state_Lobby.buttons[button].placement)) {
						state_Lobby.buttons[button].down = true;
						state_Lobby.buttons[button].flag = true;
						// console.log(button, up ? 'up' : 'down',
						// state_Lobby.buttons[button].down ? 'DOWN' : 'UP',
						// state_Lobby.buttons[button].flag ? 'redraw' : '-----');
						found = true;
					}
			}
		}
		else if (up) { // mouse up
			if (state_Lobby.mouseInitXY !== null)
				if (y !== state_Lobby.mouseInitXY[1]) {
					state_Lobby.listOffset += (state_Lobby.mouseInitXY[1] - state_Lobby.mouseXY[1]) / state_Lobby.tileSize
					state_Lobby.listOffset = clamp(state_Lobby.listOffset, 0, (state_Lobby.gamesData.length - state_Lobby.numToShowInList) * state_Lobby.listPlacement.itemHeight);
				} else if (x === state_Lobby.mouseInitXY[0] && y === state_Lobby.mouseInitXY[1]) {
					if (pointIsInRect(x, y, [state_Lobby.xOffset + state_Lobby.listPlacement.xInset * state_Lobby.tileSize,
					state_Lobby.listPlacement.start * state_Lobby.tileSize,
					(state_Lobby.numTiles - state_Lobby.listPlacement.xInset * 2) * state_Lobby.tileSize,
					(state_Lobby.listPlacement.itemHeight * state_Lobby.numToShowInList) * state_Lobby.tileSize])) {
						var offsety = y - (state_Lobby.listPlacement.start * state_Lobby.tileSize);
						var gameSelected = Math.floor(((offsety / state_Lobby.tileSize) + state_Lobby.listOffset) / state_Lobby.listPlacement.itemHeight);
						state_Lobby.selected = clamp(gameSelected, 0, state_Lobby.gamesData.length - 1);
					}
				}

			state_Lobby.mouseDown = false;
			state_Lobby.mouseXY = null;

			var found = false;
			for (var button in state_Lobby.buttons) {
				if (!found)

					if (pointIsInRect(x - state_Lobby.xOffset, y, state_Lobby.buttons[button].placement)) {
						state_Lobby.buttons[button].down = false;
						state_Lobby.buttons[button].flag = true;
						console.log(button);
						found = true;

						if (button === 'char') {
							changeChar();
						}
						if (button === 'name') {
							changeName();
						}
					}
			}
			for (var button in state_Lobby.buttons) {
				state_Lobby.buttons[button].down = false;
				state_Lobby.buttons[button].flag = true;
			}
		}
	},
	handleAction: () => {
		gotoMainGameMap();
	},
	dataRecieved: (data) => {
		if (state_Lobby.gamesData.length === 0 || state_Lobby.gamesData.length !== data.payload.length)
			state_Lobby.gamesDataFlag = true;
		console.log(data);
		var payload = data.payload.map(g => ({
			...g, convertedTime: convertTime(g.time)
		}));
		state_Lobby.gamesData = payload;
	},
	iTime: 0,
	ready: false,
	tileSize: null,
	numTiles: 20,
	buttons: {
		'char': { draw: true, text: null, type2: false, down: false, flag: true, placement: [] },
		'name': { draw: true, text: 'Change Name!', type2: false, down: false, flag: true, placement: [] },
		'newRoom': { draw: true, text: '+New Room', type2: false, down: false, flag: true, placement: [] },
	},
	arrowButtonSize: 1,
	redrawFgFlag: true,
	xOffset: 0
};
