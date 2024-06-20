const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const { connectDB, sequelize } = require('./db');
const inert = require('@hapi/inert');
const vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir); // Direktori tujuan penyimpanan file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Menambahkan timestamp pada nama file
    }
});

const upload = multer({ storage });

const init = async () => {
    try {
        await connectDB(); // Connect to MySQL
        console.log('Database connected successfully');

        // Sync all models that aren't already in the database
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');

        const port = process.env.PORT || 8000;
        console.log(`Server will start on port: ${port}`);

        const server = Hapi.server({
            port: port,
            host: '0.0.0.0', // Pastikan host diatur ke '0.0.0.0' untuk akses dari luar container
        });

        const swaggerOptions = {
            info: {
                title: 'API Documentation',
                version: Pack.version,
            },
        };

        await server.register([
            inert,
            vision,
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            }
        ]);

        server.route(routes);

        // Route untuk pengunggahan foto profil
        server.route({
            method: 'POST',
            path: '/upload',
            options: {
                payload: {
                    output: 'stream',
                    parse: true,
                    multipart: true
                },
                tags: ['api'], // Menambahkan tag agar endpoint muncul di dokumentasi Swagger
                description: 'Upload profile photo',
                notes: 'Endpoint untuk mengunggah foto profil',
            },
            handler: async (request, h) => {
                console.log('Upload request received');
                const file = request.payload.profilePhoto;
                const filePath = `uploads/${Date.now()}_${file.hapi.filename}`;
                const fileStream = fs.createWriteStream(filePath);

                return new Promise((resolve, reject) => {
                    file.pipe(fileStream);
                    file.on('end', (err) => {
                        if (err) {
                            reject(err);
                        }
                        console.log('File uploaded successfully');
                        resolve(h.response({
                            status: 'success',
                            message: 'File uploaded successfully',
                            data: {
                                filePath
                            }
                        }).code(201));
                    });
                });
            }
        });

        await server.start();
        console.log(`Server berjalan pada ${server.info.uri}`);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

init();

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});