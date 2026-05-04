import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout, { authStyles as styles } from '../../components/Auth/AuthLayout';
import { showAlert } from '../../utils/swal';
import Swal from 'sweetalert2';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      
      // Notify developer
      Swal.fire({
        icon: 'info',
        title: 'Development Mode',
        text: 'Check the server terminal for your reset link (Mocking Email).',
        background: '#ffffff',
        confirmButtonColor: 'var(--accent-cyan)'
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Access" subtitle="Enter your email to receive a reset token.">
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.errorBanner}>{error}</div>}
        {message && <div style={styles.successBanner}>{message}</div>}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="you@example.com" required />
        </div>
        <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? 'Processing...' : 'Send Token'}
        </button>
      </form>
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Remembered your password? <Link to="/login" style={styles.toggleLink}>Back to Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
