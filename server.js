require('dotenv').config();

// Use the environment variables
const dbHost = process.env.localhost;
const dbUser = process.env.root;
const dbPassword = process.env.root;
const dbName = process.env.e_library;
const PORT = process.env.PORT || 3000;


const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 3000;

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',  // Replace with your MySQL password
    database: 'e_library' // Ensure this database exists
});

// Middleware to parse URL-encoded data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files (CSS, images, etc.)
app.use(express.static('public'));

// Route to serve the home page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the register page (GET request)
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Handle registration form submission (POST request)
app.post('/register', (req, res) => {
    const { name, email, password, university, college, regulation, branch } = req.body;

    // Check if the user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], (err, result) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Error checking user');
        }

        if (result.length > 0) {
            return res.status(400).send('User already exists!');
        }

        // Hash the password before storing it
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Error hashing password');
            }

            // Insert the new user into the database
            const insertQuery = 'INSERT INTO users (name, email, password, university, college, regulation, branch) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(insertQuery, [name, email, hashedPassword, university, college, regulation, branch], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).send('Error inserting user');
                }

                // Redirect to the login page after successful registration
                res.redirect('/login');
            });
        });
    });
});

// Route for login page (GET request)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login form submission (POST request)
app.post('/login', (req, res) => {
    const { email, password, regulation } = req.body;

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Error checking email');
        }

        if (result.length === 0) {
            // If no user is found
            return res.status(400).send('Login details mismatched, kindly register or check your credentials');
        }

        // Compare the entered password with the stored hashed password
        bcrypt.compare(password, result[0].password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Error comparing passwords');
            }

            if (!isMatch) {
                // If passwords don't match
                return res.status(400).send('Login details mismatched, kindly register or check your credentials');
            }

            // If the email and password are correct, check the regulation selected
            if (regulation === 'R18') {
                // Redirect to courses18.html for R18 regulation
                return res.redirect('/courses18');
            } else if (regulation === 'R22') {
                // Redirect to courses.html for R22 regulation
                return res.redirect('/courses');
            } else {
                // If no regulation is selected or it's invalid, handle the error
                return res.status(400).send('Invalid regulation selected');
            }
        });
    });
});

// Route for courses page (R18)
app.get('/courses18', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'courses18.html'));
});

// Route for courses page (R22)
app.get('/courses', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'courses.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
