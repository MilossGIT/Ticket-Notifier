# LGL Theater Ticket Notifier 🎭

An automated notification system that monitors ticket availability for the Ljubljana City Theatre (Lutkovno gledališče Ljubljana - LGL) and sends email alerts for ticket availability changes.

## Features 🌟

- **Live Monitoring**: Real-time tracking of ticket availability
- **Smart Notifications**: Sends email alerts for:
  - New ticket availability
  - Show premieres
  - Sold out shows (RAZPRODANO)
  - Upcoming shows
  - Status changes
- **Detailed Analytics**: Tracks and reports:
  - Total events
  - Available tickets
  - Sold out shows
  - Upcoming premieres
  - Status changes

## Tech Stack 💻

- Node.js (v22+)
- Puppeteer (Web Scraping)
- Nodemailer (Email Notifications)
- GitHub Actions (Automation)

## Prerequisites 📋

- Node.js (v22 or higher)
- Gmail account with App Password enabled
- Git

## Installation 🔧

1. Clone the repository:

```bash
git clone [repository-url]
cd NotificationAPP
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create .env file in root directory
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-16-digit-app-password
RECIPIENT_EMAILS=recipient1@gmail.com,recipient2@gmail.com
```

## Gmail Setup 📧

1. Enable 2-Step Verification:

   - Go to Google Account Security
   - Enable 2-Step Verification

2. Create App Password:
   - Go to Google Account → Security → App passwords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter "LGL Ticket Notifier"
   - Copy the generated 16-character password

## Usage 🚀

1. Run the complete check:

```bash
node src/github-action-runner.js
```

2. Test specific components:

```bash
# Test scraper
node src/test.js --scraper

# Test email
node src/test.js --email

# Run all tests
node src/test.js
```

## Automated Checking ⚡

The system runs automated checks via GitHub Actions:

- Early morning (7:00 AM CEST)
- Late morning (10:00 AM CEST)
- After lunch (1:00 PM CEST)
- Mid afternoon (4:00 PM CEST)
- Evening (7:00 PM CEST)

## Email Notifications 📬

Notifications include:

1. **New Tickets Available** (🎫)

   - Shows that just became available for purchase
   - Includes direct purchase links

2. **Upcoming Premieres** (🎭)

   - New show premieres
   - Premiere dates and venues

3. **Currently Available** (🎟️)

   - All shows with available tickets
   - Purchase links and prices

4. **Sold Out Shows** (⚠️)

   - Recently sold out performances
   - Shows marked as "RAZPRODANO"

5. **Status Updates** (📢)
   - Changes in show availability
   - Other important updates

## Troubleshooting 🔍

Common issues and solutions:

1. Email authentication errors:

   - Verify Gmail App Password
   - Check .env file location
   - Ensure no spaces in App Password

2. Scraping issues:
   - Check internet connection
   - Verify website accessibility
   - Check for website structure changes

## Contributing 🤝

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License 📄

MIT LICENSE

## Author ✍️

Milos (minicm034@gmail.com)

---

For support, issues, or feature requests, please open an issue on GitHub.
