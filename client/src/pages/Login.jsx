import { useState } from 'react';
import { LogIn, User, Lock, BookOpen, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';

export default function Login() {
  const { backendUrl, checkLogin } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const {data} = await axios.post( backendUrl +'/api/auth/login', { email, password });
      
      if (data.success) {
        await checkLogin();
      } else {
        setError(data.message || 'Invalid email or password.');
      }

    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', padding: '20px', width: '100%' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'var(--blue-bg)', color: 'var(--blue)', marginBottom: '16px' }}>
            <BookOpen size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ fontSize: '14px', color: 'var(--text2)' }}>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', background:'var(--red-bg)', color:'var(--red)', borderRadius:'8px', fontSize:'13px', border:'1px solid #fca5a5' }}>
              <AlertCircle size={15} style={{ flexShrink:0 }} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
            <LogIn size={18} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="#" style={{ fontSize: '13px', color: 'var(--blue)', textDecoration: 'none', fontWeight: '500' }}>Forgot your password?</a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--text2)' }}>
          Don&apos;t have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: 'var(--blue)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}
