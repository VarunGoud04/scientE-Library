const express = require('express');
const mysql = require('mysql2');
const path = require('path');

// Create an Express app
const app = express();

// Setup the MySQL connection
const db = mysql.createConnection({
    host: 'localhost',        // MySQL host (default is localhost)
    user: 'root',             // Your MySQL username
    password: 'root',             // Your MySQL password
    database: 'e_library' // Your database name
});

// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Serve static files (PDFs) from a directory
app.use('/files', express.static(path.join(__dirname, 'pdfs')));

// Route to fetch and display documents
app.get('/', (req, res) => {
    db.query('SELECT * FROM documents', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }

        // Create HTML to display the PDF links
        let html = '<h1>Document List</h1>';
        results.forEach((doc) => {
            html += `<p><a href="/files/${doc.name}" target="_blank">${doc.name}</a></p>`;
        });

        res.send(html);
    });
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
