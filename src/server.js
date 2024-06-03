const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const { connectDB, sequelize } = require('./db');

const init = async () => {
    await connectDB(); // Connect to MySQL

    // Sync all models that aren't already in the database
    await sequelize.sync({ alter: true });

    const server = Hapi.server({
        port: 8000,
        host: 'localhost',
    });

    server.route(routes);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
