import React from 'react';
import { styles } from '../../pages/Dashboard.styles';

const Sidebar = ({ 
  user, 
  conversations, 
  activeChat, 
  loading, 
  onSelectChat, 
  onLogout, 
  onShowJoinModal, 
  onShowCreateModal,
  onNavigateHome
}) => {
  return (
    <div style={styles.sidebar} className="panel">
      <div style={styles.sidebarHeader}>
        <h2 
          style={{...styles.brandTitle, cursor: 'pointer'}} 
          className="text-gradient"
          onClick={onNavigateHome}
        >
          BlinkChat
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onShowJoinModal}
            style={styles.iconButton}
            title="Join Room with Code"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </button>
          <button
            onClick={onShowCreateModal}
            style={styles.iconButton}
            title="New Room"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <div style={styles.chatList}>
        <div style={styles.sectionTitle}>ACTIVE CHATS</div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading...</div>
        ) : conversations.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ marginBottom: '10px' }}>No active conversations.</p>
            <button
              onClick={onShowCreateModal}
              style={styles.primaryButton}
            >
              Start a Chat
            </button>
          </div>
        ) : (
          conversations.map(chat => (
            <div
              key={chat.id}
              style={activeChat?.id === chat.id ? styles.chatItemActive : styles.chatItem}
              onClick={() => onSelectChat(chat)}
            >
              <div style={styles.chatAvatar}>
                {chat.type === 'direct' ? 'D' : chat.type === 'ephemeral' ? '⚡' : 'G'}
              </div>
              <div style={styles.chatInfo}>
                <div style={styles.chatName}>{chat.name || (chat.type === 'direct' ? 'Direct Message' : 'Unnamed Chat')}</div>
                <div style={styles.chatPreview}>
                  {chat.type === 'ephemeral' ? `Code: ${chat.room_code}` : 'Click to open chat'}
                </div>
              </div>
              {chat.expires_at && (
                <div style={styles.chatTime}>
                  {new Date(chat.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* User Profile Footer */}
      <div style={styles.sidebarFooter}>
        <div style={styles.userProfile}>
          <div style={styles.userAvatar}>
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userDetails}>
            <div style={styles.userName}>{user?.username}</div>
            <div style={styles.userStatus}>
              <span style={styles.statusDot}></span> Online
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutButton} title="Sign Out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
