const { Roles } = require('../../models/Roles');

const getRoles = (req, res) => {
  Roles.findAll({
    ...req.pagination,
    where: {
      guild: "398543362476605441",
    }
  }).then(result => {
    res.status(200).send(result);
  });
};

module.exports = {
  getRoles,
};
