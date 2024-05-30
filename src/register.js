const bcrypt = require('bcryptjs');
const readline = require('readline');

let users = [];

function registerUser(fullName, email, password, confirmPassword) {
    if (password !== confirmPassword) {
        console.log('Passwords do not match!');
        return;
    }

    bcrypt.hash(password, 10, function(err, hashedPassword) {
        if (err) {
            console.log('Error hashing password!', err);
            return;
        }

        // Simulate storing user data
        const userData = {
            fullName: fullName,
            email: email,
            password: hashedPassword
        };

        // Store the user in the global array
        users.push(userData);

        // Simulate successful registration
        console.log('Registration successful!');
        console.log('User Data:', userData);
    });
}

function loginUser(email, password, rl) {
    const user = users.find(user => user.email === email);
    if (!user) {
        console.log('User not found!');
        return promptLogin(rl); // Retry login
    }

    bcrypt.compare(password, user.password, function(err, result) {
        if (err) {
            console.log('Error comparing passwords!', err);
            return;
        }

        if (result) {
            console.log('Login successful!');
            console.log('Welcome, ' + user.fullName);
            rl.close();
        } else {
            console.log('Incorrect password!');
            promptLogin(rl); // Retry login
        }
    });
}

// Create readline interface for interactive input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt user for login details
function promptLogin(rl) {
    rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', (password) => {
            loginUser(email, password, rl);
        });
    });
}

// Simulate user registration for testing
const fullName = 'Capstone Test';
const email = 'capstoneee@mail.com';
const password = 'password12340';
const confirmPassword = 'password12340';

registerUser(fullName, email, password, confirmPassword);

// Simulate a delay to ensure the user is registered before prompting for login
setTimeout(() => {
    console.log('\nPlease enter your login details:');
    promptLogin(rl);
}, 2000);