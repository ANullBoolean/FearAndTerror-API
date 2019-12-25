const jwt = require('jsonwebtoken');
const _ = require('lodash');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync("config.json"));

const verifyJWTToken = token => {
  return new Promise((resolve, reject) =>
  {
    jwt.verify(token, config.secret, (err, decodedToken) =>
    {
      if (err || !decodedToken)
      {
        return reject(err)
      }

      resolve(decodedToken)
    })
  })
}

const createJWToken = details => {
  if (typeof details !== 'object')
  {
    details = {};
  }

  if (!details.maxAge || typeof details.maxAge !== 'number')
  {
    details.maxAge = 3600 * 12;
  }

  details.sessionData = _.reduce(details.sessionData || {}, (memo, val, key) =>
  {
    if (typeof val !== "function" && key !== "password")
    {
      memo[key] = val;
    }
    return memo
  }, {})

  let token = jwt.sign({
     data: details.sessionData
    }, config.secret, {
      expiresIn: details.maxAge,
      algorithm: 'HS256'
  })

  return token;
}

module.exports = {
  verifyJWTToken,
  createJWToken,
}
