const axios = require('axios');

const getSteamUsers = (req, res) => {
  axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=06BA68891EC7424A7BF3B1ED6D2EB61C`, {
    params: {
      steamids: req.query.steamIds,
    }
  })
    .then(response => {
      res.status(200).send(response.data.response);
    })
    .catch(error => {
      res.status(500).send({
        error: 'Unable to retrieve steam user data',
      });
    });
};

const getSteamUserBans = (req, res) => {
  axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=06BA68891EC7424A7BF3B1ED6D2EB61C`, {
    params: {
      steamids: req.query.steamIds,
    }
  })
    .then(response => {
      res.status(200).send(response.data.response);
    })
    .catch(error => {
      res.status(500).send({
        error: 'Unable to retrieve steam user bans',
      });
    });
}

module.exports = { getSteamUsers, getSteamUserBans };
