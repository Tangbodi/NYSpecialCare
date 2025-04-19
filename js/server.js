const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Set your SendGrid API key
sgMail.setApiKey(''); // Replace with your real API key

// Email handler
app.post('/api/send-email', (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !phone || !email || !message) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    const msg = {
        to: 'contactus@nyspecialcare.org',
        from: 'nyspecialcare@gmail.com',
        subject: `New Contact Form Submission From: ${firstName} ${lastName}`,
        text: `You have a new message from:
Name: ${firstName} ${lastName}
Phone: ${phone}
Email: ${email}

Message:
${message}`
    };

    sgMail.send(msg)
        .then(() => {
            res.status(200).send({ message: "Email sent successfully" });
        })
        .catch((error) => {
            console.error('SendGrid error:', error.response?.body || error.message);
            res.status(500).json({ status: 'error', message: 'Failed to send email.' });
        });
});

// Intake form handler
app.post('/api/send-intake-form', (req, res) => {
    const data = req.body;
    const requiredFields = ['childFirstName', 'childLastName', 'dateOfBirth', 'sex', 'mobile', 'diagnosisCode', 'dateOfDiagnosis', 'parentFirstName', 'parentLastName', 'email', 'street', 'city', 'state', 'zip', 'insurancePlan', 'policyNum'];

    for (const field of requiredFields) {
        if (!data[field]) {
            return res.status(400).json({ status: 'error', message: `Missing field: ${field}` });
        }
    }

    const msg = {
        to: 'contactus@nyspecialcare.org',
        from: 'nyspecialcare@gmail.com',
        subject: `New Intake Form Submission For: ${data.childFirstName} ${data.childLastName}`,
        text: `You have a new intake form submission:

Child's Name: ${data.childFirstName} ${data.childLastName}
Parent's Name: ${data.parentFirstName} ${data.parentLastName}
Date of Birth: ${data.dateOfBirth}
Sex: ${data.sex}
Diagnosis Code: ${data.diagnosisCode}
Date of Diagnosis: ${data.dateOfDiagnosis}
Phone: ${data.mobile}
Email: ${data.email}
Street: ${data.street}
Apt: ${data.apt}
City: ${data.city}
State: ${data.state}
Zip: ${data.zip}
Insurance Plan: ${data.insurancePlan}
Policy Number: ${data.policyNum}`
    };

    sgMail.send(msg)
        .then(() => {
            res.status(200).send({ message: "Form sent successfully" });
        })
        .catch((error) => {
            console.error('SendGrid error:', error.response?.body || error.message);
            res.status(500).json({ status: 'error', message: 'Failed to send form.' });
        });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
