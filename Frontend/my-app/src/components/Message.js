// frontend/src/components/Message.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../App.css';

const Message = ({ text, isUser }) => (
  <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
    <ReactMarkdown>{text}</ReactMarkdown>
  </div>
);

export default Message;
