const { VoiceActivity } = require('../../models/VoiceActivity');

const getUserVoiceByChannel = (req, res) => {
  const userId = req.params.id;
  const channelId = req.params.channelId;

  if (!userId) {
    return res.status(500).send({
      status: 500,
      error: 'No user id provided',
    });
  }

  if (!channelId) {
    return res.status(500).send({
      status: 500,
      error: 'No channel id provided',
    });
  }

  VoiceActivity.findAll({ ...req.pagination, where: { userId, channelId } }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUserVoiceByChannel;
