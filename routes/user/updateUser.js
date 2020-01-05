const { User } = require('../../models/User');

const updateUser = (req, res) => {
  const id = req.params.id;

  if (!req.user.dataValues.roles.includes('410574082267021312')) {
    res.status(500).send({
      error: true,
      message: 'You\'re not personnel',
    });
  }

  const { steamId, ...garbage } = req.body;

  // Currently we're only allowed to update steamId

  if (!id || !steamId) {
    return res.status(500).send({
      status: 500,
      error: 'No id provided',
    });
  }

  User.update({
    steamId,
  }, {
    where: {
      id,
      guild: '398543362476605441',
    },
  }).then(result => {
    res.status(200).send({
      success: true,
    });
  }).catch(err => {
    console.log(err);
    res.status(500).send(err);
  });
};

module.exports = updateUser;
