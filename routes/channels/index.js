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
  const type = req.query.type || 'text';
  const access = req.query.access || true;

  if (!channelId) {
    return res.status(500).send({
      status: 500,
      error: 'No channel id provided',
    });
  }

  Channels.findAll({
    where: {
      channelId,
      type,
      access,
    },
  }).then(result => {
    res.status(200).send(result);
  });
};

module.exports = {
  getChannels,
  getChannelById,
}
