const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();

require('dotenv').config();
const cors = require('cors');

app.use(cors({
    origin: 'https://nyspecialcare.org',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));


app.use(bodyParser.json()); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS, 
    }
});


// Endpoint to handle email submission
app.post('/send-email', (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;

    console.log('Received form data:', { firstName, lastName, email, phone, message });

    if (!firstName || !lastName || !phone || !email || !message) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    // Email options
    const mailOptions = {
        from: `"NY Special Care" <nyspecialcare@gmail.com>`,
        to: 'contactus@nyspecialcare.org', 
        subject: `New Contact Form Submission From: ${firstName} ${lastName}`,
        text: `You have a new message from: \n\nName: ${firstName} ${lastName} \nPhone: ${phone} \nEmail: ${email} \n\nMessage: \n\n${message}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send email.' });
        }
        console.log('Email sent:', info.response);
        res.json({ status: 'success', message: 'Email sent successfully!' });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// HTTP and HTTPS server setup
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync('/usr/share/nginx/nycert/private.key'),
    cert: fs.readFileSync('/usr/share/nginx/nycert/nyspecialcare.org.crt'),
    ca: fs.readFileSync ('/usr/share/nginx/nycert/nyspecialcare.org.ca-bundle')
}, app);

// Start the servers
httpServer.listen(8080, () => {
    console.log('HTTP server running on http://localhost:8080');
});

httpsServer.listen(8180, () => {
    console.log('HTTPS server running on https://localhost:8180');
});