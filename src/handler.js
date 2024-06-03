const User = require('./models/User');
const bcrypt = require('bcryptjs');

const addUserLoginList = async (request, h) => {
    const { fullName, email, password } = request.payload;

    try {
        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return h.response({
                status: 'fail',
                message: 'Email already exists',
            }).code(400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan pengguna baru
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
        });

        return h.response({
            status: 'success',
            message: 'User registered successfully',
            data: {
                email: newUser.email,
            },
        }).code(201);
    } catch (err) {
        console.error(err);
        return h.response({
            status: 'fail',
            message: 'Internal Server Error',
        }).code(500);
    }
};

module.exports = { addUserLoginList };
