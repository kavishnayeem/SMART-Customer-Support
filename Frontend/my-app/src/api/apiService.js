// frontend/src/api/apiService.js
const sendMessageToBackend = async ({ accountNumber, message, chatHistory }) => {
  try {
    const response = await fetch('https://backend-seven-psi-80.vercel.app/api/support', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountNumber, message, chatHistory }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend response:', response.status, response.statusText, errorText);
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message to backend:', error);
    throw error;
  }
};

export { sendMessageToBackend };
