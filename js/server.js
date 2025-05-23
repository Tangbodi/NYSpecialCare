const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const db = require('./db');
const puppeteer = require('puppeteer');
const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 2525, // or 587 if you prefer TLS
  secure: false, // true for port 465, false for port 587
  auth: {
    user: 'apikey', // this is literally the word 'apikey'
    pass: '' // your actual SendGrid API key
  }
});
// Contact form endpoint
app.post('/api/send-email', (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !phone || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
  }

  const mailOptions = {
    from: `"NY Special Care" <contactus@nyspecialcare.org>`,
    to: 'contactus@nyspecialcare.org',
    subject: `New Contact Form Submission From: ${firstName} ${lastName}`,
    text: `You have a new message:\n\nName: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to send email.' });
    }

    // console.log('Email sent:', info.response);
    res.status(200).send({ message: "Email sent successfully" });
  });
});

// Intake form endpoint
app.post('/api/send-intake-form', async (req, res) => {
  const {
    childFirstName, childLastName, dateOfBirth, sex, mobile,
    parentFirstName, parentLastName, email, street, apt, city, state, zip,
    insurancePlan, policyNum
  } = req.body;

  if (!childFirstName || !childLastName || !dateOfBirth || !sex || !mobile || !parentFirstName || !parentLastName || !email || !street || !insurancePlan || !policyNum) {
    return res.status(400).json({ status: 'error', message: 'Required fields are missing.' });
  }
  // Helper to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  const capitalizedChildFirstName = capitalizeFirstLetter(childFirstName);
  const capitalizedChildLastName = capitalizeFirstLetter(childLastName);
  const capitalizedParentFirstName = capitalizeFirstLetter(parentFirstName);
  const capitalizedParentLastName = capitalizeFirstLetter(parentLastName);
  const capitalizedInsurancePlan = capitalizeFirstLetter(insurancePlan);

  const mailOptions = {
    from: `"NY Special Care" <contactus@nyspecialcare.org>`,
    to: 'contactus@nyspecialcare.org',
    subject: `New Intake Form Submission For: ${childFirstName} ${childLastName}`,
    text: `
      You have a new intake form submission:
      Child: ${capitalizedChildFirstName} ${capitalizedChildLastName}
      Parent: ${capitalizedParentFirstName} ${capitalizedParentLastName}
      DOB: ${dateOfBirth}
      Sex: ${sex}
      Phone: ${mobile}
      Email: ${email}
      Street: ${street} 
      Apt: ${apt} 
      City: ${city} 
      State: ${state} 
      Zip: ${zip} 
      Insurance: ${capitalizedInsurancePlan}
      Policy #: ${policyNum}
    `
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.error('Error sending form:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to send form.' });
    }
    try {
      const insertQuery = `
        INSERT INTO intake_forms (
          child_first_name, child_last_name, child_date_of_birth, child_sex, mobile, parent_first_name, parent_last_name,
          email, street, apt, city, state, zip, insurance_plan, policy_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(insertQuery, [
        capitalizedChildFirstName, capitalizedChildLastName, dateOfBirth, sex, mobile,
        capitalizedParentFirstName, capitalizedParentLastName, email, street, apt, city, state, zip, capitalizedInsurancePlan, policyNum
      ]);

      res.status(200).json({ status: 'success', message: 'Form submitted and saved successfully.' });
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      res.status(500).json({ status: 'error', message: 'Form sent, but failed to save to database.' });
    }

  });
});



// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});