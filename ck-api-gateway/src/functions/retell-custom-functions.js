/**
 * ReTell Custom Functions — Production Framework v1
 *
 * Functions callable by ReTell AI agents during live calls.
 * Each function receives structured parameters from the voice agent
 * and returns data that the agent incorporates into the conversation.
 */

import { jsonResponse } from '../utils/response.js';

// ── Property Lookup ──────────────────────────────────────────────────────
const PROPERTY_TIERS = {
  luxury: { label: 'Platinum', price: 395, frequency: 'Weekly' },
  standard: { label: 'Premier', price: 295, frequency: 'Bi-Weekly' },
  basic: { label: 'Select', price: 195, frequency: 'Monthly' },
};

function classifyProperty(assessedValue) {
  if (assessedValue >= 750000) return PROPERTY_TIERS.luxury;
  if (assessedValue >= 300000) return PROPERTY_TIERS.standard;
  return PROPERTY_TIERS.basic;
}

// ── Service Zone Validation ──────────────────────────────────────────────
const SERVICE_ZONES = new Set([
  'stuart', 'palm city', 'jensen beach', 'hobe sound',
  'port saint lucie', 'port st lucie', 'fort pierce',
  'hutchinson island', 'jupiter', 'tequesta',
  'palm beach gardens', 'vero beach', 'sebastian',
  'north palm beach', 'indian river',
]);

function isInServiceArea(city) {
  return SERVICE_ZONES.has((city || '').toLowerCase().trim());
}

// ── Availability Check ───────────────────────────────────────────────────
function getNextAvailableSlots() {
  const now = new Date();
  const slots = [];
  for (let i = 1; i <= 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    if (date.getDay() === 0) continue;
    slots.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      morning: '9:00 AM - 12:00 PM',
      afternoon: '1:00 PM - 4:00 PM',
    });
    if (slots.length >= 3) break;
  }
  return slots;
}

// ── Function Definitions (ReTell Configuration Format) ───────────────────
export const RETELL_FUNCTIONS = [
  {
    name: 'check_service_area',
    description: 'Check if a property address is within Coastal Key service territory on the Treasure Coast',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City or area name from the prospect' },
        zip_code: { type: 'string', description: 'ZIP code if provided' },
      },
      required: ['city'],
    },
    handler: async ({ city, zip_code }) => {
      const inArea = isInServiceArea(city);
      return {
        in_service_area: inArea,
        city_normalized: city,
        zip_code: zip_code || null,
        message: inArea
          ? `Yes, ${city} is within our Treasure Coast service area. We have active properties there.`
          : `${city} is outside our current service territory. We operate on the Treasure Coast from Vero Beach to Jupiter.`,
      };
    },
  },
  {
    name: 'get_pricing_recommendation',
    description: 'Get a service tier recommendation based on property details',
    parameters: {
      type: 'object',
      properties: {
        assessed_value: { type: 'number', description: 'Approximate property value' },
        property_type: { type: 'string', enum: ['single_family', 'condo', 'townhouse', 'waterfront', 'estate'] },
        occupancy: { type: 'string', enum: ['primary', 'seasonal', 'vacant', 'rental'] },
      },
      required: ['assessed_value'],
    },
    handler: async ({ assessed_value, property_type, occupancy }) => {
      const tier = classifyProperty(assessed_value);
      const isHighRisk = occupancy === 'vacant' || occupancy === 'seasonal';
      const recommended = isHighRisk && tier.label === 'Select' ? PROPERTY_TIERS.standard : tier;

      return {
        recommended_tier: recommended.label,
        monthly_price: recommended.price,
        inspection_frequency: recommended.frequency,
        risk_note: isHighRisk
          ? 'Seasonal/vacant properties have elevated risk. We recommend at minimum bi-weekly inspections.'
          : null,
        complimentary_offer: 'We offer a complimentary baseline property assessment — no obligation.',
      };
    },
  },
  {
    name: 'check_availability',
    description: 'Check available appointment slots for a complimentary property assessment',
    parameters: {
      type: 'object',
      properties: {
        preferred_day: { type: 'string', description: 'Preferred day of week if any' },
        preferred_time: { type: 'string', enum: ['morning', 'afternoon', 'no_preference'] },
      },
    },
    handler: async ({ preferred_day, preferred_time }) => {
      const slots = getNextAvailableSlots();
      let filtered = slots;

      if (preferred_day) {
        const dayMatch = slots.filter(s =>
          s.dayOfWeek.toLowerCase().includes(preferred_day.toLowerCase())
        );
        if (dayMatch.length > 0) filtered = dayMatch;
      }

      return {
        available_slots: filtered.map(s => ({
          date: s.date,
          day: s.dayOfWeek,
          times: preferred_time === 'morning' ? s.morning
               : preferred_time === 'afternoon' ? s.afternoon
               : `${s.morning} or ${s.afternoon}`,
        })),
        message: `I have ${filtered.length} openings this week for a complimentary assessment.`,
      };
    },
  },
  {
    name: 'book_assessment',
    description: 'Book a complimentary baseline property assessment appointment',
    parameters: {
      type: 'object',
      properties: {
        contact_name: { type: 'string', description: 'Full name of the property owner' },
        phone: { type: 'string', description: 'Contact phone number' },
        email: { type: 'string', description: 'Email address' },
        property_address: { type: 'string', description: 'Full property address' },
        preferred_date: { type: 'string', description: 'Selected date (YYYY-MM-DD)' },
        preferred_time: { type: 'string', enum: ['morning', 'afternoon'] },
      },
      required: ['contact_name', 'phone', 'property_address', 'preferred_date'],
    },
    handler: async ({ contact_name, phone, email, property_address, preferred_date, preferred_time }) => {
      const appointmentId = `CK-${Date.now().toString(36).toUpperCase()}`;
      return {
        appointment_id: appointmentId,
        status: 'confirmed',
        contact_name,
        phone,
        email: email || null,
        property_address,
        date: preferred_date,
        time_window: preferred_time === 'morning' ? '9:00 AM - 12:00 PM' : '1:00 PM - 4:00 PM',
        service: 'Complimentary Baseline Property Assessment',
        message: `Your assessment is confirmed for ${preferred_date}. A Coastal Key specialist will arrive during the ${preferred_time || 'scheduled'} window. You will receive a confirmation text at ${phone}.`,
        next_steps: [
          'Confirmation SMS sent immediately',
          'Reminder call 24 hours before appointment',
          'Assessment takes approximately 60-90 minutes',
          'Written report with photos delivered within 4 hours',
        ],
      };
    },
  },
  {
    name: 'handle_objection',
    description: 'Get a professional reframe for a common prospect objection',
    parameters: {
      type: 'object',
      properties: {
        objection_type: {
          type: 'string',
          enum: ['price', 'neighbor_watches', 'think_about_it', 'next_season', 'have_pm_company', 'not_interested'],
          description: 'Category of the objection raised',
        },
      },
      required: ['objection_type'],
    },
    handler: async ({ objection_type }) => {
      const REFRAMES = {
        price: "A single undetected AC failure costs $4,000 to $12,000 in remediation. Our service runs $195 to $395 per month. That's risk transfer at a fraction of exposure.",
        neighbor_watches: "A neighbor's verbal account won't hold up the way a timestamped, photographic inspection report will. We protect your insurance claim position.",
        think_about_it: "Absolutely — take your time. Let us do the complimentary baseline inspection first. You'll get a full documented risk report regardless of your decision.",
        next_season: "Hurricane season runs June through November. Properties without oversight during that window face the highest risk. I can hold your spot at today's rate.",
        have_pm_company: "Property managers focus on tenant placement and rent collection, not property condition oversight. We're the institutional check on the system — complementary, not competitive.",
        not_interested: "I understand. Would it be helpful if I sent you our property risk guide? It covers the most common issues we find on Treasure Coast properties. No obligation.",
      };

      return {
        objection_type,
        reframe: REFRAMES[objection_type] || "I understand your concern. Could you tell me more about what's holding you back?",
        follow_up: 'Would a complimentary baseline assessment help address that concern?',
      };
    },
  },
  {
    name: 'transfer_to_specialist',
    description: 'Transfer the call to a Coastal Key property specialist for detailed consultation',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Reason for the transfer' },
        contact_name: { type: 'string' },
        property_value: { type: 'number' },
        segment: { type: 'string', enum: ['absentee', 'luxury', 'investor', 'seasonal', 'str'] },
      },
      required: ['reason'],
    },
    handler: async ({ reason, contact_name, property_value, segment }) => {
      return {
        transfer_initiated: true,
        transfer_number: '+17722470982',
        context: {
          contact_name: contact_name || 'Unknown',
          property_value: property_value || null,
          segment: segment || 'unclassified',
          reason,
        },
        agent_script: `Transferring you now to a Coastal Key property specialist who can discuss your specific needs in detail. One moment please.`,
      };
    },
  },
];

// ── API Route Handler ────────────────────────────────────────────────────
export async function handleRetellFunction(request) {
  const { function_name, parameters } = await request.json();

  const fn = RETELL_FUNCTIONS.find(f => f.name === function_name);
  if (!fn) {
    return jsonResponse({ error: `Unknown function: ${function_name}` }, 400);
  }

  const result = await fn.handler(parameters || {});
  return jsonResponse({ function_name, result });
}

// ── Atlas Dead-Lead Revival Functions ────────────────────────────────────
export const ATLAS_FUNCTIONS = {
  revival_follow_up: {
    name: 'revival_follow_up',
    description: 'Re-engage a lead that previously did not connect or showed initial interest',
    script_template: (contact) => ({
      opening: `Hi ${contact.name}, this is Sarah from Coastal Key. We spoke briefly a few days ago about property oversight for your home on the Treasure Coast. I wanted to follow up and see if you had any questions.`,
      value_prop: `Since we last spoke, we've had several seasonal homeowners in your area sign up for our complimentary baseline assessment. Would you like me to schedule one for you as well?`,
      close: `The assessment is completely free and takes about 60 to 90 minutes. You'll get a full written report with photos regardless of whether you decide to move forward.`,
    }),
  },
  appointment_confirmation: {
    name: 'appointment_confirmation',
    description: 'Confirm an upcoming assessment appointment',
    script_template: (appointment) => ({
      opening: `Hi ${appointment.name}, this is Sarah from Coastal Key. I'm calling to confirm your property assessment scheduled for ${appointment.date}.`,
      details: `Our specialist will arrive during the ${appointment.time_window} window. The assessment covers a full interior and exterior inspection with timestamped photo documentation.`,
      close: `Is that time still working for you? And is there anything specific you'd like us to focus on during the assessment?`,
    }),
  },
  speed_to_lead: {
    name: 'speed_to_lead',
    description: 'Immediate follow-up for new inbound leads within 60 seconds',
    script_template: (lead) => ({
      opening: `Hi ${lead.name}, this is Sarah from Coastal Key Property Management. I see you just requested information about our home watch services. I wanted to reach out right away.`,
      qualify: `Could you tell me a bit about your property? Is it a primary residence or a seasonal home?`,
      close: `Based on what you've described, I'd recommend starting with our complimentary baseline assessment. Would this week or next work better for you?`,
    }),
  },
};
