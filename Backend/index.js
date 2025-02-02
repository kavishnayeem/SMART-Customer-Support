require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3001;
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.use(express.json());
app.use(cors());

// Validate OpenAI API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

// OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// User Schema
const UserSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  location: {
    city: String,
    state: String,
    country: String,
  },
  recent_purchases: [
    {
      company: String,
      model: String,
      specs: String,
      purchase_date: Date,
    },
  ],
  support_history: [
    {
      issue: String,
      date: Date,
      resolution: String,
    },
  ],
  preferences: [String],
  average_spending: Number,
  subscription_status: String,
});

const User = mongoose.model('Customer', UserSchema, 'Customers');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', async () => {
  console.log('Successfully connected to MongoDB');
  
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.post('/api/support', async (req, res) => {
  try {
    const { accountNumber, message, chatHistory = [] } = req.body;

    // Validate accountNumber
    if (!accountNumber || typeof accountNumber !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid account number is required',
      });
    }

    // Find the user in the database
    const user = await User.findOne({ accountNumber: accountNumber.trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please check the account number.',
      });
    }

    // Construct the history section from previous chat messages
    const historyContent = chatHistory.length
      ? chatHistory
          .map((entry) => `${entry.isUser ? 'User' : 'Assistant'}: ${entry.text}`)
          .join('\n')
      : 'No prior conversation history.';

    // Construct the OpenAI prompt
    const prompt = `
**Role**: 
You are a dedicated multilingual customer support agent for an imaginary e-commerce website that specializes in a variety of products, including electronics and home goods. Your primary responsibility is to assist customers with their inquiries related to products and services offered on the website. You should not provide answers to general knowledge questions or inquiries about history. You can speak many languages but your primary language is English.
Keep in mind that your token limit is only 300.
**Task**:
1. **Respond Directly to the Customer's Inquiry**: Interpret the customer's question and respond specifically to their product-related inquiries without deviating into unrelated topics.
2. **For New Purchase Inquiries**: When a customer expresses interest in purchasing a product, ask clarifying questions to better understand their needs (e.g., preferred features, style, or budget) and provide relevant product suggestions along with correct (raw links including https) links for easy access (it should exist on the web).
3. **Use Real Product Types for Suggestions**: Offer recommendations based on common product types (e.g., electronics, home appliances) or customer preferences, ensuring that all suggestions are realistic and available for purchase.
4. **Referencing Customer History**: Only mention recent purchases if the customer specifically asks about them. Support history should only be referenced if it directly pertains to the customer's question.

Maintain a helpful and conversational tone while adhering to ethical policies that prioritize customer satisfaction and privacy.

### Customer Profile
- **Name**: ${user.name}
- **Account Number**: ${user.accountNumber}
- **Location**: ${user.location.city}, ${user.location.state}, ${user.location.country}
- **Recent Purchases**: 
${user.recent_purchases
  .map((p, i) => `  ${i + 1}. ${p.company} ${p.model} (${p.specs}, Purchased on: ${p.purchase_date.toISOString().split('T')[0]})`)
  .join('\n') || 'No recent purchases listed'}
- **Support History**: ${user.support_history.map(h => `${h.issue} (Date: ${h.date.toISOString().split('T')[0]}, Resolution: ${h.resolution})`).join(', ') || 'No prior support interactions'}
- **Preferences**: ${user.preferences.join(', ') || 'No specific preferences listed'}
- **Average Spending**: $${user.average_spending || 'Not available'}
- **Subscription Status**: ${user.subscription_status || 'Not available'}
- **Chat History**:
${historyContent}
### Customer Inquiry:
"${message}"

**Format**:
1. **Acknowledge the Inquiry**: Begin by acknowledging the customer's question and confirming their interest in the specific product type or help topic.
2. **Ask Clarifying Questions**: If the customer shows interest in a new product, ask clarifying questions based on typical customer needs (e.g., preferred features or budget).
3. **Provide Product Recommendations or Solutions**: Use information from the customer's preferences or recent purchases to suggest relevant products, including Amazon links for easy access, ensuring suggestions align with their needs.
4. **Encourage Further Assistance**: Wrap up by encouraging them to ask more questions if they need further help.
5. Do not reply in bold format as it is converted into string to display on UI. Ensure that the format of numbers and points are well spaced, and place them on separate lines using \n instead of in a paragraph.
### Example Interactions:
- **For New Purchases**: If a customer asks about a new product (e.g., "I'm interested in buying a laptop"), acknowledge their interest and ask follow-up questions (e.g., "Are you looking for any specific features or a preferred brand?") and provide a link to a relevant product on Amazon.
- **For Assistance on Recent Purchases**: If they ask about a past purchase, provide specific details based on the recent_purchases array.
- Only bring up **Support History** if the customer explicitly asks.

Important instructions: Strictly adhere to the role of a customer support agent and maintain a helpful tone. Do not mention that you are an AI language model or provide information outside of your role.
Generate a response that directly addresses the customer's question, acknowledges their needs, and provides relevant solutions or suggestions, including product links. Your tone should be conversational and helpful.`;

    // Call OpenAI API
    let completion;
    try {
      completion = await openai.createChatCompletion({
        model: 'gpt-4o-mini', // Ensure this model is accessible to you
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.6,
      });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      return res.status(500).json({
        success: false,
        message: 'Error generating response from AI.',
      });
    }

    const aiResponse =
      completion.data.choices[0]?.message?.content?.trim() || 'Unable to generate response';

    res.json({
      success: true,
      message: aiResponse,
      user: {
        name: user.name,
        accountNumber: user.accountNumber,
        location: user.location,
        average_spending: user.average_spending,
        subscription_status: user.subscription_status,
      },
    });
  } catch (error) {
    console.error('Error in /api/support route:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.',
    });
  }
});

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://user-app-sand.vercel.app', 'https://agent-app-sand.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

