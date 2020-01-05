const moment = require('moment');
const { Op } = require('sequelize');
const { VoiceActivity } = require('../../models/VoiceActivity');

const getUserVoiceDaily = (req, res) => {
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

  VoiceActivity.findAll({
    attributes: [
      [VoiceActivity.sequelize.literal(`DATE("jointime")`), 'date'],
      [VoiceActivity.sequelize.literal(`SUM("time")`), 'time'],
    ],
    group: ['date'],
    where: {
      createdAt: {
        [Op.gte]: moment().subtract(days, 'days').toDate(),
      },
      ...where,
    },
  }).then(result => {
    const results = [];

    for (let index = 0; index < days; index++) {
      const day = moment().subtract(index, 'days').startOf('day').format('YYYY-MM-DD');
      let found = false;

      result.forEach(d => {
        if (d.get('date') === day) {
          results.push({
            date: d.get('date'),
            time: d.get('time'),
          });
          found = true;
        }
      });

      if (!found) {
        results.push({
          date: day,
          time: 0,
        });
      }
    }

    res.status(200).send(results);
  }).catch(err => {
    res.status(500).send({
      error: true,
    });
  });
};

module.exports = getUserVoiceDaily;
