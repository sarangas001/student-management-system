import { ShieldAlert, Database, Key, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';

const issues = [
  {
    severity: 'Critical',
    color: '#ef4444',
    icon: <Database size={20} />,
    title: 'MongoDB Credentials Hardcoded',
    file: 'setup.sh',
    detail: 'Username and password exposed in connection string',
    impact: 'Full database access — all 8 databases on the cluster are exposed',
  },
  {
    severity: 'Critical',
    color: '#ef4444',
    icon: <Key size={20} />,
    title: 'Weak JWT Secret',
    file: 'setup.sh',
    detail: 'JWT secret is set to "secretkey" — trivially guessable',
    impact: 'Anyone can forge valid auth tokens for any role',
  },
  {
    severity: 'High',
    color: '#f97316',
    icon: <ShieldAlert size={20} />,
    title: 'No Authentication on API Routes',
    file: 'server/routes/',
    detail: 'All CRUD endpoints are publicly accessible',
    impact: 'Unauthenticated access to student, teacher, and admin data',
  },
  {
    severity: 'High',
    color: '#f97316',
    icon: <AlertTriangle size={20} />,
    title: 'No Rate Limiting',
    file: 'server/routes/auth.routes.js',
    detail: 'Login endpoint has no brute-force protection',
    impact: 'Password guessing and credential stuffing attacks possible',
  },
  {
    severity: 'Medium',
    color: '#eab308',
    icon: <ShieldAlert size={20} />,
    title: 'Error Messages Leak Internals',
    file: 'server/controllers/authController.js',
    detail: 'error.message returned directly to client',
    impact: 'Database schema and library versions exposed',
  },
];

const exposedDatabases = [
  { name: 'student-management', size: '0.43 MB' },
  { name: 'event_registration', size: '0.70 MB' },
  { name: 'sample_mflix', size: '144.50 MB' },
  { name: 'ai_news_guardian', size: '0.21 MB' },
  { name: 'travel-app-db', size: '0.50 MB' },
  { name: 'test', size: '0.89 MB' },
  { name: 'admin', size: '0.00 MB' },
  { name: 'local', size: '0.00 MB' },
];

const steps = [
  'Change the MongoDB Atlas password immediately',
  'Enable IP Access List restriction on the Atlas cluster',
  'Move all secrets to a .env file (gitignored)',
  'Generate a strong random JWT_SECRET (min 256 bits)',
  'Force password reset for all user accounts',
  'Audit MongoDB Atlas access logs for unauthorized access',
];

export default function SecurityAlert() {
  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '64px', height: '64px', borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px'
        }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
          Security Alert
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text2)', maxWidth: '600px', margin: '0 auto' }}>
          Critical vulnerabilities found in this repository. Credentials are exposed and the database is publicly accessible.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
          Issues Found
        </h2>
        {issues.map((issue, i) => (
          <div key={i} className="card" style={{ padding: '20px', borderLeft: `4px solid ${issue.color}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: issue.color, marginTop: '2px' }}>{issue.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                    background: `${issue.color}20`, color: issue.color, textTransform: 'uppercase'
                  }}>
                    {issue.severity}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>
                    {issue.title}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text2)', margin: '0 0 4px 0' }}>
                  {issue.detail}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text3)', margin: 0 }}>
                  <strong>Impact:</strong> {issue.impact}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text3)', margin: '4px 0 0 0' }}>
                  <strong>File:</strong> {issue.file}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
          Exposed Databases
        </h2>
        <div className="card" style={{ padding: '16px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text2)', fontWeight: '500' }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text2)', fontWeight: '500' }}>Database</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text2)', fontWeight: '500' }}>Size</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text2)', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {exposedDatabases.map((db, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text3)' }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'monospace' }}>{db.name}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>{db.size}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px',
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'
                    }}>
                      EXPOSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
          What to Do
        </h2>
        <div className="card" style={{ padding: '20px' }}>
          <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {steps.map((step, i) => (
              <li key={i} style={{ fontSize: '14px', color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: '#22c55e', marginTop: '2px', flexShrink: 0 }} />
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0 }}>
          This page was generated as part of a security audit.
          For more details, see the full security report.
        </p>
      </div>
    </div>
  );
}
