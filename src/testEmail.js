const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sendEmail } = require('./emailService');

async function validateEnv() {
  console.log('Loading .env from:', path.resolve(__dirname, '../.env'));

  const required = {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
    RECIPIENT_EMAILS: process.env.RECIPIENT_EMAILS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
  };

  console.log('\nEnvironment Variables Check:');
  let isValid = true;

  for (const [key, value] of Object.entries(required)) {
    const status = value ? '✅' : '❌';
    if (!value) isValid = false;

    if (key === 'EMAIL_APP_PASSWORD') {
      console.log(`${status} ${key}: ${value ? '********' : 'Not Set'}`);
    } else {
      console.log(`${status} ${key}: ${value || 'Not Set'}`);
    }
  }

  if (!isValid) {
    console.log('\nMake sure your .env file exists in the root directory:');
    console.log(path.resolve(__dirname, '..'));
  }

  return isValid;
}

async function testEmail() {
  console.log('Starting email test...');

  // Validate environment first
  const isValid = await validateEnv();
  if (!isValid) {
    console.error('\n❌ Environment validation failed.');
    console.log('\nRequired .env format:');
    console.log(`
# .env file for the project
EMAIL_USER=your_email_user
EMAIL_APP_PASSWORD=your_email_app_password
RECIPIENT_EMAILS=recipient1@example.com,recipient2@example.com

# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
    `);
    process.exit(1);
  }

  try {
    const testData = {
      events: [],
      changes: [
        {
          title: 'Test Performance',
          eventDate: '28. NOV. 2024',
          date: '28. NOV. 2024',
          status: 'available',
          previousStatus: 'announced',
          changeType: 'updated',
          venue: 'Main Theater',
          price: '20.00 EUR',
          purchaseLink: 'https://test-link.com',
        },
        {
          title: 'Another Test Show',
          eventDate: '29. NOV. 2024',
          date: '29. NOV. 2024',
          status: 'sold_out',
          previousStatus: 'available',
          changeType: 'updated',
          venue: 'Small Theater',
          price: '15.00 EUR',
        },
      ],
      upcomingPremieres: [
        {
          title: 'New Show Premiere',
          date: new Date('2024-12-01'),
          rawDate: '1. DEC. 2024',
          venue: 'Grand Hall',
          originalEvent: {
            purchaseLink: 'https://test-premiere-link.com',
          },
        },
      ],
      isPremiereMonth: true,
    };

    console.log('\nAttempting to send test email...');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', process.env.RECIPIENT_EMAILS);
    console.log(`Test data includes:
- ${testData.changes.length} changes
- ${testData.upcomingPremieres.length} premieres`);

    const result = await sendEmail(testData);

    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);

    console.log('\nPlease check:');
    console.log('1. Your Gmail sent folder');
    console.log('2. Recipient spam folders');
    console.log(`3. These email addresses: ${process.env.RECIPIENT_EMAILS}`);
  } catch (error) {
    console.error('\n❌ Email test failed');
    console.error('Error details:', error);

    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failed. Common issues:');
      console.error('1. EMAIL_USER might be incorrect');
      console.error('2. EMAIL_APP_PASSWORD might be invalid');
      console.error('3. 2FA needs to be enabled on Gmail account');
      console.error(
        '4. App password needs to be generated from Gmail settings'
      );
    }

    process.exit(1);
  }
}

// Run test if file is executed directly
if (require.main === module) {
  testEmail();
}

module.exports = { testEmail };
