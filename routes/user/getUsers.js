const { User } = require('../../models/User');

const getUsers = (req, res) => {
  User.findAll({ ...req.pagination }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUsers;
