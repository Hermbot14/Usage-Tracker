const electron = require('electron');
console.log('Electron module loaded:', typeof electron);
console.log('Electron keys:', Object.keys(electron));
console.log('Has app?', 'app' in electron);
console.log('app value:', electron.app);
