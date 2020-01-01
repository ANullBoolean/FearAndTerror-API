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

/* AUTHENTICATION REQUIRED */

app.get("/test", middleware, (req, res) => { res.status(200).send({ success: true }); });

/* Message Activity */
const { getMessages, getMessagesByChannel, getMessageCount, getNewMessagesCount } = require('./routes/messages');

app.get("/v1.0/messages", [middleware, pagination], getMessages);
app.get("/v1.0/messages/count", middleware, getMessageCount);
app.get("/v1.0/messages/new", middleware, getNewMessagesCount);
app.get("/v1.0/messages/:channelId", [middleware, pagination], getMessagesByChannel);

/* Discord Roles */
const { getRoles } = require('./routes/roles');

app.get("/v1.0/roles", [middleware, pagination], getRoles);

/* Global Voice Activity */
const { getVoice, getVoiceCount, getAverageVoiceTime } = require('./routes/voice');

app.get("/v1.0/voice", [middleware, pagination], getVoice);
app.get("/v1.0/voice/count", middleware, getVoiceCount);
app.get("/v1.0/voice/average", middleware, getAverageVoiceTime);

/* Global Squad Activity */
const { getSquad, getSquadCount } = require('./routes/squad');

app.get("/v1.0/squad", [middleware, pagination], getSquad);
app.get("/v1.0/squad/count", middleware, getSquadCount);

/* Get Channels */
const { getChannels, getChannelById } = require('./routes/channels');

app.get("/v1.0/channels", [middleware, pagination], getChannels);
app.get("/v1.0/channels/:id", middleware, getChannelById);

/* Users */
const {
  getUser,
  getUsers,
  getUserVoice,
  getUserSquad,
  getUserMessages,
  getUserCount,
  getNewUsersCount,
  getUserVoiceDaily,
  getUserVoiceAverage,
  getUserMessagesByDay,
  getUserVoiceByChannel,
} = require('./routes/user');

app.get("/v1.0/users", [middleware, pagination], getUsers);
app.get("/v1.0/users/count", middleware, getUserCount);
app.get("/v1.0/users/new", middleware, getNewUsersCount);
app.get("/v1.0/users/:id", middleware, getUser);
app.get("/v1.0/users/:id/voice", [middleware, pagination], getUserVoice);
app.get("/v1.0/users/:id/voice/average", middleware, getUserVoiceAverage);
app.get("/v1.0/users/:id/voice/daily", middleware, getUserVoiceDaily);
app.get("/v1.0/users/:id/voice/channel/:channelId", [middleware, pagination], getUserVoiceByChannel);
app.get("/v1.0/users/:id/squad", [middleware, pagination], getUserSquad);
app.get("/v1.0/users/:id/messages", [middleware, pagination], getUserMessages);
app.get("/v1.0/users/:id/messages/daily", middleware, getUserMessagesByDay);

const { searchUsers } = require('./routes/search');
app.get("/v1.0/search/users", [middleware, pagination], searchUsers);

const { discordAuthRedirect, discordAuthVerify, discordSession, discordAuthLogin } = require('./routes/discord');
app.get("/v1.0/discord/redirect", discordAuthRedirect);
app.get("/v1.0/discord/verify", discordAuthVerify);
app.get("/v1.0/discord/session", discordSession);
app.post("/v1.0/discord/login", discordAuthLogin);

const { submitApplication, getApplications, getApplication, voteApplication } = require('./routes/applications');
app.post("/v1.0/application/submit", submitApplication);
app.get("/v1.0/applications", [middleware, pagination], getApplications);
app.get("/v1.0/applications/:id", middleware, getApplication);
app.post("/v1.0/applications/:id/vote", middleware, voteApplication);

// Start out server :)

app.listen(APIPort, () => {
  console.log(`Listening on PORT ${APIPort}`);
});
