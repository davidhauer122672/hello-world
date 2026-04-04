# Coastal Key Treasure Coast Asset Management — Unified Operations Platform

Institutional-grade property oversight platform with appointment booking, Stripe payments, workflow automation, and AI-powered sales enablement.

## Features

- **Calendar Booking** - Interactive month-view calendar with time slot selection and double-booking prevention
- **Stripe Payments** - Secure checkout via Stripe Checkout Sessions (PCI compliant)
- **Confirmation Emails** - Automatic email sent upon successful payment via Nodemailer
- **Responsive Design** - Clean, mobile-friendly UI

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser.

## Stripe Webhook (Local Development)

To receive payment confirmations locally, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Copy the webhook signing secret to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

## Services & Pricing

| Service         | Duration | Price |
|-----------------|----------|-------|
| Consultation    | 1 hour   | $50   |
| Follow-up       | 30 min   | $30   |
| Premium Session | 2 hours  | $100  |

## How It Works

1. Client selects a date and time on the calendar
2. Fills in their details and selects a service
3. Clicks "Book & Pay" to be redirected to Stripe Checkout
4. After payment, Stripe webhook marks the appointment as paid
5. A confirmation email is automatically sent to the client

## Tech Stack

- **Backend**: Node.js, Express
- **Payments**: Stripe
- **Email**: Nodemailer (SMTP)
- **Storage**: JSON file (easily swappable for a database)
- **Frontend**: Vanilla HTML/CSS/JS
