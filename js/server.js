const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));  // Enable CORS for all origins
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
app.post('/api/send-email', (req, res) => {
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
        res.status(200).send({ message: "Email sent successfully" });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});