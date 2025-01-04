const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    rentLocker: (lockerId, name, phone) => ipcRenderer.invoke('rent-locker', { lockerId, name, phone }),
    getLockers: () => ipcRenderer.invoke('get-lockers'),
    returnLocker: (lockerId) => ipcRenderer.invoke('return-locker', lockerId),
});
