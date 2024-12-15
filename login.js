app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query to check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Error checking email');
        }

        if (result.length === 0) {
            // If no user is found, send a custom message
            return res.status(400).send('Kindly register if not registered, or kindly login if already registered');
        }

        // Compare the entered password with the stored hashed password
        bcrypt.compare(password, result[0].password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Error comparing passwords');
            }

            if (!isMatch) {
                // If the password doesn't match, send a custom message
                return res.status(400).send('Kindly register if not registered, or kindly login if already registered');
            }

            // If the email and password match
            res.send('Login successful!');
        });
    });
});
