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
    guild: '398543362476605441',
  };

  // Search by steamid
  if (userId.length === 17 && userId.includes('765')) {
    where = {
      steamId: userId,
      guild: '398543362476605441',
    };
  }

  User.findAll({
    where,
  }).then(result => {
    if (result.length < 1) {
      res.status(404).send({
        error: true,
        message: 'user not found',
      });
    }
    res.status(200).send(result[0]);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUser;
