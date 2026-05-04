import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import conversationService from '../services/conversation.service';
import messageService from '../services/message.service';
import { getSocket } from '../services/socket';

export const useChat = (user, conversationId) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const fetchConversations = async () => {
    try {
      const res = await conversationService.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await messageService.getMessages(id);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSelectChat = (chat, shouldNavigate = true) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
    if (shouldNavigate) {
      const urlParam = (chat.type === 'ephemeral' && chat.room_code) ? chat.room_code : chat.id;
      navigate(`/chat/${urlParam}`);
    }
    const socket = getSocket();
    if (socket) socket.emit('join_room', chat.id);
  };

  const sendMessage = async (content) => {
    if (!content.trim() || !activeChat) return;

    try {
      const optimisticMsg = {
        id: Date.now(),
        content,
        sender_id: user.id,
        username: user.username,
        created_at: new Date().toISOString(),
        conversation_id: activeChat.id,
        optimistic: true
      };
      setMessages(prev => [...prev, optimisticMsg]);
      await messageService.sendMessage({ conversationId: activeChat.id, content });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeChatRef.current?.id === Number(msg.conversation_id)) {
        setMessages(prev => {
          const filtered = prev.filter(m => !(m.optimistic && m.content === msg.content && m.sender_id === msg.sender_id));
          return [...filtered, msg];
        });
      }
      setConversations(prev => prev.map(c => 
        c.id === Number(msg.conversation_id) ? { ...c, last_message_at: msg.created_at } : c
      ));
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, []);

  return {
    conversations,
    setConversations,
    activeChat,
    setActiveChat,
    messages,
    setMessages,
    loading,
    fetchConversations,
    handleSelectChat,
    sendMessage,
    activeChatRef
  };
};
