# Theatre Ticket Notification System

An automated system that monitors the Lutkovno gledališče Ljubljana (Ljubljana Puppet Theatre) website for ticket availability and premieres. The system runs multiple times daily via GitHub Actions and sends email notifications about ticket availability, new shows, and upcoming premieres.

## Features

- **Automated Monitoring**:

  - Checks run 5 times daily:
    - 7:00 AM CEST (Early morning)
    - 10:00 AM CEST (Late morning)
    - 1:00 PM CEST (After lunch)
    - 4:00 PM CEST (Mid afternoon)
    - 7:00 PM CEST (Evening)
  - Immediate notifications for newly available tickets
  - Special monitoring for premiere events

- **Smart Detection**:

  - Tracks ticket availability changes
  - Identifies sold-out shows
  - Monitors upcoming premieres
  - Detects invitation-only events

- **Email Notifications**:
  - 🚨 Urgent alerts for newly available tickets
  - 🎭 Announcements for new premieres
  - 📢 Status change updates
  - Different color-coding for different types of notifications

## Setup Requirements

- GitHub account
- Gmail account for sending notifications
- Gmail App Password (for secure authentication)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MilossGIT/TicketNotifier.git
cd TicketNotifier
```

2. Install dependencies:

```bash
npm install
```

3. Set up GitHub Secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Add these secrets:
     - `EMAIL_USER`: Your Gmail address
     - `EMAIL_PASS`: Your Gmail App Password
     - `RECIPIENT_EMAILS`: Comma-separated email list (e.g., email1@example.com,email2@example.com)

## Gmail Setup

1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Select 'Mail' and generate password
   - Use this password for `EMAIL_PASS` secret

## Notification Types

The system sends different types of email notifications:

- **Urgent (Red)**: New tickets become available
- **New (Green)**: Upcoming premieres announced
- **Update (Yellow)**: Status changes or updates

## File Structure

```
.
├── .github/
│   └── workflows/
│       └── check-tickets.yml    # Schedule configuration
├── src/
│   ├── github-action-runner.js  # Main runner
│   ├── scraper.js              # Scraping logic
│   ├── email.js                # Email notifications
│   └── test-premiere.js        # Test script
├── package.json
└── README.md
```

## Monitoring

- View runs in the GitHub Actions tab
- Each check shows:
  - Number of events found
  - Status changes
  - New tickets available
  - Upcoming premieres
  - Any errors encountered

## Local Testing

To test the system:

```bash
# Test just email
node src/test.js --email

# Test just scraper
node src/test.js --scraper

# Test both
node src/test.js

## Status Types

- `available`: Tickets can be purchased
- `sold_out`: No tickets available
- `upcoming`: Future event
- `announced`: Just announced

## Error Handling

- Automatic retry on failure
- Error screenshots captured
- Detailed logging
- Email notifications for system issues

## Contact

Milos - minasesek@gmail.com
Project Link: [https://github.com/MilossGIT/TicketNotifier](https://github.com/MilossGIT/TicketNotifier)
```
