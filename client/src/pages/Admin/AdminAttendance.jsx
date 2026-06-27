import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';
import axios from 'axios';

// ─── API Functions ────────────────────────────────────────────────────────────

const SL_HOLIDAYS = {
  // 2025
  '2025-01-01': 'New Year\'s Day',
  '2025-01-13': 'Thai Pongal',
  '2025-01-14': 'Duruthu Full Moon Poya',
  '2025-02-04': 'National Day',
  '2025-02-12': 'Navam Full Moon Poya',
  '2025-02-26': 'Maha Sivarathri',
  '2025-03-13': 'Medin Full Moon Poya',
  '2025-03-31': 'Id-ul-Fitr (Ramadan)',
  '2025-04-11': 'Bak Full Moon Poya',
  '2025-04-14': 'Sinhala & Tamil New Year Eve',
  '2025-04-18': 'Good Friday',
  '2025-05-01': 'Labour Day',
  '2025-05-12': 'Vesak Full Moon Poya',
  '2025-05-13': 'Day after Vesak',
  '2025-06-07': 'Id-ul-Alha (Hajj)',
  '2025-06-10': 'Poson Full Moon Poya',
  '2025-07-10': 'Esala Full Moon Poya',
  '2025-08-08': 'Nikini Full Moon Poya',
  '2025-09-05': 'Milad-un-Nabi',
  '2025-09-07': 'Binara Full Moon Poya',
  '2025-10-07': 'Vap Full Moon Poya',
  '2025-10-20': 'Deepavali',
  '2025-11-05': 'Il Full Moon Poya',
  '2025-12-04': 'Unduvap Full Moon Poya',
  '2025-12-25': 'Christmas Day',
  // 2026
  '2026-01-01': 'New Year\'s Day',
  '2026-01-14': 'Thai Pongal',
  '2026-02-04': 'National Day',
  '2026-03-20': 'Maha Sivarathri',
  '2026-04-02': 'Bak Full Moon Poya',
  '2026-04-03': 'Good Friday',
  '2026-04-14': 'Sinhala & Tamil New Year',
  '2026-05-01': 'Labour Day',
  '2026-05-31': 'Vesak Full Moon Poya',
  '2026-06-01': 'Day after Vesak',
  '2026-12-25': 'Christmas Day',
};

const fetchAttendanceSummaryAPI = async (backendUrl, month, year) => {
  try {
    const { data } = await axios.get(`${backendUrl}/api/admin/attendance/summary`, {
      params: { month, year },
      withCredentials: true
    });
    if (data.success) {
      return {
        present: data.data.Present || 0,
        absent: data.data.Absent || 0,
        late: data.data.Late || 0,
        attendanceByDay: {}
      };
    }
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
  }
  return { present: 0, absent: 0, late: 0, attendanceByDay: {} };
};

