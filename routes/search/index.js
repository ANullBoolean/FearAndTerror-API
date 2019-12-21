const { User } = require('../../models/User');
const Op = require('sequelize').Op;

const searchUsers = (req, res) => {

  const searchParam = req.query.search;

  if (!searchParam) {
    return res.status(500).send({
      status: 500,
      error: 'No search param provided',
    });
  }

  let where = {};

  if (searchParam.match(/\d{18}/)) {
    // Discord ID
    where = {
      userId: searchParam,
    };
  } else if (searchParam.match(/7\d{16}/)) {
    // Steam ID
    where = {
      steamId: searchParam,
    };
  } else {
    where = {
      [Op.or]: [
        {
          username: {
            [Op.iLike]: `%${searchParam}%`
          }
        },
        {
          nickname: {
            [Op.iLike]: `%${searchParam}%`
          }
        }
      ]
    };
  }

  User.findAndCountAll({
    attributes: [
      'id',
      'userId',
      'username',
      'nickname',
      'steamId',
      'roles',
      'createdAt',
      'updatedAt'
    ],
    where,
    ...req.pagination,
  }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });

};

module.exports = {
  searchUsers,
};
