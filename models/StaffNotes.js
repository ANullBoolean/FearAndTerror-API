const Sequelize = require('sequelize');
const { Database } = require('../structures/PostgreSQL');

const StaffNotes = Database.db.define('staffNotes', {
  userId: Sequelize.STRING,
  posterId: Sequelize.STRING,
  posterName: Sequelize.STRING,
  contents: Sequelize.TEXT,
});

module.exports = { StaffNotes };
