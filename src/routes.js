const { addUserLoginList, getAllWasteClass } = require('./handler');

const routes = [
    {
        method: 'POST',
        path: '/users',
        handler: addUserLoginList,
    },
    {
        method: 'GET',
        path: '/explore',
        handler: getAllWasteClass,
    },
    {
        method: 'GET',
        path: '/explore/{class}',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/explore/{class}/{sort}',
        handler: () => {},
    },
];

module.exports = routes;
