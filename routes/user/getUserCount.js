const { User } = require('../../models/User');

const getUserCount = (req, res) => {
  User.count().then(count => {
    res.status(200).send({ count });
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUserCount;
