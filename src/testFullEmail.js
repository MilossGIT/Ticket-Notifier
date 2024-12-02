const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sendEmail } = require('./emailService');

async function runFullTest() {
  console.log('Starting comprehensive email test...');

  // Create a complete test dataset
  const testData = {
    events: [],
    changes: [
      // New Available Tickets
      {
        title: 'MIŠEK JULIJAN, izven',
        date: 'TOR., 26. NOV. 2024, OB 17:30',
        status: 'available',
        previousStatus: 'upcoming',
        changeType: 'updated',
        venue: 'Mali oder LGL',
        price: '5.00 EUR',
        purchaseLink: 'https://test-link.com/tickets/1',
      },
      {
        title: 'MACBETH, Abonma 15+ in izven',
        date: 'TOR., 26. NOV. 2024, OB 18:00',
        status: 'available',
        previousStatus: 'announced',
        changeType: 'updated',
        venue: 'Tunel LGL',
        price: '5.00 EUR',
        purchaseLink: 'https://test-link.com/tickets/2',
      },
      // Status Updates
      {
        title: 'OBISK, izven',
        date: 'SOB., 30. NOV. 2024, OB 10:30',
        status: 'sold_out',
        previousStatus: 'available',
        changeType: 'updated',
        venue: 'Oder pod zvezdami LGL',
        price: '5.00 EUR',
      },
      // Completely New Show
      {
        title: 'TRANSPORT: ODHOD, izven',
        date: 'PET., 29. NOV. 2024, OB 19:30',
        status: 'announced',
        changeType: 'new',
        venue: 'Veliki oder LGL',
        price: '5.00 EUR',
      },
    ],
    upcomingPremieres: [
      {
        title: 'PISMA Z ROBA GOZDA, premiera in izven',
        date: new Date('2024-11-28T18:00:00'),
        venue: 'Veliki oder LGL',
        rawDate: '28. NOV. 2024',
        originalEvent: {
          purchaseLink: 'https://test-link.com/premiere/1',
        },
      },
      {
        title: 'NOVA PREDSTAVA, premiera',
        date: new Date('2024-12-15T19:30:00'),
        venue: 'Mali oder LGL',
        rawDate: '15. DEC. 2024',
        originalEvent: {
          status: 'announced',
        },
      },
    ],
    isPremiereMonth: true,
  };

  try {
    console.log('\nTest Data Summary:');
    console.log(
      '- New Available Tickets:',
      testData.changes.filter((e) => e.status === 'available').length
    );
    console.log(
      '- Status Updates:',
      testData.changes.filter((e) => e.changeType === 'updated').length
    );
    console.log(
      '- New Shows:',
      testData.changes.filter((e) => e.changeType === 'new').length
    );
    console.log('- Upcoming Premieres:', testData.upcomingPremieres.length);

    console.log('\nAttempting to send test email...');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', process.env.RECIPIENT_EMAILS);

    const result = await sendEmail(testData);

    console.log('\n✅ Full test email sent successfully!');
    console.log('Message ID:', result.messageId);

    console.log('\nEmail sent with:');
    console.log('- Newly Available Tickets Section');
    console.log('- Status Updates Section');
    console.log('- Upcoming Premieres Section');
    console.log('- Premier Month Notice');

    console.log('\nPlease check your email to verify:');
    console.log('1. All sections are properly formatted');
    console.log('2. Links are working correctly');
    console.log('3. Dates are correctly formatted');
    console.log('4. Status changes are clear');
    console.log('5. Premier month notice is visible');
  } catch (error) {
    console.error('\n❌ Test email failed');
    console.error('Error details:', error);

    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failed. Please check:');
      console.error('1. EMAIL_USER is correct');
      console.error('2. EMAIL_APP_PASSWORD is valid');
      console.error('3. 2FA is enabled on Gmail account');
      console.error('4. SMTP settings are correct');
    }

    process.exit(1);
  }
}

// Run the full test if this file is executed directly
if (require.main === module) {
  runFullTest();
}

module.exports = { runFullTest };
