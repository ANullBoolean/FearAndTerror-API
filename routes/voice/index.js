const { VoiceActivity } = require('../../models/VoiceActivity');

const getVoice = (req, res) => {
  VoiceActivity.findAll({ ...req.pagination }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

const getVoiceCount = (req, res) => {
  VoiceActivity.count().then(count => {
    res.status(200).send({ count });
  }).catch(err => {
    res.status(500).send(err);
  });
};

const getAverageVoiceTime = (req, res) => {
  VoiceActivity.findAll({
    attributes: [
      [
        VoiceActivity.sequelize.fn('AVG', VoiceActivity.sequelize.col('time')),
        'averageTime'
      ],
      [
        VoiceActivity.sequelize.literal('COUNT(DISTINCT("channelId"))'),
        'uniqueChannels'
      ]
    ],
  }).then(result => {
    res.status(200).send(result[0]);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = { getVoice, getVoiceCount, getAverageVoiceTime };
