/**
 * Main application routes
 */

'use strict';

module.exports = function (app) {
    app.use('/api/property', require('./controllers/property'));
};