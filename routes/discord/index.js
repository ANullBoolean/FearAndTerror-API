const { User } = require('../../models/User');
const { createJWToken } = require('../../middleware/jwt');
const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));
const qs = require('qs');
const uuidv4 = require('uuid/v4');
const { roles } = require('../authentication');

const sessions = {};

const discordAuthRedirect = (req, res) => {
  res.redirect('https://discordapp.com/api/oauth2/authorize?client_id=651122365006086144&redirect_uri=http%3A%2F%2Fapi.fearandterror.com%2Fv1.0%2Fdiscord%2Fverify&response_type=code&scope=identify');
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
    redirect_uri: `http://api.fearandterror.com/v1.0/discord/verify`,
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
      res.redirect(`http://personnel.fearandterror.com/application?uuid=${uuid}`);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error);
    });
};

const discordAuthLogin = (req, res) => {
  const code = req.body.code;

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
    redirect_uri: `http://personnel.fearandterror.com/login`,
    grant_type: 'authorization_code',
    scope: 'identify'
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(response => {

      axios.get('http://discordapp.com/api/v6/users/@me', {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        }
      })
        .then(response => {


          User.findAll({
            where: {
              userId: response.data.id,
              guild: '398543362476605441',
            },
          }).then(results => {
            if (results.length < 1) {
              return res.status(403).send({
                status: 'unauthorized',
                statusCode: 403,
                message: `Unauthorized User`
              });
            }

            if (!JSON.parse(results[0].dataValues.roles).some(r => roles.includes(r))) {
              return res.status(400).send({
                status: 'unauthorized',
                statusCode: 400,
                message: `Missing required discord role(s)`
              });
            }

            // Authenticated Successfully, send token
            res.status(200).send({
              status: 'success',
              statusCode: 200,
              data: {
                username: results[0].dataValues.username,
                roles: results[0].dataValues.roles,
                avatar: response.data.avatar,
                userId: response.data.id,
                token: createJWToken({ sessionData: results[0].dataValues }),
              }
            });
          }).catch(err => {
            res.status(500).send(err);
          });

        })
        .catch(error => {
          res.status(500).send({
            error: 'Unable to retrieve discord user data',
          });
        });
    })
    .catch(error => {
      res.status(500).send(error);
    });
}

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
  discordAuthLogin,
  discordSession,
};
