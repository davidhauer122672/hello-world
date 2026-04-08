const { google } = require('googleapis');

let sheets = null;
let auth = null;

function getClient() {
  if (sheets) return sheets;

  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentialsJson) {
    console.warn('Google Sheets: GOOGLE_SERVICE_ACCOUNT_KEY not set, skipping sync');
    return null;
  }

  const credentials = JSON.parse(credentialsJson);
  auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Appointments';

// Initialize sheet with headers if empty
async function ensureHeaders() {
  const client = getClient();
  if (!client || !SPREADSHEET_ID) return;

  try {
    const res = await client.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:G1`,
    });

    if (!res.data.values || res.data.values.length === 0) {
      await client.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:G1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Name', 'Email', 'Date', 'Time', 'Service', 'Paid', 'Created At']],
        },
      });
      console.log('Google Sheets: Headers created');
    }
  } catch (err) {
    console.error('Google Sheets: Failed to ensure headers:', err.message);
  }
}

// Append a new appointment row
async function appendAppointment(appointment) {
  const client = getClient();
  if (!client || !SPREADSHEET_ID) return;

  try {
    await ensureHeaders();
    await client.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          appointment.id,
          appointment.name,
          appointment.email,
          appointment.date,
          appointment.timeSlot,
          appointment.service,
          appointment.paid ? 'Yes' : 'No',
          appointment.createdAt,
        ]],
      },
    });
    console.log(`Google Sheets: Appointment ${appointment.id} added`);
  } catch (err) {
    console.error('Google Sheets: Failed to append row:', err.message);
  }
}

// Update the "Paid" column for an appointment
async function updatePaymentStatus(appointmentId) {
  const client = getClient();
  if (!client || !SPREADSHEET_ID) return;

  try {
    const res = await client.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === appointmentId);
    if (rowIndex === -1) return;

    // Update the Paid column (column G, index 6)
    await client.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!G${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Yes']],
      },
    });
    console.log(`Google Sheets: Appointment ${appointmentId} marked as paid`);
  } catch (err) {
    console.error('Google Sheets: Failed to update payment status:', err.message);
  }
}

module.exports = { appendAppointment, updatePaymentStatus };
