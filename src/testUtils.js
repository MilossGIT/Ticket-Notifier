const generateTestEvent = (overrides = {}) => ({
  title: 'Test Event',
  date: '14. NOV. 2024',
  eventDate: '14. NOV. 2024',
  status: 'available',
  venue: 'Test Venue',
  price: '10.00 EUR',
  changeType: 'new',
  purchaseLink: 'https://example.com',
  previousStatus: null,
  isPremiere: false,
  ...overrides,
});

const generateTestPremiere = (overrides = {}) => ({
  title: 'Test Premiere',
  date: new Date(),
  venue: 'Test Venue',
  status: 'announced',
  originalEvent: {
    purchaseLink: 'https://example.com',
    price: '20.00 EUR',
    status: 'announced',
    ...overrides.originalEvent,
  },
  ...overrides,
});

module.exports = {
  generateTestEvent,
  generateTestPremiere,
};
