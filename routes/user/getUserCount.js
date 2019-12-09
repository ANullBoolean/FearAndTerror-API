const { User } = require('../../models/User');

const getUserCount = (req, res) => {
  User.count().then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUserCount;
