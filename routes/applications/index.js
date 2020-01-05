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

const getUserApplications = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(500).send({
      error: true,
      message: 'Invalid User Id',
    });
  }

  Applications.findAndCountAll({
    ...req.pagination,
    where: {
      userId,
    },
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

const getApplication = (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) {
    return res.status(500).send({
      error: true,
      message: 'Invalid ID',
    });
  }

  Applications.findOne({
    where: {
      id,
    },
  })
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        error: true,
      });
    });
}

const voteApplication = (req, res) => {
  const id = req.params.id;
  const upvote = req.body.upvote == true ? true : false;

  if (isNaN(id)) {
    return res.status(500).send({
      error: true,
      message: 'Invalid ID',
    });
  }

  Applications.findOne({
    where: {
      id,
    },
  })
    .then(application => {
      const userId = req.user.userId;
      const votes = {
        ...application.get('votes'),
        [userId]: upvote,
      };

      const upvotes = Object.values(votes).filter(v => v == true).length;
      const downvotes = Object.keys(votes).length - upvotes;

      application.update({
        votes,
        upvotes,
        downvotes,
      })
        .then(result => {
          res.status(200).send(result);
        })
        .catch(err => {
          console.log(err);
          res.status(500).send({
            error: true,
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        error: true,
      });
    });
}

const updateApplication = (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  if (isNaN(id)) {
    return res.status(500).send({
      error: true,
      message: 'Invalid ID',
    });
  }

  Applications.update({
    status,
  }, {
    where: {
      id,
    },
  })
    .then(result => {
      res.status(200).send(result);
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
  voteApplication,
  getApplications,
  getApplication,
  getUserApplications,
  updateApplication,
};
