const { registerUser, loginUser, getUser, updateUserProfile, updateUserPassword, logoutUser, getTotalScan, updateScanQty } = require('./handler');
const Joi = require('joi');

const routes = [
    {
        method: 'POST',
        path: '/register',
        options: {
            payload: {
                output: 'data',
                parse: true
            }
        },
        handler: registerUser,
    },
    {
        method: 'POST',
        path: '/login',
        options: {
            payload: {
                output: 'data',
                parse: true
            }
        },
        handler: loginUser,
    },
    {
        method: 'GET',
        path: '/users/{id}',
        handler: getUser,
    },
    {
        method: 'PUT',
        path: '/users/{id}',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                multipart: true // Tetap gunakan multipart untuk mendukung profilePhoto
            }
        },
        handler: updateUserProfile,
    },
    {
        method: 'PUT',
        path: '/users/{id}/password',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                multipart: true // Mendukung form-data
            }
        },
        handler: updateUserPassword,
    },
    {
        method: 'GET',
        path: '/users/{id}/totalScan',
        handler: getTotalScan,
    },
    {
        method: 'PUT',
        path: '/scan/{id}',
        handler: async (request, h) => {
            const { id } = request.params;
            const { waste } = request.payload;
            const result = await updateScanQty(id, waste);
            return { id, waste, result };
        },
        options: {
            validate: {
                payload: Joi.object({
                    waste: Joi.string().required()
                })
            }
        }
    }
];

module.exports = routes;