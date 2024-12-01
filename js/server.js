const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse JSON request bodies

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    auth: {
        user: 'nyspecialcare@gmail.com', // Replace with your Microsoft 365 email
        pass: 'qdrc sgum kqan qszy', // Use the password or app password for the mailbox
    }
});


// Endpoint to handle email submission
app.post('/send-email', (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    console.log('Received form data:', { firstName, lastName, email, message });

    if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    // Email options
    const mailOptions = {
        from: 'nyspecialcare@gmail.com',
        to: 'bodi.tang@nyspecialcare.org', 
        subject: `New Contact Form Submission From: ${firstName} ${lastName}`,
        text: `You have a new message from ${firstName} ${lastName} (${email}):\n\n${message}`,
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

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on https://165.227.120.217:${PORT}`);
});
