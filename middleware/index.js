const { verifyJWTToken } = require('./jwt');
const { Authentication } = require('../models/Authentication');

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
    .catch(() => {
      return res.status(401).send({
        status: 'unauthorized',
        statusCode: 401,
        message: `Invalid Authentication Token`
      });
    })
    .then((token) => {

      if (!token || !token.data || !token.data.username || !token.exp) {
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

      Authentication.findAll({
        where: {
          username: token.data.username,
          active: true,
        },
      }).then(result => {

        if (result.length < 1) {
          return res.status(401).send({
            status: 'unauthorized',
            statusCode: 401,
            message: `Invalid Authentication Token`
          });
        }

        next();
      }).catch(err => {
        return res.status(500).send(err);
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
