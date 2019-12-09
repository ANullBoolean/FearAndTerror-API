const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const cors = require('cors');
const winston = require('winston');

const config = JSON.parse(fs.readFileSync('config.json'));

const { middleware, pagination } = require('./middleware');
const { Database } = require('./structures/PostgreSQL');
// const { User } = require('./models/User.js');

/****************
**   Config    **
****************/

// Start our database connection
Database.start();

// Set our API port
const APIPort = config.port;

// Create some global analytical variables
global.avgResponseTime = [];

// Setup our debug logging
const debugLogging = new winston.transports.Console();
winston.add(debugLogging);

// Create our express app
const app = express();

app.use(function(req, res, next) {
  const startHrTime = process.hrtime();

  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

    if (req.path !== "/" && req.path !== "/api/info") {
      global.avgResponseTime.push(elapsedTimeInMs);
      if (global.avgResponseTime.length > 99) {
        global.avgResponseTime.shift();
      }
    }
  });

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set('secret', config.secret);
app.use(morgan('dev'));

/****************
**  REST API   **
****************/

app.get("/", (req, res) => {
  res.status(200).send('API Online');
});

app.get("/api/info", (req, res) => {
  const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
  res.status(200).json({
    avgResponseTime: arrAvg(avgResponseTime),
  });
});

/* NO AUTHENTICATION REQUIRED */
const { login, register } = require('./routes/authentication');

app.post('/login', login);
app.post('/register', register);

/* AUTHENTICATION REQUIRED */

app.get("/test", middleware, (req, res) => { res.status(200).send({ success: true }); });

/* Message Activity */
const { getMessages, getMessagesByChannel, getMessageCount } = require('./routes/messages');

app.get("/v1.0/messages", [middleware, pagination], getMessages);
app.get("/v1.0/messages/count", middleware, getMessageCount);
app.get("/v1.0/messages/:channelId", [middleware, pagination], getMessagesByChannel);

/* Discord Roles */
const { getRoles } = require('./routes/roles');

app.get("/v1.0/roles", [middleware, pagination], getRoles);

/* Global Voice Activity */
const { getVoice } = require('./routes/voice');

app.get("/v1.0/voice", [middleware, pagination], getVoice);

/* Global Squad Activity */
const { getSquad, getSquadCount } = require('./routes/squad');

app.get("/v1.0/squad", [middleware, pagination], getSquad);
app.get("/v1.0/squad/count", middleware, getSquadCount);

/* Get Channels */
const { getChannels, getChannelById } = require('./routes/channels');

app.get("/v1.0/channels", [middleware, pagination], getChannels);
app.get("/v1.0/channels/:id", middleware, getChannelById);

/* Users */
const { getUser, getUsers, getUserVoice, getUserSquad, getUserCount, getUserMessages } = require('./routes/user');

app.get("/v1.0/users", [middleware, pagination], getUsers);
app.get("/v1.0/users/:id", middleware, getUser);
app.get("/v1.0/users/count", middleware, getUserCount);
app.get("/v1.0/users/:id/voice", [middleware, pagination], getUserVoice);
app.get("/v1.0/users/:id/squad", [middleware, pagination], getUserSquad);
app.get("/v1.0/users/:id/messages", [middleware, pagination], getUserMessages);

// Start out server :)

app.listen(APIPort, () => {
  console.log(`Listening on PORT ${APIPort}`);
});
