const { Channels } = require('../../models/Channels');

const getChannels = (req, res) => {
  Channels.findAll({
    ...req.pagination,
  }).then(result => {
    res.status(200).send(result);
  });
};

const getChannelById = (req, res) => {
  const channelId = req.params.id;

  if (!channelId) {
    return res.status(500).send({
      status: 500,
      error: 'No channel id provided',
    });
  }

  Channels.findAll({
    where: {
      channelId,
    },
  }).then(result => {
    res.status(200).send(result);
  });
};

module.exports = {
  getChannels,
  getChannelById,
}
