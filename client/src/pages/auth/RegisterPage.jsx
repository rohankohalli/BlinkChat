import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout, { authStyles as styles } from '../../components/Auth/AuthLayout';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Register a new identity to start chatting.">
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.errorBanner}>{error}</div>}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} placeholder="chatmaster99" required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="you@example.com" required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} placeholder="••••••••" required />
        </div>
        <button type="submit" style={{...styles.button, opacity: loading ? 0.7 : 1}} disabled={loading}>
          {loading ? 'Processing...' : 'Create Identity'}
        </button>
      </form>
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.toggleLink}>Sign in here</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
