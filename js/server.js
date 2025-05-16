const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const sgMail = require('@sendgrid/mail');
const db = require('./db');

const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

sgMail.setApiKey(''); // Replace with your actual key

app.post('/api/send-intake-form', async (req, res) => {
  const {
    childFirstName, childLastName, dateOfBirth, sex, mobile,
    parentFirstName, parentLastName, email, street, apt, city, state, zip,
    insurancePlan, policyNum, signatureData
  } = req.body;

  if (!childFirstName || !childLastName || !dateOfBirth || !sex || !mobile ||
      !parentFirstName || !parentLastName || !email || !street || !insurancePlan || !policyNum || !signatureData) {
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

    await page.goto('https://nyspecialcare.org/newclientintakeform.html', {
      waitUntil: 'networkidle0'
    });

    await page.evaluate((data) => {
      // Fill form fields
      document.getElementById('childFirstName').value = data.childFirstName;
      document.getElementById('childLastName').value = data.childLastName;
      document.getElementById('dateOfBirth').value = data.dateOfBirth;
      document.getElementById('sex').value = data.sex;
      document.getElementById('mobile').value = data.mobile;
      document.getElementById('parentFirstName').value = data.parentFirstName;
      document.getElementById('parentLastName').value = data.parentLastName;
      document.getElementById('email').value = data.email;
      document.getElementById('street').value = data.street;
      document.getElementById('apt').value = data.apt || '';
      document.getElementById('city').value = data.city || '';
      document.getElementById('state').value = data.state || '';
      document.getElementById('zip').value = data.zip || '';
      document.getElementById('insurancePlan').value = data.insurancePlan;
      document.getElementById('policyNum').value = data.policyNum;
    
      // Create wrapper for signature label and image
      const wrapper = document.createElement('div');
      wrapper.style.marginTop = '40px';
    
      const label = document.createElement('h4');
      label.innerText = 'Parent Signature (电子签名)';
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
      childFirstName,
      childLastName,
      dateOfBirth,
      sex,
      mobile,
      parentFirstName,
      parentLastName,
      email,
      street,
      apt,
      city,
      state,
      zip,
      insurancePlan,
      policyNum,
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

    // Send email with PDF attachment via SendGrid
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

    // Save to database
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
