const { VoiceActivity } = require('../../models/VoiceActivity');

const getVoice = (req, res) => {
  VoiceActivity.findAll({ ...req.pagination }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = { getVoice };
