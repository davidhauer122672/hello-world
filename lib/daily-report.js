const cron = require('node-cron');
const db = require('./db');
const { sendSMS } = require('./sms');

const PRICES = {
  consultation: 50,
  followup: 30,
  premium: 100,
};

const SERVICE_LABELS = {
  consultation: 'Consultation',
  followup: 'Follow-up',
  premium: 'Premium Session',
};

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function buildReport() {
  const yesterday = getYesterday();
  const today = getToday();
  const allAppointments = db.getAppointments();

  // Yesterday's paid appointments (revenue earned)
  const paidYesterday = allAppointments.filter(
    (a) => a.paid && a.createdAt && a.createdAt.startsWith(yesterday)
  );

  // Today's upcoming appointments
  const todayAppointments = allAppointments.filter((a) => a.date === today);

  // Calculate revenue
  let totalRevenue = 0;
  const serviceBreakdown = {};

  paidYesterday.forEach((a) => {
    const price = PRICES[a.service] || 0;
    totalRevenue += price;
    const label = SERVICE_LABELS[a.service] || a.service;
    serviceBreakdown[label] = (serviceBreakdown[label] || 0) + 1;
  });

  // All-time totals
  const allPaid = allAppointments.filter((a) => a.paid);
  let allTimeRevenue = 0;
  allPaid.forEach((a) => {
    allTimeRevenue += PRICES[a.service] || 0;
  });

  // Build message
  let msg = `DAILY REPORT - ${today}\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `YESTERDAY'S EARNINGS\n`;
  if (paidYesterday.length === 0) {
    msg += `No payments received.\n`;
  } else {
    msg += `$${totalRevenue} from ${paidYesterday.length} booking(s)\n`;
    Object.entries(serviceBreakdown).forEach(([svc, count]) => {
      msg += `  - ${svc}: ${count}x\n`;
    });
    msg += `\nDetails:\n`;
    paidYesterday.forEach((a) => {
      msg += `  ${a.name} | ${a.service} | $${PRICES[a.service] || 0}\n`;
    });
  }

  msg += `\nTODAY'S SCHEDULE\n`;
  if (todayAppointments.length === 0) {
    msg += `No appointments today.\n`;
  } else {
    todayAppointments.forEach((a) => {
      const status = a.paid ? 'PAID' : 'UNPAID';
      msg += `  ${a.timeSlot} - ${a.name} (${SERVICE_LABELS[a.service] || a.service}) [${status}]\n`;
    });
  }

  msg += `\nALL-TIME: $${allTimeRevenue} from ${allPaid.length} paid booking(s)`;

  return msg;
}

function startDailyReport() {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily report...');
    try {
      const report = buildReport();
      await sendSMS(report);
      console.log('Daily report sent successfully.');
    } catch (err) {
      console.error('[daily-report] Scheduled report failed:', err.message);
    }
  });

  console.log('Daily report scheduled for 9:00 AM');
}

// Export for manual trigger too
module.exports = { startDailyReport, buildReport };
