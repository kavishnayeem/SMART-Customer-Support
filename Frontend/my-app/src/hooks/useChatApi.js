
import { useState } from 'react';
import { sendMessageToBackend } from '../api/apiService';

const useChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messageData) => {
    setIsLoading(true);
    try {
      const response = await sendMessageToBackend(messageData);
      return response;
    } catch (error) {
      console.error('Error in useChatApi:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
};

export default useChatApi;
