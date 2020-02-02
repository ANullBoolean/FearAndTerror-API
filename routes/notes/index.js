const { StaffNotes } = require('../../models/StaffNotes');

const getStaffNotes = (req, res) => {
  const userId = req.params.userId;

  StaffNotes.findAll({
    where: {
      userId,
    },
    ...req.pagination,
  }).then(results => {
    res.status(200).send(results);
  }).catch(err => {
    console.log(err);
    res.status(500).send({
      completed: false,
    });
  });
};

const addStaffNote = (req, res) => {
  const userId = req.params.userId;
  const contents = req.body.contents;

  const posterId = req.user.userId;
  const posterName = req.user.name;

  if (!userId || !posterId || !posterName || !contents) {
    return res.status(500).send({
      error: true,
      message: 'All fields are required',
    });
  }

  StaffNotes.create({
    userId,
    posterId,
    posterName,
    contents,
  }).then(results => {
    res.status(200).send(results);
  }).catch(err => {
    res.status(500).send({
      completed: false,
    });
  });
};

module.exports = {
  addStaffNote,
  getStaffNotes,
};
