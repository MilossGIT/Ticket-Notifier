const { sendEmail } = require('./emailService');

async function testEmail() {
  console.log('Testing email service...');

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
      ],
      upcomingPremieres: [
        {
          title: 'New Show Premiere',
          rawDate: '1. DEC. 2024',
          venue: 'Grand Hall',
          originalEvent: {
            purchaseLink: 'https://test-premiere-link.com',
          },
        },
      ],
    };

    console.log('Using email configuration:');
    console.log('- From:', process.env.EMAIL_USER);
    console.log('- To:', process.env.RECIPIENT_EMAILS);

    await sendEmail(testData);
    console.log('✅ Email test completed successfully');
  } catch (error) {
    console.error('❌ Email test failed:', error);
    process.exit(1);
  }
}

// Run test if file is executed directly
if (require.main === module) {
  testEmail();
}

module.exports = { testEmail };
