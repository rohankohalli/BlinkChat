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
  messagesEndRef
}) => {
  if (!activeChat) {
    return (
      <div style={styles.noChatSelected}>
        <div style={styles.welcomeIcon}>✨</div>
        <h2 style={styles.welcomeTitle}>Welcome back, {user?.username}!</h2>
        <p style={styles.welcomeText}>Select a conversation from the sidebar or start a new ephemeral room.</p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button onClick={onShowCreateModal} style={styles.primaryButton}>Create Room</button>
          <button onClick={onShowJoinModal} style={styles.secondaryButton}>Join Room</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatWindow}>
      {/* Chat Header */}
      <div style={styles.chatHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
