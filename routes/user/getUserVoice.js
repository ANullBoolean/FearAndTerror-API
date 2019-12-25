const { VoiceActivity } = require('../../models/VoiceActivity');

const getUserVoice = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(500).send({
      status: 500,
      error: 'No user id provided',
    });
  }

  VoiceActivity.findAndCountAll({ ...req.pagination, where: { userId } }).then(result => {
    res.status(200).send({ ...req.pagination, ...result });
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUserVoice;
