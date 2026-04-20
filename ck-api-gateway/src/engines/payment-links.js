/**
 * Payment Link Engine — Coastal Key Client Billing
 *
 * Generates Stripe payment links for service tier selection.
 * Links are embedded in every client-facing dashboard once
 * a service tier is selected.
 *
 * Service Tiers:
 *   Select  — $195/month (Standard home watch, weekly visits)
 *   Premier — $295/month (Enhanced management with concierge)
 *   Platinum — $395/month (Full luxury management, 24/7 coverage)
 *
 * One-time services:
 *   Hurricane Prep — $350
 *   Deep Inspection — $150
 *   Onboarding Setup — $250
 *
 * Secrets required (placeholder refs — populate via wrangler secret put):
 *   STRIPE_SECRET_KEY — Stripe API secret key
 *   STRIPE_PUBLISHABLE_KEY — Stripe publishable key (for client-side)
 *   STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret
 */

// ── Service Tiers ──────────────────────────────────────────────────────────

export const SERVICE_TIERS = {
  select: {
    id: 'tier-select',
    name: 'Select',
    price: 19500,
    displayPrice: '$195',
    interval: 'month',
    description: 'Standard home watch with weekly property visits, photo documentation, and digital reports.',
    features: [
      'Weekly property inspections',
      'Photo-backed digital reports',
      'GPS-timestamped documentation',
      'Email alerts for issues detected',
      'Basic vendor coordination',
      'AI-powered risk monitoring',
    ],
    stripePriceId: '{STRIPE_PRICE_SELECT}',
  },
  premier: {
    id: 'tier-premier',
    name: 'Premier',
    price: 29500,
    displayPrice: '$295',
    interval: 'month',
    description: 'Enhanced property management with concierge services, priority response, and insurer-grade compliance.',
    features: [
      'Everything in Select',
      'Bi-weekly inspections',
      'Concierge services coordination',
      'Priority emergency response',
      'Insurance-compliant reporting',
      'Vendor management and oversight',
      'Monthly financial summary',
      'Predictive maintenance alerts',
    ],
    stripePriceId: '{STRIPE_PRICE_PREMIER}',
  },
  platinum: {
    id: 'tier-platinum',
    name: 'Platinum',
    price: 39500,
    displayPrice: '$395',
    interval: 'month',
    description: 'Full luxury property management with 24/7 coverage, personal concierge, and white-glove service.',
    features: [
      'Everything in Premier',
      '24/7 monitoring and response',
      'Personal concierge assigned',
      'White-glove move-in/move-out',
      'Hurricane preparation and recovery',
      'Full vendor lifecycle management',
      'Real-time AI dashboard access',
      'Quarterly property health review',
      'Direct CEO communication line',
    ],
    stripePriceId: '{STRIPE_PRICE_PLATINUM}',
  },
};

// ── One-Time Services ──────────────────────────────────────────────────────

export const ONE_TIME_SERVICES = {
  hurricanePrep: {
    id: 'svc-hurricane-prep',
    name: 'Hurricane Preparation Package',
    price: 35000,
    displayPrice: '$350',
    description: 'Complete hurricane preparation: shutter installation, debris clearing, supply staging, post-storm inspection.',
    stripePriceId: '{STRIPE_PRICE_HURRICANE}',
  },
  deepInspection: {
    id: 'svc-deep-inspection',
    name: 'Deep Property Inspection',
    price: 15000,
    displayPrice: '$150',
    description: 'Comprehensive 2-hour property inspection covering all systems: HVAC, plumbing, electrical, roof, foundation.',
    stripePriceId: '{STRIPE_PRICE_INSPECTION}',
  },
  onboarding: {
    id: 'svc-onboarding',
    name: 'New Client Onboarding',
    price: 25000,
    displayPrice: '$250',
    description: 'Full property onboarding: baseline inspection, key exchange, vendor setup, system configuration, welcome package.',
    stripePriceId: '{STRIPE_PRICE_ONBOARDING}',
  },
};

// ── Payment Link Generator ─────────────────────────────────────────────────

