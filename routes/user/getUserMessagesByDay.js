const moment = require('moment');
const { Op } = require('sequelize');
const { MessageActivity } = require('../../models/MessageActivity');

const getUserMessagesByDay = (req, res) => {
  const userId = req.params.id;
  let where = {
    userId,
  };
  const days = parseInt(req.query.days || 7);
  const channelId = req.query.channelId;
  if (channelId) {
    where = {
      ...where,
      channelId,
    };
  }

  MessageActivity.count({
    group: [ MessageActivity.sequelize.fn('date_trunc', 'day', MessageActivity.sequelize.col('createdAt'))],
    where: {
      createdAt: {
        [Op.gte]: moment().subtract(days, 'days').toDate(),
      },
      ...where,
    },
  }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUserMessagesByDay;
