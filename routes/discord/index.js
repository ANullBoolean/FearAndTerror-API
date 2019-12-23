const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));
const qs = require('qs');
const uuidv4 = require('uuid/v4');

const sessions = {};

const discordAuthRedirect = (req, res) => {
  res.redirect('https://discordapp.com/api/oauth2/authorize?client_id=651122365006086144&redirect_uri=http%3A%2F%2Fapi.personnel.squadhosting.com%2Fv1.0%2Fdiscord%2Fverify&response_type=code&scope=identify');
};

const discordAuthVerify = (req, res) => {
  const code = req.query.code;

  if (!code) {
    res.status(401).send({
      error: 'Code is required',
    });
    return;
  }

  axios.post('https://discordapp.com/api/v6/oauth2/token', qs.stringify({
    client_id: config.clientid,
    client_secret: config.clientsecret,
    code,
    redirect_uri: `http://api.personnel.squadhosting.com/v1.0/discord/verify`,
    grant_type: 'authorization_code',
    scope: 'identify'
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(response => {
      const uuid = uuidv4();
      sessions[uuid] = response.data;
      res.redirect(`http://personnel.squadhosting.com/application?uuid=${uuid}`);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error);
    });
};

const discordSession = (req, res) => {
  const uuid = req.query.uuid;

  if (!uuid) {
    res.status(401).send({
      error: 'uuid is required',
    });
    return;
  }

  const session = sessions[uuid] || null;

  if (!session) {
    res.status(500).send({
      error: 'Invalid Session',
    });
    return;
  }

  axios.get('http://discordapp.com/api/v6/users/@me', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    }
  })
    .then(response => {
      res.status(200).send(response.data);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({
        error: 'Unable to retrieve discord user data',
      });
    });
};

module.exports = {
  discordAuthRedirect,
  discordAuthVerify,
  discordSession,
};
