import React from 'react';
import { styles } from '../../pages/Dashboard.styles';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ 
  user, 
  conversations, 
  activeChat, 
  loading, 
  onSelectChat, 
  onLogout, 
  onShowJoinModal, 
  onShowCreateModal,
  onNavigateHome,
  invites = [],
  onRespondToInvite,
  friends = [],
  pendingFriends = [],
  onRespondToFriendRequest
}) => {
  const { themeMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('chats'); // 'chats' or 'friends'

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

      <div style={{ display: 'flex', padding: '0 16px', marginBottom: '16px', gap: '8px' }}>
        <button 
          onClick={() => setActiveTab('chats')}
          style={{
            flex: 1, 
            padding: '8px', 
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            background: activeTab === 'chats' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'chats' ? '#fff' : 'var(--text-secondary)'
          }}
        >Chats</button>
        <button 
          onClick={() => setActiveTab('friends')}
          style={{
            flex: 1, 
            padding: '8px', 
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            background: activeTab === 'friends' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'friends' ? '#fff' : 'var(--text-secondary)'
          }}
        >Friends {pendingFriends.length > 0 && `(${pendingFriends.length})`}</button>
      </div>

      <div style={styles.chatList}>
        {activeTab === 'chats' ? (
          <>
            {invites.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={styles.sectionTitle}>PENDING INVITES</div>
                {invites.map(invite => (
                  <div key={invite.id} style={{...styles.chatItem, background: 'rgba(52, 211, 153, 0.05)', borderLeft: '3px solid var(--accent-emerald)'}}>
                    <div style={styles.chatInfo}>
                      <div style={styles.chatName}>{invite.conversation_name || 'Group Invite'}</div>
                      <div style={styles.chatPreview}>From: {invite.from_username}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button 
                          onClick={() => onRespondToInvite(invite.id, 'accept')}
                          style={{...styles.primaryButton, padding: '2px 8px', fontSize: '11px', flex: 1}}
                        >Accept</button>
                        <button 
                          onClick={() => onRespondToInvite(invite.id, 'decline')}
                          style={{...styles.ghostButton, padding: '2px 8px', fontSize: '11px', flex: 1, border: '1px solid var(--border-light)'}}
                        >Ignore</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {pendingFriends.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={styles.sectionTitle}>FRIEND REQUESTS</div>
                {pendingFriends.map(req => (
                  <div key={req.id} style={{...styles.chatItem, background: 'rgba(52, 211, 153, 0.05)'}}>
                    <div style={styles.chatAvatar}>
                      {req.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.chatInfo}>
                      <div style={styles.chatName}>{req.username}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                          onClick={() => onRespondToFriendRequest(req.id, 'accept')}
                          style={{...styles.primaryButton, padding: '2px 8px', fontSize: '11px', flex: 1}}
                        >Accept</button>
                        <button 
                          onClick={() => onRespondToFriendRequest(req.id, 'reject')}
                          style={{...styles.ghostButton, padding: '2px 8px', fontSize: '11px', flex: 1, border: '1px solid var(--border-light)'}}
                        >Decline</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.sectionTitle}>ALL FRIENDS</div>
            {friends.length === 0 ? (
              <div style={styles.emptyState}>No friends added yet.</div>
            ) : (
              friends.map(friend => (
                <div 
                  key={friend.id} 
                  style={styles.chatItem}
                  onClick={() => {
                    // Logic to start DM with friend
                    const existing = conversations.find(c => c.type === 'direct' && c.id === friend.id); // This is wrong, id is conv id
                    // For now, let's just show they are friends
                  }}
                >
                  <div style={{...styles.chatAvatar, position: 'relative'}}>
                    {friend.username.charAt(0).toUpperCase()}
                    <span style={{
                      position: 'absolute', bottom: 0, right: 0, 
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: friend.status === 'online' ? 'var(--status-online)' : 'var(--status-offline)',
                      border: '2px solid var(--bg-base)'
                    }}></span>
                  </div>
                  <div style={styles.chatInfo}>
                    <div style={styles.chatName}>{friend.username}</div>
                    <div style={styles.chatPreview}>{friend.status === 'online' ? 'Online' : 'Offline'}</div>
                  </div>
                </div>
              ))
            )}
          </>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={toggleTheme} 
            style={styles.iconButton} 
            title={`Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
          >
            {themeMode === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line>
              </svg>
            ) : themeMode === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            )}
          </button>
          <button onClick={onLogout} style={styles.logoutButton} title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
