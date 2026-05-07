import { useState, useRef, useEffect } from 'react';

const ChatPanel = ({ messages, onSendMessage, roomUsers, currentUser }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState('chat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-800/90 backdrop-blur-md border-l border-dark-700 w-72">
      {/* Tabs */}
      <div className="flex border-b border-dark-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'chat'
              ? 'text-primary-400 border-b-2 border-primary-500'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'users'
              ? 'text-primary-400 border-b-2 border-primary-500'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          Users ({roomUsers.length})
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-dark-500 text-sm py-8">
                No messages yet.
                <br />Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.username === currentUser?.username ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl ${
                      msg.username === currentUser?.username
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-dark-700 text-dark-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 px-1">
                    <span className="text-xs text-dark-500">{msg.username}</span>
                    <span className="text-xs text-dark-600">•</span>
                    <span className="text-xs text-dark-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-dark-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-dark-700 text-white text-sm px-3 py-2 rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  message.trim()
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-dark-700 text-dark-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {roomUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-dark-700/50"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-dark-800 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {user.username}
                    {user.userId === currentUser?._id && (
                      <span className="text-dark-500 ml-1">(you)</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
