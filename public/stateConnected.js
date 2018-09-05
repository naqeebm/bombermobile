const drawConnected = ctxs => {
  ctxs['bg'].clearRect(20, 20, 310, 30);
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
};

const updateConnected = iTick => {
  iTime = iTick;
};

const state_Connected = {
  actionButtonText: '-',
  draw: drawConnected,
  update: updateConnected,
  handleMouse: () => {},
  handleAction: () => {},
  iTime: 0
};
