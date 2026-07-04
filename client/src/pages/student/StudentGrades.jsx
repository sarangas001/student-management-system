import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Download, BookOpen, TrendingUp, Award, Filter } from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';

// ── Grade → colour mapping ────────────────────────────────────────────────────
const gradeClass = (grade) => {
  if (!grade) return 'badge-blue';
  const g = grade.toUpperCase();
  if (g === 'A' || g === 'A-')              return 'badge-green';
  if (g === 'B+' || g === 'B' || g === 'B-') return 'badge-blue';
  if (g === 'C+' || g === 'C' || g === 'C-') return 'badge-amber';
  return 'badge-red'; // D, F
};

const barColor = (grade) => {
  if (!grade) return 'var(--blue)';
  const g = grade.toUpperCase();
  if (g.startsWith('A'))  return 'var(--green)';
  if (g.startsWith('B'))  return 'var(--blue)';
  if (g.startsWith('C'))  return '#e6a800';
  return 'var(--red)';
};

const ASSESSMENT_TYPES = ['All', 'Mid Exam', 'Final Exam', 'Assignment', 'Quiz'];

// ── Component ─────────────────────────────────────────────────────────────────
const StudentGrades = () => {
  const { backendUrl } = useAppContext();

  const [grades,    setGrades]    = useState([]);
  const [cgpaData,  setCgpaData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // Filter state
  const [filterAssessment, setFilterAssessment] = useState('All');
  const [filterCourse,     setFilterCourse]     = useState('All');

  // ── Fetch grades & CGPA ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [gradesRes, cgpaRes] = await Promise.all([
          axios.get(`${backendUrl}/api/student/grades`,      { withCredentials: true }),
          axios.get(`${backendUrl}/api/student/grades/cgpa`, { withCredentials: true }),
        ]);

        if (gradesRes.data.success) setGrades(gradesRes.data.data);
        if (cgpaRes.data.success)   setCgpaData(cgpaRes.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load grade data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendUrl]);

  // ── Unique course list for filter dropdown ──────────────────────────────────
  const courseOptions = useMemo(() => {
    const codes = [...new Set(grades.map((g) => g.course?.code).filter(Boolean))];
    return ['All', ...codes];
  }, [grades]);

  // ── Filtered grade records ──────────────────────────────────────────────────
  const filtered = useMemo(() => grades.filter((g) => {
    const matchAssessment = filterAssessment === 'All' || g.assessmentType === filterAssessment;
    const matchCourse     = filterCourse     === 'All' || g.course?.code    === filterCourse;
    return matchAssessment && matchCourse;
  }), [grades, filterAssessment, filterCourse]);

  // ── Performance bars: average marks per course ──────────────────────────────
  const coursePerf = useMemo(() => {
    const map = {};
    grades.forEach((g) => {
      const code = g.course?.code;
      if (!code) return;
      if (!map[code]) map[code] = { code, name: g.course?.name, marks: [], grade: g.grade };
      map[code].marks.push(g.marks);
      map[code].grade = g.grade; // keep last grade (rough indicator)
    });
    return Object.values(map).map((c) => ({
      ...c,
      avg: Math.round(c.marks.reduce((a, b) => a + b, 0) / c.marks.length),
    }));
  }, [grades]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading grade records…</div>
        </div>
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

  return (
    <div>
      {/* ── CGPA Summary Cards ─────────────────────────────────────────────── */}
      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon si-blue"><TrendingUp size={18} /></div>
          <div className="stat-label">Current CGPA</div>
          <div className="stat-val">{cgpaData?.cgpa ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-green"><BookOpen size={18} /></div>
          <div className="stat-label">Graded Courses</div>
          <div className="stat-val">{cgpaData?.gradedCourses ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-amber"><Award size={18} /></div>
          <div className="stat-label">Total Credits</div>
          <div className="stat-val">{cgpaData?.totalCredits ?? 0}</div>
        </div>
      </div>

      {/* ── Grade Report Table ─────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">My Grade Report</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Filter size={13} style={{ color: 'var(--text3)' }} />
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{ fontSize: 12, padding: '4px 8px' }}
                title="Filter by course"
              >
                {courseOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={filterAssessment}
                onChange={(e) => setFilterAssessment(e.target.value)}
                style={{ fontSize: 12, padding: '4px 8px' }}
                title="Filter by assessment type"
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-sm" title="Download grade report">
              <Download size={13} /> Download
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)', fontSize: 13 }}>
            {grades.length === 0
              ? 'No published grades found. Check back after assessments are graded.'
              : 'No records match the selected filters.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Assessment Type</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g._id}>
                  <td>
                    <span style={{ fontWeight: 500 }}>{g.course?.code}</span>
                    {' '}— {g.course?.name}
                  </td>
                  <td>
                    <span className={`badge ${
                      g.assessmentType === 'Mid Exam'   ? 'badge-blue' :
                      g.assessmentType === 'Final Exam' ? 'badge-green' :
                      g.assessmentType === 'Assignment' ? 'badge-amber' :
                      'badge-red'
                    }`}>
                      {g.assessmentType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{g.marks}</td>
                  <td>
                    <span className={`badge ${gradeClass(g.grade)}`}>{g.grade}</span>
                  </td>
                  <td style={{ color: 'var(--text2)', fontStyle: g.remark ? 'normal' : 'italic' }}>
                    {g.remark || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Performance Overview ───────────────────────────────────────────── */}
      {coursePerf.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Performance Overview</div>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Average marks per course</span>
          </div>
          {coursePerf.map((c) => (
            <div className="grade-bar-wrap" key={c.code}>
              <div className="grade-bar-label">
                <span>{c.code} — {c.name}</span>
                <span style={{ color: barColor(c.grade), fontWeight: 600 }}>
                  {c.grade} ({c.avg}%)
                </span>
              </div>
              <div className="grade-bar-bg">
                <div
                  className="grade-bar-fill"
                  style={{ width: `${Math.min(c.avg, 100)}%`, background: barColor(c.grade) }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentGrades;