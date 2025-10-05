const fs = require('fs');
const path = require('path');

// Dynamically load all Controller files from the current directory
const Controller = {};

// Read all files in the current directory
fs.readdirSync(__dirname)
    .filter(file => file.endsWith('Controller.js')) // Only include Controller files
    .forEach(file => {
        const ControllerName = path.basename(file, '.js');
        Controller[ControllerName] = require(path.join(__dirname, file));
    });

module.exports = Controller;