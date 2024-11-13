const { scrapeTickets } = require('./scraper');
const { sendEmail } = require('./emailService');
require('dotenv').config();

async function runTests(options = {}) {
  console.log('Running full system test...');
  let scrapedData = null;

  try {
    // Test scraper if no specific test is requested or if scraper test is requested
    if (!options.email) {
      console.log('Testing scraper...');
      scrapedData = await scrapeTickets();
      console.log('✅ Scraper test successful');
      console.log(`Found ${scrapedData.events.length} events`);
      console.log(`Found ${scrapedData.upcomingPremieres.length} premieres`);
    }

    // Test email if no specific test is requested or if email test is requested
    if (!options.scraper) {
      console.log('Testing email with scraped data...');

      // If we don't have scraped data, use comprehensive test data
      const testData = scrapedData || {
        events: [
          // Available show
          {
            title: 'Currently Available Show',
            eventDate: '15. DEC. 2024',
            date: '15. DEC. 2024',
            status: 'available',
            venue: 'Main Theater',
            price: '15.00 EUR',
            purchaseLink: 'https://example.com/available',
          },
          // Sold out show
          {
            title: 'Sold Out Performance',
            eventDate: '20. DEC. 2024',
            date: '20. DEC. 2024',
            status: 'sold_out',
            venue: 'Grand Hall',
            isSoldOut: true,
          },
          // Another available show
          {
            title: 'Another Available Show',
            eventDate: '25. DEC. 2024',
            date: '25. DEC. 2024',
            status: 'available',
            venue: 'Studio Theater',
            price: '20.00 EUR',
            purchaseLink: 'https://example.com/another',
          },
        ],
        changes: [
          // Newly available show
          {
            title: 'Newly Available Show',
            eventDate: '28. NOV. 2024',
            date: '28. NOV. 2024',
            status: 'available',
            previousStatus: 'announced',
            changeType: 'updated',
            venue: 'Test Venue',
            price: '25.00 EUR',
            purchaseLink: 'https://example.com/new',
          },
          // Newly sold out show
          {
            title: 'Just Sold Out Show',
            eventDate: '30. NOV. 2024',
            date: '30. NOV. 2024',
            status: 'sold_out',
            previousStatus: 'available',
            changeType: 'updated',
            venue: 'Main Stage',
            isSoldOut: true,
          },
          // Status update
          {
            title: 'Status Changed Show',
            eventDate: '5. DEC. 2024',
            date: '5. DEC. 2024',
            status: 'available',
            previousStatus: 'upcoming',
            changeType: 'updated',
            venue: 'Small Theater',
            price: '18.00 EUR',
            purchaseLink: 'https://example.com/status',
          },
        ],
        upcomingPremieres: [
          {
            title: 'Exciting New Premiere',
            rawDate: '1. DEC. 2024',
            date: new Date('2024-12-01'),
            venue: 'Grand Hall',
            originalEvent: {
              purchaseLink: 'https://example.com/premiere',
              status: 'announced',
            },
          },
          {
            title: 'Another Premiere',
            rawDate: '10. DEC. 2024',
            date: new Date('2024-12-10'),
            venue: 'Main Stage',
            originalEvent: {
              purchaseLink: 'https://example.com/another-premiere',
              status: 'available',
            },
          },
        ],
      };

      await sendEmail(testData);
      console.log('✅ Email test successful');
    }

    console.log('✅ All tests completed successfully');
  } catch (error) {
    console.error('❌ Tests failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  scraper: args.includes('--scraper'),
  email: args.includes('--email'),
};

// Run tests
if (require.main === module) {
  runTests(options);
}

module.exports = { runTests };
