import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout, { authStyles as styles } from '../../components/Auth/AuthLayout';
import Swal from 'sweetalert2';

const ResetPasswordPage = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) setToken(resetToken);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(token, password);
      
      Swal.fire({
        icon: 'success',
        title: 'Security Updated',
        text: 'Your password has been reset successfully.',
        showConfirmButton: false,
        timer: 2000,
        background: '#ffffff',
        timerProgressBar: true
      });

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="New Password" subtitle="Create a strong new password for your account.">
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.errorBanner}>{error}</div>}
        {message && <div style={styles.successBanner}>{message}</div>}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Reset Token</label>
          <input type="text" value={token} onChange={(e) => setToken(e.target.value)} style={styles.input} placeholder="Paste token from console" required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>New Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} placeholder="••••••••" required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={styles.input} placeholder="••••••••" required />
        </div>
        <button type="submit" style={{...styles.button, opacity: loading ? 0.7 : 1}} disabled={loading}>
          {loading ? 'Processing...' : 'Update Password'}
        </button>
      </form>
      <div style={styles.footer}>
        <Link to="/login" style={styles.toggleLink}>Back to Sign In</Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
