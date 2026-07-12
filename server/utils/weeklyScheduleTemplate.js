// Fixed weekly timetable template, keyed by course code. Rooms/times are
// fabricated placeholders until a real per-course timetable exists in the DB.
const DEFAULT_WEEKLY_SLOTS = [
  { day: 'Monday', time: '08:00 - 10:00', room: 'A201', courseCode: 'CS301' },
  { day: 'Monday', time: '10:00 - 12:00', room: 'B105', courseCode: 'CS401' },
  { day: 'Wednesday', time: '08:00 - 10:00', room: 'A201', courseCode: 'CS301' },
  { day: 'Wednesday', time: '14:00 - 16:00', room: 'C302', courseCode: 'MA201' },
  { day: 'Thursday', time: '14:00 - 15:00', room: 'Staff Block', courseCode: '', isOfficeHours: true },
  { day: 'Friday', time: '10:00 - 12:00', room: 'B105', courseCode: 'CS401' },
];

module.exports = { DEFAULT_WEEKLY_SLOTS };
