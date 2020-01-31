const Sequelize = require('sequelize');
const { Database } = require('../structures/PostgreSQL');

const EventLog = Database.db.define('eventLog', {
  target: Sequelize.STRING,
  caller: Sequelize.STRING,
  action: {
		type: Sequelize.ENUM,
		values: [
      'add-role',
      'remove-role',
      'submitted-application',
      'updated-application',
      'complete-application',
      'update-user',
    ],
  },
  details: Sequelize.JSONB,
});

module.exports = { EventLog };
