const drawConnected = ctxs => {
  ctxs['bg'].clearRect(20, 20, 310, 200);
  ctxs['bg'].fillStyle = `rgba(255,${Math.sin(state_Connected.iTime / 38) *
    128},128,1)`;
  ctxs['bg'].fillRect(20, 20, 310, 30);
  ctxs['bg'].fillStyle = 'black';
  ctxs['bg'].font = '20px calibri';
  ctxs['bg'].fillText(
    'Connected to server! Retrieving game data...',
    25,
    41,
    299
  );
  ctxs['bg'].fillStyle = 'blue';
  ctxs['bg'].fillText(
    'Connected to server! Retrieving game data...',
    24,
    40,
    300
  );
  fillTextOnCanv(ctxs['bg'], 'Game may be in progress.', 25, 80, 'white');
  fillTextOnCanv(
    ctxs['bg'],
    'Please wait.' + '.'.repeat(state_Connected.iTime % 10),
    25,
    100,
    state_Connected.color
  );
  state_Connected.particles.forEach(part => {
    ctxs['fg'].clearRect(part[0] - part[2] - 1, part[1] - part[3] - 1, 7, 7);
    fillRectOnCanv(
      ctxs['fg'],
      part[0],
      part[1],
      5,
      5,
      part[5],
      `rgba(255,255,255,${part[4] / gameVars.FPS})`,
      1,
      false
    );
  });
};

const updateConnected = iTick => {
  if (iTick % (gameVars.FPS / 2) === 0) state_Connected.iTime++;
  state_Connected.particles.forEach(part => {
    part[0] += part[2];
    part[1] += part[3];
    part[4]--;
  });
  state_Connected.particles = state_Connected.particles.filter(
    part => part[4] > 0
  );
};

const state_Connected = {
  actionButtonText: '-',
  draw: drawConnected,
  update: updateConnected,
  handleMouse: () => {},
  handleAction: () => {
    state_Connected.explode(canvs['mid'].width / 2, canvs['mid'].height / 2);
  },
  iTime: 0,
  color: 'white',
  particles: [],
  particleLifeInSeconds: 3,
  explode: (x, y) => {
    for (let i = -0.5; i < 0.5; i += 0.2) {
      for (let j = -0.5; j < 0.5; j += 0.2) {
        state_Connected.particles.push([
          x + i,
          y + j,
          -1.5 + Math.random() * 3,
          -1.5 + Math.random() * 3,
          gameVars.FPS +
            Math.floor(
              Math.random() *
                gameVars.FPS *
                state_Connected.particleLifeInSeconds
            ),
          `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() *
            255},${0.5 + Math.random() * 0.5})`
        ]);
      }
    }
  }
};
