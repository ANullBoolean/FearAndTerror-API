const { EventLog } = require('../models/EventLog');

const LogEvent = (target, caller, action, details) => {
  EventLog.create({
    target,
    caller,
    action,
    details,
  })
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.error(err);
    });
};

module.exports = { LogEvent };
