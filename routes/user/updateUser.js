const { User } = require('../../models/User');
const { LogEvent } = require('../../methods/EventLog');

const updateUser = (req, res, next) => {
  const id = req.params.id;

  if (!req.user.dataValues.roles.includes('410574082267021312')) {
    return res.status(401).send({
      status: 401,
      message: 'You\'re not personnel',
    });
  }

  const { steamId, military, tz, joindate, ambassador, ...garbage } = req.body;

  if (!id) {
    throw new Error('No ID Provided');
  }

  try {
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
        next(new Error('Error updating user'));
      });

    }).catch(err => {
      console.error(err);
      next(new Error('Error fetching user'));
    });
  } catch (error) {
    throw error;
  }


};

module.exports = updateUser;
