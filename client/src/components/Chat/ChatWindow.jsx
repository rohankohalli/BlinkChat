import React from 'react';
import { styles } from '../../pages/Dashboard.styles';

const ChatWindow = ({
  user,
  activeChat,
  messages,
  message,
  setMessage,
  onSendMessage,
  onShowCreateModal,
  onShowJoinModal,
  onShowInviteModal,
  onLeaveRoom,
  messagesEndRef,
  isMobile,
  onToggleSidebar
}) => {
  if (!activeChat) {
    return (
      <div style={styles.noChatSelected}>
        {isMobile && (
          <button 
            onClick={onToggleSidebar}
            style={{ 
              position: 'absolute', 
              top: '24px', 
              left: '24px', 
              background: 'var(--gradient-gold)', 
              border: 'none', 
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        <div style={{ marginBottom: '32px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4M3 5h4M19 3v4M17 5h4"/>
          </svg>
        </div>
        <h2 style={{...styles.welcomeTitle, textAlign: 'center'}}>Welcome back, {user?.username}!</h2>
        <p style={{...styles.welcomeText, color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'center', maxWidth: '400px'}}>
          Select a conversation from the sidebar or start a new ephemeral room.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={onShowCreateModal} 
            style={{
              ...styles.primaryButton, 
              background: 'var(--accent-emerald)', 
              color: '#fff',
              padding: '12px 28px',
              className: 'hover-elevate'
            }}
          >
            Create Room
          </button>
          <button 
            onClick={onShowJoinModal} 
            style={{
              ...styles.iconButton, 
              padding: '12px 28px', 
              width: 'auto', 
              height: 'auto',
              fontWeight: '700', 
              fontSize: '0.9rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              className: 'hover-elevate'
            }}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatWindow}>
      {/* Chat Header */}
      <div style={styles.chatHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMobile && (
            <button 
              onClick={onToggleSidebar}
              style={{...styles.iconButton, marginRight: '8px', background: 'transparent', border: 'none'}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}
          <div style={styles.chatAvatarLarge}>
            {activeChat.type === 'ephemeral' ? '⚡' : (activeChat.name ? activeChat.name.charAt(0).toUpperCase() : 'G')}
          </div>
          <div>
            <h3 style={styles.activeChatTitle}>{activeChat.name || (activeChat.type === 'direct' ? 'Direct Message' : 'Unnamed Chat')}</h3>
            <div style={styles.activeChatStatus}>
              {activeChat.participant_count} members
              {activeChat.type === 'ephemeral' && ` • Room Code: ${activeChat.room_code}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onShowInviteModal(true)}
            style={{ ...styles.secondaryButton, padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
          >
            Invite
          </button>
          <button
            onClick={onLeaveRoom}
            style={{ ...styles.ghostButton, color: '#ff4d4d', padding: '8px 16px', fontSize: '13px', borderRadius: '8px', border: '1px solid rgba(255, 77, 77, 0.2)' }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        <div style={{ marginTop: 'auto' }} />
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={msg.sender_id === user.id ? styles.myMessageWrapper : styles.otherMessageWrapper}
          >
            {msg.sender_id !== user.id && (
              <div style={styles.messageAvatar}>
                {msg.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={msg.sender_id === user.id ? styles.myMessage : styles.otherMessage}>
              {msg.sender_id !== user.id && (
                <div style={styles.messageSenderName}>{msg.username}</div>
              )}
              <div style={styles.messageContent}>{msg.content}</div>
              <div style={styles.messageTime}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={onSendMessage} style={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.messageInput}
        />
        <button type="submit" style={styles.sendButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
