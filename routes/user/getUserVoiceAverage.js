const { VoiceActivity } = require('../../models/VoiceActivity');

const getUserVoiceAverage = (req, res) => {
  const userId = req.params.id;

  VoiceActivity.findAll({
    where: {
      userId,
    },
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

module.exports = getUserVoiceAverage;
