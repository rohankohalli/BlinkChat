import { initSocket, disconnectSocket, getSocket } from '../services/socket';
import conversationService from '../services/conversation.service';
import messageService from '../services/message.service';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('blink_token');
    if (token) {
      const socket = initSocket(token);
      fetchConversations();

      socket.on('new_message', (msg) => {
        if (activeChat?.id === msg.conversation_id) {
          setMessages(prev => [...prev, msg]);
        }
        // Update conversation preview in sidebar
        setConversations(prev => prev.map(c => 
          c.id === msg.conversation_id ? { ...c, last_message_at: msg.created_at } : c
        ));
      });
      
      return () => {
        disconnectSocket();
      };
    }
  }, [activeChat]);

  const fetchConversations = async () => {
    try {
      const res = await conversationService.getConversations();
      setConversations(res.data.conversations);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await messageService.getMessages(conversationId);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
    // Join the socket room
    const socket = getSocket();
    if (socket) {
      socket.emit('join_room', chat.id);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !activeChat) return;

    try {
      const content = message;
      setMessage('');
      
      // Send to API
      const res = await messageService.sendMessage({
        conversationId: activeChat.id,
        content
      });

      // Note: We don't manually add to messages state here because 
      // the socket 'new_message' event will handle it for us.
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/auth');
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      const res = await conversationService.createConversation({
        type: 'ephemeral',
        name: roomName,
        ttl_hours: 24
      });
      
      setShowCreateModal(false);
      setRoomName('');
      fetchConversations();
      handleSelectChat({ id: res.data.conversationId, ...res.data });
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    try {
      const res = await conversationService.joinRoom(roomCode);
      setShowJoinModal(false);
      setRoomCode('');
      fetchConversations();
      // res.data.conversationId is returned from backend
      handleSelectChat({ id: res.data.conversationId });
    } catch (err) {
      console.error("Error joining room:", err);
      alert(err.response?.data?.error || "Failed to join room");
    }
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar Panel */}
      <div style={styles.sidebar} className="panel">
        <div style={styles.sidebarHeader}>
          <h2 style={styles.brandTitle} className="text-gradient">BlinkChat</h2>
          <div style={{display: 'flex', gap: '8px'}}>
            <button 
              onClick={() => setShowJoinModal(true)} 
              style={styles.iconButton} 
              title="Join Room"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </button>
            <button 
              onClick={() => setShowCreateModal(true)} 
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
             <div style={{padding: '20px', textAlign: 'center', opacity: 0.6}}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{marginBottom: '10px'}}>No active conversations.</p>
              <button 
                onClick={() => setShowCreateModal(true)} 
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
                onClick={() => handleSelectChat(chat)}
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
          <button onClick={handleLogout} style={styles.logoutButton} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.mainChat} className="panel">
        {!activeChat ? (
          <div style={styles.noChatSelected}>
            <div style={styles.welcomeIcon}>✨</div>
            <h2 style={styles.welcomeTitle}>Welcome back, {user?.username}!</h2>
            <p style={styles.welcomeText}>Select a conversation from the sidebar or start a new ephemeral room.</p>
            <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
               <button onClick={() => setShowCreateModal(true)} style={styles.primaryButton}>Create Room</button>
               <button onClick={() => setShowJoinModal(true)} style={styles.secondaryButton}>Join Room</button>
            </div>
          </div>
        ) : (
          <div style={styles.chatWindow}>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
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
            </div>

            {/* Messages Area */}
            <div style={styles.messagesContainer}>
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
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={styles.inputArea}>
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
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Create New Room</h3>
            <p>Ephemeral rooms expire after 24 hours of inactivity.</p>
            <form onSubmit={handleCreateRoom}>
              <input 
                autoFocus
                style={styles.modalInput}
                placeholder="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.ghostButton}>Cancel</button>
                <button type="submit" style={styles.primaryButton}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Join Room</h3>
            <p>Enter the room code shared with you.</p>
            <form onSubmit={handleJoinRoom}>
              <input 
                autoFocus
                style={styles.modalInput}
                placeholder="Room Code (e.g. AB1234)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowJoinModal(false)} style={styles.ghostButton}>Cancel</button>
                <button type="submit" style={styles.primaryButton}>Join</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  layout: {
    height: '100vh',
    display: 'flex',
    padding: '24px',
    gap: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  sidebar: {
    width: '340px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  iconButton: {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-light)',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    paddingLeft: '8px',
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border-light)',
  },
  primaryButton: {
    background: 'var(--gradient-primary)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  secondaryButton: {
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    fontWeight: '500',
    border: '1px solid var(--border-light)',
  },
  ghostButton: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  chatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.2s ease',
  },
  chatItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    marginBottom: '4px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-light)',
  },
  chatAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatName: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chatPreview: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chatTime: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  sidebarFooter: {
    padding: '20px 24px',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    color: '#fff',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  userStatus: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--status-online)',
    boxShadow: '0 0 8px var(--status-online)',
  },
  logoutButton: {
    background: 'transparent',
    color: 'var(--text-muted)',
    padding: '8px',
  },
  mainChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  welcomeIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
    opacity: 0.8,
  },
  welcomeTitle: {
    fontSize: '1.5rem',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    fontWeight: '500',
  },
  welcomeText: {
    fontSize: '0.95rem',
    maxWidth: '300px',
    lineHeight: '1.5',
  },
  // Active chat window styles placeholder
  chatWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--border-light)',
  },
  chatAvatarLarge: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#fff',
  },
  activeChatTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '4px',
  },
  activeChatStatus: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  messagesContainer: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  myMessageWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '10px',
  },
  myMessage: {
    maxWidth: '70%',
    padding: '12px 18px',
    background: 'var(--gradient-primary)',
    color: '#fff',
    borderRadius: '18px 18px 2px 18px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
  otherMessage: {
    maxWidth: '70%',
    padding: '12px 18px',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    borderRadius: '18px 18px 18px 2px',
    border: '1px solid var(--border-light)',
  },
  messageAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginTop: 'auto',
  },
  messageSenderName: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--accent-color)',
    marginBottom: '4px',
  },
  messageContent: {
    fontSize: '0.95rem',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  messageTime: {
    fontSize: '0.7rem',
    opacity: 0.6,
    textAlign: 'right',
    marginTop: '4px',
  },
  inputArea: {
    padding: '24px',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    gap: '12px',
  },
  messageInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-full)',
    padding: '14px 24px',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
  },
  sendButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'var(--gradient-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1a1a1a',
    padding: '32px',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid var(--border-light)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  modalInput: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    marginTop: '20px',
    marginBottom: '24px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  }
};

export default Dashboard;
