const drawLoading = ctxs => {
  ctxs['bg'].clearRect(20, 20, 200, 30);
  ctxs['bg'].fillStyle = `rgba(${Math.sin(state_loading.iTime / 32) *
    255},${Math.sin(state_loading.iTime / 38) * 255},${Math.sin(iTime / 24) *
    255},1)`;
  ctxs['bg'].fillRect(20, 20, 200, 30);
  ctxs['bg'].fillStyle = 'black';
  ctxs['bg'].font = '20px calibri';
  ctxs['bg'].fillText('Connecting to server...', 25, 41);
  ctxs['bg'].fillStyle = 'white';
  ctxs['bg'].fillText('Connecting to server...', 24, 40);
};

const updateLoading = iTick => {
  state_Loading.iTime = iTick;
};

const state_Loading = {
  actionButtonText: '-',
  draw: drawLoading,
  update: updateLoading,
  handleMouse: () => {},
  handleAction: () => {},
  iTime: 0
};