// Store connected agents and users
const agents = [];
const usersRequestingAgent = [];

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('userJoin', async ({ accountNumber }) => {
    console.log(`User ${accountNumber} joined the chat`);

    socket.accountNumber = accountNumber;
    socket.role = 'user';

    // Find user information
    const user = await User.findOne({ accountNumber: accountNumber.trim() });
    if (!user) {
      socket.emit('humanResponse', { message: 'User not found. Please check the account number.' });
      return;
    }
    socket.userInfo = {
      name: user.name,
      accountNumber: user.accountNumber,
      location: user.location,
      recent_purchases: user.recent_purchases,
      support_history: user.support_history,
      preferences: user.preferences,
      average_spending: user.average_spending,
      subscription_status: user.subscription_status,
    };

    // Add user to list of users requesting an agent
    usersRequestingAgent.push(socket);

    // Try to assign an agent
    assignAgentToUser(socket);
  });

  socket.on('agentAvailable', () => {
    console.log(`Agent connected: ${socket.id}`);

    socket.role = 'agent';
    agents.push(socket);

    // Try to assign users to this agent
    assignUserToAgent(socket);
  });

  socket.on('userMessage', ({ message }) => {
    if (socket.agent) {
      socket.agent.emit('agentNotification', { message });
    }
  });

  socket.on('agentMessage', ({ message }) => {
    if (socket.user) {
      socket.user.emit('humanResponse', { message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    if (socket.role === 'user') {
      if (socket.agent) {
        // Notify agent that user has disconnected
        socket.agent.emit('userDisconnected', { message: 'User has disconnected.' });
        socket.agent.user = null;
      }
      usersRequestingAgent.splice(usersRequestingAgent.indexOf(socket), 1);
    }

    if (socket.role === 'agent') {
      if (socket.user) {
        // Notify user that agent has disconnected
        socket.user.emit('humanResponse', { message: 'Agent has disconnected.' });
        socket.user.agent = null;
      }
      agents.splice(agents.indexOf(socket), 1);
    }
  });
});

function assignAgentToUser(userSocket) {
  // Assign first available agent to the user
  for (let agentSocket of agents) {
    if (!agentSocket.user) {
      agentSocket.user = userSocket;
      userSocket.agent = agentSocket;

      agentSocket.emit('agentAssigned', {
        message: 'You are now connected to a user.',
        user: userSocket.userInfo,
      });
      userSocket.emit('humanResponse', { message: 'A human agent has joined the chat.' });

      // Remove user from the queue
      usersRequestingAgent.splice(usersRequestingAgent.indexOf(userSocket), 1);

      break;
    }
  }
}

function assignUserToAgent(agentSocket) {
  // Assign first user requesting an agent to this agent
  for (let userSocket of usersRequestingAgent) {
    if (!userSocket.agent) {
      agentSocket.user = userSocket;
      userSocket.agent = agentSocket;

      agentSocket.emit('agentAssigned', {
        message: 'You are now connected to a user.',
        user: userSocket.userInfo,
      });
      userSocket.emit('humanResponse', { message: 'A human agent has joined the chat.' });

      // Remove user from the queue
      usersRequestingAgent.splice(usersRequestingAgent.indexOf(userSocket), 1);

      break;
    }
  }
}
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
