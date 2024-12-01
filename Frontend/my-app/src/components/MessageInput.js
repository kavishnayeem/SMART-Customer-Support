// frontend/src/components/MessageInput.js
import React, { useState } from 'react';
import '../App.css';

const MessageInput = ({ onSend, disabled, inAgentMode, socket, setMessages }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      if (inAgentMode) {
        // Send message via socket to the server (human agent)
        socket.emit('userMessage', { message: message.trim() });
        setMessages((prev) => [...prev, { text: message.trim(), isUser: true }]);
        setMessage('');
      } else {
        onSend(message.trim());
        setMessage('');
      }
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        disabled={disabled}
        aria-label="Message input"
      />
      <button type="submit" disabled={disabled} aria-label="Send message">
        Send
      </button>
    </form>
  );
};

export default MessageInput;
