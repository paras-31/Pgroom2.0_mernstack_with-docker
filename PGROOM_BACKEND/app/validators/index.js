// validators/rules/index.js
const fs = require('fs');
const path = require('path');

// Dynamically load all validator files from the current directory
const validators = {};

// Read all files in the current directory
fs.readdirSync(__dirname)
    .filter(file => file.endsWith('Validator.js')) // Only include validator files
    .forEach(file => {
        const validatorName = path.basename(file, '.js');
        validators[validatorName] = require(path.join(__dirname, file));
    });

module.exports = validators;