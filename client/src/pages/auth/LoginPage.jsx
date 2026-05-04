import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout, { authStyles as styles } from '../../components/Auth/AuthLayout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Enter your details to securely sign in.">
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.errorBanner}>{error}</div>}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="you@example.com" required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} placeholder="••••••••" required />
        </div>
        <button type="submit" style={{...styles.button, opacity: loading ? 0.7 : 1}} disabled={loading}>
          {loading ? 'Processing...' : 'Authenticate'}
        </button>
      </form>
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.toggleLink}>Create one</Link><br/>
          <Link to="/forgot-password" style={{...styles.toggleLink, fontSize: '0.8rem', marginTop: '8px', display: 'inline-block'}}>Forgot Password?</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
