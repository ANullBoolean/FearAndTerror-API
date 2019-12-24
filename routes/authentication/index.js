const crypto = require('crypto');
const { createJWToken } = require('../../middleware/jwt.js');
const { Authentication } = require('../../models/Authentication');

const roles = [
  '601467946858184704', // Clan Leader
  '458087769303023617', // Clan Director
  '525347747059204096', // Mordhau Director
  '620724284175941663', // R6S Director
  '651467080893202446', // Halo Director
  '471757506562228235', // Tarkov Director
  '398544403314245633', // Squad Director
  '398544596755415062', // Manager
  '650889847715790866', // Executive Producer
  // '410574082267021312', // FaT-Personnel
];

const hashPassword = password => {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const register = (req, res) => {
  const { username, password, createKey } = req.body;

  if (!createKey || !username || !password) {
    return res.status(500).send({
      status: 'error',
      statusCode: 500,
      message: 'All Fields Required'
    });
  }

  Authentication.findAll({
    where: {
      username,
    },
  }).then(result => {
    if (result.length >= 1) {
      return res.status(500).send({
        status: 'error',
        statusCode: 500,
        message: 'Username already registered'
      });
    }

    Authentication.findAll({
      where: {
        createKey,
        active: false,
      },
    }).then(result => {
      if (result.length < 1) {
        return res.status(500).send({
          status: 'error',
          statusCode: 500,
          message: 'Invalid Creation Key'
        });
      }

      Authentication.update({
        username,
        password: hashPassword(password),
        active: true,
      }, {
        where: {
          createKey,
        }
      }).then(() => {
        res.status(200).send({
          status: 'success',
          statusCode: 200,
          data: {
            message: 'Account Successfully Created',
          }
        });
      }).catch(err => {
        return res.status(500).send(err);
      });

    }).catch(err => {
      return res.status(500).send(err);
    });

  }).catch(err => {
    return res.status(500).send(err);
  });

}

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || username === 'Paul') {
    return res.status(500).send({
      status: 'error',
      statusCode: 500,
      message: 'All Fields Required'
    });
  }

  Authentication.findAll({
    where: {
      username,
      password: hashPassword(password),
      active: true,
    },
  }).then(results => {

    if (results.length < 1) {
      return res.status(401).send({
        status: 'unauthorized',
        statusCode: 401,
        message: `Invalid Username or Password`
      });
    }

    // Authenticated Successfully, send token
    res.status(200).send({
      status: 'success',
      statusCode: 200,
      data: {
        token: createJWToken({ sessionData: { username }}),
      }
    });
  }).catch(err => {
    res.status(500).send(err);
  });

}

module.exports = {
  hashPassword,
  register,
  login,
  roles,
};
