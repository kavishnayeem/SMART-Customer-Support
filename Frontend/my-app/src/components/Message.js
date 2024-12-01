// frontend/src/components/Message.js
import React from 'react';
import '../App.css';

const Message = ({ text, isUser }) => (
  <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>{text}</div>
);

export default Message;
