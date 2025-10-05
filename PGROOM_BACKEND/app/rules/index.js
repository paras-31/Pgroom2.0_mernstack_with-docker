// validators/rules/index.js
const EmailExists = require('./EmailExists');
const MobileExists = require('./MobileExists');
const TenantExists = require('./TenantExists');

module.exports = {
    EmailExists,
    MobileExists,
    TenantExists,
};