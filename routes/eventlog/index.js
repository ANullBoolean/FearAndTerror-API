const { EventLog } = require('../../models/EventLog');

const getUserEventLog = (req, res) => {
  const target = req.params.id;

  EventLog.findAll({
    where: {
      target,
    },
  }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    console.log(err);
    res.status(500).send(err);
  });
};

module.exports = {
  getUserEventLog,
};