const fetchCoursesAPI = async (backendUrl) => {
  try {
    const { data } = await axios.get(`${backendUrl}/api/admin/attendance/courses`, {
      withCredentials: true
    });
    if (data.success) {
      return data.data.map(c => ({ id: c._id, code: c.code, name: c.name }));
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
  return [];
};

const fetchStudentsByCourseAPI = async (backendUrl, courseId) => {
  try {
    const { data } = await axios.get(`${backendUrl}/api/admin/attendance/students`, {
      params: { courseId },
      withCredentials: true
    });
    if (data.success) {
      return data.data.map(student => ({
        id: student._id,
        displayId: student.studentId,
        name: `${student.firstName} ${student.lastName}`
      }));
    }
  } catch (error) {
    console.error('Error fetching students by course:', error);
  }
  return [];
};

const saveAttendanceAPI = async (backendUrl, courseId, date, records, adminId) => {
  try {
    const { data } = await axios.post(`${backendUrl}/api/admin/attendance`, {
      courseId,
      date,
      attendanceData: records,
      markedBy: adminId
    }, { withCredentials: true });
    return data.success;
  } catch (error) {
    console.error('Error saving attendance:', error);
    return false;
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CELL_CLASS = {
  P: 'att-p',
  A: 'att-a',
  L: 'att-l',
  H: 'att-h',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function buildCalendarCells(year, month, attendanceByDay = {}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const leadingBlanks = (firstDow === 0 ? 6 : firstDow - 1); 

  const todayObj = new Date();
  const isCurrentMonth = todayObj.getFullYear() === year && todayObj.getMonth() + 1 === month;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push({ blank: true });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow = new Date(year, month - 1, d).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const holidayName = SL_HOLIDAYS[dateStr];
    const isHoliday = Boolean(holidayName);
    const isToday = isCurrentMonth && todayObj.getDate() === d;
    const isFuture = new Date(year, month - 1, d) > todayObj;

    let status = null;
    if (isHoliday || isWeekend) {
      status = 'H';
    } else if (!isFuture && attendanceByDay[d]) {
      status = attendanceByDay[d];
    }

    cells.push({ day: d, blank: false, isHoliday, holidayName, isWeekend, isToday, isFuture, status });
  }
  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AdminAttendance = () => {
  const { backendUrl, user } = useAppContext();

  // --- Summary panel state ---
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // --- Calendar navigation state ---
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1); // 1-based

  // --- Mark-attendance panel state ---
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Load summary whenever calendar month/year changes ─────────────────────
  useEffect(() => {
    const loadSummary = async () => {
      setSummaryLoading(true);
      const data = await fetchAttendanceSummaryAPI(backendUrl, calMonth, calYear);
      setSummary(data);
      setSummaryLoading(false);
    };
    if (backendUrl) loadSummary();
  }, [backendUrl, calMonth, calYear]);

  // ── Calendar navigation helpers ────────────────────────────────────────────
  const goToPrevMonth = () => {
    if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  // ── Load courses on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const loadCourses = async () => {
      const data = await fetchCoursesAPI(backendUrl);
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0].id);
    };
    if (backendUrl) loadCourses();
  }, [backendUrl]);

  // ── Load students whenever course changes ──────────────────────────────────
  useEffect(() => {
    if (!selectedCourse || !backendUrl) return;
    const loadStudents = async () => {
      setStudentsLoading(true);
      const data = await fetchStudentsByCourseAPI(backendUrl, selectedCourse);
      setStudents(data);
      const defaults = {};
      data.forEach((s) => { defaults[s.id] = 'Present'; });
      setAttendanceMap(defaults);
      setStudentsLoading(false);
    };
    loadStudents();
  }, [backendUrl, selectedCourse]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveSuccess(false);
    const records = Object.entries(attendanceMap).map(([id, status]) => ({ studentId: id, status }));
    const success = await saveAttendanceAPI(backendUrl, selectedCourse, selectedDate, records, user);
    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Refresh summary
      const data = await fetchAttendanceSummaryAPI(backendUrl, calMonth, calYear);
      setSummary(data);
    } else {
      alert("Failed to save attendance.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="two-col">

      {/* ── Left: Attendance Summary + Calendar ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Attendance Summary</span>
          {/* Month navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-sm cursor-pointer" onClick={goToPrevMonth}
              style={{ padding: '4px 8px', lineHeight: 1 }}>
              <ChevronLeft className='w-5 h-5' />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', minWidth: '110px', textAlign: 'center' }}>
              {MONTH_NAMES[calMonth - 1]} {calYear}
            </span>
            <button className="btn btn-sm cursor-pointer" onClick={goToNextMonth}
              style={{ padding: '4px 8px', lineHeight: 1 }}>
              <ChevronRight className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Pipeline stats */}
        {summaryLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>
            Loading summary…
          </div>
        ) : (
          <>
            <div className="pipeline">
              <div className="pip-stage">
                <div className="pip-label">Present</div>
                <div className="pip-val" style={{ color: 'var(--green)' }}>
                  {summary.present.toLocaleString()}
                </div>
              </div>
              <div className="pip-stage">
                <div className="pip-label">Absent</div>
                <div className="pip-val" style={{ color: 'var(--red)' }}>
                  {summary.absent.toLocaleString()}
                </div>
              </div>
              <div className="pip-stage">
                <div className="pip-label">Late</div>
                <div className="pip-val" style={{ color: 'var(--amber)' }}>
                  {summary.late.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Real Calendar grid */}
            <div className="att-grid" style={{ marginTop: '10px' }}>
              {/* Day-of-week headers */}
              {DAY_LABELS.map((d) => (
                <div key={d} style={{
                  fontSize: '10px', color: 'var(--text3)',
                  textAlign: 'center', fontWeight: 600,
                }}>
                  {d}
                </div>
              ))}

              {/* Calendar cells */}
              {buildCalendarCells(calYear, calMonth, summary.attendanceByDay).map((cell, idx) => {
                if (cell.blank) {
                  return <div key={`blank-${idx}`} />;
                }
                const cellClass = cell.status ? STATUS_CELL_CLASS[cell.status] : '';
                const todayStyle = cell.isToday ? {
                  outline: '2px solid var(--blue)',
                  outlineOffset: '1px',
                  fontWeight: 700,
                } : {};
                const futureStyle = cell.isFuture && !cell.isHoliday && !cell.isWeekend ? {
                  opacity: 0.35,
                } : {};
                return (
                  <div
                    key={cell.day}
                    className={`att-cell ${cellClass}`}
                    title={cell.isHoliday ? cell.holidayName : cell.isWeekend ? 'Weekend' : ''}
                    style={{ ...todayStyle, ...futureStyle, cursor: cell.isHoliday ? 'help' : 'default' }}
                  >
                    {cell.day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="att-legend">
              <span>
                <span className="att-dot" style={{ background: 'var(--green-bg)' }} />
                Present
              </span>
              <span>
                <span className="att-dot" style={{ background: 'var(--red-bg)' }} />
                Absent
              </span>
              <span>
                <span className="att-dot" style={{ background: 'var(--amber-bg)' }} />
                Late
              </span>
              <span>
                <span className="att-dot" style={{ background: 'var(--surface2)' }} />
                Holiday
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Right: Mark Attendance ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Mark Attendance</span>
        </div>

        {/* Course selector */}
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label>Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="cursor-pointer"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date selector */}
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Students table */}
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {studentsLoading ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '16px', color: 'var(--text3)' }}>
                  Loading students…
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '16px', color: 'var(--text3)' }}>
                  No students found for this course.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.displayId} — {student.name}</td>
                  <td>
                    <select
                      className="inline-select cursor-pointer"
                      value={attendanceMap[student.id] ?? 'Present'}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Success alert */}
        {saveSuccess && (
          <div className="alert alert-green" style={{ marginTop: '10px' }}>
            <i className="ti ti-circle-check" />
            Attendance saved successfully!
          </div>
        )}

        {/* Save button */}
        <button
          className="btn btn-primary cursor-pointer"
          style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
          onClick={handleSaveAttendance}
          disabled={saving || studentsLoading}
        >
          <i className="ti ti-check" />
          {saving ? 'Saving…' : 'Save Attendance'}
        </button>
      </div>

    </div>
  );
};
