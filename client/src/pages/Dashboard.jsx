import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initSocket, disconnectSocket } from '../services/socket';
import conversationService from '../services/conversation.service';
import userService from '../services/user.service';
import inviteService from '../services/invite.service';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Chat/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import { CreateRoomModal, JoinRoomModal, InviteModal } from '../components/Chat/Modals';
import { styles } from './Dashboard.styles';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    conversations, setConversations,
    activeChat, setActiveChat,
    messages, setMessages,
    loading,
    fetchConversations,
    handleSelectChat,
    sendMessage,
    activeChatRef
  } = useChat(user, conversationId);

  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [invites, setInvites] = useState([]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Handle User Search for Invites
  useEffect(() => {
    const search = async () => {
      if (userSearch.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const res = await userService.searchUsers(userSearch);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoadingSearch(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [userSearch]);

  const fetchInvites = async () => {
    try {
      const res = await inviteService.getPendingInvites();
      setInvites(res.data);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('blink_token');
    if (token) {
      const socket = initSocket(token);
      fetchConversations();
      fetchInvites();

      socket.on('new_message', (msg) => {
        if (activeChatRef.current?.id === Number(msg.conversation_id)) {
          setMessages(prev => {
            const filtered = prev.filter(m => !(m.optimistic && m.content === msg.content && m.sender_id === msg.sender_id));
            return [...filtered, msg];
          });
        }
        setConversations(prev => prev.map(c =>
          c.id === Number(msg.conversation_id) ? { ...c, last_message_at: msg.created_at } : c
        ));
      });

      return () => socket.off('new_message');
    }
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const chat = conversations.find(c =>
        (c.room_code && c.room_code.toUpperCase() === conversationId.toUpperCase()) ||
        c.id.toString() === conversationId
      );
      if (chat && (!activeChat || activeChat.id !== chat.id)) {
        handleSelectChat(chat, false);
      }
    } else if (!conversationId) {
      setActiveChat(null);
      setMessages([]);
    }
  }, [conversationId, conversations]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    sendMessage(message);
    setMessage('');
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    try {
      const res = await conversationService.createConversation({ type: 'ephemeral', name: roomName, ttl_hours: 24 });
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
      handleSelectChat({ id: res.data.conversationId });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join room");
    }
  };

  const handleInviteUser = async (targetUserId) => {
    if (!activeChat) return;
    try {
      await inviteService.sendInvite(activeChat.id, targetUserId);
      alert("Invite sent successfully!");
      setShowInviteModal(false);
      setUserSearch('');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send invite");
    }
  };

  const handleLeaveRoom = async () => {
    if (!activeChat) return;
    if (!window.confirm(`Are you sure you want to leave "${activeChat.name || 'this room'}"?`)) return;

    try {
      await conversationService.leaveRoom(activeChat.id);
      fetchConversations();
      setActiveChat(null);
      navigate('/chat');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave room");
    }
  };

  const handleRespondToInvite = async (inviteId, action) => {
    try {
      const res = await inviteService.respondToInvite(inviteId, action);
      fetchInvites();
      if (action === 'accept') {
        fetchConversations();
        // Option to navigate to the new chat
        if (res.data.conversationId) {
          navigate(`/chat/${res.data.conversationId}`);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to respond to invite");
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/auth');
  };

  return (
    <div style={styles.layout}>
      <Sidebar
        user={user}
        conversations={conversations}
        activeChat={activeChat}
        invites={invites}
        loading={loading}
        onSelectChat={handleSelectChat}
        onLogout={handleLogout}
        onShowJoinModal={() => setShowJoinModal(true)}
        onShowCreateModal={() => setShowCreateModal(true)}
        onRespondToInvite={handleRespondToInvite}
        onNavigateHome={() => navigate('/chat')}
      />

      <div style={styles.mainChat} className="panel">
        <ChatWindow
          user={user}
          activeChat={activeChat}
          messages={messages}
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          onShowCreateModal={() => setShowCreateModal(true)}
          onShowJoinModal={() => setShowJoinModal(true)}
          onShowInviteModal={() => setShowInviteModal(true)}
          onLeaveRoom={handleLeaveRoom}
          messagesEndRef={messagesEndRef}
        />
      </div>

      <CreateRoomModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
        roomName={roomName}
        setRoomName={setRoomName}
      />

      <JoinRoomModal
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinRoom}
        roomCode={roomCode}
        setRoomCode={setRoomCode}
      />

      <InviteModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteUser}
        searchTerm={userSearch}
        setSearchTerm={setUserSearch}
        users={searchResults}
        loadingSearch={loadingSearch}
      />
    </div>
  );
};

export default Dashboard;
