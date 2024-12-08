const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors()); 
app.use(bodyParser.json()); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    auth: {
        user: GMAIL_USER, 
        pass: GMAIL_PASS,
    }
});


app.post('/send-email', (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    console.log('Received form data:', { firstName, lastName, email, message });

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
            console.error('Error sending email:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send email.' });
        }

        console.log('Email sent:', info.response);
        res.json({ status: 'success', message: 'Email sent successfully!' });
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});