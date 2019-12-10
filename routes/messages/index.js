const moment = require('moment');
const { Op } = require('sequelize');
const { MessageActivity } = require('../../models/MessageActivity');

const getMessages = (req, res) => {
  MessageActivity.findAll({ ...req.pagination }).then(result => {
    res.status(200).send(result);
  });
};

const getMessagesByChannel = (req, res) => {
  const channelId = req.params.channelId;

  if (!channelId) {
    return res.status(500).send({
      status: 500,
      error: 'No channel id provided',
    });
  }

  MessageActivity.findAll({ ...req.pagination, where: { channelId } }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

const getMessageCount = (req, res) => {
  MessageActivity.count().then(count => {
    res.status(200).send({ count });
  }).catch(err => {
    res.status(500).send(err);
  });
};

const getNewMessagesCount = (req, res) => {
  let where = {};
  const days = parseInt(req.query.days || 7);
  const channelId = req.query.channelId;
  if (channelId) {
    where = {
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

module.exports = {
  getMessages,
  getMessageCount,
  getNewMessagesCount,
  getMessagesByChannel,
};
