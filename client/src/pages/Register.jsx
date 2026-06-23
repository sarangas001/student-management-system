import { useState } from 'react';
import { UserPlus, User, Lock, Mail, BookOpen, Hash, GraduationCap, Building2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';

const DEPARTMENTS = [
  'SE',
  'CS',
  'IS',
];

const ROLES = [
  { value: 'student', label: 'Student', icon: GraduationCap, color: '#b45309', bg: '#fef3c7' },
  { value: 'teacher', label: 'Teacher', icon: User, color: '#0f766e', bg: '#ccfbf1' },
  { value: 'admin',   label: 'Admin',   icon: Building2,     color: '#1a5faa', bg: '#e8f1fb' },
];

export default function Register() {
  const { backendUrl, checkLogin, setIsLoggedIn } = useAppContext();
  const navigate = useNavigate();

  const [role, setRole]         = useState('student');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    studentId: '',
    teacherId: '',
    adminId: '',
    department: '',
    yearOfStudy: '',
  });

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      axios.defaults.withCredentials = true;

      const payload = {
        role,
        firstName:  form.firstName,
        lastName:   form.lastName,
        email:      form.email,
        password:   form.password,
        ...(role === 'student' && { studentId: form.studentId, department: form.department, yearOfStudy: Number(form.yearOfStudy) }),
        ...(role === 'teacher' && { teacherId: form.teacherId, department: form.department }),
        ...(role === 'admin'   && { adminId: form.adminId }),
      };

      const { data } = await axios.post(`${backendUrl}/api/auth/register`, payload);

      if (data.success) {
        setSuccess('Account created successfully! Redirecting…');
        setIsLoggedIn(true);
        await checkLogin();
        setTimeout(() => navigate('/'), 1200);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.value === role);

  return (
    <div className="flex min-h-screen w-full" style={{ background: 'var(--bg)' }}>

      {/* ── Left panel – branding ── */}
      <div
        className="reg-left-panel hidden md:flex flex-col justify-between"
        style={{
          width: '380px',
          minWidth: '340px',
          background: 'linear-gradient(160deg, #1a5faa 0%, #0d3d72 100%)',
          padding: '48px 40px',
          color: '#fff',
        }}
      >
        {/* Brand */}
        <div className="flex flex-col gap-3 items-start">
          <div
            className="flex items-center justify-center mb-5 rounded-2xl"
            style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.15)' }}
          >
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">SMS Portal</h1>
          <p className="text-sm leading-relaxed" style={{ opacity: 0.75 }}>
            Student Management System<br />University of Sri Jayewardenepura
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-6">
          {[
            { step: '01', title: 'Choose your role',    desc: 'Select student, teacher, or admin' },
            { step: '02', title: 'Fill in your details', desc: 'Provide your personal information' },
            { step: '03', title: 'Get instant access',  desc: 'Login to your personalised dashboard' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div
                className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
                style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.18)' }}
              >
                {step}
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">{title}</div>
                <div className="text-xs" style={{ opacity: 0.65 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sign-in prompt */}
        <p className="text-xs" style={{ opacity: 0.8 }}>
          Already have an account?{' '}
          <span
            className="underline cursor-pointer"
            style={{ color: '#93c5fd' }}
            onClick={() => navigate('/login')}
          >
            Sign in
          </span>
        </p>
      </div>

      {/* ── Right panel – form ── */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto" style={{ padding: '32px 20px' }}>
        <div
          className="w-full rounded-2xl flex flex-col gap-3"
          style={{
            maxWidth: 480,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '36px 32px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex items-center justify-center shrink-0 rounded-xl transition-all duration-200"
              style={{ width: 52, height: 52, background: selectedRole.bg, color: selectedRole.color }}
            >
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-0.5" style={{ color: 'var(--text)' }}>Create Account</h2>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>
                Register as a new {selectedRole.label.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>I am a</label>
            <div className="flex gap-2">
              {ROLES.map(({ value, label, icon: Icon, color, bg }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setRole(value); setError(''); }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs cursor-pointer transition-all duration-150"
                  style={{
                    padding: '9px 8px',
                    border: role === value ? `1.5px solid ${color}` : '1.5px solid var(--border2)',
                    background: role === value ? bg : 'var(--surface)',
                    color: role === value ? color : 'var(--text2)',
                    fontWeight: role === value ? 600 : 500,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback banners */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg text-xs mb-4"
              style={{
                padding: '10px 14px',
                background: 'var(--red-bg)',
                color: 'var(--red)',
                border: '1px solid #fca5a5',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
          {success && (
            <div
              className="flex items-center gap-2 rounded-lg text-xs mb-4"
              style={{
                padding: '10px 14px',
                background: 'var(--green-bg)',
                color: 'var(--green)',
                border: '1px solid #86efac',
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <FieldWrap label="First Name" icon={<User size={15} />}>
                <input type="text" placeholder="e.g. Kasuni" value={form.firstName} onChange={set('firstName')} required />
              </FieldWrap>
              <FieldWrap label="Last Name" icon={<User size={15} />}>
                <input type="text" placeholder="e.g. Perera" value={form.lastName} onChange={set('lastName')} required />
              </FieldWrap>
            </div>

            {/* Role-specific ID */}
            {role === 'student' && (
              <FieldWrap label="Student ID" icon={<Hash size={15} />}>
                <input type="text" placeholder="e.g. FC222015" value={form.studentId} onChange={set('studentId')} required />
              </FieldWrap>
            )}
            {role === 'teacher' && (
              <FieldWrap label="Teacher ID" icon={<Hash size={15} />}>
                <input type="text" placeholder="e.g. TC10042" value={form.teacherId} onChange={set('teacherId')} required />
              </FieldWrap>
            )}
            {role === 'admin' && (
              <FieldWrap label="Admin ID" icon={<Hash size={15} />}>
                <input type="text" placeholder="e.g. AD00001" value={form.adminId} onChange={set('adminId')} required />
              </FieldWrap>
            )}

            {/* Email */}
            <FieldWrap label="Email Address" icon={<Mail size={15} />}>
              <input type="email" placeholder="you@university.ac.lk" value={form.email} onChange={set('email')} required />
            </FieldWrap>

            {/* Department – student & teacher */}
            {(role === 'student' || role === 'teacher') && (
              <FieldWrap label="Department" icon={<Building2 size={15} />}>
                <select value={form.department} onChange={set('department')} required>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </FieldWrap>
            )}

            {/* Year of Study – student only */}
            {role === 'student' && (
              <FieldWrap label="Year of Study" icon={<GraduationCap size={15} />}>
                <select value={form.yearOfStudy} onChange={set('yearOfStudy')} required>
                  <option value="">Select year…</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>{y}{['st', 'nd', 'rd', 'th'][y - 1]} Year</option>
                  ))}
                </select>
              </FieldWrap>
            )}

            {/* Password */}
            <FieldWrap label="Password" icon={<Lock size={15} />}>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  minLength={8}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
                  style={{ color: 'var(--text3)' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </FieldWrap>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 mt-1"
              style={{
                padding: '12px',
                background: 'var(--blue)',
                opacity: loading || success ? 0.75 : 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? <Spinner /> : <UserPlus size={17} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

          </form>

          {/* Mobile sign-in link */}
          <p className="text-center mt-5 text-xs" style={{ color: 'var(--text2)' }}>
            Already registered?{' '}
            <span
              className="font-semibold underline cursor-pointer"
              style={{ color: '#93c5fd' }}
              onClick={() => navigate('/login')}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable field wrapper ── */
function FieldWrap({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold" style={{ color: 'var(--text2)' }}>{label}</label>
      <div className="relative flex items-center">
        {/* Icon sits inside the input on the left */}
        <span
          className="absolute left-2.5 flex items-center justify-center pointer-events-none z-10"
          style={{ color: 'var(--text3)', top: '50%', transform: 'translateY(-50%)' }}
        >
          {icon}
        </span>
        {/* Inputs/selects get left padding to clear the icon */}
        <style>{`
          .field-inner input,
          .field-inner select {
            width: 100%;
            padding: 9px 11px 9px 34px;
            border: 1px solid var(--border2);
            border-radius: 8px;
            font-size: 13px;
            font-family: 'DM Sans', sans-serif;
            background: var(--surface);
            color: var(--text);
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .field-inner input:focus,
          .field-inner select:focus {
            border-color: var(--blue);
            box-shadow: 0 0 0 3px rgba(26,95,170,0.12);
          }
          .field-inner .relative input {
            padding-left: 34px;
          }
        `}</style>
        <div className="field-inner w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: 16,
        height: 16,
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}
