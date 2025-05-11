const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const sgMail = require('@sendgrid/mail');
const db = require('./db');

const app = express();

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

sgMail.setApiKey('YOUR_SENDGRID_API_KEY'); // Replace with your actual key

app.post('/api/send-intake-form', async (req, res) => {
  const {
    childFirstName, childLastName, dateOfBirth, sex, mobile,
    parentFirstName, parentLastName, email, street, apt, city, state, zip,
    insurancePlan, policyNum
  } = req.body;

  if (!childFirstName || !childLastName || !dateOfBirth || !sex || !mobile ||
      !parentFirstName || !parentLastName || !email || !street || !insurancePlan || !policyNum) {
    return res.status(400).json({ status: 'error', message: 'Required fields are missing.' });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const capitalizedChildFirstName = capitalize(childFirstName);
  const capitalizedChildLastName = capitalize(childLastName);
  const capitalizedParentFirstName = capitalize(parentFirstName);
  const capitalizedParentLastName = capitalize(parentLastName);
  const capitalizedInsurancePlan = capitalize(insurancePlan);

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Replace this with your live, publicly accessible intake form URL
    await page.goto('https://nyspecialcare.org/newclientintakeform.html', {
      waitUntil: 'networkidle0'
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    await sgMail.send({
      to: 'contactus@nyspecialcare.org',
      from: 'contactus@nyspecialcare.org', // Must be verified in SendGrid
      subject: `New Intake Form Submission: ${capitalizedChildFirstName} ${capitalizedChildLastName}`,
      text: 'A new intake form has been submitted. Please see the attached PDF.',
      attachments: [
        {
          content: Buffer.from(pdfBuffer).toString('base64'), 
          filename: 'intake-form.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });

    const insertQuery = `
      INSERT INTO intake_forms (
        child_first_name, child_last_name, child_date_of_birth, child_sex, mobile, parent_first_name,
        parent_last_name, email, street, apt, city, state, zip, insurance_plan, policy_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(insertQuery, [
      capitalizedChildFirstName,
      capitalizedChildLastName,
      dateOfBirth,
      sex,
      mobile,
      capitalizedParentFirstName,
      capitalizedParentLastName,
      email,
      street,
      apt,
      city,
      state,
      zip,
      capitalizedInsurancePlan,
      policyNum
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Form submitted, emailed, and saved successfully.'
    });

  } catch (error) {
    console.error('Error in send-intake-form:', error);
    if (error.response?.body?.errors) {
      console.error('SendGrid API errors:', error.response.body.errors);
    }
    res.status(500).json({ status: 'error', message: 'Submission failed. Please try again later.' });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
