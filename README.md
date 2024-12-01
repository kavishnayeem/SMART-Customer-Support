# SMART Customer Support

## Project Overview

SMART Customer Support is a web application designed to facilitate customer support interactions between users and agents. The application consists of two main components: a frontend user interface for customers and a separate agent interface for support agents. The system utilizes real-time communication through WebSockets, allowing for seamless chat interactions.

### Features

- User authentication and login
- Real-time chat functionality between users and agents
- Text-to-audio feature for enhanced accessibility
- Display of customer information, including recent purchases and support history
- Responsive design for a better user experience

## Technologies Used

- **Frontend**: React, Socket.IO
- **Backend**: Node.js, Express, MongoDB
- **Real-time Communication**: Socket.IO
- **Styling**: CSS


 



## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (for the backend)
- Git (for cloning the repository)

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository
bash
git clone https://github.com/kavishnayeem/SMART-Customer-Support.git
cd SMART-Customer-Support


### 2. Set Up the Backend

1. Navigate to the `Backend` directory:

   ```bash
   cd Backend
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `Backend` directory and add the following environment variables:

   ```plaintext
   PORT=3001
   MONGODB_URI=<your_mongodb_connection_string>
   OPENAI_API_KEY=<your_openai_api_key>
   ```

4. Start the backend server:

   ```bash
   npm start
   ```

### 3. Set Up the Frontend

1. Navigate to the `Frontend/my-app` directory:

   ```bash
   cd ../Frontend/my-app
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Start the user interface:

   ```bash
   npm start
   ```

4. Open a new terminal and navigate to the `Frontend/agent-app` directory:

   ```bash
   cd ../agent-app
   ```

5. Install the required dependencies:

   ```bash
   npm install
   ```

6. Start the agent interface:

   ```bash
   npm start
   ```

### 4. Access the Application

- Open your web browser and go to `http://localhost:3000` to access the user interface.
- Open another tab or window and go to `http://localhost:3001` to access the agent interface.

## Usage

1. **User Interface**: Users can log in using their credentials, send messages, and request to speak with an agent.
2. **Agent Interface**: Agents can connect to users, view customer information, and respond to messages.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the contributors and the open-source community for their support and resources.


