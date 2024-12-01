const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors({
    origin: 'https://www.nyspecialcare.org', 
}));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// Email submission endpoint
app.post('/send-email', (req, res) => {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    const mailOptions = {
        from: 'nyspecialcare@gmail.com',
        to: 'bodi.tang@nyspecialcare.org',
        subject: `New Contact Form Submission From: ${firstName} ${lastName}`,
        text: `You have a new message from ${firstName} ${lastName} (${email}):\n\n${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ status: 'error', message: 'Failed to send email.' });
        }
        res.json({ status: 'success', message: 'Email sent successfully!' });
    });
});


https.createServer(options, app).listen(3000, () => {
    console.log('HTTPS Server running on https://localhost:3000');
});
