// agent-app/src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [assignedUser, setAssignedUser] = useState(null);
  const [customerData, setCustomerData] = useState(null); // New state for customer data
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection with Redis adapter
    const newSocket = io('https://backend-seven-psi-80.vercel.app', {
      transports: ['websocket'],
      upgrade: false,
    }); // Replace with your backend URL if different
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server as agent');
      newSocket.emit('agentAvailable');
      setIsConnected(true);
    });

    // Receive assigned user information
    newSocket.on('agentAssigned', ({ message, user }) => {
      console.log(message);
      setAssignedUser(user);
      setCustomerData(user); // Set customer data
      setMessages([]);
    });

    // Receive messages from the user
    newSocket.on('agentNotification', ({ message }) => {
      setMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    });

    // Handle user disconnect
    newSocket.on('userDisconnected', ({ message }) => {
      console.log(message);
      setAssignedUser(null);
      setCustomerData(null); // Clear customer data
      setMessages([]);
    });

    // Handle disconnection
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() !== '' && assignedUser) {
      socket.emit('agentMessage', { message: messageInput.trim() });
      setMessages((prev) => [...prev, { text: messageInput.trim(), sender: 'agent' }]);
      setMessageInput('');
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-content">
          <svg className="chat-icon" viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"
            />
          </svg>
          <h1>Agent Interface</h1>
        </div>
      </nav>
      <main className="chat-container">
        {assignedUser ? (
          <>
            <div className="customer-info">
              <h2>Customer Information</h2>
              <p><strong>Name:</strong> {customerData.name}</p>
              <p><strong>Account Number:</strong> {customerData.accountNumber}</p>
              <p><strong>Location:</strong> {customerData.location.city}, {customerData.location.state}, {customerData.location.country}</p>
              <p><strong>Average Spending:</strong> ${customerData.average_spending || 'Not available'}</p>
              <p><strong>Subscription Status:</strong> {customerData.subscription_status || 'Not available'}</p>
              <p><strong>Recent Purchases:</strong></p>
              <ul>
                {customerData.recent_purchases && customerData.recent_purchases.length > 0 ? (
                  customerData.recent_purchases.map((purchase, index) => (
                    <li key={index}>
                      {purchase.company} {purchase.model} ({purchase.specs}) - Purchased on {purchase.purchase_date.split('T')[0]}
                    </li>
                  ))
                ) : (
                  <li>No recent purchases</li>
                )}
              </ul>
              <p><strong>Support History:</strong></p>
              <ul>
                {customerData.support_history && customerData.support_history.length > 0 ? (
                  customerData.support_history.map((support, index) => (
                    <li key={index}>
                      Issue: {support.issue} on {support.date.split('T')[0]} - Resolution: {support.resolution}
                    </li>
                  ))
                ) : (
                  <li>No support history</li>
                )}
              </ul>
              <p><strong>Preferences:</strong> {customerData.preferences?.join(', ') || 'None'}</p>
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === 'agent' ? 'user-message' : 'bot-message'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form className="message-input" onSubmit={sendMessage}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="waiting-message">
            <p>Waiting for a user to connect...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
