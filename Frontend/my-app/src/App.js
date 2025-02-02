import React, { useState, useEffect } from 'react';
import './App.css';
import useChatApi from './hooks/useChatApi';
import usersData from './data/users.json';
import Navbar from './components/Navbar';
import Message from './components/Message';
import LoadingIndicator from './components/LoadingIndicator';
import LoginInput from './components/LoginInput';
import MessageInput from './components/MessageInput';
import io from 'socket.io-client';

function App() {
  const [messages, setMessages] = useState([]);
  const [accountNumber, setAccountNumber] = useState('');
  const { sendMessage, isLoading } = useChatApi();
  const [inAgentMode, setInAgentMode] = useState(false);
  const [socket, setSocket] = useState(null);
  const [textToAudioEnabled, setTextToAudioEnabled] = useState(false); // New state for text to audio toggle
  const [speechSynthesisInstance, setSpeechSynthesisInstance] = useState(null); // State to hold the speech synthesis instance

  // Function to handle login submission
  const handleLoginSubmit = (email, password) => {
    const user = usersData.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase().trim() &&
        user.password === password.trim()
    );
    if (user) {
      const formattedAccountNumber = user.accountNumber.trim();
      setAccountNumber(formattedAccountNumber);
      handleAccountSubmit(formattedAccountNumber);
    } else {
      alert('Invalid email or password');
    }
  };

  const handleAccountSubmit = async (number) => {
    try {
      if (!number || typeof number !== 'string' || number.trim() === '') {
        throw new Error('Invalid account number');
      }

      const response = await sendMessage({
        accountNumber: number,
        message: 'greeting',
        chatHistory: messages,
      });
      setMessages((prev) => [...prev, { text: response.message, isUser: false }]);
      if (textToAudioEnabled) { // Check if text to audio is enabled
        textToAudio(response.message); // Convert response text to audio
      }
    } catch (error) {
      console.error('Error sending account number:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: 'There was an issue with your account number. Please try again.',
          isUser: false,
        },
      ]);
    }
  };

  const handleSendMessage = async (text) => {
    const newMessage = { text, isUser: true };
    setMessages((prev) => [...prev, newMessage]);

    if (inAgentMode) {
      // Send message to agent via socket
      if (socket) {
        socket.emit('userMessage', { message: text });
      } else {
        console.error('Socket is not connected.');
      }
    } else {
      // Check if the user wants to speak to an agent
      const lowerCaseText = text.toLowerCase();
      if (
        lowerCaseText.includes('speak to an agent') ||
        lowerCaseText.includes('talk to an agent') ||
        lowerCaseText.includes('connect to agent') ||
        lowerCaseText.includes('contact agent')
      ) {
        setInAgentMode(true);

        // Initialize socket connection
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        // Notify server that user has joined
        newSocket.emit('userJoin', { accountNumber });

        // Listen for messages from the agent
        newSocket.on('humanResponse', (data) => {
          setMessages((prev) => [...prev, { text: data.message, isUser: false }]);
          if (textToAudioEnabled) { // Check if text to audio is enabled
            textToAudio(data.message); // Convert response text to audio
          }
        });

        // Handle socket disconnection
        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        // Notify the user
        setMessages((prev) => [
          ...prev,
          { text: 'You will be connected to a human agent shortly.', isUser: false },
        ]);
      } else {
        // Handle interaction with ChatGPT
        try {
          const response = await sendMessage({
            accountNumber,
            message: text,
            chatHistory: [...messages, newMessage],
          });
          setMessages((prev) => [...prev, { text: response.message, isUser: false }]);
          if (textToAudioEnabled) { // Check if text to audio is enabled
            textToAudio(response.message); // Convert response text to audio
          }
        } catch (error) {
          console.error('Error:', error);
          setMessages((prev) => [
            ...prev,
            {
              text: 'Sorry, I am unable to process your request right now. Please try again later.',
              isUser: false,
            },
          ]);
        }
      }
    }
  };

  const textToAudio = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
    setSpeechSynthesisInstance(speech); // Store the speech instance
  };

  const toggleTextToAudio = () => {
    if (textToAudioEnabled) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis
    }
    setTextToAudioEnabled((prev) => !prev); // Toggle the text to audio state
  };

  // Effect to stop audio on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis when the component unmounts
    };
  }, []);

  return (
    <div className="App">
      <Navbar />
      <div className="toggle-button" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
        <span style={{  marginRight:"5px",fontWeight: 'bold', color: '#0071e3', fontSize: '1.0rem' }}>Text to Audio</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={textToAudioEnabled}
            onChange={toggleTextToAudio}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <main className="chat-container">
        {!accountNumber ? (
          <LoginInput onSubmit={handleLoginSubmit} />
        ) : (
          <>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <Message key={index} {...message} />
              ))}
              {isLoading && <LoadingIndicator />}
            </div>
            <MessageInput
              onSend={handleSendMessage}
              disabled={isLoading}
              inAgentMode={inAgentMode}
              socket={socket}
              setMessages={setMessages}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
