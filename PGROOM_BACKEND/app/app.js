const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const apiRoutes = require('./routes/Api.js');
const v1 = require('./routes/v1.js');
const authMiddleware = require('../app/middleware/AuthMiddelware.js');


// const express = require('express');
const client = require('prom-client');
const v1Routes = require('./routes/v1');
// const app = express();

// Prometheus metrics setup
client.collectDefaultMetrics();

const loginCounter = new client.Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins'
});

const errorCounter = new client.Counter({
  name: 'app_errors_total',
  help: 'Total number of errors'
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Track login endpoint (call this after successful login)
app.post('/track-login', (req, res) => {
  loginCounter.inc();
  res.sendStatus(200);
});

// Use your API routes
app.use('/api/v1', v1Routes);

// Global error handler for error tracking
app.use((err, req, res, next) => {
  errorCounter.inc();
  res.status(500).send('Internal Server Error');
});


// Generate a secure random session secret using crypto
const secret = crypto.randomBytes(32).toString('base64');

// Enable CORS for all routes
app.use(cors());

// Configure session middleware
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// file for open APIs, no authentication required
app.use('/pgrooms', apiRoutes);

// API THAT REQUIRE AUTHORIZATION
app.use('/pgrooms/v1', authMiddleware, v1);

module.exports = app;
