const Op = require('sequelize').Op;
const { User } = require('../../models/User');

const getWhitelist = (req, res) => {

  let whitelist = 'Group=Whitelist:reserve\n\n';

  res.set({ 'content-type': 'text/plain; charset=utf-8' });

  User.findAll({
    where: {
      steamId: {
        [Op.ne]: null
      }
    }
  })
  .then(result => {
    result.forEach(user => {
      whitelist = `${whitelist}Admin=${user.steamId}:Whitelist // ${user.nickname} (${user.username})` + '\n';
    });
    res.status(200).send(whitelist);
  })
  .catch(err => {
    console.log(err);
    res.status(500).send({
      error: true,
    });
  })
};

module.exports = { getWhitelist };
