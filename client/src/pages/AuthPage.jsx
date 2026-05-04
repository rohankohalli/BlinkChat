import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Check for reset token in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      setMode('reset');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/chat');
      } else if (mode === 'register') {
        await register(username, email, password);
        navigate('/chat');
      } else if (mode === 'forgot') {
        await forgotPassword(email);
        setMessage('Reset token generated! Check server console (Mocking Email).');
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await resetPassword(token, password);
        setMessage('Password reset successfully! You can now sign in.');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="panel animate-entrance">
        
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <div style={styles.iconDot}></div>
            <div style={{...styles.iconDot, animationDelay: '0.2s'}}></div>
          </div>
          <h1 style={styles.title}>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot' && 'Reset Access'}
            {mode === 'reset' && 'New Password'}
            <span className="text-gradient"> BlinkChat</span>
          </h1>
          <p style={styles.subtitle}>
            {mode === 'login' && 'Enter your details to securely sign in.'}
            {mode === 'register' && 'Register a new identity to start chatting.'}
            {mode === 'forgot' && 'Enter your email to receive a reset token.'}
            {mode === 'reset' && 'Create a strong new password for your account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBanner}>{error}</div>}
          {message && <div style={styles.successBanner}>{message}</div>}

          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="chatmaster99"
                required
              />
            </div>
          )}

          {(mode !== 'reset') && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="you@example.com"
                required
              />
            </div>
          )}

          {(mode === 'reset') && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Reset Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={styles.input}
                placeholder="Paste token from console"
                required
              />
            </div>
          )}

          {(mode !== 'forgot') && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>{mode === 'reset' ? 'New Password' : 'Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {(mode === 'reset') && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            style={{...styles.button, opacity: loading ? 0.7 : 1}} 
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              mode === 'login' ? 'Authenticate' : 
              mode === 'register' ? 'Create Identity' :
              mode === 'forgot' ? 'Send Token' : 'Update Password'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {mode === 'login' ? (
              <>
                Don't have an account? <span style={styles.toggleLink} onClick={() => setMode('register')}>Create one</span><br/>
                <span style={{...styles.toggleLink, fontSize: '0.8rem', marginTop: '8px', display: 'inline-block'}} onClick={() => setMode('forgot')}>Forgot Password?</span>
              </>
            ) : (
              <span style={styles.toggleLink} onClick={() => setMode('login')}>Back to Sign In</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
    display: 'flex',
    gap: '6px',
    marginBottom: '16px',
  },
  iconDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'var(--gradient-primary)',
    animation: 'pulse 1.5s infinite alternate',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    maxWidth: '80%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  input: {
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-light)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  // We handle focus state directly via a generic class or in-line if needed, but standard CSS handles border color transition gracefully
  button: {
    marginTop: '12px',
    padding: '14px 20px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--gradient-primary)',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '600',
    boxShadow: '0 8px 20px rgba(6, 182, 212, 0.25)',
    letterSpacing: '0.01em',
  },
  errorBanner: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  successBanner: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#6ee7b7',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  toggleLink: {
    color: 'var(--accent-cyan)',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.2s',
  }
};

export default AuthPage;