export async function createPaymentLink(env, serviceId, clientEmail = null) {
  const allServices = { ...SERVICE_TIERS, ...ONE_TIME_SERVICES };
  const service = allServices[serviceId];

  if (!service) {
    return { error: 'Unknown service: ' + serviceId + '. Valid: ' + Object.keys(allServices).join(', ') };
  }

  if (!env.STRIPE_SECRET_KEY) {
    return {
      service,
      paymentLink: null,
      status: 'STRIPE_NOT_CONFIGURED',
      manualInstructions: {
        message: 'Stripe is not configured. Set STRIPE_SECRET_KEY via wrangler secret put.',
        setupSteps: [
          '1. Go to stripe.com → Dashboard → API Keys',
          '2. Copy the Secret Key (sk_live_...)',
          '3. Run: wrangler secret put STRIPE_SECRET_KEY',
          '4. Create Products and Prices in Stripe for each tier',
          '5. Update stripePriceId values in this engine',
        ],
      },
    };
  }

  const isRecurring = !!service.interval;

  const lineItem = {
    price: service.stripePriceId,
    quantity: 1,
  };

  const sessionParams = {
    mode: isRecurring ? 'subscription' : 'payment',
    line_items: [lineItem],
    success_url: 'https://coastalkey-pm.com/payment-success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://coastalkey-pm.com/pricing',
    payment_method_types: ['card'],
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    metadata: {
      serviceId: service.id,
      serviceName: service.name,
      source: 'coastal-key-api',
    },
  };

  if (clientEmail) {
    sessionParams.customer_email = clientEmail;
  }

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encodeStripeParams(sessionParams),
    });

    const session = await res.json();

    if (session.error) {
      return { error: session.error.message, service };
    }

    return {
      service,
      paymentLink: session.url,
      sessionId: session.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'LINK_CREATED',
    };
  } catch (err) {
    return { error: 'Stripe API error: ' + err.message, service };
  }
}

function encodeStripeParams(obj, prefix = '') {
  const parts = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? prefix + '[' + key + ']' : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object') {
          parts.push(encodeStripeParams(item, fullKey + '[' + i + ']'));
        } else {
          parts.push(encodeURIComponent(fullKey + '[' + i + ']') + '=' + encodeURIComponent(item));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      parts.push(encodeStripeParams(value, fullKey));
    } else {
      parts.push(encodeURIComponent(fullKey) + '=' + encodeURIComponent(value));
    }
  }
  return parts.join('&');
}

// ── Dashboard with Embedded Pay Links ──────────────────────────────────────

export function getPaymentDashboard(env) {
  const stripeConfigured = !!env?.STRIPE_SECRET_KEY;

  return {
    system: 'Coastal Key Payment Engine',
    status: stripeConfigured ? 'LIVE' : 'AWAITING_STRIPE_CONFIGURATION',
    currency: 'USD',
    serviceTiers: Object.values(SERVICE_TIERS).map(t => ({
      id: t.id,
      name: t.name,
      price: t.displayPrice + '/mo',
      description: t.description,
      features: t.features,
      payEndpoint: '/v1/payments/link?service=' + Object.keys(SERVICE_TIERS).find(k => SERVICE_TIERS[k].id === t.id),
    })),
    oneTimeServices: Object.values(ONE_TIME_SERVICES).map(s => ({
      id: s.id,
      name: s.name,
      price: s.displayPrice,
      description: s.description,
      payEndpoint: '/v1/payments/link?service=' + Object.keys(ONE_TIME_SERVICES).find(k => ONE_TIME_SERVICES[k].id === s.id),
    })),
    stripeSetup: stripeConfigured ? 'Configured' : {
      required: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET'],
      instructions: 'Run: wrangler secret put STRIPE_SECRET_KEY',
    },
    clientFacingIntegration: {
      pricing: 'GET /v1/payments/pricing — public pricing page data',
      link: 'POST /v1/payments/link — generate Stripe checkout link',
      dashboard: 'GET /v1/payments/dashboard — full payment engine status',
    },
    timestamp: new Date().toISOString(),
  };
}

// ── Public Pricing Data (no auth needed) ───────────────────────────────────

export function getPublicPricing() {
  return {
    company: 'Coastal Key Property Management',
    tagline: 'Peace of Mind, Engineered.',
    tiers: Object.values(SERVICE_TIERS).map(t => ({
      name: t.name,
      price: t.displayPrice,
      interval: t.interval,
      description: t.description,
      features: t.features,
      cta: 'Get Started',
    })),
    addOns: Object.values(ONE_TIME_SERVICES).map(s => ({
      name: s.name,
      price: s.displayPrice,
      description: s.description,
    })),
    guarantee: 'Zero preventable incidents. If we miss one, your next month is free.',
    serviceArea: 'Martin, St. Lucie, and Indian River Counties',
  };
}
