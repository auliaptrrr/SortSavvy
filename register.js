const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Fungsi untuk mendaftarkan pengguna
async function registerUser(fullName, email, password, confirmPassword, callback) {
    if (password !== confirmPassword) {
        console.log('Passwords do not match!');
        return callback();
    }

    try {
        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('Email already exists!');
            return callback();
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan pengguna baru
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
        });

        console.log('Registration successful!');
        console.log('User Data:', newUser);

        callback();
    } catch (err) {
        console.error('Error registering user!', err);
        callback();
    }
}

// Fungsi untuk login pengguna
async function loginUser(email, password, rl) {
    try {
        // Cari pengguna berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('Email not found!');
            return promptLogin(rl); // Retry login
        }

        // Bandingkan password
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            console.log('Login successful!');
            console.log('Welcome, ' + user.fullName);
            rl.close();
        } else {
            console.log('Incorrect password!');
            promptLogin(rl); // Retry login
        }
    } catch (err) {
        console.error('Error logging in user!', err);
        promptLogin(rl); // Retry login
    }
}

// Create readline interface for interactive input
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt user for registration details
function promptRegister(rl) {
    rl.question('Enter full name: ', (fullName) => {
        rl.question('Enter email: ', (email) => {
            rl.question('Enter password: ', (password) => {
                rl.question('Confirm password: ', (confirmPassword) => {
                    registerUser(fullName, email, password, confirmPassword, () => {
                        console.log('\nPlease enter your login details:');
                        promptLogin(rl);
                    });
                });
            });
        });
    });
}

// Function to prompt user for login details
function promptLogin(rl) {
    rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', (password) => {
            loginUser(email, password, rl);
        });
    });
}

// Start the registration process
console.log('Please enter your registration details:');
promptRegister(rl);