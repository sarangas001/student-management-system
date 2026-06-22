import { useContext, useState } from 'react';
import { LogIn, User, Lock, BookOpen } from 'lucide-react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const context = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { backendUrl, isLoggedInCheck,setIsLoggedIn, setRole, setUser } = context;
    
    try {
      axios.defaults.withCredentials = true;

      const {data} = await axios.post( backendUrl +'/api/auth/login', { email, password });
      
      if (data.success) {
        setIsLoggedIn(true);
        isLoggedInCheck();
        
      }

    }catch (error) {
      console.error('Login failed:', error);
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

          <div className="form-group">
            <label>Username or Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input 
                type="text" 
                placeholder="Enter your username or email" 
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', fontSize: '14px' }}>
            <LogIn size={18} />
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="#" style={{ fontSize: '13px', color: 'var(--blue)', textDecoration: 'none', fontWeight: '500' }}>Forgot your password?</a>
        </div>
      </div>
    </div>
  );
}
