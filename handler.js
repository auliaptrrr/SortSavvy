const User = require('./models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./db');

// Handler untuk registrasi pengguna
const registerUser = async (request, h) => {
    console.log('Received payload:', request.payload);

    const { fullName, email, password, confirmPassword } = request.payload;

    if (!email) {
        return h.response({
            status: 'fail',
            message: 'Email is required',
        }).code(400);
    }

    if (password !== confirmPassword) {
        return h.response({
            status: 'fail',
            message: 'Passwords do not match',
        }).code(400);
    }

    try {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return h.response({
                status: 'fail',
                message: 'Email already exists',
            }).code(400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultProfilePhoto = './assets/default_avatar.png';

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            profilePhoto: defaultProfilePhoto,
            totalScans: 0,
        });

        return h.response({
            status: 'success',
            message: 'User registered successfully',
            data: {
                email: newUser.email,
                createdAt: newUser.createdAt,
                profilePhoto: newUser.profilePhoto,
            },
        }).code(201);
    } catch (err) {
        console.error('Error during user registration:', err);
        return h.response({
            status: 'fail',
            message: 'Internal Server Error',
        }).code(500);
    }
};

// Handler untuk login pengguna
const loginUser = async (request, h) => {
    console.log('Received payload:', request.payload);

    const { email, password } = request.payload;

    if (!email || !password) {
        return h.response({
            status: 'fail',
            message: 'Email and password are required',
        }).code(400);
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return h.response({
                status: 'fail',
                message: 'Email not found',
            }).code(400);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return h.response({
                status: 'fail',
                message: 'Incorrect password',
            }).code(400);
        }

        return h.response({
            status: 'success',
            message: 'Login successful',
            data: {
                user_id: user.id, // Tambahkan user_id ke dalam respons
                email: user.email,
                fullName: user.fullName,
                profilePhoto: user.profilePhoto,
                totalScans: user.totalScans,
            },
        }).code(200);
    } catch (err) {
        console.error('Error during user login:', err);
        return h.response({
            status: 'fail',
            message: 'Internal Server Error',
        }).code(500);
    }
};

// Handler untuk mendapatkan data pengguna berdasarkan user_id
const getUser = async (request, h) => {
    const { id } = request.params;

    try {
        const user = await User.findByPk(id, {
            attributes: ['id', 'fullName', 'email', 'profilePhoto', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return h.response({
                status: 'fail',
                message: 'User not found',
            }).code(404);
        }

        return h.response({
            status: 'success',
            data: user,
        }).code(200);
    } catch (err) {
        console.error('Error retrieving user data:', err);
        return h.response({
            status: 'fail',
            message: 'Internal Server Error',
        }).code(500);
    }
};

// Handler untuk memperbarui profil pengguna
const updateUserProfile = async (request, h) => {
    const { id } = request.params;
    const { fullName, email, password } = request.payload;
    const profilePhoto = request.payload.profilePhoto;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return h.response({
                status: 'fail',
                message: 'User not found',
            }).code(404);
        }

        // Validasi password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return h.response({
                status: 'fail',
                message: 'Incorrect password',
            }).code(400);
        }

        // Perbarui profil
        if (fullName) {
            user.fullName = fullName;
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== id) {
                return h.response({
                    status: 'fail',
                    message: 'Email already in use',
                }).code(400);
            }
            user.email = email;
        }

        if (profilePhoto) {
            const filePath = `uploads/${Date.now()}_${profilePhoto.hapi.filename}`;
            const fileStream = fs.createWriteStream(filePath);

            await new Promise((resolve, reject) => {
                profilePhoto.pipe(fileStream);
                profilePhoto.on('end', (err) => {
                    if (err) {
                        reject(err);
                    }
                    user.profilePhoto = filePath;
                    resolve();
                });
            });
        }

        await user.save();

        return h.response({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profilePhoto: user.profilePhoto,
            },
        }).code(200);
    } catch (err) {
        console.error('Error during profile update:', err);
        return h.response({
            status: 'fail',
            message: 'Internal Server Error',
        }).code(500);
    }
};

// Handler untuk memperbarui password pengguna
const updateUserPassword = async (request, h) => {
    const { id } = request.params;
    const { currentPassword, newPassword } = request.payload;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return h.response({
                status: 'fail',
                message: 'User not found',
            }).code(404);
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return h.response({
                status: 'fail',
                message: 'Incorrect current password',
            }).code(400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        return h.response({
            status: 'success',
            message: 'Password updated successfully',
        }).code(200);
    } catch (err) {
        console.error('Error during password update:', err);
        return h.response({
            status: 'fail',
            message: 'Internal Server Error',
        }).code(500);
    }
};

// Fungsi untuk memperbarui data scan
const updateScanQty = async (id, waste) => {
    // Masukkan data scan baru
    await sequelize.query('INSERT INTO total_scan (id, waste) VALUES (?, ?)', {
        replacements: [id, waste],
        type: sequelize.QueryTypes.INSERT
    });

    return { success: true };
};

// Fungsi untuk mendapatkan total temuan
const getTotalScan = async (request, h) => {
    const { id } = request.params;

    const getScanQty = async (id, wasteType) => {
        const [rows] = await sequelize.query('SELECT COUNT(*) as count FROM total_scan WHERE id = ? AND waste = ?', {
            replacements: [id, wasteType],
            type: sequelize.QueryTypes.SELECT
        });
        console.log(`Count for ${wasteType}:`, rows); // Tambahkan log ini
        return rows[0] && rows[0].count ? rows[0].count : 0;
    };

    try {
        const organicCount = await getScanQty(id, 'organik');
        const anorganicCount = await getScanQty(id, 'anorganik');
        console.log(`Total organik: ${organicCount}, Total anorganik: ${anorganicCount}`);
        return h.response({ id, organicCount, anorganicCount }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Internal Server Error' }).code(500);
    }
};

module.exports = { registerUser, loginUser, getUser, updateUserProfile, updateUserPassword, updateScanQty, getTotalScan };