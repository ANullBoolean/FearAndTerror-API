const { Roles } = require('../../models/Roles');

const getRoles = (req, res) => {
  Roles.findAll({
    ...req.pagination,
  }).then(result => {
    res.status(200).send(result);
  });
};

module.exports = {
  getRoles,
};
