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

    // console.log('Received form data:', { firstName, lastName, email, phone, message });

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

        // console.log('Email sent:', info.response);
        res.status(200).send({ message: "Email sent successfully" });
    });
});


// Endpoint to handle intake form submission
app.post('/api/send-intake-form', (req, res) => {
    const { childFirstName, childLastName, dateOfBirth, sex, mobile, diagnosisCode, dateOfDiagnosis, parentFirstName, parentLastName, email, street, apt, city, state, zip, insurancePlan, policyNum } = req.body;
    console.log('Received form data:', { childFirstName, childLastName, dateOfBirth, sex, mobile, diagnosisCode, dateOfDiagnosis, email, street, apt, city, state, zip, insurancePlan, policyNum });
    if (!childFirstName || !childLastName || !dateOfBirth || !sex || !mobile || !dateOfDiagnosis || !diagnosisCode || !parentFirstName || !parentLastName || !email || !street || !city || !state || !zip || !insurancePlan || !policyNum) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }
    const mailOptions = {
        from: `"NY Special Care" <nyspecialcare@gmail.com>`,
        to: 'contactus@nyspecialcare.org',
        subject: `New Intake Form Submission For: ${childFirstName} ${childLastName}`,
        text: `You have a new intake form submission:
        \nChild's Name: ${childFirstName} ${childLastName} 
        \nParent's Name: ${parentFirstName} ${parentLastName} 
        \nDate of Birth: ${dateOfBirth} 
        \nSex: ${sex} 
        \nDiagnosis Code: ${diagnosisCode} 
        \nDate of Diagnosis: ${dateOfDiagnosis} 
        \nPhone: ${mobile} 
        \nEmail: ${email} 
        \nStreet: ${street} 
        \nApt: ${apt} 
        \nCity: ${city} 
        \nState: ${state} 
        \nZip: ${zip} 
        \nInsurance Plan: ${insurancePlan} 
        \nPolicy Number: ${policyNum}`
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending form:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send form.' });
        }
        // console.log('Email sent:', info.response);
        res.status(200).send({ message: "Form sent successfully" });
    });
})
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);  // Log the entire error
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});