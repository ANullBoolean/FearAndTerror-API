const { MessageActivity } = require('../../models/MessageActivity');

const getUserMessages = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(500).send({
      status: 500,
      error: 'No user id provided',
    });
  }

  MessageActivity.findAll({ ...req.pagination, where: { userId } }).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(500).send(err);
  });
};

module.exports = getUserMessages;
