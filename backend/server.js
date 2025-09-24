const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');

// --- Environment Variable Configuration ---
const credentialsPath = path.join(__dirname, 'google-credentials.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
dotenv.config({ path: path.resolve(__dirname, '.env') });

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to database
connectDB();

// --- Mongoose Models and Middleware ---
// Models are imported in their respective route files


// --- Express App Setup ---
const app = express();
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://agrigrow-ai.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add a simple logger to see if requests are reaching here
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});
 
// --- API Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// --- THIS IS THE CORRECTED LINE ---
const weatherRoutes = require('./routes/weatherRoutes'); // Changed from weatherRoutes to newWeatherRoutes
// --- END OF CORRECTION ---
const marketRoutes = require('./routes/marketRoutes');
const postRoutes = require('./routes/postRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const productRoutes = require('./routes/productRoutes');
const cropRoutes = require('./routes/cropRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const expertRoutes = require('./routes/expertRoutes');
const articleRoutes = require('./routes/articleRoutes');
const messageRoutes = require('./routes/messageRoutes');
const callRoutes = require('./routes/callRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const Service = require('./models/Service'); // Assuming the model exists
 
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gemini', geminiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'AgriGrow AI Backend API',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            users: '/api/users',
            posts: '/api/posts',
            // Add other endpoints as needed
        }
    });
});
// --- Server and Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: ["http://localhost:3000", "http://127.0.0.1:5002", "http://127.0.0.1:3000", "http://localhost:5173", "http://localhost:8080", "https://agrigrow-ai.vercel.app", "https://agrigrow-ai.onrender.com"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Import enhanced socket handlers
const {
    authenticateSocket,
    handleConnection,
    handleAddUser,
    handleSendMessage,
    handleJoinConversation,
    handleLeaveConversation,
    handleMarkAsRead,
    handleTyping,
    handleStopTyping,
    handleCallOffer,
    handleCallAnswer,
    handleCallReject,
    handleCallEnd,
    handleIceCandidate,
    handleMuteStatusChanged,
    handleVideoStatusChanged,
    handleCallConnected,
    handleDisconnect
} = require('./socket/messageSocketHandler');
const serviceSocketHandler = require('./socket/serviceSocketHandler');

// Socket authentication middleware
io.use(authenticateSocket);

io.on('connection', async (socket) => {
    // Handle initial connection
    await handleConnection(socket, io);

    // Legacy support for addUser event
    socket.on('addUser', (userId) => {
        handleAddUser(socket, userId, io);
    });

    // Enhanced message sending
    socket.on('sendMessage', (data) => {
        handleSendMessage(socket, data, io);
    });

    // Conversation room management
    socket.on('joinConversation', (conversationId) => {
        handleJoinConversation(socket, conversationId);
    });

    socket.on('leaveConversation', (conversationId) => {
        handleLeaveConversation(socket, conversationId);
    });

    // Message read receipts
    socket.on('markAsRead', (messageId) => {
        handleMarkAsRead(socket, messageId, io);
    });

    // Typing indicators
    socket.on('typing', (data) => {
        handleTyping(socket, data, io);
    });

    socket.on('stopTyping', (data) => {
        handleStopTyping(socket, data, io);
    });

    // Video/Audio call handlers
    socket.on('callOffer', (data) => {
        handleCallOffer(socket, data, io);
    });

    socket.on('callAnswer', (data) => {
        handleCallAnswer(socket, data, io);
    });

    socket.on('callReject', (data) => {
        handleCallReject(socket, data, io);
    });

    socket.on('callEnd', (data) => {
        handleCallEnd(socket, data, io);
    });

    socket.on('iceCandidate', (data) => {
        handleIceCandidate(socket, data, io);
    });

    socket.on('muteStatusChanged', (data) => {
        handleMuteStatusChanged(socket, data, io);
    });

    socket.on('videoStatusChanged', (data) => {
        handleVideoStatusChanged(socket, data, io);
    });

    socket.on('callConnected', (data) => {
        handleCallConnected(socket, data, io);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        handleDisconnect(socket, io);
    });

    // Error handling
    socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
    });
});

// Service socket handler
serviceSocketHandler(io);

// --- Start Server ---
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// --- Global Error Handling ---
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
});