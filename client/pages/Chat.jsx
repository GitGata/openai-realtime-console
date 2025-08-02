import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Users, Hash } from 'react-feather';
import io from 'socket.io-client';

export default function Chat() {
  const { api, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers] = useState(['admin', 'user1', 'user2']); // Mock data
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    loadMessages();
    initializeSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    socketRef.current = io();
    
    socketRef.current.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.emit('join_room', 'general');
  };

  const loadMessages = async () => {
    try {
      const data = await api('/api/chat/messages?channel=general&limit=50');
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api('/api/chat/messages', {
        method: 'POST',
        body: {
          message: newMessage,
          channel: 'general'
        }
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Hash className="h-5 w-5 text-gray-400 ml-2" />
            <h1 className="text-xl font-semibold text-gray-900">צ'אט כללי</h1>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 ml-1" />
            <span>{onlineUsers.length} משתמשים מחוברים</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const isOwn = message.user_id === user?.id;
                const showAvatar = index === 0 || messages[index - 1].user_id !== message.user_id;
                
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {showAvatar && !isOwn && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium ml-2">
                          {(message.full_name || message.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`${showAvatar && !isOwn ? '' : 'mr-10'} ${isOwn ? 'ml-2' : ''}`}>
                        {showAvatar && (
                          <div className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-left' : 'text-right'}`}>
                            {isOwn ? 'אתה' : (message.full_name || message.username)} • {formatTime(message.created_at)}
                          </div>
                        )}
                        <div className={`rounded-lg px-3 py-2 ${
                          isOwn 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Hash className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">אין הודעות עדיין</h3>
                  <p>התחל שיחה עם הצוות</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={sendMessage} className="flex items-center space-x-4 space-x-reverse">
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="הקלד הודעה..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 hidden lg:block">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">משתמשים מחוברים</h3>
            <div className="space-y-2">
              {onlineUsers.map((username, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 ml-2">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{username}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">ערוצים</h3>
            <div className="space-y-1">
              <div className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded">
                <Hash className="h-4 w-4 ml-2" />
                <span className="text-sm">כללי</span>
              </div>
              <div className="flex items-center px-2 py-1 text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
                <Hash className="h-4 w-4 ml-2" />
                <span className="text-sm">פרויקטים</span>
              </div>
              <div className="flex items-center px-2 py-1 text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
                <Hash className="h-4 w-4 ml-2" />
                <span className="text-sm">אקראי</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}