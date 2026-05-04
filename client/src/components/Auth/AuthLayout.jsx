const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div style={authStyles.container}>
      <div style={authStyles.card} className="panel animate-entrance">
        <div style={authStyles.header}>
          <div style={authStyles.iconContainer}>
            <div style={authStyles.iconDot}></div>
            <div style={{ ...authStyles.iconDot, animationDelay: '0.2s' }}></div>
          </div>
          <h1 style={authStyles.title}>{title} <span className="text-gradient">BlinkChat</span></h1>
          {subtitle && <p style={authStyles.subtitle}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};

export const authStyles = {
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
    marginBottom: '16px'
  },
  successBanner: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#6ee7b7',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '16px'
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

export default AuthLayout;
