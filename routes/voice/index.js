const moment = require('moment');
const { Op } = require('sequelize');
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

const getChannelVoiceActivity = (req, res) => {
  const days = parseInt(req.query.days || 7);
  const channelId = req.params.channelId;

  VoiceActivity.findAll({
    where: {
      createdAt: {
        [Op.gte]: moment().subtract(days, 'days').toDate(),
      },
      channelName: VoiceActivity.sequelize.where(VoiceActivity.sequelize.fn('LOWER', VoiceActivity.sequelize.col('channelName')), 'LIKE', '%' + channelId + '%'),
    },
    order: [
      [ VoiceActivity.sequelize.literal(`DATE("jointime")`), 'ASC' ],
    ],
  }).then(result => {
    const results = {};
    const hours = days * 24;
    for (let index = 0; index <= hours; index++) {
      results[moment().subtract(index, 'hour').startOf('hour')] = {
        users: 0,
      };
    }

    try {
      result.forEach(r => {
        const join = moment(r.get('jointime')).startOf('hour');
        const leave = moment(r.get('leavetime')).startOf('hour');
        const duration = moment.duration(leave.diff(join));
        const hours = duration.asHours();

        for (let index = 0; index <= hours; index++) {
          const t = moment(join).add(index, 'hour');
          if (results[t]) {
            results[t].users += 1;
          }
        }
      });
    } catch (e) {
      console.log(e);
    }

    res.status(200).send(results);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = { getVoice, getVoiceCount, getAverageVoiceTime, getChannelVoiceActivity };
