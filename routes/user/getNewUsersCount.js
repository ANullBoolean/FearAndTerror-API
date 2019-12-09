const moment = require('moment');
const { Op } = require('sequelize');
const { User } = require('../../models/User');

const getNewUsersCount = (req, res) => {
  const days = parseInt(req.query.days || 7);

  User.count({
    group: [ User.sequelize.fn('date_trunc', 'day', User.sequelize.col('createdAt'))],
    where: {
      createdAt: {
        [Op.gte]: moment().subtract(days, 'days').toDate(),
      },
    },
  }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getNewUsersCount;
