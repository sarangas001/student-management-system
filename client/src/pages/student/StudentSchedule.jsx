import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { BookOpen, Clock, MapPin, User } from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';

// ── Ordered days for the weekly timetable ─────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Format time range e.g. "08:00" + "10:00" → "08:00 – 10:00" ───────────────
const formatTime = (start, end) =>
  start && end ? `${start} – ${end}` : start || end || '—';

// ── Component ─────────────────────────────────────────────────────────────────
const StudentSchedule = () => {
  const { backendUrl } = useAppContext();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch enrolled courses with schedule slots ──────────────────────────────
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/student/schedule`,
          { withCredentials: true }
        );
        if (data.success) setCourses(data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load schedule. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [backendUrl]);

  // ── Build a map: day → list of { slot, course } ────────────────────────────
  const scheduleByDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => { map[d] = []; });

    courses.forEach((course) => {
      (course.schedule || []).forEach((slot) => {
        if (slot.day && map[slot.day]) {
          map[slot.day].push({ slot, course });
        }
      });
    });

    // Sort each day's entries by startTime
    DAYS.forEach((d) => {
      map[d].sort((a, b) =>
        (a.slot.startTime || '').localeCompare(b.slot.startTime || '')
      );
    });

    return map;
  }, [courses]);

  // ── Courses without any schedule slots ─────────────────────────────────────
  const unscheduled = useMemo(
    () => courses.filter((c) => !c.schedule || c.schedule.length === 0),
    [courses]
  );

  // ── Days that have at least one class ──────────────────────────────────────
  const activeDays = DAYS.filter((d) => scheduleByDay[d]?.length > 0);

  // ── Whether any schedule data exists at all ────────────────────────────────
  const hasScheduleData = activeDays.length > 0;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading your timetable…</div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ color: 'var(--red)', fontSize: 14 }}>{error}</div>
        <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // ── Empty state — no enrolled courses ──────────────────────────────────────
  if (courses.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <BookOpen size={32} style={{ color: 'var(--text3)', marginBottom: 12 }} />
        <div style={{ color: 'var(--text2)', fontWeight: 600, marginBottom: 6 }}>No enrolled courses</div>
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>
          You are not enrolled in any courses yet. Contact your admin to get enrolled.
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* ── Weekly Timetable (only shown when schedule slots exist) ─────────── */}
      {hasScheduleData && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Weekly Timetable</div>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              {activeDays.length} active day{activeDays.length !== 1 ? 's' : ''}
            </span>
          </div>

          {activeDays.map((day) => (
            <div key={day} style={{ marginBottom: 18 }}>
              {/* Day header */}
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '.06em', color: 'var(--blue)',
                padding: '6px 0 8px',
                borderBottom: '1px solid var(--border)',
                marginBottom: 8,
              }}>
                {day}
              </div>

              {/* Slots */}
              {scheduleByDay[day].map(({ slot, course }, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 12px',
                  background: 'var(--surface2)',
                  borderRadius: 'var(--radius)',
                  marginBottom: 6,
                  borderLeft: '3px solid var(--blue)',
                }}>
                  {/* Time */}
                  <div style={{ minWidth: 110, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
                      <Clock size={12} />
                      {formatTime(slot.startTime, slot.endTime)}
                    </div>
                  </div>

                  {/* Course info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>
                      <span style={{ color: 'var(--blue)' }}>{course.code}</span>
                      {' '}— {course.name}
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text3)' }}>
                      {slot.room && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={11} /> {slot.room}
                        </span>
                      )}
                      {course.teacher && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <User size={11} />
                          {course.teacher.firstName} {course.teacher.lastName}
                        </span>
                      )}
                      <span>{course.credits} cr.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Enrolled Courses Table (always shown) ───────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">My Enrolled Courses</div>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Name</th>
              <th>Teacher</th>
              <th>Credits</th>
              <th>Department</th>
              <th>Status</th>
              <th>Schedule Slots</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td style={{ fontWeight: 600, color: 'var(--blue)' }}>{course.code}</td>
                <td>{course.name}</td>
                <td>
                  {course.teacher
                    ? `${course.teacher.firstName} ${course.teacher.lastName}`
                    : <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Not assigned</span>}
                </td>
                <td>{course.credits}</td>
                <td>{course.department}</td>
                <td>
                  <span className={`badge ${course.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                    {course.status}
                  </span>
                </td>
                <td>
                  {course.schedule?.length > 0 ? (
                    <span className="badge badge-blue">{course.schedule.length} slot{course.schedule.length !== 1 ? 's' : ''}</span>
                  ) : (
                    <span style={{ color: 'var(--text3)', fontSize: 12, fontStyle: 'italic' }}>Not set</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notice for unscheduled courses */}
        {unscheduled.length > 0 && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'var(--amber-bg)',
            borderRadius: 'var(--radius)',
            fontSize: 12,
            color: 'var(--amber)',
          }}>
            ⚠️ {unscheduled.length} course{unscheduled.length !== 1 ? 's have' : ' has'} no timetable slots yet.
            Contact your admin to have the schedule configured.
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentSchedule;