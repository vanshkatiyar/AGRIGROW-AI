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
dotenv.config();

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Mongoose Models and Middleware ---
// Models are imported in their respective route files


// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- API Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const marketRoutes = require('./routes/marketRoutes');
const postRoutes = require('./routes/postRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const productRoutes = require('./routes/productRoutes');
const cropDoctorRoutes = require('./routes/cropDoctorRoutes');
const cropRoutes = require('./routes/cropRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const expertRoutes = require('./routes/expertRoutes');
const articleRoutes = require('./routes/articleRoutes');
const messageRoutes = require('./routes/messageRoutes');
const callRoutes = require('./routes/callRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/crop-doctor', cropDoctorRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/services', serviceRoutes);



// --- Server and Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: "http://localhost:8080", 
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

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});