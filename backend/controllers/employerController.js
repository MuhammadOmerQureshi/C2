// You can import and re-export employeeController functions, or add employer-specific logic here.
const employeeController = require('./employeeController');

module.exports = {
  ...employeeController
};
