import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initSocket, disconnectSocket } from '../services/socket';
import conversationService from '../services/conversation.service';
import userService from '../services/user.service';
import inviteService from '../services/invite.service';
import friendService from '../services/friend.service';
import { useChat } from '../hooks/useChat';
import { showAlert, showConfirm, showToast } from '../utils/swal';
import Sidebar from '../components/Chat/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import { CreateRoomModal, JoinRoomModal, InviteModal } from '../components/Chat/Modals';
import { styles } from './Dashboard.styles';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);

  const {
    conversations, setConversations,
    activeChat, setActiveChat,
    messages, setMessages,
    loading,
    fetchConversations,
    handleSelectChat,
    sendMessage,
    activeChatRef
  } = useChat(user, conversationId, socket);

  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // For mobile responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [invites, setInvites] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingFriends, setPendingFriends] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const fetchFriends = async () => {
    try {
      const res = await friendService.getFriends();
      setFriends(res.data);
      const pendingRes = await friendService.getPendingRequests();
      setPendingFriends(pendingRes.data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('blink_token');
    if (token) {
      const s = initSocket(token);
      setSocket(s);
      fetchConversations();
      fetchInvites();
      fetchFriends();

      const interval = setInterval(() => {
        fetchInvites();
        fetchFriends();
      }, 10000);

      return () => {
        clearInterval(interval);
        disconnectSocket();
      };
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
      showToast("Room created!");
      handleSelectChat({ id: res.data.conversationId, ...res.data });
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Failed to create room", "error");
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
      showToast("Joined successfully!");
      handleSelectChat({ id: res.data.conversationId });
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Failed to join room", "error");
    }
  };

  const handleInviteUser = async (targetUserId) => {
    if (!activeChat) return;
    try {
      await inviteService.sendInvite(activeChat.id, targetUserId);
      showToast("Invite sent successfully!");
      setShowInviteModal(false);
      setUserSearch('');
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Failed to send invite", "error");
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      await friendService.sendFriendRequest(friendId);
      showToast("Friend request sent!");
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Failed to send friend request", "error");
    }
  };

  const handleLeaveRoom = async () => {
    if (!activeChat) return;
    const result = await showConfirm(
      "Are you sure?",
      `You are about to leave "${activeChat.name || 'this room'}"`,
      "Leave Room"
    );

    if (!result.isConfirmed) return;

    try {
      await conversationService.leaveRoom(activeChat.id);
      fetchConversations();
      setActiveChat(null);
      navigate('/chat');
      showToast("Left room successfully");
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Failed to leave room", "error");
    }
  };

  const handleRespondToInvite = async (inviteId, action) => {
    try {
      const res = await inviteService.respondToInvite(inviteId, action);
      fetchInvites();
      showToast(`Invite ${action}ed`);
      if (action === 'accept') {
        fetchConversations();
        if (res.data.conversationId) {
          navigate(`/chat/${res.data.conversationId}`);
        }
      }
    } catch (err) {
      showAlert("Error", err.response?.data?.message || "Failed to respond to invite", "error");
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/auth');
  };

  const handleRespondToFriendRequest = async (friendId, action) => {
    try {
      await friendService.respondToRequest(friendId, action);
      fetchFriends();
      showToast(`Friend request ${action}ed`);
    } catch (err) {
      showAlert("Error", "Failed to respond to friend request", "error");
    }
  };

  return (
    <div style={styles.layout}>
      {isMobile && sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div style={{
        ...styles.sidebar,
        position: isMobile ? 'fixed' : 'relative',
        left: sidebarOpen ? 0 : '-100%',
        top: 0,
        zIndex: isMobile ? 101 : 1,
        height: '100%',
        width: isMobile ? '100vw' : styles.sidebar.width,
        minWidth: isMobile ? '100vw' : styles.sidebar.minWidth,
        boxShadow: isMobile ? '0 0 50px rgba(0,0,0,0.8)' : 'none'
      }}>
        <Sidebar
          user={user}
          conversations={conversations}
          activeChat={activeChat}
          invites={invites}
          loading={loading}
          onSelectChat={(chat) => {
            handleSelectChat(chat);
            if (isMobile) setSidebarOpen(false);
          }}
          onLogout={handleLogout}
          onShowJoinModal={() => setShowJoinModal(true)}
          onShowCreateModal={() => setShowCreateModal(true)}
          onRespondToInvite={handleRespondToInvite}
          onNavigateHome={() => {
            navigate('/chat');
            if (isMobile) setSidebarOpen(false);
          }}
          friends={friends}
          pendingFriends={pendingFriends}
          onRespondToFriendRequest={handleRespondToFriendRequest}
        />
      </div>

      <div style={{
        ...styles.mainChat,
        marginLeft: !isMobile && sidebarOpen ? 0 : 0,
        width: '100%',
        flex: 1
      }} className="panel">
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
          isMobile={isMobile}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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
        onAddFriend={handleAddFriend}
        searchTerm={userSearch}
        setSearchTerm={setUserSearch}
        users={searchResults}
        friends={friends}
        loadingSearch={loadingSearch}
      />
    </div>
  );
};

export default Dashboard;
