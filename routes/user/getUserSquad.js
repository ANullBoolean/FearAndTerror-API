const { SquadActivity } = require('../../models/SquadActivity');

const getUserSquad = (req, res) => {
  const steamId = req.params.id;

  if (!steamId) {
    return res.status(500).send({
      status: 500,
      error: 'No SteamID provided',
    });
  }

  if (steamId.length !== 17) {
    return res.status(500).send({
      status: 500,
      error: 'Invalid SteamID',
    });
  }

  SquadActivity.findAll({ ...req.pagination, where: { steamId } }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUserSquad;
