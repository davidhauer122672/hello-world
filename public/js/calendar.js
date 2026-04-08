// Calendar UI
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM',
  '3:00 PM', '4:00 PM', '5:00 PM'
];

let currentMonth, currentYear;
let selectedDate = null;
let selectedTime = null;
let bookedSlots = [];

const today = new Date();
currentMonth = today.getMonth();
currentYear = today.getFullYear();

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const monthYear = document.getElementById('monthYear');
  monthYear.textContent = `${MONTHS[currentMonth]} ${currentYear}`;

  grid.innerHTML = '';

  // Day labels
  DAYS.forEach((d) => {
    const label = document.createElement('div');
    label.className = 'day-label';
    label.textContent = d;
    grid.appendChild(label);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day empty';
    grid.appendChild(empty);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = d;

    const cellDate = new Date(currentYear, currentMonth, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (cellDate < todayStart) {
      cell.classList.add('past');
    } else {
      // Check if this is today
      if (cellDate.getTime() === todayStart.getTime()) {
        cell.classList.add('today');
      }

      // Check if selected
      const dateStr = formatDate(currentYear, currentMonth, d);
      if (selectedDate === dateStr) {
        cell.classList.add('selected');
      }

      cell.addEventListener('click', () => selectDate(currentYear, currentMonth, d));
    }

    grid.appendChild(cell);
  }
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function selectDate(year, month, day) {
  selectedDate = formatDate(year, month, day);
  selectedTime = null;

  document.getElementById('selectedDateDisplay').textContent = selectedDate;
  document.getElementById('selectedTimeDisplay').textContent = 'No time selected';
  updateSubmitButton();

  renderCalendar();

  // Fetch booked slots
  try {
    const res = await fetch(`/api/appointments?date=${selectedDate}`);
    const data = await res.json();
    bookedSlots = data.bookedSlots || [];
  } catch {
    bookedSlots = [];
  }

  renderTimeSlots();
}

function renderTimeSlots() {
  const section = document.getElementById('timeSlotsSection');
  const grid = document.getElementById('slotsGrid');
  const label = document.getElementById('selectedDateLabel');

  section.style.display = 'block';
  label.textContent = selectedDate;
  grid.innerHTML = '';

  TIME_SLOTS.forEach((slot) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-btn';
    btn.textContent = slot;

    if (bookedSlots.includes(slot)) {
      btn.classList.add('booked');
      btn.disabled = true;
    } else {
      if (selectedTime === slot) btn.classList.add('selected');
      btn.addEventListener('click', () => selectTime(slot));
    }

    grid.appendChild(btn);
  });
}

function selectTime(slot) {
  selectedTime = slot;
  document.getElementById('selectedTimeDisplay').textContent = slot;
  updateSubmitButton();
  renderTimeSlots();
}

function updateSubmitButton() {
  const btn = document.getElementById('submitBtn');
  btn.disabled = !(selectedDate && selectedTime);
}

// Get selected values (used by booking.js)
function getCalendarSelection() {
  return { date: selectedDate, timeSlot: selectedTime };
}

// Navigation
document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

// Initial render
renderCalendar();
