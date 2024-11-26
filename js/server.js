const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse JSON request bodies

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider's service (e.g., Gmail, Outlook)
    auth: {
        user: 'tangbodi@gmail.com', // Replace with your email
        pass: 'yxzk lpzp chlu bccc', // Replace with your email password or app password
    },
});

// Endpoint to handle email submission
app.post('/send-email', (req, res) => {
    const { name, email, subject, message } = req.body;

    console.log('Received form data:', { name, email, subject, message });

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    // Email options
    const mailOptions = {
        from: email, // Sender's email
        to: 'tangbodi@gmail.com', // Your email to receive messages
        subject: `New Contact Form Submission: ${subject}`,
        text: `You have a new message from ${name} (${email}):\n\n${message}`,
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
    console.log(`Server is running on http://localhost:${PORT}`);
});
