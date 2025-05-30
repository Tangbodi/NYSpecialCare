const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const db = require('./db');
const puppeteer = require('puppeteer');
const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

sgMail.setApiKey(''); // Replace with your actual API key

// Contact form endpoint
app.post('/api/send-email', (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !phone || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
  }

  const msg = {
    to: 'contactus@nyspecialcare.org',
    from: 'contactus@nyspecialcare.org',
    subject: `New Contact Form Submission From: ${firstName} ${lastName}`,
    text: `You have a new message:\n\nName: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n\n${message}`,
  };

  sgMail
    .send(msg)
    .then(() => res.status(200).send({ message: "Email sent successfully" }))
    .catch((error) => {
      console.error('Error sending email:', error);
      res.status(500).json({ status: 'error', message: 'Failed to send email.' });
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

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  const capitalizedChildFirstName = capitalizeFirstLetter(childFirstName);
  const capitalizedChildLastName = capitalizeFirstLetter(childLastName);
  const capitalizedParentFirstName = capitalizeFirstLetter(parentFirstName);
  const capitalizedParentLastName = capitalizeFirstLetter(parentLastName);
  const capitalizedInsurancePlan = capitalizeFirstLetter(insurancePlan);

  const msg = {
    to: 'contactus@nyspecialcare.org',
    from: 'contactus@nyspecialcare.org',
    subject: `New Intake Form Submission For: ${capitalizedChildFirstName} ${capitalizedChildLastName}`,
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

  try {
    await sgMail.send(msg);

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
  } catch (err) {
    console.error('Error processing intake form:', err);
    res.status(500).json({ status: 'error', message: 'Form submission failed.' });
  }
});

//Agreement Endpoint
app.post('/api/send-agreement-consent-form', async (req, res) => {
  const { childFullName, parentFullName, dateOfBirth, parentPrintedName, dateOfSign, signatureData } = req.body;

  if (!childFullName || !parentFullName || !dateOfBirth || !parentPrintedName || !dateOfSign || !signatureData) {
    return res.status(400).json({ status: 'error', message: 'Required fields are missing.' });
  }

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto('http://127.0.0.1:5500/abaserviceagreementandconsentform.html', {
      waitUntil: 'networkidle0'
    });

    await page.evaluate((data) => {
      // Fill form fields
      document.getElementById('childFullName').value = data.childFullName;
      document.getElementById('parentFullName').value = data.parentFullName;
      document.getElementById('dateOfBirth').value = data.dateOfBirth;
      document.getElementById('parentPrintedName').value = data.parentPrintedName;
      document.getElementById('dateOfSign').value = data.dateOfSign;

      // Remove the entire signature section
      const signatureSection = document.getElementById('signature-pad')?.parentElement;
      if (signatureSection) signatureSection.remove();

      // Remove the submit and clear signature buttons
      document.getElementById('clear-signature')?.remove();
      document.querySelector('button[type="submit"]')?.remove();
      
      // Add a clean static signature section
      const wrapper = document.createElement('div');
      wrapper.style.marginTop = '40px';

      const label = document.createElement('h4');
      label.innerText = 'Parent Signature';
      label.style.marginBottom = '10px';
      label.style.fontWeight = 'bold';
      label.style.color = '#333';

      const sigImg = document.createElement('img');
      sigImg.src = data.signatureData;
      sigImg.style.maxWidth = '300px';
      sigImg.style.border = '1px solid #ccc';
      sigImg.alt = 'Parent Signature';

      wrapper.appendChild(label);
      wrapper.appendChild(sigImg);

      document.querySelector('form').appendChild(wrapper);
    }, {
      childFullName,
      parentFullName,
      dateOfBirth,
      parentPrintedName,
      dateOfSign,
      signatureData
    });

    // Optional: wait for a short delay to ensure DOM updates
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    await sgMail.send({
      to: 'contactus@nyspecialcare.org',
      from: 'contactus@nyspecialcare.org',
      subject: `New ABA Service Agreement and Consent Form Submission: ${childFullName}`,
      text: 'A new ABA service agreement and consent form has been submitted. Please see the attached PDF.',
      attachments: [
        {
          content: Buffer.from(pdfBuffer).toString('base64'),
          filename: 'agreement-consent-form.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });
    res.status(200).json({ status: 'success', message: 'Form submitted successfully.' });

  } catch (error) {
    console.error('Error in send-agreement-consent-form:', error);
    if (error.response?.body?.errors) {
      console.error('SendGrid API errors:', error.response.body.errors);
    }
    res.status(500).json({ status: 'error', message: 'Submission failed. Please try again later.' });
  } 

});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// Start server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});