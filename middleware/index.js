const { verifyJWTToken } = require('./jwt');
const { User } = require('../models/User');
const { roles } = require('../routes/authentication');

const middleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({
      status: 'unauthorized',
      statusCode: 401,
      message: `Invalid Authentication Token`
    });
  }

  const authToken = req.headers.authorization.replace('Bearer ', '');

  verifyJWTToken(authToken)
    .then((token) => {
      if (!token || !token.data || !token.data.userId || !token.exp) {
        return res.status(401).send({
          status: 'unauthorized',
          statusCode: 401,
          message: `Invalid Authentication Token`
        });
      }

      if (token.exp - (Date.now() / 1000 | 0) < 1) {
        return res.status(401).send({
          status: 'unauthorized',
          statusCode: 401,
          message: `Invalid Authentication Token`
        });
      }

      // Temp user blacklist
      if (token.data.userId === '216274121619668992') {
        return res.status(401).send({
          status: 'unauthorized',
          statusCode: 401,
          message: `Invalid Authentication Token`
        });
      }

      User.findAll({
        where: {
          userId: token.data.userId,
          guild: '398543362476605441',
        },
      }).then(result => {

        if (result.length < 1) {
          return res.status(401).send({
            status: 'unauthorized',
            statusCode: 401,
            message: `Invalid Authentication Token`
          });
        }

        if (!JSON.parse(result[0].dataValues.roles).some(r => roles.includes(r))) {
          return res.status(401).send({
            status: 'unauthorized',
            statusCode: 401,
            message: `Unauthorized User`
          });
        }

        req.user = result[0];

        next();
      }).catch(err => {
        console.log('ERROR: ', err);
        return res.status(500).send(err);
      });
    })
    .catch(() => {
      return res.status(401).send({
        status: 'unauthorized',
        statusCode: 401,
        message: `Invalid Authentication Token`
      });
    });
}

const pagination = (req, res, next) => {
  const limit = Math.max(req.query.limit || 20, 1);
  const offset = Math.max(((req.query.page || 1) - 1), 0) * limit;
  const orderBy = req.query.orderBy || 'id';
  const orderDirection = req.query.direction == 'DESC' ? 'DESC' : 'ASC';

  req.pagination = {
    limit,
    offset,
    order: [
      [orderBy, orderDirection],
    ],
  };
  next();
}

module.exports = {
  middleware,
  pagination,
};
