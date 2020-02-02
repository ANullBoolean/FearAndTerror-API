const { User } = require('../../models/User');
const { LogEvent } = require('../../methods/EventLog');

const updateUser = (req, res) => {
  const id = req.params.id;

  if (!req.user.dataValues.roles.includes('410574082267021312')) {
    res.status(500).send({
      error: true,
      message: 'You\'re not personnel',
    });
    return;
  }

  const { steamId, military, tz, joindate, ambassador, ...garbage } = req.body;

  if (!id) {
    return res.status(500).send({
      status: 500,
      error: 'No id provided',
    });
  }

  User.findOne({
    where: {
      id,
      guild: '398543362476605441',
    }
  }).then(user => {

    const oldValues = { ...user.dataValues };

    user.update({
      steamId,
      military,
      tz,
      joindate,
      ambassador,
    }, {
      returning: true,
    }).then(result => {
      const newValues = { ...user.dataValues };
      const changes = {};
      const ignore = [ 'joindate', 'createdAt', 'updatedAt' ];

      Object.keys(oldValues).forEach(key => {
        if (!ignore.includes(key)) {
          if (oldValues[key] !== newValues[key]) {
            changes[key] = {
              old: oldValues[key],
              new: newValues[key],
            };
          }
        }
      });

      LogEvent(user.userId, req.user.userId, req.user.name, 'update-user', changes);

      res.status(200).send({
        success: true,
      });
    }).catch(err => {
      console.error(err);
      res.status(500).send({
        complete: false,
        message: 'Error while updating user',
      });
    });

  }).catch(err => {
    console.log(err);
    res.status(500).send({
      complete: false,
      message: 'Error while fetching user',
    });
  });
};

module.exports = updateUser;
