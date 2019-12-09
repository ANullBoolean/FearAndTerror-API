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
  MessageActivity.count().then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = {
  getMessages,
  getMessageCount,
  getMessagesByChannel,
};
