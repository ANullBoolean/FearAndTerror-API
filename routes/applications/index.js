const axios = require('axios');
const { Applications } = require('../../models/Applications');
const { User } = require('../../models/User');
const { Op } = require('sequelize');
const moment = require('moment');

const { LogEvent } = require('../../methods/EventLog');

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));

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
      LogEvent(userId, userId, username, 'submitted-application', { id: result.dataValues.id });

      axios.get(`http://bravo.fearandterror.com:4500/application`, {
        params: {
          uid: userId,
          id: result.dataValues.id,
          token: config.apiToken,
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
      console.error(err);
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
      'votes',
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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
      res.status(500).send({
        error: true,
      });
    });
}


const processVotingApplications = (req, res) => {
  Applications.findAll({
    where: {
      status: 'voting',
      createdAt: {
        [Op.lte]: moment().subtract(1, 'days').toDate(),
      }
    },
  })
    .then(result => {
      result.forEach(application => {
        application.update({
          status: 'vote-review',
        }).then(() => {
          LogEvent(application.get('userId'), 'pam', 'Automated', 'updated-application', {
            id: application.get('id'),
            status: 'vote-review',
          });
        });
      });

      res.status(200).send({
        complete: true,
        results: result.length,
      });
    })
    .catch(err => {
      console.error(err);
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

        LogEvent(application.get('userId'), 'pam', 'Automated', 'updated-application', {
          id,
          status: 'vote-review',
        });
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
          console.error(err);
          res.status(500).send({
            error: true,
          });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send({
        error: true,
      });
    });
}

const updateApplication = (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  if (status === 'pending-introduction') {
    // /applicant/welcome

    axios.get(`http://bravo.fearandterror.com:4500/applicant/welcome`, {
      params: {
        token: config.apiToken,
        uid: req.body.uid,
      }
    }).catch(err => {
      console.error(err);
    });
  }

  if (status === 'denied') {
    axios.get(`http://bravo.fearandterror.com:4500/applicant/denied`, {
      params: {
        token: config.apiToken,
        uid: req.body.uid,
      }
    }).catch(err => {
      console.error(err);
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
    returning: true,
  })
    .then(result => {
      if (result[0] !== 1) {
        return res.status(200).send({
          error: true,
          message: 'Missing Update Data',
        });
      }

      const application = result[1][0].dataValues;

      LogEvent(application.userId, req.user.userId, req.user.name, 'updated-application', {
        id: application.id,
        status: application.status,
      });

      if (application.status !== 'voting' && application.votemessage) {
        axios.get(`http://bravo.fearandterror.com:4500/application/voting/delete`, {
          params: {
            id: application.votemessage,
            token: config.apiToken,
          }
        })
        .catch(err => {
          console.error(err);
        });
      }

      res.status(200).send(application);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send({
        error: true,
      });
    });
}

const giveTags = (req, res) => {
  axios.get(`http://bravo.fearandterror.com:4500/applicant/channel-signup`, {
    params: {
      uid: req.query.uid,
      token: config.apiToken,
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
  axios.get(`http://bravo.fearandterror.com:4500/applicant/accepted`, {
    params: {
      uid: req.query.userId,
      token: config.apiToken,
    }
  })
    .then(() => {

      LogEvent(req.query.userId, req.user.userId, req.user.name, 'add-role', {
        id: '398547748900831234', // Recruit role
      });

      res.status(200).send({
        complete: true,
      });
    })
    .catch(err => {
      console.error(err);
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

      LogEvent(userId, req.user.userId, req.user.name, 'complete-application', {
        id,
        status,
      });

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

        LogEvent(userId, req.user.userId, req.user.name, 'update-user', {
          steamId,
          military,
          tz,
          joindate,
          ambassador: req.user.userId,
        });

        axios.get(`http://localhost:4500/applicant/completed`, {
          params: {
            steamId,
            military,
            tz,
            userId,
            uid: userId,
            ambassador: req.user.userId,
            token: config.apiToken,
          }
        })
          .then(() => {
            res.status(200).send({
              complete: true,
            });
          })
          .catch(err => {
            console.error(err);
            res.status(500).send({
              complete: false,
            });
          });

      }).catch(err => {
        console.error(err);
        res.status(500).send(err);
      });
    })
    .catch(err => {
      console.error(err);
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
  processVotingApplications,
};
