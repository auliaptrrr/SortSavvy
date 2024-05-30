const { addUserLoginList } = require('./handler');

const routes = [
    {
      method: 'POST',
      path: '/users',
      handler: addUserLoginList,
    },
  ];
   
  module.exports = routes;