const axios = require('axios');
const { Applications } = require('../../models/Applications');
const { User } = require('../../models/User');

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
    .then(result => {
      axios.get(`http://206.189.230.161:4500/application`, {
        params: {
          uid: userId,
          id: result.dataValues.id,
        }
      })
        .then(() => {
          res.status(200).send({
            complete: true,
          });
        })
        .catch(err => {
          res.status(500).send({
            complete: false,
          });
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
      let statusChange = {};
      const userId = req.user.userId;
      const votes = {
        ...application.get('votes'),
        [userId]: upvote,
      };

      const upvotes = Object.values(votes).filter(v => v == true).length;
      const downvotes = Object.keys(votes).length - upvotes;

      // Automatically push it into review if we meet these values
      if (upvotes >= 10 || downvotes >= 5) {
        statusChange = {
          status: 'vote-review',
        };
      }

      application.update({
        votes,
        upvotes,
        downvotes,
        ...statusChange,
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

  if (status === 'pending-interview') {
    // /applicant/welcome

    axios.get(`http://206.189.230.161:4500/applicant/welcome`, {
      params: {
        uid: req.body.uid,
      }
    }).catch(err => {
      console.log(err);
    });
  }

  if (status === 'denied') {
    axios.get(`http://206.189.230.161:4500/applicant/denied`, {
      params: {
        uid: req.body.uid,
      }
    }).catch(err => {
      console.log(err);
    });
  }

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

const giveTags = (req, res) => {
  axios.get(`http://206.189.230.161:4500/applicant/channel-signup`, {
    params: {
      uid: req.query.uid,
    }
  })
    .then(result => {
      res.status(200).send({
        complete: true,
      });
    })
    .catch(err => {
      res.status(500).send({
        complete: false,
      });
    });
}

const promoteApplicant = (req, res) => {
  axios.get(`http://206.189.230.161:4500/applicant/accepted`, {
    params: {
      uid: req.query.userId,
    }
  })
    .then(() => {
      res.status(200).send({
        complete: true,
      });
    })
    .catch(err => {
      // console.log(err);
      res.status(500).send({
        complete: false,
      });
    });
}

const completeApplication = (req, res) => {
  const id = req.params.id;

  const {
    uid,
    userId,
    status,
    steamId,
    military,
    tz,
    joindate,
  } = req.body;

  console.log(req.user.userId);

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
      User.update({
        steamId,
        military,
        tz,
        joindate,
        ambassador: req.user.userId,
      }, {
        where: {
          id: uid,
          guild: '398543362476605441',
        },
      }).then(result => {
        res.status(200).send({
          success: true,
        });
      }).catch(err => {
        res.status(500).send(err);
      });
    })
    .catch(err => {
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
  giveTags,
  completeApplication,
  promoteApplicant,
};
