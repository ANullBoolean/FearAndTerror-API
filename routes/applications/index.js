const { Applications } = require('../../models/Applications');

const submitApplication = (req, res) => {

  const { userId, username, age, why, what, games, bring, skills, length, found } = req.body;

  if (!userId || !username || !age || !why || !what || !games || !bring || !skills || !length || !found) {
    res.status(500).send({
      error: true,
      message: 'All fields required',
    });
  }

  Applications.create({
    userId,
    username,
    age,
    why,
    what,
    games,
    bring,
    skills,
    length,
    found,
    status: 'voting',
    votes: {},
    upvotes: 0,
    downvotes: 0,
    notes: {},
  })
    .then(() => {
      res.status(200).send({
        success: true,
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        error: true,
      });
    });
};

const getApplications = (req, res) => {
  const status = req.query.status || 'voting';
  const userId = req.query.userId || null;

  let where = {
    status,
  };

  if (userId) {
    where.userId = userId;
  }

  Applications.findAndCountAll({
    ...req.pagination,
    where,
    attributes: [
      'id',
      'userId',
      'username',
      'status',
      'age',
      'upvotes',
      'downvotes',
      'createdAt',
      'updatedAt'
    ],
  })
    .then(result => {
      res.status(200).send({ ...req.pagination, ...result });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        error: true,
      });
    });
}

module.exports = {
  submitApplication,
  getApplications,
};
