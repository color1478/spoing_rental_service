const express = require('express');
const path = require('path');
const fs = require('fs');

const server = express();
const PORT = 3000;
server.use(express.json());
server.use(express.static(path.join(__dirname, 'html')));

// Path to data.json
const dataFilePath = path.join(__dirname, 'data.json');

// Ensure data.json exists
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

// Save data to JSON
const saveData = (data) => {
    const existingData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    existingData.push(data);
    fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));
};

// API to get lockers
server.get('/api/get-lockers', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    res.json(data);
});

// API to rent a locker
server.post('/api/rent-locker', (req, res) => {
    const { lockerId, name, phone } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    if (data.find(entry => entry.lockerId == lockerId && entry.rentValue)) {
        return res.status(400).json({ success: false, message: `Locker ${lockerId} is already rented.` });
    }

    const currentTime = new Date().toISOString();
    saveData({ lockerId, name, phone, rentTime: currentTime, returnTime: null, rentValue: true });
    res.json({ success: true, message: `Locker ${lockerId} rented successfully!` });
});

// API to return a locker
server.post('/api/return-locker', (req, res) => {
    const { lockerId } = req.body;
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    const locker = data.find(entry => entry.lockerId == lockerId && entry.rentValue);
    if (!locker) {
        return res.status(400).json({ success: false, message: `Locker ${lockerId} is not currently rented.` });
    }

    locker.returnTime = new Date().toISOString();
    locker.rentValue = false;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.json({ success: true, message: `Locker ${lockerId} returned successfully.` });
});

// Serve return.html for /return route
server.get('/return', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/return.html'));
});

// Start Express server
server.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});
