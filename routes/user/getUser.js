const { User } = require('../../models/User');

const getUser = (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(500).send({
      status: 500,
      error: 'No user id provided',
    });
  }

  let where = {
    userId,
  };

  // Search by steamid
  if (userId.length === 17) {
    where = {
      steamId: userId,
    };
  }

  User.findAll({
    where,
  }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUser;
