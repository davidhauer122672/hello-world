// Booking form submission and payment flow
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const msgEl = document.getElementById('formMessage');
  const submitBtn = document.getElementById('submitBtn');

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const service = document.getElementById('service').value;
  const { date, timeSlot } = getCalendarSelection();

  // Validate
  if (!name || !email || !service || !date || !timeSlot) {
    showMessage(msgEl, 'Please fill in all fields and select a date and time.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

  try {
    // Step 1: Create appointment
    const apptRes = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, date, timeSlot, service }),
    });

    const apptData = await apptRes.json();
    if (!apptRes.ok) {
      showMessage(msgEl, apptData.error || 'Failed to create appointment.', 'error');
      resetButton(submitBtn);
      return;
    }

    // Step 2: Create payment session
    const payRes = await fetch('/api/payments/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: apptData.id }),
    });

    const payData = await payRes.json();
    if (!payRes.ok) {
      showMessage(msgEl, payData.error || 'Failed to start payment.', 'error');
      resetButton(submitBtn);
      return;
    }

    // Step 3: Redirect to Stripe Checkout
    window.location.href = payData.url;
  } catch (err) {
    showMessage(msgEl, 'Something went wrong. Please try again.', 'error');
    resetButton(submitBtn);
  }
});

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `form-message ${type}`;
  el.style.display = 'block';
}

function resetButton(btn) {
  btn.disabled = false;
  btn.innerHTML = 'Book & Pay';
}
