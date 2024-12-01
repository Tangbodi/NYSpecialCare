const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

var options = {
    key:fs.readFileSync('/usr/share/nginx/nycert/private.key'),
    cert:fs.readFileSync('/usr/share/nginx/nycert/ssl-bundle.crt')
}
var httpsServer = https.createServer(options,app);
var httpServer = http.createServer(app);

app.use(bodyParser.json()); 

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

// Start the server
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

httpsServer.listen(3000);
httpServer.listen(3001);