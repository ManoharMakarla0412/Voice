const chrono = require('chrono-node');

exports.parseDate = (dateString) => {
  const date = chrono.parseDate(dateString);
  if (!date) {
    throw new Error('Invalid date format');
  }
  return date;
};