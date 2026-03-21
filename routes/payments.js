const express = require('express');
const router = express.Router();
const stripe = require('../lib/stripe');
const db = require('../lib/db');
const { sendConfirmation } = require('../lib/mailer');
const sheets = require('../lib/sheets');

const PRICES = {
  consultation: { amount: 5000, label: 'Consultation (1 hour)' },
  followup: { amount: 3000, label: 'Follow-up (30 min)' },
  premium: { amount: 10000, label: 'Premium Session (2 hours)' },
};

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  const { appointmentId } = req.body;
  if (!appointmentId) return res.status(400).json({ error: 'appointmentId required' });

  const appointment = db.getAppointmentById(appointmentId);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  const price = PRICES[appointment.service];
  if (!price) return res.status(400).json({ error: 'Unknown service type' });

  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: price.label },
            unit_amount: price.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: appointment.email,
      metadata: { appointmentId: appointment.id },
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/book.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
});

// Check session status
router.get('/session-status', async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const appointmentId = session.metadata.appointmentId;
    const appointment = db.getAppointmentById(appointmentId);

    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      appointment,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// Webhook handler (mounted separately with raw body)
async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const appointmentId = session.metadata.appointmentId;

    if (appointmentId) {
      const appointment = db.updateAppointment(appointmentId, { paid: true });
      if (appointment) {
        console.log(`Payment confirmed for appointment ${appointmentId}`);
        await sendConfirmation(appointment);
        sheets.updatePaymentStatus(appointmentId).catch(() => {});
      }
    }
  }

  res.json({ received: true });
}

module.exports = { router, webhookHandler };
