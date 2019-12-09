const { SquadActivity } = require('../../models/SquadActivity');

const getSquad = (req, res) => {
  SquadActivity.findAll({ ...req.pagination }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

const getSquadCount = (req, res) => {
  SquadActivity.count().then(count => {
    res.status(200).send({ count });
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = { getSquad, getSquadCount };
