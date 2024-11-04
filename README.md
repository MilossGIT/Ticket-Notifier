# Ticket Notification System

This project is an automated ticket availability checker and notifier for the Lutkovno gledališče Ljubljana (Ljubljana Puppet Theatre) website. It uses GitHub Actions to automatically scrape the website for ticket information and sends daily email notifications about available tickets.

## Features

* Automated daily checks using GitHub Actions
* Scrapes the Lutkovno gledališče Ljubljana website for ticket information
* Filters and processes event data
* Sends daily email notifications with available ticket information
* Supports multiple email recipients
* Runs in the cloud - no local server needed
* Error logging and screenshot capture for troubleshooting

## How It Works

The system runs automatically every day at 9:00 AM CEST using GitHub Actions. It:
1. Scrapes the theatre website for available tickets
2. Processes and filters the event data
3. Sends email notifications with available ticket information
4. Captures screenshots and logs for troubleshooting if errors occur

## Prerequisites

To set up this project, you need:
* A GitHub account
* A Gmail account for sending notifications
* Gmail App Password (regular password won't work with 2FA)

## Setup Instructions

1. Fork or clone this repository:
```bash
git clone https://github.com/MilossGIT/TicketNotifier.git
cd TicketNotifier
```

2. Set up GitHub Secrets:
   - Go to your repository's Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `EMAIL_USER`: Your Gmail address
     - `EMAIL_PASS`: Your Gmail App Password
     - `RECIPIENT_EMAILS`: Comma-separated list of recipient emails

3. The GitHub Action workflow is already configured to run daily at 9:00 AM CEST.

## Generating a Gmail App Password

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll to the bottom and click on "App passwords"
4. Generate a new app password for "Mail"
5. Use this password for the `EMAIL_PASS` secret

## Configuration

### Modifying the Schedule

To change when the checker runs, modify the cron schedule in `.github/workflows/check-tickets.yml`:
```yaml
schedule:
  - cron: '0 9 * * *'  # Runs at 9:00 AM CEST
```

### Email Recipients

Update the `RECIPIENT_EMAILS` secret in your GitHub repository settings. Format:
```
email1@example.com,email2@example.com
```

## Monitoring

* Go to the "Actions" tab in your GitHub repository to monitor runs
* Each run will show detailed logs and any error screenshots
* GitHub keeps logs for 90 days

## Troubleshooting

* **Emails not sending**: Verify your Gmail App Password and email settings
* **Scraping fails**: Check the Actions logs for error screenshots and details
* **Schedule issues**: Remember times are in CEST (UTC+2)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Milos / minicm034@gmail.com

Project Link: https://github.com/MilossGIT/TicketNotifier
